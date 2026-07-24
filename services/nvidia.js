/* ═══════════════════════════════════════════════════════════════════
   CocoAI — NVIDIA NIM Vision Service
   Multimodal image analysis via NVIDIA Integrate API (OpenAI-compatible)
   Primary model:  minimaxai/minimax-m3 (High-speed MoE, best accuracy)
   Fallback 1:     meta/llama-3.2-11b-vision-instruct
   Fallback 2:     nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
   ═══════════════════════════════════════════════════════════════════ */

const NvidiaService = {

  ENDPOINT: 'https://integrate.api.nvidia.com/v1/chat/completions',

  // Model fallback chain
  MODEL_CHAIN: [
    'minimaxai/minimax-m3',                           // Primary: High-speed MoE vision model (Excellent accuracy & instruction following)
    'meta/llama-3.2-11b-vision-instruct',            // Fallback 1: 11B high-speed vision model
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning',  // Fallback 2: Omni-modal reasoning
  ],

  MAX_RETRIES: 1,
  BASE_DELAY_MS: 150,
  REQUEST_TIMEOUT_MS: 3000,  // Kill any single request that takes > 3s

  /**
   * Analyze screen capture(s) using NVIDIA NIM vision models.
   * Supports single image (string) or multiple images (array) for long scrollable problems.
   * Streams the response chunk-by-chunk just like GeminiService.analyzeImage.
   *
   * @param {string} apiKey        - NVIDIA NIM API key (nvapi-...)
   * @param {string|string[]} base64Images - Single base64 image string or array of base64 image strings
   * @param {string} prompt        - Instruction text sent to the model
   * @param {function} [onChunk]   - Called with each streamed text chunk
   * @param {function} [onStatus]  - Called with status strings (retry/fallback messages)
   * @returns {Promise<string>}    - Full compiled response text
   */
  async analyzeImage(apiKey, base64Images, prompt, onChunk, onStatus) {
    if (!apiKey) {
      throw new Error('NVIDIA API key is missing. Add BUILD_NVIDIA_API_KEY in Settings.');
    }
    if (!prompt) {
      prompt = 'Analyze the code, question, error, or diagram in this screenshot. Provide a clear step-by-step solution with complete corrected code blocks and time/space complexity analysis where applicable.';
    }

    // Normalize to array
    const imageArray = Array.isArray(base64Images) ? base64Images : [base64Images];

    // Build content: text first, then all images
    const contentParts = [{ type: 'text', text: prompt }];
    for (const img of imageArray) {
      const imageUrl = img.startsWith('data:')
        ? img
        : `data:image/png;base64,${img}`;
      contentParts.push({ type: 'image_url', image_url: { url: imageUrl } });
    }

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
                content: contentParts
              }
            ],
            temperature: 0.2,
            max_tokens: 4096,
            stream: true
          });

          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            this.REQUEST_TIMEOUT_MS
          );

          const fetchPromise = fetch(this.ENDPOINT, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'text/event-stream',
              'Content-Type': 'application/json'
            },
            body,
            signal: controller.signal
          });

          let response;
          try {
            response = await fetchPromise;
          } finally {
            clearTimeout(timeoutId);
          }

          // ── Rate Limit (429) — Bail immediately, let Gemini handle it ──
          if (response.status === 429) {
            console.warn(`⚠️ NVIDIA 429 on ${model} — skipping all NVIDIA models, switching to Gemini.`);
            if (onStatus) onStatus('⚡ NVIDIA busy — switching to Gemini instantly...');
            throw Object.assign(new Error('NVIDIA rate-limited: falling back to Gemini.'), { isRateLimit: true });
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

          // 429 bail-out — propagate immediately to skip all remaining NVIDIA models
          if (err.isRateLimit) throw err;

          // Non-429 NVIDIA errors — skip retries, try next model
          if (err.message?.includes('NVIDIA API error') && !err.message.includes('429')) {
            break;
          }

          // Network/timeout errors — retry with backoff
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
