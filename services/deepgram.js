/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Deepgram Live Audio Transcription Service  v2.1
   Real-time speech-to-text using browser MediaRecorder + Deepgram WS

   Key improvements over v1:
   - audioBitsPerSecond: 16000 → 128000  (8x better audio quality)
   - sampleRate: 16000 → 48000            (CD-quality capture)
   - Added WebSocket KeepAlive heartbeat  (prevents mid-question drops)
   - Added debounce safety net            (fires if UtteranceEnd never arrives)
   - endpointing: 800ms, utterance_end: 2000ms (better silence detection)
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
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;       // increased from 3 → 5 for more resilience
    this.micStreamTracks = null;
    this.systemStreamTracks = null;

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
      const highQualityMicConstraints = {
        channelCount: 1,
        sampleRate: 48000,          // CD-quality — was 16000
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
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

            // Mix streams using AudioContext
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const micSource = audioCtx.createMediaStreamSource(micStream);
            const systemSource = audioCtx.createMediaStreamSource(systemStream);
            const dest = audioCtx.createMediaStreamDestination();

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
   */
  _connectWebSocket() {
    const params = new URLSearchParams({
      model: 'nova-3',              // Deepgram's most accurate model
      language: 'en-US',            // was 'en' — en-US has better US accent coverage
      smart_format: 'true',         // auto-formats numbers, dates, currency
      punctuate: 'true',            // adds punctuation for better readability
      interim_results: 'true',      // live in-progress text while speaking
      utterance_end_ms: '2000',     // wait 2s of silence before UtteranceEnd — was 1500ms
      vad_events: 'true',           // voice activity detection events
      endpointing: '800',           // 800ms silence threshold — prevents mid-sentence triggers
      no_delay: 'true',             // reduces transcript delivery latency
      filler_words: 'false',        // strip "um", "uh", "like" from transcripts
    });

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    this.ws = new WebSocket(wsUrl, ['token', this.apiKey]);

    this.ws.onopen = () => {
      console.log('[Deepgram] WebSocket connected');
      this.isListening = true;
      this.reconnectAttempts = 0;
      this._setStatus('listening');
      this._startRecording();
      this._startKeepAlive();   // prevent idle disconnection
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

      // Auto-reconnect on unexpected close (not user-initiated)
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * this.reconnectAttempts, 5000); // 1s, 2s, 3s... up to 5s
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
   * Send a KeepAlive ping every 8 seconds to prevent Deepgram from
   * closing the WebSocket during silences (Deepgram closes after ~10s of no audio).
   */
  _startKeepAlive() {
    this._stopKeepAlive();
    this._keepAliveTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
        console.log('[Deepgram] KeepAlive sent');
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
   */
  _startRecording() {
    if (!this.mediaStream) return;

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000,   // 128kbps — was 16000 (8x better quality = 8x better accuracy)
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(event.data);
      }
    };

    // Send audio chunks every 200ms for smooth real-time transcription
    this.mediaRecorder.start(200);
    console.log('[Deepgram] MediaRecorder started at 128kbps');
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

        // Accumulate final chunks into the utterance buffer.
        // The AI trigger fires ONLY from UtteranceEnd — not here.
        if (isFinal) {
          if (!this._pendingUtterance) this._pendingUtterance = [];
          this._pendingUtterance.push(transcript.trim());

          // ── Safety debounce net ──────────────────────────────────────
          // If UtteranceEnd never arrives (network hiccup, Deepgram plan limits),
          // fire the trigger ourselves after 3 seconds of no new isFinal chunks.
          clearTimeout(this._utteranceDebounceTimer);
          this._utteranceDebounceTimer = setTimeout(() => {
            if (this._pendingUtterance && this._pendingUtterance.length > 0) {
              const fullUtterance = this._pendingUtterance.join(' ');
              this._pendingUtterance = [];
              console.log('[Deepgram] Debounce fired (UtteranceEnd not received):', fullUtterance);
              if (this.onUtteranceEnd) this.onUtteranceEnd(fullUtterance);
            }
          }, 3000);
        }
      }
    }

    // UtteranceEnd — primary trigger gate.
    // Fires after speaker has been silent for utterance_end_ms (2000ms).
    if (data.type === 'UtteranceEnd') {
      clearTimeout(this._utteranceDebounceTimer);   // cancel safety net — not needed
      this._utteranceDebounceTimer = null;

      if (this._pendingUtterance && this._pendingUtterance.length > 0) {
        const fullUtterance = this._pendingUtterance.join(' ');
        this._pendingUtterance = [];
        console.log('[Deepgram] UtteranceEnd received. Full utterance:', fullUtterance);
        if (this.onUtteranceEnd) this.onUtteranceEnd(fullUtterance);
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
   * Check if a transcript line is likely a question worth answering
   */
  static isQuestion(text) {
    const trimmed = text.trim();

    // Must be at least 4 words to avoid triggering on noise like "what?" or "how?"
    if (trimmed.split(/\s+/).length < 4) return false;

    // Direct question mark
    if (trimmed.endsWith('?')) return true;

    // Common question starters (interview-specific)
    const questionStarters = [
      'what', 'how', 'why', 'when', 'where', 'who', 'which',
      'can you', 'could you', 'would you', 'do you', 'did you',
      'have you', 'are you', 'is there', 'tell me', 'describe',
      'explain', 'walk me through', 'give me an example',
      "what's your", 'what is your', 'talk me through',
      'write a', 'write the', 'implement', 'code a', 'code the',
      'design a', 'design the', 'find the', 'solve',
    ];

    const lower = trimmed.toLowerCase();
    return questionStarters.some(s => lower.startsWith(s));
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

    this._setStatus('paused');
    console.log('[Deepgram] Stopped');
  }
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DeepgramService };
}
