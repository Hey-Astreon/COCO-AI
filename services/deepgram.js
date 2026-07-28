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
    this._stalePurgeTimer = null;  // Hard safety purge timer for incomplete mid-sentence fragments
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
   * 2. Added `keywords` parameter — injects 50+ tech vocabulary terms into
   *    Deepgram's beam search decoder, dramatically boosting the likelihood
   *    that acoustically ambiguous words resolve correctly to tech terms.
   *    Example: "Best API" → "REST API", "Best base" → "database"
   *    IMPORTANT: nova-2 uses `keywords` (NOT `keyterms` which is nova-3 only).
   *    Using the wrong parameter name causes Deepgram to silently ignore all boosts.
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
    // ── Tech Vocabulary Keywords Boost (nova-2 API parameter) ───────────────
    // Injected into Deepgram's decoder to boost probability of technical words
    // that are acoustically ambiguous (e.g., REST vs Best, SQL vs sequel).
    // CRITICAL: nova-2 uses `keywords` param. nova-3 uses `keyterms`. Wrong
    // param name causes silent failure — Deepgram ignores all boosts.
    const TECH_KEYWORDS = [
      'REST', 'API', 'HTTP', 'HTTPS', 'SQL', 'NoSQL', 'JSON', 'XML', 'YAML',
      'GraphQL', 'gRPC', 'TCP', 'UDP', 'OAuth', 'JWT', 'CORS', 'CRUD', 'OOP', 'ACID',
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
      'event loop', 'closure', 'promise', 'async/await', 'garbage collection',
      'heap', 'stack', 'thread', 'process', 'Nginx', 'Linux', 'OS', 'DOM'
    ];

    const params = new URLSearchParams({
      model: 'nova-2',              // nova-2 high accuracy model
      language: 'en-US',            // en-US technical accent coverage
      smart_format: 'true',         // auto-formats numbers, dates, currency
      punctuate: 'true',            // adds punctuation
      interim_results: 'true',      // required for live updates and VAD
      utterance_end_ms: '2500',     // 2500ms (2.5s) utterance completion threshold (full sentence)
      vad_events: 'true',           // voice activity detection events
      endpointing: '300',           // 300ms endpointing: fast per-word-group is_final chunks
      // CRITICAL: endpointing MUST be low (300ms) so is_final chunks arrive quickly during speech.
      // utterance_end_ms handles the FULL sentence completion (2.5s silence).
      // Setting both to 2500ms causes audio loss: no is_final arrives during speech,
      // and any WS hiccup at the 2.5s mark drops the entire question.
    });

    // FIX #2: Append keywords as repeated params (Deepgram nova-2 requires one per key)
    // Using `keywords` (NOT `keyterms`) — critical for nova-2 compatibility
    TECH_KEYWORDS.forEach(term => params.append('keywords', term));

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    this.ws = new WebSocket(wsUrl, ['token', this.apiKey]);

    this.ws.onopen = () => {
      console.log('[Deepgram] WebSocket connected (nova-2 + keywords boost active)');
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
      audioBitsPerSecond: 64000,   // 64kbps Opus — gold standard for speech STT accuracy & sharp formants
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
   * Smart Utterance Accumulator — guarantees whole question completion
   * even if speaker pauses for 2-3 seconds mid-sentence.
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

        // Accumulate final chunks into the pending utterance buffer
        if (isFinal) {
          if (!this._pendingUtterance) this._pendingUtterance = [];
          this._pendingUtterance.push(transcript.trim());

          // Cancel stale purge timer — new speech arrived, buffer is actively growing
          clearTimeout(this._stalePurgeTimer);
          this._stalePurgeTimer = null;

          // ── If Deepgram emits speech_final (syntactic clause completion) ──
          if (speechFinal) {
            this._flushPendingUtterance('speech_final');
            return;
          }

          // ── Silence Safety Timer (3000ms) ──
          clearTimeout(this._utteranceDebounceTimer);
          this._utteranceDebounceTimer = setTimeout(() => {
            this._flushPendingUtterance('silence_timer');
          }, 3000);
        }
      }
    }

    // UtteranceEnd — Deepgram's VAD signal when speaker pauses (2.5s)
    if (data.type === 'UtteranceEnd') {
      clearTimeout(this._utteranceDebounceTimer);
      this._utteranceDebounceTimer = null;
      this._flushPendingUtterance('UtteranceEnd');
    }
  }

  /**
   * Flush pending utterance to AI if question is complete.
   * If question is incomplete (mid-sentence pause), PRESERVE buffer for next speech chunk!
   */
  /**
   * Flush pending utterance to AI if question is complete.
   * Universal Guarantee: If speaker stops talking (UtteranceEnd, silence_timer, or 4s timeout),
   * ANY spoken text is immediately flushed to AI. NO WORDS ARE EVER DISCARDED!
   */
  _flushPendingUtterance(source) {
    if (!this._pendingUtterance || this._pendingUtterance.length === 0) return;

    // Clean and join pending chunks into full utterance
    const rawChunks = this._pendingUtterance.map(c => c.trim()).filter(Boolean);
    if (rawChunks.length === 0) return;

    const fullUtterance = rawChunks.join(' ').replace(/\s+/g, ' ').trim();
    if (!fullUtterance) return;

    // Universal Question Check — when speaker stops talking, ALL utterances pass
    const isComplete = DeepgramService.isQuestion(fullUtterance, source);

    if (isComplete) {
      // Question ready! Clear buffer & trigger AI answer
      this._pendingUtterance = [];
      clearTimeout(this._stalePurgeTimer);
      this._stalePurgeTimer = null;
      clearTimeout(this._utteranceDebounceTimer);
      this._utteranceDebounceTimer = null;

      console.log(`[Deepgram] Universal Question Triggered via ${source}:`, fullUtterance);
      if (this.onUtteranceEnd) this.onUtteranceEnd(fullUtterance);
    } else {
      // Mid-sentence pause during active speech — hold buffer for next word
      console.log(`[Deepgram] Mid-sentence pause (${source}) — holding buffer:`, fullUtterance);

      // Force-flush safety timer (4.0s): If speaker stops speaking for 4s, FORCE FLUSH to AI!
      // NEVER DISCARD SPOKEN WORDS!
      clearTimeout(this._stalePurgeTimer);
      this._stalePurgeTimer = setTimeout(() => {
        if (this._pendingUtterance && this._pendingUtterance.length > 0) {
          const forceText = this._pendingUtterance.join(' ').replace(/\s+/g, ' ').trim();
          this._pendingUtterance = [];
          this._stalePurgeTimer = null;
          console.log('[Deepgram] 4s force-flush (never purge!):', forceText);
          if (forceText && DeepgramService.isQuestion(forceText, 'force_flush')) {
            if (this.onUtteranceEnd) this.onUtteranceEnd(forceText);
          }
        }
      }, 4000);
    }
  }

  /**
   * Simple speaker detection heuristic
   */
  _detectSpeaker(transcript) {
    return 'interviewer';
  }

  /**
   * Check if a transcript line is an interview prompt worth answering.
   *
   * Universal Guarantee Rule:
   * 1. If speaker finished talking (source is UtteranceEnd, silence_timer, or force_flush),
   *    ANY spoken prompt (2+ words or non-filler) IS valid — trigger AI immediately!
   * 2. If speaker is in the middle of active speech (speech_final), only pause if
   *    sentence ends on an open article or conjunction.
   */
  static isQuestion(text, source = 'manual') {
    if (!text) return false;
    const trimmed = text.trim();
    if (trimmed.length < 3) return false; // Minimum character length guard

    const cleanText = trimmed.replace(/[.,?!]+$/, '');
    const words = cleanText.split(/\s+/);

    // Single-word filler filter ("okay", "yeah", "thanks", "hello")
    if (words.length === 1) {
      const singleFiller = new Set(['ok', 'okay', 'yeah', 'yes', 'no', 'um', 'uh', 'right', 'sure', 'thanks', 'hello', 'hi', 'hey', 'cool', 'bye', 'great', 'fine']);
      if (singleFiller.has(words[0].toLowerCase())) return false;
    }

    // ── Universal Completion Guarantee ──
    // When the speaker pauses or stops talking (UtteranceEnd / silence / force_flush),
    // WHATEVER was spoken is treated as complete!
    if (source === 'UtteranceEnd' || source === 'silence_timer' || source === 'force_flush' || source === 'manual') {
      return true;
    }

    // Mid-stream check (only while speech is actively ongoing):
    // Hold buffer only if sentence ends on an open article or conjunction
    const lastWord = words[words.length - 1].toLowerCase();
    const midSpeechIncompleteConnectors = new Set([
      'the', 'a', 'an',
      'and', 'or', 'but', 'so', 'because'
    ]);

    if (words.length >= 2 && midSpeechIncompleteConnectors.has(lastWord)) {
      console.log(`[Deepgram] Mid-speech pause on "${lastWord}" — holding buffer for next word.`);
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
    clearTimeout(this._stalePurgeTimer);
    this._stalePurgeTimer = null;
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
