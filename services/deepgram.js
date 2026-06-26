/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Deepgram Live Audio Transcription Service
   Real-time speech-to-text using browser MediaRecorder + Deepgram WS
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
    this.onTranscript = null;    // callback(text, isFinal, speaker)
    this.onError = null;         // callback(error)
    this.onStatusChange = null;  // callback(status) — 'connecting'|'listening'|'paused'|'error'
    this.reconnectAttempts = 0;
    this.maxReconnects = 3;
  }

  /**
   * Start capturing audio from the user's microphone
   * and streaming to Deepgram for transcription
   */
  async startMicrophone() {
    try {
      this._setStatus('connecting');

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Connect to Deepgram WebSocket
      this._connectWebSocket();

    } catch (err) {
      this._setStatus('error');
      if (this.onError) this.onError(err);
      console.error('[Deepgram] Microphone access error:', err);
    }
  }

  /**
   * Start capturing system audio (speaker loopback) using Electron's
   * desktopCapturer — this captures interviewer's voice from Zoom/Meet/Teams
   */
  async startSystemAudio() {
    try {
      this._setStatus('connecting');

      // Use Electron's desktopCapturer to get system audio
      // This needs to be called from the renderer with proper permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // In Electron, we can capture system audio via a loopback device
          // For now, fall back to mic if system audio isn't available
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: false,
          noiseSuppression: true,
        }
      });

      this.mediaStream = stream;
      this._connectWebSocket();

    } catch (err) {
      console.warn('[Deepgram] System audio not available, falling back to mic');
      await this.startMicrophone();
    }
  }

  /**
   * Connect to Deepgram's live transcription WebSocket
   */
  _connectWebSocket() {
    const params = new URLSearchParams({
      model: 'nova-3',
      language: 'en',
      smart_format: 'true',
      punctuate: 'true',
      interim_results: 'true',
      utterance_end_ms: '1500',
      vad_events: 'true',
      endpointing: '300',
    });

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    this.ws = new WebSocket(wsUrl, ['token', this.apiKey]);

    this.ws.onopen = () => {
      console.log('[Deepgram] WebSocket connected');
      this.isListening = true;
      this.reconnectAttempts = 0;
      this._setStatus('listening');
      this._startRecording();
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

      // Auto-reconnect on unexpected close
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        console.log(`[Deepgram] Reconnecting (attempt ${this.reconnectAttempts})...`);
        this._setStatus('connecting');
        setTimeout(() => this._connectWebSocket(), 2000);
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
   * Start MediaRecorder to capture and send audio chunks
   */
  _startRecording() {
    if (!this.mediaStream) return;

    // Use a format supported by browsers and Deepgram
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 16000,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(event.data);
      }
    };

    // Send audio chunks every 250ms for real-time transcription
    this.mediaRecorder.start(250);
    console.log('[Deepgram] MediaRecorder started');
  }

  /**
   * Handle incoming transcript results from Deepgram
   */
  _handleTranscript(data) {
    // Handle transcript results
    if (data.type === 'Results') {
      const transcript = data.channel?.alternatives?.[0]?.transcript;
      const isFinal = data.is_final;
      const speechFinal = data.speech_final;

      if (transcript && transcript.trim()) {
        // Determine speaker role (simple heuristic — can be improved)
        const speaker = this._detectSpeaker(transcript);

        if (this.onTranscript) {
          this.onTranscript(transcript.trim(), isFinal, speaker, speechFinal);
        }
      }
    }

    // Handle utterance end events
    if (data.type === 'UtteranceEnd') {
      // Utterance complete — good time to trigger AI if it was a question
    }
  }

  /**
   * Simple speaker detection heuristic
   * In a real implementation, this would use Deepgram's diarization
   * For now, we treat all incoming audio as "interviewer" since the
   * candidate typically knows what they said themselves
   */
  _detectSpeaker(transcript) {
    // Default to 'interviewer' — the primary use case is detecting their questions
    return 'interviewer';
  }

  /**
   * Check if a transcript line is likely a question
   */
  static isQuestion(text) {
    const trimmed = text.trim();
    // Direct question mark
    if (trimmed.endsWith('?')) return true;

    // Common question starters
    const questionStarters = [
      'what', 'how', 'why', 'when', 'where', 'who', 'which',
      'can you', 'could you', 'would you', 'do you', 'did you',
      'have you', 'are you', 'is there', 'tell me', 'describe',
      'explain', 'walk me through', 'give me an example',
      'what\'s your', 'what is your',
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

  /**
   * Pause transcription (keep connection alive)
   */
  pause() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
      this._setStatus('paused');
    }
  }

  /**
   * Resume transcription
   */
  resume() {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
      this._setStatus('listening');
    }
  }

  /**
   * Stop transcription and clean up
   */
  stop() {
    this.isListening = false;

    if (this.mediaRecorder) {
      try { this.mediaRecorder.stop(); } catch (e) {}
      this.mediaRecorder = null;
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
