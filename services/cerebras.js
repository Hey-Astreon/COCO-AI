/* ═══════════════════════════════════════════════════════════════════
   CocoAI — Cerebras AI Service
   Streaming chat completions via Cerebras (OpenAI-compatible API)
   ═══════════════════════════════════════════════════════════════════ */

const https = require('https');

const CEREBRAS_BASE = 'api.cerebras.ai';

// Available models on Cerebras
const MODELS = {
  'llama-8b': 'llama-3.1-8b',
  'llama-70b': 'llama-3.3-70b',
  'qwen-32b': 'qwen-3-32b',
};

const DEFAULT_MODEL = 'llama-3.3-70b';

/**
 * Build the system prompt for interview context
 */
function buildSystemPrompt(context = {}) {
  let prompt = `You are CocoAI, an elite AI interview copilot assisting a candidate in a live technical interview. Your answers MUST sound like a smart, natural human candidate speaking — NOT an AI textbook.

CRITICAL ANSWER QUALITY & LENGTH RULES:
1. STRICT LENGTH PROPORTIONALITY:
   - Simple/Quick Questions (e.g., definitions, concepts, quick comparisons): 40 to 75 words MAX. Give a 2-3 sentence punchy answer.
   - Medium/Technical Questions (e.g., system design, architecture, framework concepts): 80 to 140 words MAX. Clear bullet points.
   - Coding Problems: Output ONLY the clean runnable code block + 2 lines explaining approach, O(Time), and O(Space).
   - Behavioral Questions: Use STAR method in 100 to 140 words total (1 short bullet each for Situation, Task, Action, Result).

2. ZERO FLUFF / NO "AI COOKED" PREAMBLES:
   - NEVER start with pleasantries or preambles like "Sure!", "Certainly!", "Great question!", "Here is a breakdown...", "In technical interviews...".
   - Start IMMEDIATELY with the answer on line 1.
   - NEVER end with conclusions like "In summary", "To conclude", "Hope this helps!".

3. NATURAL HUMAN SPEAKING TONE:
   - Use direct, spoken English that the candidate can read aloud effortlessly.
   - Avoid overly formal academic jargon or textbook definitions. Use practical industry terms.

4. ROBUSTNESS TO TRANSCRIPTION & PRONUNCIATION ERRORS:
   - The question transcript you receive is captured in real-time from a speech-to-text engine. It may contain minor phonetic typos, misheard words, or minor grammar/pronunciation errors (e.g. "reactive native" instead of "React Native", "usestate hook" instead of "useState hook", "docker container" instead of "Docker container").
   - Intelligently reconstruct the interviewer's original intent based on technical context and answer the correct underlying question. Do NOT mention or point out any transcription errors.

5. STRICT ANSWER LENGTH COMPLIANCE:
   - Enforce these word counts strictly. Never exceed them under any circumstances. Keep your answers concise, practical, and conversational.`;

  if (context.resume) {
    // Sanitize and cap resume to max 1,500 words (~6000 chars) to prevent token context window bloat
    const cleanResume = String(context.resume).trim();
    const words = cleanResume.split(/\s+/);
    const cappedResume = words.length > 1500 ? words.slice(0, 1500).join(' ') + ' ...[truncated]' : cleanResume;

    prompt += `\n\nCANDIDATE'S RESUME (PRIMARY SOURCE FOR CANDIDATE'S PERSONALITY, SKILLS & PROJECTS):\n${cappedResume}\n\nIMPORTANT CONTEXT INSTRUCTION FOR PERSONAL & BEHAVIORAL QUESTIONS:
The resume above defines the candidate's professional identity, technical skills, real-world projects, work history, education, and domain expertise.
For ANY personal, behavioral, or experience-based questions (e.g., "Tell me about yourself", "What are your strengths?", "Describe a challenging project you built", "What technologies do you prefer?", "Why should we hire you?"):
1. Speak in FIRST PERSON ("I", "my", "we") as the candidate.
2. Ground your answer directly in the candidate's actual projects, programming languages, frameworks, and job experience listed in the resume.
3. Reflect the candidate's professional background and technical persona.
4. Keep spoken personal responses concise (60-90 words max), natural, and confident.`;
  }
  if (context.jobDescription) {
    const cleanJD = String(context.jobDescription).trim();
    const jdWords = cleanJD.split(/\s+/);
    const cappedJD = jdWords.length > 1000 ? jdWords.slice(0, 1000).join(' ') + ' ...[truncated]' : cleanJD;
    prompt += `\n\nJOB DESCRIPTION:\n${cappedJD}`;
  }
  if (context.transcript && context.transcript.length > 0) {
    const recentTranscript = context.transcript.slice(-10).map(t =>
      `${t.role}: ${t.text}`
    ).join('\n');
    prompt += `\n\nRECENT INTERVIEW TRANSCRIPT:\n${recentTranscript}`;
  }

  return prompt;
}

