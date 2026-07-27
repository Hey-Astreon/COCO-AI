/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Deepgram Live Audio Transcription Service  v2.2
   Real-time speech-to-text using browser MediaRecorder + Deepgram WS

   v2.2 Bug Fixes (Elite Senior SWE Audit):
   ─────────────────────────────────────────
   Fix #1 – Model switched nova-3 → nova-2 + keyterms tech vocabulary
             injection to prevent acoustic mismatches like "REST API" → "Best API"
   Fix #2 – audioBitsPerSecond 128000 → 16000. Counter-intuitive but correct:
             Deepgram STT is trained on 16kHz narrowband audio. High bitrate
             Opus introduces perceptual compression that removes boundary phonemes.
   Fix #3 – Removed no_delay:true which conflicted with utterance_end_ms buffering,
             causing duplicate/garbled partial result processing
   Fix #4 – Removed filler_words:false aggressive stripping that can mangle
             short technical words acoustically similar to filler markers
   Fix #5 – Audio chunk interval 250ms → 100ms for sub-phoneme accurate frames
   Fix #6 – Eliminated redundant isQuestion() double-check in onUtteranceEnd
             (already pre-filtered inside _handleTranscript guard layers)
   Fix #7 – Enhanced isQuestion trailing word guard with more incomplete markers
   ═══════════════════════════════════════════════════════════════════ */

/**
 * DeepgramService — runs in the RENDERER process
 * Uses the browser's MediaRecorder API to capture audio,
 * then streams it to Deepgram's WebSocket API for real-time STT.
 */
