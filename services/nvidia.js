/* ═══════════════════════════════════════════════════════════════════
   CocoAI — NVIDIA NIM Vision Service
   Multimodal image analysis via NVIDIA Integrate API (OpenAI-compatible)
   Primary model:  nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
   Fallback model: minimax-ai/minimax-m3
   ═══════════════════════════════════════════════════════════════════ */

const NvidiaService = {

  ENDPOINT: 'https://integrate.api.nvidia.com/v1/chat/completions',

  // Model fallback chain
  MODEL_CHAIN: [
    'meta/llama-3.2-90b-vision-instruct',            // Primary: 90B state-of-the-art vision and reasoning
    'minimaxai/minimax-m3',                           // Fallback 1: High-speed MoE vision model
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',  // Fallback 2: Omni-modal reasoning
  ],

  MAX_RETRIES: 3,
  BASE_DELAY_MS: 600,

  /**
   * Analyze a screen capture using NVIDIA NIM vision models.
   * Streams the response chunk-by-chunk just like GeminiService.analyzeImage.
   *
   * @param {string} apiKey        - NVIDIA NIM API key (nvapi-...)
   * @param {string} base64Image   - Base64 image string (with or without data URL prefix)
   * @param {string} prompt        - Instruction text sent to the model
   * @param {function} [onChunk]   - Called with each streamed text chunk
   * @param {function} [onStatus]  - Called with status strings (retry/fallback messages)
   * @returns {Promise<string>}    - Full compiled response text
   */
  async analyzeImage(apiKey, base64Image, prompt, onChunk, onStatus) {
    if (!apiKey) {
      throw new Error('NVIDIA API key is missing. Add BUILD_NVIDIA_API_KEY in Settings.');
    }
    if (!prompt) {
      prompt = 'Analyze the code, question, error, or diagram in this screenshot. Provide a clear step-by-step solution with complete corrected code blocks and time/space complexity analysis where applicable.';
    }

    // Normalise base64 — keep data URL prefix since NVIDIA accepts it
    const imageUrl = base64Image.startsWith('data:')
      ? base64Image
      : `data:image/png;base64,${base64Image}`;

    let lastError = null;

    for (let modelIdx = 0; modelIdx < this.MODEL_CHAIN.length; modelIdx++) {
      const model = this.MODEL_CHAIN[modelIdx];

      for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
        try {
          if (onStatus) {
            const friendlyName = model.split('/')[1] || model;
            if (attempt > 0 || modelIdx > 0) {
              const msg = attempt > 0
                ? `⏳ Rate limited — retry ${attempt}/${this.MAX_RETRIES} on ${friendlyName}...`
                : `🔄 Switching to fallback model: ${friendlyName}...`;
              onStatus(msg);
            } else {
              onStatus(`📡 Initializing connection to NVIDIA NIM...`);
            }
          }

          const body = JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: imageUrl } }
                ]
              }
            ],
            temperature: 0.2,
            max_tokens: 2048,
            stream: true
          });

          const fetchPromise = fetch(this.ENDPOINT, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'text/event-stream',
              'Content-Type': 'application/json'
            },
            body
          });

          if (onStatus) {
            const friendlyName = model.split('/')[1] || model;
            onStatus(`🧠 Processing image tokens on ${friendlyName}...`);
          }

          const response = await fetchPromise;

          // ── Rate Limit (429) — Retry with backoff ──
          if (response.status === 429) {
            const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`⚠️ NVIDIA 429 on ${model}. Waiting ${delay / 1000}s...`);
            if (onStatus) onStatus(`⏳ Rate limited — waiting ${Math.round(delay / 1000)}s before retry...`);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }

          // ── Other API error ──
          if (!response.ok) {
            const errText = await response.text();
            let errMsg = `NVIDIA API error ${response.status}`;
            try {
              const errJson = JSON.parse(errText);
              if (errJson.detail || errJson.message) {
                errMsg += `: ${errJson.detail || errJson.message}`;
              }
            } catch (_) {
              errMsg += `: ${errText.slice(0, 200)}`;
            }
            throw new Error(errMsg);
          }

          // ── Success: Stream SSE chunks ──
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullText = '';
          let streamStarted = false;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split('\n');
              buffer = lines.pop(); // keep incomplete line in buffer

              for (const line of lines) {
                const clean = line.trim();
                if (!clean || clean === 'data: [DONE]') continue;

                if (clean.startsWith('data: ')) {
                  try {
                    const json = JSON.parse(clean.substring(6));
                    const chunk = json.choices?.[0]?.delta?.content;
                    if (chunk) {
                      streamStarted = true;
                      fullText += chunk;
                      if (onChunk) onChunk(chunk);
                    }
                  } catch (e) {
                    console.warn('[NVIDIA] Failed to parse SSE chunk:', e);
                  }
                }
              }
            }

            // Flush remaining buffer
            const remaining = buffer.trim();
            if (remaining.startsWith('data: ') && remaining !== 'data: [DONE]') {
              try {
                const json = JSON.parse(remaining.substring(6));
                const chunk = json.choices?.[0]?.delta?.content;
                if (chunk) {
                  fullText += chunk;
                  if (onChunk) onChunk(chunk);
                }
              } catch (_) {}
            }

            console.log(`🥥 NVIDIA analysis streaming succeeded — model: ${model}`);
            return fullText;

          } catch (streamErr) {
            if (streamStarted) {
              console.warn('[NVIDIA] Stream interrupted mid-generation. Returning partial response.', streamErr);
              return fullText;
            }
            throw streamErr;
          }

        } catch (err) {
          lastError = err;

          // Non-429 NVIDIA errors — skip retries, try next model
          if (err.message?.includes('NVIDIA API error') && !err.message.includes('429')) {
            break;
          }

          // Network errors — retry with backoff
          if (!err.message?.includes('NVIDIA API error')) {
            const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`⚠️ Network error on ${model}. Retrying in ${delay / 1000}s...`, err.message);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }

      console.warn(`❌ All retries exhausted for model: ${model}. Trying next fallback...`);
    }

    // All models exhausted
    throw new Error(
      lastError?.message ||
      'All NVIDIA models are rate-limited. Falling back to Gemini.'
    );
  }
};

// Export for renderer scripts
window.NvidiaService = NvidiaService;
