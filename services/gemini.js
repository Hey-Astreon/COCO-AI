/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Gemini Vision Service
   Multimodal content generation via Google Gemini API (REST)
   With retry logic, exponential backoff, and model fallback
   ═══════════════════════════════════════════════════════════════════ */

const GeminiService = {
  // Model fallback chain — if one model is rate-limited, try the next
  MODEL_CHAIN: [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ],

  MAX_RETRIES: 3,
  BASE_DELAY_MS: 800,  // 800ms initial delay for faster retries

  /**
   * Analyze screen capture with Gemini Vision API (REST)
   * Automatically retries on 429 rate-limit errors with exponential backoff,
   * and falls back to alternative models if all retries are exhausted.
   *
   * @param {string} apiKey - Gemini API Key
   * @param {string} base64Image - Base64 image data (with or without prefix)
   * @param {string} prompt - Vision prompt
   * @param {function} [onChunk] - Optional callback for streaming text chunks
   * @param {function} [onStatus] - Optional callback for status updates (e.g. "Retrying...")
   * @returns {Promise<string>} - The full compiled response text
   */
  async analyzeImage(apiKey, base64Image, prompt, onChunk, onStatus) {
    if (!prompt) {
      prompt = 'Identify the coding problem, question, or diagram in this screenshot and provide a clear, concise step-by-step solution with code.';
    }
    if (!apiKey) {
      throw new Error('Gemini API key is missing. Set it in the Settings panel (⚙).');
    }

    // Remove the data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const requestBody = JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048
      }
    });

    // Try each model in the fallback chain
    let lastError = null;

    for (let modelIdx = 0; modelIdx < this.MODEL_CHAIN.length; modelIdx++) {
      const model = this.MODEL_CHAIN[modelIdx];

      // Retry loop with exponential backoff for each model
      for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

          if (onStatus && (attempt > 0 || modelIdx > 0)) {
            const msg = attempt > 0
              ? `⏳ Rate limited — retry ${attempt}/${this.MAX_RETRIES} on ${model}...`
              : `🔄 Switching to fallback model: ${model}...`;
            onStatus(msg);
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: requestBody
          });

          // ── Rate Limit (429) — Retry with backoff ──
          if (response.status === 429) {
            const delay = this.BASE_DELAY_MS * Math.pow(2, attempt);
            console.warn(`⚠️ Gemini 429 rate limit on ${model}. Waiting ${delay / 1000}s before retry ${attempt + 1}/${this.MAX_RETRIES}...`);

            if (onStatus) {
              onStatus(`⏳ Rate limited — waiting ${Math.round(delay / 1000)}s before retry...`);
            }

            await new Promise(r => setTimeout(r, delay));
            continue; // retry same model
          }

          // ── Other API error — don't retry, throw immediately ──
          if (!response.ok) {
            const errText = await response.text();
            let errMsg = `Gemini API error ${response.status}`;
            try {
              const errJson = JSON.parse(errText);
              if (errJson.error?.message) {
                errMsg += `: ${errJson.error.message}`;
              }
            } catch (_) {
              errMsg += `: ${errText.slice(0, 200)}`;
            }
            throw new Error(errMsg);
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

            console.log(`🥥 Gemini analysis streaming succeeded on model: ${model}`);
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