/**
 * Stream a chat completion from Cerebras API
 * @param {string} apiKey - Cerebras API key
 * @param {string} question - The interview question
 * @param {object} options - { model, context, onChunk, onDone, onError }
 * @returns {object} - { abort() } to cancel the request
 */
function streamCompletion(apiKey, question, options = {}) {
  const {
    model = DEFAULT_MODEL,
    context = {},
    onChunk = () => {},
    onDone = () => {},
    onError = () => {},
    attempt = 0,
    maxRetries = 3,
  } = options;

  let isAborted = false;
  let activeReq = null;

  const systemPrompt = buildSystemPrompt(context);

  const payload = JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ],
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 0.9,
  });

  activeReq = https.request({
    hostname: CEREBRAS_BASE,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'text/event-stream',
    },
  }, (res) => {
    // ── Handle 429 Queue Exceeded — Exponential backoff retry or fallback model ──
    if (res.statusCode === 429) {
      if (attempt < maxRetries && !isAborted) {
        const delay = 600 * Math.pow(2, attempt); // 600ms, 1200ms, 2400ms
        console.warn(`⚠️ Cerebras 429 Queue Exceeded on ${model}. Retrying in ${delay}ms (Attempt ${attempt + 1}/${maxRetries})...`);
        setTimeout(() => {
          if (!isAborted) {
            streamCompletion(apiKey, question, {
              ...options,
              attempt: attempt + 1
            });
          }
        }, delay);
        return;
      } else if (!isAborted) {
        // Fallback to gemma-4-31b or qwen-3-32b if primary model is queue-clogged
        const fallbackModel = (model === 'gemma-4-31b') ? 'qwen-3-32b' : 'gemma-4-31b';
        console.warn(`⚠️ Cerebras ${model} queue exhausted — switching fallback model to ${fallbackModel}...`);
        streamCompletion(apiKey, question, {
          ...options,
          model: fallbackModel,
          attempt: 0
        });
        return;
      }
    }

    if (res.statusCode !== 200) {
      let errorBody = '';
      res.on('data', (chunk) => { errorBody += chunk.toString(); });
      res.on('end', () => {
        if (!isAborted) {
          onError(new Error(`Cerebras API error ${res.statusCode}: ${errorBody}`));
        }
      });
      res.on('error', (err) => {
        if (!isAborted) onError(err);
      });
      return;
    }

    let buffer = '';
    let fullText = '';

    res.on('data', (chunk) => {
      if (isAborted) return;
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          if (!isAborted) onDone(fullText);
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta && !isAborted) {
            fullText += delta;
            onChunk(delta, fullText);
          }
        } catch (e) {}
      }
    });

    res.on('end', () => {
      if (!isAborted && fullText) {
        onDone(fullText);
      }
    });

    res.on('error', (err) => {
      if (!isAborted) onError(err);
    });
  });

  activeReq.on('error', (err) => {
    if (attempt < maxRetries && !isAborted) {
      const delay = 600 * Math.pow(2, attempt);
      setTimeout(() => {
        if (!isAborted) {
          streamCompletion(apiKey, question, {
            ...options,
            attempt: attempt + 1
          });
        }
      }, delay);
      return;
    }
    if (!isAborted) onError(err);
  });

  activeReq.write(payload);
  activeReq.end();

  return {
    abort: () => {
      isAborted = true;
      if (activeReq) {
        try { activeReq.destroy(); } catch (e) {}
      }
    }
  };
}

/**
 * Non-streaming completion (for quick one-shot queries)
 */
function getCompletion(apiKey, question, model = DEFAULT_MODEL) {
  return new Promise((resolve, reject) => {
    let result = '';
    streamCompletion(apiKey, question, {
      model,
      onChunk: (chunk) => { result += chunk; },
      onDone: (text) => resolve(text),
      onError: reject,
    });
  });
}

/**
 * Fetch available models from Cerebras
 */
function getModels(apiKey) {
  return new Promise((resolve) => {
    const req = https.get({
      hostname: CEREBRAS_BASE,
      path: '/v1/models',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 3000,
    }, (res) => {
      if (res.statusCode !== 200) {
        resolve([]);
        return;
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const models = (parsed.data || []).map(m => m.id);
          resolve(models);
        } catch (e) {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.on('timeout', () => {
      try { req.destroy(); } catch(e) {}
      resolve([]);
    });
  });
}

module.exports = {
  MODELS,
  DEFAULT_MODEL,
  streamCompletion,
  getCompletion,
  getModels,
  buildSystemPrompt,
};