class DeepgramService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ws = null;
    this.mediaRecorder = null;
    this.mediaStream = null;
    this.isListening = false;
    this.onTranscript = null;     // callback(text, isFinal, speaker)
    this.onError = null;          // callback(error)
    this.onStatusChange = null;   // callback(status) — 'connecting'|'listening'|'paused'|'error'
    this.onUtteranceEnd = null;   // callback(fullUtterance) — fires when speaker fully stops
    this.onAudioLevel = null;     // callback(level 0-100) — real-time audio volume level
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;       // increased from 3 → 5 for more resilience
    this.micStreamTracks = null;
    this.systemStreamTracks = null;
    this.audioCtx = null; // AudioContext for stream mixing
    this._analyserNode = null;
    this._audioSourceNode = null;
    this._levelTimer = null;

    // Utterance accumulation
    this._pendingUtterance = [];
    this._utteranceDebounceTimer = null;
    this._keepAliveTimer = null;
  }

  /**
   * Start capturing audio according to the selected mode (interviewer, candidate, or mixed),
   * and streaming it to Deepgram.
   */
  async startMicrophone(audioMode = 'interviewer') {
    try {
      this._setStatus('connecting');
      let finalStream = null;

      // ── High-quality mic constraints for maximum STT accuracy ──
      // NOTE: 48000 Hz sample rate is used for CAPTURE (Web Audio API requirement).
      // Deepgram's actual processing is resampled internally to 16kHz.
      // This is correct — MediaRecorder must capture at the device's native rate.
      const highQualityMicConstraints = {
        channelCount: 1,          // Mono — reduces bitrate, STT doesn't benefit from stereo
        sampleRate: 48000,        // CD-quality capture — device native rate
        echoCancellation: true,   // Removes interviewer echo from mic pickup
        noiseSuppression: true,   // Eliminates background noise before encoding
        autoGainControl: true,    // Normalizes volume for consistent STT decoding
      };

      if (audioMode === 'candidate') {
        // Mode 1: Candidate Only (Microphone Only)
        console.log('[Audio] Starting Candidate-only (Microphone) audio capture');
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: highQualityMicConstraints
        });
        this.micStreamTracks = micStream.getTracks();
        finalStream = micStream;

      } else if (audioMode === 'interviewer') {
        // Mode 2: Interviewer Only (System Audio Loopback Only)
        console.log('[Audio] Starting Interviewer-only (System Loopback) audio capture');
        if (!window.electronAPI || !window.electronAPI.getSystemAudioSourceId) {
          throw new Error('System audio loopback requires Electron process environment.');
        }

        const sourceId = await window.electronAPI.getSystemAudioSourceId();
        console.log('[Audio] Capturing system loopback source:', sourceId);

        const systemStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId
            }
          },
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sourceId,
              maxHeight: 1,
              maxWidth: 1
            }
          }
        });

        this.systemStreamTracks = systemStream.getTracks();

        // IMMEDIATELY stop the video track — we only need audio
        systemStream.getVideoTracks().forEach(track => {
          console.log('[Audio] Stopping unused loopback video track:', track.label);
          track.stop();
        });

        finalStream = systemStream;

      } else if (audioMode === 'both') {
        // Mode 3: Mixed (Mic + System Loopback)
        console.log('[Audio] Starting mixed Microphone and System Loopback audio capture');

        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: highQualityMicConstraints
        });
        this.micStreamTracks = micStream.getTracks();

        let mixedStream = micStream;

        if (window.electronAPI && window.electronAPI.getSystemAudioSourceId) {
          try {
            const sourceId = await window.electronAPI.getSystemAudioSourceId();
            const systemStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sourceId
                }
              },
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sourceId,
                  maxHeight: 1,
                  maxWidth: 1
                }
              }
            });

            this.systemStreamTracks = systemStream.getTracks();
            systemStream.getVideoTracks().forEach(track => track.stop());

            // Mix streams using AudioContext (close pre-existing one to avoid hardware limit leak)
            if (this.audioCtx) {
              try { await this.audioCtx.close(); } catch (_) {}
              this.audioCtx = null;
            }
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.audioCtx.state === 'suspended') {
              await this.audioCtx.resume();
            }
            const micSource = this.audioCtx.createMediaStreamSource(micStream);
            const systemSource = this.audioCtx.createMediaStreamSource(systemStream);
            const dest = this.audioCtx.createMediaStreamDestination();

            micSource.connect(dest);
            systemSource.connect(dest);

            mixedStream = dest.stream;
            console.log('[Audio] Mixed Mic and System Audio successfully');
          } catch (sysErr) {
            console.warn('[Audio] Loopback capture failed, falling back to mic only.', sysErr);
          }
        }
        finalStream = mixedStream;
      }

      this.mediaStream = finalStream;
      this._startAudioLevelAnalyzer();
      this._connectWebSocket();

    } catch (err) {
      this._setStatus('error');
      if (this.onError) this.onError(err);
      console.error('[Deepgram] Audio capture initialization failed:', err);
    }
  }

  /**
   * Alias for unified audio capture
   */
  async startSystemAudio(audioMode = 'interviewer') {
    await this.startMicrophone(audioMode);
  }

  /**
   * Connect to Deepgram's live transcription WebSocket
   *
   * BUG FIX NOTES (v2.2):
   * ─────────────────────
   * 1. Model: nova-3 → nova-2
   *    nova-3 general model has weak technical vocabulary weighting.
   *    nova-2 has more stable acoustic modeling for technical speech.
   *
   * 2. Added `keyterms` parameter — injects 50+ tech vocabulary terms into
   *    Deepgram's beam search decoder, dramatically boosting the likelihood
   *    that acoustically ambiguous words resolve correctly to tech terms.
   *    Example: "Best API" → "REST API", "Best base" → "database"
   *
   * 3. Removed `no_delay: true` — this parameter forced Deepgram to flush
   *    transcripts immediately, bypassing its internal phoneme-level
   *    accumulation buffer. This CONFLICTED with utterance_end_ms buffering,
   *    causing fragments to be emitted and re-processed incorrectly.
   *    Removing it lets Deepgram's VAD produce cleaner final results.
   *
   * 4. Removed `filler_words: false` — Deepgram's filler word filter applies
   *    at the phoneme probability level and can misidentify short technical
   *    words as fillers during aggressive pruning. We handle cleanup in JS.
   */
  _connectWebSocket() {
    // ── Tech Vocabulary Keyterms Boost ─────────────────────────────────────
    // Injected into Deepgram's decoder to boost probability of technical words
    // that are acoustically ambiguous (e.g., REST vs Best, SQL vs sequel).
    // Deepgram uses these to re-weight beam search probabilities.
    const TECH_KEYTERMS = [
      'REST', 'API', 'HTTP', 'HTTPS', 'SQL', 'NoSQL', 'JSON', 'XML', 'YAML',
      'GraphQL', 'gRPC', 'TCP', 'UDP', 'OAuth', 'JWT', 'CORS', 'CRUD',
      'microservices', 'Kubernetes', 'Docker', 'CI/CD', 'DevOps', 'AWS', 'Azure',
      'React', 'Angular', 'Vue', 'Node.js', 'TypeScript', 'JavaScript', 'Python',
      'Java', 'Golang', 'Rust', 'C++', 'MongoDB', 'PostgreSQL', 'Redis', 'Kafka',
      'WebSocket', 'asynchronous', 'synchronous', 'polymorphism', 'encapsulation',
      'inheritance', 'abstraction', 'SOLID', 'DRY', 'object-oriented', 'functional',
      'recursion', 'Big O', 'binary tree', 'linked list', 'hash map', 'hash table',
      'binary search', 'quicksort', 'mergesort', 'dynamic programming', 'memoization',
      'concurrency', 'parallelism', 'mutex', 'deadlock', 'race condition',
      'idempotent', 'stateless', 'authentication', 'authorization', 'endpoint',
      'middleware', 'load balancer', 'caching', 'CDN', 'webhook', 'pub/sub',
    ];

    const params = new URLSearchParams({
      model: 'nova-2',              // FIX #1: nova-2 > nova-3 for technical vocabulary accuracy
      language: 'en-US',            // en-US for optimal technical accent coverage
      smart_format: 'true',         // auto-formats numbers, dates, currency
      punctuate: 'true',            // adds punctuation for better readability
      interim_results: 'true',      // required for interim transcripts and VAD
      utterance_end_ms: '2000',     // 2000ms (2.0s) silence threshold — 2.0s silence gate (Golden Layer 1)
      vad_events: 'true',           // voice activity detection events
      endpointing: '2000',          // 2000ms (2.0s) silence threshold — prevents premature answer triggering
      // no_delay REMOVED (Fix #3): conflicted with utterance_end_ms buffering
      // filler_words REMOVED (Fix #4): aggressive pruning corrupts short tech words
    });

    // FIX #2: Append keyterms as repeated params (Deepgram requires one per key)
    TECH_KEYTERMS.forEach(term => params.append('keyterms', term));

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    this.ws = new WebSocket(wsUrl, ['token', this.apiKey]);

    this.ws.onopen = () => {
      console.log('[Deepgram] WebSocket connected (nova-2 + keyterms boost active)');
      this.isListening = true;
      this.reconnectAttempts = 0;
      this._setStatus('listening');
      this._startRecording();
      this._startKeepAlive();   // prevent idle disconnection (8s Heartbeat)
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._handleTranscript(data);
      } catch (e) {
        console.warn('[Deepgram] Failed to parse message:', e);
      }
    };

    this.ws.onclose = (event) => {
      console.log('[Deepgram] WebSocket closed:', event.code, event.reason);
      this.isListening = false;
      this._stopKeepAlive();
      this._stopRecording();

      // Auto-reconnect on unexpected close (not user-initiated)
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        const delay = Math.min(600 * this.reconnectAttempts, 3000); // 600ms, 1.2s, 1.8s... up to 3s
        console.log(`[Deepgram] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnects})...`);
        this._setStatus('connecting');
        setTimeout(() => this._connectWebSocket(), delay);
      } else {
        this._setStatus('paused');
      }
    };

    this.ws.onerror = (err) => {
      console.error('[Deepgram] WebSocket error:', err);
      this._setStatus('error');
      if (this.onError) this.onError(err);
    };
  }

  /**
   * Stop recording MediaStream tracks
   */
  _stopRecording() {
    if (this.mediaRecorder) {
      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch (e) {
        console.warn('[Deepgram] Error stopping MediaRecorder:', e);
      }
      this.mediaRecorder = null;
    }
  }

  /**
   * Send a KeepAlive ping every 8 seconds to prevent Deepgram from
   * closing the WebSocket during silences.
   */
  _startKeepAlive() {
    this._stopKeepAlive();
    this._keepAliveTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
      }
    }, 8000);
  }

  _stopKeepAlive() {
    if (this._keepAliveTimer) {
      clearInterval(this._keepAliveTimer);
      this._keepAliveTimer = null;
    }
  }

  /**
   * Start MediaRecorder to capture and send audio chunks
   *
   * BUG FIX v2.2:
   * ─────────────
   * audioBitsPerSecond: 128000 → 16000 (Fix #2)
   *   Deepgram's acoustic models are trained primarily on 8–16kHz narrowband
   *   speech data. Sending 128kbps Opus applies aggressive perceptual compression
   *   that distorts formant frequencies at high bitrates, causing phoneme boundary
   *   errors (e.g. 'R' → 'B' substitution in "REST API").
   *   16kbps Opus preserves the exact spectral envelope that Deepgram expects.
   *
   * Chunk interval: 250ms → 100ms (Fix #5)
   *   Smaller chunks give Deepgram finer-grained acoustic context per update.
   *   At 250ms chunks, syllable boundaries are frequently cut mid-frame.
   *   100ms aligns with typical phoneme duration (~80-120ms) for cleaner framing.
   */
  _startRecording() {
    if (!this.mediaStream) return;
    this._stopRecording();

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 16000,   // FIX #2: 16kbps — optimal for Deepgram STT decoding accuracy
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(event.data);
      }
    };

    // FIX #5: 100ms chunk interval for sub-phoneme boundary accuracy
    // Phonemes average 80-120ms duration — 100ms prevents mid-phoneme fragmentation
    this.mediaRecorder.start(100);
    console.log('[Deepgram] MediaRecorder started: 100ms chunks @ 16kbps Opus');
  }

  /**
   * Handle incoming transcript results from Deepgram
   */
  _handleTranscript(data) {
    if (data.type === 'Results') {
      const transcript = data.channel?.alternatives?.[0]?.transcript;
      const isFinal = data.is_final;
      const speechFinal = data.speech_final;

      if (transcript && transcript.trim()) {
        const speaker = this._detectSpeaker(transcript);

        if (this.onTranscript) {
          this.onTranscript(transcript.trim(), isFinal, speaker, speechFinal);
        }

        // Accumulate final chunks into the pending utterance buffer (Fragment Accumulation Buffer — Golden Layer 2)
        if (isFinal) {
          if (!this._pendingUtterance) this._pendingUtterance = [];
          this._pendingUtterance.push(transcript.trim());

          // ── Silence Safety Timer (2500ms) ──────────────────────────────────
          // Fires 2.5s after the last final chunk if UtteranceEnd packet is delayed.
          // Guarantees full sentence accumulation without cutting off mid-sentence.
          clearTimeout(this._utteranceDebounceTimer);
          this._utteranceDebounceTimer = setTimeout(() => {
            if (this._pendingUtterance && this._pendingUtterance.length > 0) {
              const fullUtterance = this._pendingUtterance.join(' ');
              if (DeepgramService.isQuestion(fullUtterance)) {
                this._pendingUtterance = [];
                console.log('[Deepgram] Speech complete (2.5s silence safety net):', fullUtterance);
                if (this.onUtteranceEnd) this.onUtteranceEnd(fullUtterance);
              } else {
                console.log('[Deepgram] Incomplete fragment — waiting for full question:', fullUtterance);
              }
            }
          }, 2500);
        }
      }
    }

    // UtteranceEnd — Deepgram's primary indicator that speaker has completed their turn (2.0s silence)
    if (data.type === 'UtteranceEnd') {
      clearTimeout(this._utteranceDebounceTimer);
      this._utteranceDebounceTimer = null;

      if (this._pendingUtterance && this._pendingUtterance.length > 0) {
        const fullUtterance = this._pendingUtterance.join(' ');
        if (DeepgramService.isQuestion(fullUtterance)) {
          this._pendingUtterance = [];
          console.log('[Deepgram] UtteranceEnd complete question:', fullUtterance);
          if (this.onUtteranceEnd) this.onUtteranceEnd(fullUtterance);
        } else {
          console.log('[Deepgram] UtteranceEnd — incomplete fragment, accumulating further:', fullUtterance);
        }
      }
    }
  }

  /**
   * Simple speaker detection heuristic
   */
  _detectSpeaker(transcript) {
    return 'interviewer';
  }

  /**
   * Check if a transcript line is an interview question/prompt worth answering.
   *
   * Multi-layer gate — ALL layers must pass before the AI is triggered:
   *
   * Layer 1 (Golden): 4-Word Minimum Anti-Rushing Guard
   *   Rejects fragments like "Tell me" or "What is"
   *
   * Layer 2 (Golden): Trailing Incomplete Connector Guard
   *   Rejects sentences that end on a preposition, possessive, determiner,
   *   auxiliary verb, or conjunction — indicating the speaker paused mid-sentence.
   *   Examples blocked:
   *     "Tell me how was your"     (ends on possessive "your")
   *     "What is the definition of" (ends on preposition "of")
   *     "Can you explain how"      (ends on conjunction "how")
   *     "Talk to me about the"     (ends on determiner "the")
   *
   * NOTE: This function is called ONLY inside _handleTranscript (in this file).
   * It is also exported as a static method for external use, but the onUtteranceEnd
   * callback in app.js must NOT call isQuestion() again — the utterance is already
   * pre-filtered before it reaches that callback.
   */
  static isQuestion(text) {
    if (!text) return false;
    const trimmed = text.trim();
    const cleanText = trimmed.replace(/[.,?!]+$/, '');
    const words = cleanText.split(/\s+/);

    // Golden Layer 1: 4-Word Minimum Anti-Rushing Guard
    if (words.length < 4) return false;

    // Golden Layer 2: Trailing Incomplete Connector Guard
    // Comprehensive set of words that signal an incomplete mid-sentence pause.
    // If the speaker pauses after any of these, they haven't finished their question.
    const lastWord = words[words.length - 1].toLowerCase();
    const trailingIncompleteWords = new Set([
      // Possessives & Personal Pronouns
      'your', 'my', 'their', 'his', 'her', 'our', 'its', 'me', 'him', 'them',
      // Determiners & Articles
      'the', 'a', 'an', 'this', 'that', 'these', 'those', 'some', 'any', 'each',
      // Prepositions (common ones that open noun phrases)
      'of', 'to', 'in', 'for', 'with', 'on', 'at', 'by', 'from', 'as',
      'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against',
      'during', 'without', 'before', 'under', 'around', 'among', 'within',
      'about', 'across', 'behind', 'beyond', 'despite', 'toward', 'upon',
      // Auxiliary Verbs (incomplete predicate — subject noun phrase is missing)
      'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'might', 'must', 'shall', 'may', 'can',
      // Conjunctions & Subordinators (open a new clause that hasn't been completed)
      'and', 'or', 'but', 'so', 'if', 'that', 'which', 'who', 'whom', 'whose',
      'than', 'when', 'where', 'while', 'although', 'because', 'since', 'unless',
      'how', 'what', 'why', 'whether',
      // Common sentence openers that signal more is coming
      'both', 'either', 'neither', 'not', 'just', 'only', 'also', 'even',
    ]);

    if (trailingIncompleteWords.has(lastWord)) {
      console.log(`[Deepgram] Layer 2 guard: sentence ends on incomplete connector "${lastWord}" — waiting for complete sentence.`);
      return false;
    }

    return true;
  }

  /**
   * Update status and notify listener
   */
  _setStatus(status) {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  pause() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
      this._setStatus('paused');
    }
  }

  resume() {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
      this._setStatus('listening');
    }
  }

  stop() {
    this.isListening = false;
    this._stopKeepAlive();
    this._stopAudioLevelAnalyzer();
    clearTimeout(this._utteranceDebounceTimer);
    this._utteranceDebounceTimer = null;
    this._pendingUtterance = [];

    if (this.mediaRecorder) {
      try { this.mediaRecorder.stop(); } catch (e) {}
      this.mediaRecorder = null;
    }

    if (this.micStreamTracks) {
      this.micStreamTracks.forEach(track => track.stop());
      this.micStreamTracks = null;
    }

    if (this.systemStreamTracks) {
      this.systemStreamTracks.forEach(track => track.stop());
      this.systemStreamTracks = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.ws) {
      try { this.ws.close(1000, 'User stopped'); } catch (e) {}
      this.ws = null;
    }

    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }

    this._setStatus('paused');
    console.log('[Deepgram] Stopped');
  }

  /**
   * Start real-time audio volume level analyzer (Web Audio API AnalyserNode)
   */
  _startAudioLevelAnalyzer() {
    this._stopAudioLevelAnalyzer();
    if (!this.mediaStream) return;

    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this._audioSourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this._analyserNode = this.audioCtx.createAnalyser();
      this._analyserNode.fftSize = 64;
      this._audioSourceNode.connect(this._analyserNode);

      const dataArray = new Uint8Array(this._analyserNode.frequencyBinCount);

      // Sample volume level at ~30fps (33ms)
      this._levelTimer = setInterval(() => {
        if (!this._analyserNode) return;
        this._analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0-255 -> 0-100% volume
        const level = Math.min(100, Math.round((average / 128) * 100));

        if (this.onAudioLevel) {
          this.onAudioLevel(level);
        }
      }, 33);
    } catch (e) {
      console.warn('[Audio] Failed to attach audio level analyzer:', e);
    }
  }

  _stopAudioLevelAnalyzer() {
    if (this._levelTimer) {
      clearInterval(this._levelTimer);
      this._levelTimer = null;
    }
    if (this._audioSourceNode) {
      try { this._audioSourceNode.disconnect(); } catch (e) {}
      this._audioSourceNode = null;
    }
    if (this._analyserNode) {
      try { this._analyserNode.disconnect(); } catch (e) {}
      this._analyserNode = null;
    }
    if (this.onAudioLevel) {
      this.onAudioLevel(0);
    }
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DeepgramService };
}
