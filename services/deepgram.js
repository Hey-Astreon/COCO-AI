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
   */
  _connectWebSocket() {
    const params = new URLSearchParams({
      model: 'nova-3',              // Deepgram's most accurate model
      language: 'en-US',            // en-US for optimal technical accent coverage
      smart_format: 'true',         // auto-formats numbers, dates, currency
      punctuate: 'true',            // adds punctuation for better readability
      interim_results: 'true',      // required for interim transcripts and VAD
      utterance_end_ms: '1000',     // 1000ms (1.0s) silence threshold — Deepgram minimum required value
      vad_events: 'true',           // voice activity detection events
      endpointing: '500',           // 500ms silence threshold — sub-second sentence completion
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
   * Stop MediaRecorder cleanly so fresh WebM headers are sent on next connection
   */
  _stopRecording() {
    if (this.mediaRecorder) {
      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch (_) {}
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
   */
  _startRecording() {
    if (!this.mediaStream) return;
    this._stopRecording();

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(event.data);
      }
    };

    // Send audio chunks every 150ms for ultra-responsive streaming
    this.mediaRecorder.start(150);
    console.log('[Deepgram] MediaRecorder started with fresh WebM headers');
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
        if (isFinal) {
          if (!this._pendingUtterance) this._pendingUtterance = [];
          this._pendingUtterance.push(transcript.trim());

          // ⚡ Instant Trigger on speech_final (0ms delay!)
          if (speechFinal && this._pendingUtterance.length > 0) {
            clearTimeout(this._utteranceDebounceTimer);
            this._utteranceDebounceTimer = null;
            const fullUtterance = this._pendingUtterance.join(' ');
            this._pendingUtterance = [];
            console.log('[Deepgram] Instant speech_final trigger:', fullUtterance);
            if (this.onUtteranceEnd) this.onUtteranceEnd(fullUtterance);
            return;
          }

          // Fast Safety Debounce Net (1.2s)
          clearTimeout(this._utteranceDebounceTimer);
          this._utteranceDebounceTimer = setTimeout(() => {
            if (this._pendingUtterance && this._pendingUtterance.length > 0) {
              const fullUtterance = this._pendingUtterance.join(' ');
              this._pendingUtterance = [];
              console.log('[Deepgram] Safety net trigger (1.2s):', fullUtterance);
              if (this.onUtteranceEnd) this.onUtteranceEnd(fullUtterance);
            }
          }, 1200);
        }
      }
    }

    // UtteranceEnd — primary trigger gate.
    if (data.type === 'UtteranceEnd') {
      clearTimeout(this._utteranceDebounceTimer);
      this._utteranceDebounceTimer = null;

      if (this._pendingUtterance && this._pendingUtterance.length > 0) {
        const fullUtterance = this._pendingUtterance.join(' ');
        this._pendingUtterance = [];
        console.log('[Deepgram] UtteranceEnd trigger:', fullUtterance);
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
   * Check if a transcript line is an interview question/prompt worth answering
   */
  static isQuestion(text) {
    if (!text) return false;
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/);

    // Ignore single/double word filler background noise like "okay", "yeah"
    if (words.length < 3) return false;

    // In a live technical interview, ANY utterance > 2 words spoken by the interviewer
    // is a question, follow-up, or instruction that needs an AI answer.
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
