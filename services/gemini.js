/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Gemini Vision Service
   Multimodal content generation via Google Gemini API (REST)
   With retry logic, exponential backoff, and model fallback
   ═══════════════════════════════════════════════════════════════════ */

const GeminiService = {
  // Model fallback chain — Google Gemini official REST endpoints
  MODEL_CHAIN: [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
  ],

  MAX_RETRIES: 2,
  BASE_DELAY_MS: 500,
  REQUEST_TIMEOUT_MS: 30000, // 30s timeout per model for vision processing (was 6s, too short)

  async analyzeImage(apiKey, base64Images, prompt, onChunk, onStatus) {
    if (!prompt) {
      prompt = 'Identify the coding problem, question, or diagram in this screenshot and provide a clear, concise step-by-step solution with code.';
    }
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Set it in the Settings panel (⚙).');
    }

    // Normalize to array
    const imageArray = Array.isArray(base64Images) ? base64Images : [base64Images];

    // Build parts: text prompt first, then all images
    const parts = [{ text: prompt }];
    for (const img of imageArray) {
      const cleanBase64 = img.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64
        }
      });
    }

    const requestBody = JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096
      }
    });

    let lastError = null;

    for (let modelIdx = 0; modelIdx < this.MODEL_CHAIN.length; modelIdx++) {
      const model = this.MODEL_CHAIN[modelIdx];

      for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

          if (onStatus && (attempt > 0 || modelIdx > 0)) {
            const msg = attempt > 0
              ? `⏳ Rate limited — retry ${attempt}/${this.MAX_RETRIES} on ${model}...`
              : `🔄 Switching to model: ${model}...`;
            onStatus(msg);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

          let response;
          try {
            response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: requestBody,
              signal: controller.signal
            });
          } finally {
            clearTimeout(timeoutId);
          }

          // Rate Limit (429) — Retry same model with short backoff
          if (response.status === 429) {
            const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`⚠️ Gemini 429 on ${model}. Waiting ${delay}ms...`);
            if (onStatus) onStatus(`⏳ Gemini rate limited — retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }

          // Invalid Model (404/400) or Server Error — break attempt loop and switch to next model immediately!
          if (!response.ok) {
            const errText = await response.text();
            console.warn(`⚠️ Gemini ${model} returned HTTP ${response.status}: ${errText.slice(0, 150)} — switching model...`);
            lastError = new Error(`Gemini ${model} failed (${response.status})`);
            break; // try next model in MODEL_CHAIN
          }

          // ── Success: Stream Chunks ──
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
              buffer = lines.pop(); // Keep partial line in buffer

              for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine) continue;

                if (cleanLine.startsWith('data: ')) {
                  const dataStr = cleanLine.substring(6);
                  try {
                    const json = JSON.parse(dataStr);
                    const chunkText = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (chunkText) {
                      streamStarted = true;
                      fullText += chunkText;
                      if (onChunk) {
                        onChunk(chunkText);
                      }
                    }
                  } catch (e) {
                    console.warn('[Gemini] Failed to parse SSE JSON chunk:', e);
                  }
                }
              }
            }

            // Flush remaining buffer
            if (buffer.trim().startsWith('data: ')) {
              try {
                const json = JSON.parse(buffer.trim().substring(6));
                const chunkText = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (chunkText) {
                  fullText += chunkText;
                  if (onChunk) onChunk(chunkText);
                }
              } catch (_) {}
            }

            console.log(`✨ Gemini analysis streaming succeeded on model: ${model}`);
            return fullText;

          } catch (streamErr) {
            if (streamStarted) {
              console.warn('[Gemini] Stream interrupted mid-generation. Returning partial response.', streamErr);
              return fullText;
            }
            throw streamErr;
          }

        } catch (err) {
          lastError = err;

          // If it's a non-429 API error, don't retry — break to next model
          if (err.message && err.message.includes('Gemini API error') && !err.message.includes('429')) {
            break;
          }

          // If it's a network error, retry
          if (!err.message?.includes('Gemini API error')) {
            const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`⚠️ Network error on ${model}. Retrying in ${delay / 1000}s...`, err.message);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }

      // All retries exhausted for this model — move to next model in chain
      console.warn(`❌ All retries exhausted for model: ${model}. Trying next fallback...`);
    }

    // All models and retries exhausted
    throw new Error(
      lastError?.message ||
      'All Gemini models are rate-limited. Please wait 30-60 seconds and try again, or check your API key quota at https://aistudio.google.com.'
    );
  }
};

// Export for renderer scripts
window.GeminiService = GeminiService;

