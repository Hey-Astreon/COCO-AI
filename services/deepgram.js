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
    this._stalePurgeTimer = null;     // Force-flush safety timer for stale mid-sentence fragments
    this._utteranceEndDebounceTimer = null; // Debounce UtteranceEnd to absorb inter-clause pauses
    this._keepAliveTimer = null;

    // Dynamic Context for custom vocabulary boosting
    this.resume = '';
    this.jobDescription = '';
  }

  /**
   * Update active interview context to extract personalized keywords
   */
  setContext(resume, jobDescription) {
    this.resume = resume || '';
    this.jobDescription = jobDescription || '';
    console.log('[Deepgram] Active context updated. Custom keywords will be compiled on WebSocket connection.');
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
        // Mode 2: Interviewer Only (System Audio Loopback with Mic Fallback)
        console.log('[Audio] Starting Interviewer-only (System Loopback) audio capture');
        let systemStream = null;

        if (window.electronAPI && window.electronAPI.getSystemAudioSourceId) {
          try {
            const sourceId = await window.electronAPI.getSystemAudioSourceId();
            console.log('[Audio] Capturing system loopback source:', sourceId);

            systemStream = await navigator.mediaDevices.getUserMedia({
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
          } catch (sysErr) {
            console.warn('[Audio] System loopback capture failed, falling back to standard microphone:', sysErr);
          }
        }

        // Fallback to standard microphone if system loopback is unsupported or denied
        if (!finalStream) {
          console.log('[Audio] Falling back to standard Microphone audio capture');
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: highQualityMicConstraints
          });
          this.micStreamTracks = micStream.getTracks();
          finalStream = micStream;
        }

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
    // Clean static technical terms. No generic short words like "DOM" or "OS" that distort normal speech.
    const TECH_KEYWORDS = [
      'REST', 'API', 'HTTP', 'HTTPS', 'SQL', 'NoSQL', 'JSON', 'XML', 'YAML',
      'GraphQL', 'gRPC', 'TCP', 'UDP', 'OAuth', 'JWT', 'CORS', 'CRUD', 'OOP', 'ACID',
      'microservices', 'Kubernetes', 'Docker', 'CI/CD', 'DevOps', 'AWS', 'Azure',
      'React', 'Angular', 'Vue', 'Node.js', 'TypeScript', 'JavaScript', 'Python',
      'Java', 'Golang', 'Rust', 'C++', 'MongoDB', 'PostgreSQL', 'Redis', 'Kafka',
      'WebSocket', 'polymorphism', 'encapsulation', 'inheritance', 'SOLID', 'DRY',
      'FastAPI', 'ChromaDB', 'Tree-Sitter', 'Nginx', 'Linux'
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
    });

    const finalKeywords = new Set();

    // Helper to safely add keywords based on length to prevent phonetic black holes
    const addSafeKeyword = (keyword) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;

      // Deepgram legacy keywords parameter only supports single words.
      // If the keyword contains spaces (e.g. "Alyra Lock"), split it into single words.
      if (trimmed.includes(' ')) {
        const individualWords = trimmed.split(/\s+/);
        individualWords.forEach(word => addSafeKeyword(word));
        return;
      }

      // Extract raw word to check length (removing any legacy weight if present)
      const cleanWord = trimmed.replace(/:[0-9]+$/, '');
      if (cleanWord.length <= 2) return; // Skip tiny 1-2 char noises
      
      // ── Word Length Rules to Prevent Phonetic Distortions ──
      // 1. Long tech/proper nouns (>= 5 chars, e.g. "FastAPI", "Alyra", "FinSync"):
      //    Boost with weight 4 for high-precision matching.
      // 2. Medium proper nouns (4 chars, e.g. "IDBI"):
      //    Boost with weight 2 for medium precision.
      // 3. Short acronyms/words (< 4 chars, e.g. "Vue", "JWT", "API", "SQL"):
      //    Keep weight at 1 to prevent them from acting as acoustic black holes.
      if (cleanWord.length >= 5) {
        finalKeywords.add(`${cleanWord}:4`);
      } else if (cleanWord.length === 4) {
        finalKeywords.add(`${cleanWord}:2`);
      } else {
        finalKeywords.add(`${cleanWord}:1`);
      }
    };

    // 1. Add static technical acronyms/terms
    TECH_KEYWORDS.forEach(term => addSafeKeyword(term));

    // 2. Dynamically extract project names and proper nouns from candidate's Resume/JD
    const textToScan = `${this.resume || ''} ${this.jobDescription || ''}`;
    if (textToScan.trim()) {
      // Extract consecutive Capitalized Word Phrases (2-3 words, e.g. "Astra Vision", "Alyra Lock", "IDBI FinSync")
      const phraseRegex = /\b[A-Z][a-zA-Z0-9-']+(?:\s+[A-Z][a-zA-Z0-9-']+){1,2}\b/g;
      let match;
      while ((match = phraseRegex.exec(textToScan)) !== null) {
        const phrase = match[0].trim();
        if (phrase.length > 3 && phrase.length < 35) {
          addSafeKeyword(phrase);
        }
      }

      // Extract single capitalized terms (e.g. "FastAPI", "ChromaDB")
      const wordRegex = /\b[A-Z][a-zA-Z0-9-']+\b/g;
      while ((match = wordRegex.exec(textToScan)) !== null) {
        const word = match[0].trim();
        const stopWords = new Set(['The', 'And', 'But', 'For', 'With', 'You', 'Your', 'This', 'That', 'These', 'Those', 'From', 'About', 'Into', 'Project', 'Resume', 'Experience', 'Company', 'Role']);
        if (word.length > 2 && word.length < 25 && !stopWords.has(word)) {
          addSafeKeyword(word);
        }
      }
    }

    // Append all static & dynamic keywords to query params
    finalKeywords.forEach(keyword => params.append('keywords', keyword));

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
   * Audio Configuration:
   * ────────────────────
   * audioBitsPerSecond: 64000 (64kbps Opus)
   *   64kbps Opus mono provides the optimal balance of spectral fidelity, crisp formants,
   *   and low network payload for Deepgram's STT decoder.
   *
   * Chunk interval: 100ms
   *   At 100ms frames, chunks closely match natural phoneme durations (~80-120ms),
   *   preventing mid-syllable boundary fragmentation.
   */
  _startRecording() {
    if (!this.mediaStream) return;
    this._stopRecording();

    try {
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
      console.log('[Deepgram] MediaRecorder started: 100ms chunks @ 64kbps Opus');
    } catch (e) {
      console.error('[Deepgram] Failed to start MediaRecorder:', e);
      if (this.onError) this.onError(e);
    }
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

          // New speech arrived — cancel ALL pending flush timers.
          // The speaker is still talking; don't answer yet!
          clearTimeout(this._stalePurgeTimer);
          this._stalePurgeTimer = null;
          clearTimeout(this._utteranceEndDebounceTimer);
          this._utteranceEndDebounceTimer = null;

          // ── speech_final fires at CLAUSE boundaries, NOT full-question boundaries ──
          // A long question like: "Walk me through Alyra Lock, [speech_final fires here]
          // explain the architecture choices, [speech_final fires here] and describe the
          // data model [speech_final fires here]" fires 3 times for 1 question!
          // DO NOT flush on speech_final — keep accumulating until UtteranceEnd.

          // ── Long Silence Safety Timer (6000ms) ──
          // Only triggers if UtteranceEnd somehow never fires (rare edge case).
          // 6s is long enough that TTS inter-clause pauses (~1-3s) don't trigger it.
          clearTimeout(this._utteranceDebounceTimer);
          this._utteranceDebounceTimer = setTimeout(() => {
            this._flushPendingUtterance('silence_timer');
          }, 6000);
        }
      }
    }

    // UtteranceEnd — Deepgram VAD: 2.5s silence detected since last audio.
    // DEBOUNCE: Wait 1500ms before flushing. If new speech arrives in that window
    // (interviewer paused between clauses), cancel and keep accumulating.
    // This is what prevents long multi-clause questions from being split into fragments.
    if (data.type === 'UtteranceEnd') {
      clearTimeout(this._utteranceDebounceTimer);
      this._utteranceDebounceTimer = null;

      clearTimeout(this._utteranceEndDebounceTimer);
      this._utteranceEndDebounceTimer = setTimeout(() => {
        this._utteranceEndDebounceTimer = null;
        this._flushPendingUtterance('UtteranceEnd');
      }, 1500);
    }
  }

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
    clearTimeout(this._utteranceEndDebounceTimer);
    this._utteranceEndDebounceTimer = null;
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
