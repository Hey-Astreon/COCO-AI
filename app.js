/* ═════════════════════════════════════════════════════════════
   CocoAI — Application Logic
   Real AI answers via Cerebras + Live audio via Deepgram
   ═════════════════════════════════════════════════════════════ */

'use strict';

// ─── State ────────────────────────────────────────────────────
const state = {
  micActive: false,
  sessionTime: 0,
  messageCount: 0,
  autoScroll: true,
  lastAnswer: '',
  currentModel: 'llama-3.3-70b',
  apiKeys: { cerebras: '', deepgram: '' },
  transcriptHistory: [],  // { role, text } for AI context
  deepgramService: null,
  interimTranscriptEl: null, // For updating interim results
};

// ─── DOM Refs ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const els = {
  opacitySlider: $('opacitySlider'),
  opacityValue: $('opacityValue'),
  mainContainer: $('mainContainer'),
  answersFeed: $('answersFeed'),
  transcriptFeed: $('transcriptFeed'),
  askInput: $('askInput'),
  micBtn: $('micBtn'),
  micIcon: $('micIcon'),
  statusBadge: $('statusBadge'),
  statusDot: document.querySelector('.status-dot'),
  statusText: $('statusText'),
  autoScrollCheck: $('autoScrollCheck'),
  typingIndicator: $('typingIndicator'),
  toast: $('toast'),
  modelSelect: $('modelSelect'),
};

// ─── Initialization ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initOpacitySlider();
  initHotkeys();
  initAutoScroll();
  initModelSelector();
  startSessionTimer();
  await initElectronBridge();
  initDeepgram();
});

// ─── Electron Bridge ──────────────────────────────────────────
async function initElectronBridge() {
  if (window.electronAPI) {
    // Get API keys from main process
    try {
      state.apiKeys = await window.electronAPI.getApiKeys();
      console.log('🥥 API keys loaded:', {
        cerebras: state.apiKeys.cerebras ? '✅ Set' : '❌ Missing',
        deepgram: state.apiKeys.deepgram ? '✅ Set' : '❌ Missing',
      });
    } catch (e) {
      console.error('Failed to get API keys:', e);
    }

    // Listen for AI streaming events
    window.electronAPI.onAIChunk((data) => {
      handleAIChunk(data);
    });
    window.electronAPI.onAIDone((data) => {
      handleAIDone(data);
    });
    window.electronAPI.onAIError((data) => {
      handleAIError(data);
    });

    // Listen for analyze-screen from main process
    window.electronAPI.onAnalyzeScreen(() => {
      analyzeScreen();
    });

    console.log('🥥 CocoAI running in Electron (stealth mode active)');
  } else {
    console.log('🥥 CocoAI running in browser (demo mode)');
  }
}

// ─── Deepgram Audio Service ────────────────────────────────────
function initDeepgram() {
  if (!state.apiKeys.deepgram) {
    console.warn('[Deepgram] No API key — audio disabled');
    updateStatus('idle', 'No API Key');
    return;
  }

  // Load DeepgramService (it runs in the renderer since it uses MediaRecorder)
  // The service file is loaded via script tag in index.html
  if (typeof DeepgramService === 'undefined') {
    console.warn('[Deepgram] DeepgramService not loaded');
    return;
  }

  state.deepgramService = new DeepgramService(state.apiKeys.deepgram);

  // Handle transcription results
  state.deepgramService.onTranscript = (text, isFinal, speaker, speechFinal) => {
    if (isFinal) {
      // Final result — add to transcript feed
      addTranscriptEntry(speaker, text);

      // Store in history for AI context
      state.transcriptHistory.push({ role: speaker, text });

      // Auto-detect questions and generate answers
      if (DeepgramService.isQuestion(text)) {
        setTimeout(() => {
          addQACard(text);
          showToast('❓ Question detected — generating answer...', 'success');
        }, 500);
      }

      // Clear interim element
      if (state.interimTranscriptEl) {
        state.interimTranscriptEl.remove();
        state.interimTranscriptEl = null;
      }
    } else {
      // Interim result — show live updating text
      showInterimTranscript(text);
    }
  };

  // Handle status changes
  state.deepgramService.onStatusChange = (status) => {
    switch (status) {
      case 'connecting':
        updateStatus('connecting', 'Connecting...');
        break;
      case 'listening':
        updateStatus('listening', 'Listening');
        els.micBtn.classList.add('active');
        state.micActive = true;
        // Resume wave animation
        document.querySelectorAll('.wave-bar').forEach(b => b.style.animationPlayState = 'running');
        break;
      case 'paused':
        updateStatus('paused', 'Paused');
        els.micBtn.classList.remove('active');
        state.micActive = false;
        document.querySelectorAll('.wave-bar').forEach(b => b.style.animationPlayState = 'paused');
        break;
      case 'error':
        updateStatus('error', 'Error');
        break;
    }
  };

  // Handle errors
  state.deepgramService.onError = (err) => {
    console.error('[Deepgram] Error:', err);
    showToast('🎙 Audio error: ' + (err.message || 'Connection failed'), 'error');
  };

  updateStatus('idle', 'Ready');
}

function showInterimTranscript(text) {
  if (!state.interimTranscriptEl) {
    state.interimTranscriptEl = document.createElement('div');
    state.interimTranscriptEl.className = 'transcript-entry interviewer interim';
    state.interimTranscriptEl.innerHTML = `
      <div class="transcript-avatar interviewer-avatar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div class="transcript-bubble">
        <div class="transcript-badges">
          <span class="badge badge-interviewer">Interviewer</span>
          <span class="badge badge-interim">Live</span>
        </div>
        <div class="transcript-text interim-text"></div>
      </div>
    `;
    els.transcriptFeed.appendChild(state.interimTranscriptEl);
  }

  const textEl = state.interimTranscriptEl.querySelector('.interim-text');
  if (textEl) textEl.textContent = text;
  scrollToBottom(els.transcriptFeed);
}

function updateStatus(type, text) {
  const dot = els.statusDot;
  const label = els.statusText;

  dot.className = 'status-dot ' + type;
  label.textContent = text;

  if (type === 'listening') {
    label.style.color = 'var(--accent-secondary)';
  } else if (type === 'error') {
    label.style.color = 'var(--accent-danger)';
  } else {
    label.style.color = 'var(--text-muted)';
  }
}

// ─── Model Selector ────────────────────────────────────────────
function initModelSelector() {
  if (els.modelSelect) {
    els.modelSelect.addEventListener('change', () => {
      state.currentModel = els.modelSelect.value;
      showToast(`🧠 Model: ${els.modelSelect.options[els.modelSelect.selectedIndex].text}`, 'success');
    });
  }
}

// ─── Opacity Slider ────────────────────────────────────────────
function initOpacitySlider() {
  const slider = els.opacitySlider;

  const updateSlider = () => {
    const val = slider.value;
    els.opacityValue.textContent = val + '%';

    slider.style.setProperty('--value', val + '%');
    slider.style.background = `linear-gradient(to right,
      var(--accent-primary) 0%,
      var(--accent-primary) ${val}%,
      rgba(255,255,255,0.15) ${val}%
    )`;

    if (window.electronAPI) {
      window.electronAPI.setOpacity(val / 100);
    } else {
      document.body.style.opacity = (val / 100).toFixed(2);
    }
  };

  slider.addEventListener('input', updateSlider);
  updateSlider();
}

// ─── Auto-scroll ────────────────────────────────────────────────
function initAutoScroll() {
  els.autoScrollCheck.addEventListener('change', () => {
    state.autoScroll = els.autoScrollCheck.checked;
  });
}

function scrollToBottom(el) {
  if (state.autoScroll) {
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }
}

// ─── Session Timer ─────────────────────────────────────────────
function startSessionTimer() {
  setInterval(() => { state.sessionTime++; }, 1000);
}

function getTimestamp() {
  const m = Math.floor(state.sessionTime / 60).toString().padStart(2, '0');
  const s = (state.sessionTime % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Hotkeys ────────────────────────────────────────────────────
function initHotkeys() {
  document.addEventListener('keydown', e => {
    const ctrl = e.ctrlKey;
    const shift = e.shiftKey;
    const key = e.key.toLowerCase();

    if (ctrl && shift && key === 'h') {
      e.preventDefault();
      toggleVisibility();
    }
    if (ctrl && shift && key === 'a') {
      e.preventDefault();
      analyzeScreen();
    }
    if (key === 'enter' && document.activeElement === els.askInput) {
      submitQuestion();
    }
    if (key === 'escape') {
      els.askInput.focus();
    }
  });
}

// ─── Toggle Visibility ─────────────────────────────────────────
let isVisible = true;
function toggleVisibility() {
  isVisible = !isVisible;
  els.mainContainer.style.opacity = isVisible ? '1' : '0';
  els.mainContainer.style.pointerEvents = isVisible ? 'all' : 'none';
  showToast(isVisible ? '👁 Overlay visible' : '🙈 Overlay hidden', 'success');
}

// ─── Mic Toggle ────────────────────────────────────────────────
function toggleMic() {
  if (!state.deepgramService) {
    showToast('🎙 Audio service not initialized. Check API key.', 'error');
    return;
  }

  if (state.micActive) {
    state.deepgramService.pause();
    showToast('🔇 Microphone paused');
  } else {
    if (state.deepgramService.isListening) {
      state.deepgramService.resume();
    } else {
      state.deepgramService.startMicrophone();
    }
    showToast('🎙 Microphone active', 'success');
  }
}

// ─── Ask Input Handler ─────────────────────────────────────────
function handleAskKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitQuestion();
  }
}

// ─── Submit Question ───────────────────────────────────────────
function submitQuestion() {
  const question = els.askInput.value.trim();
  if (!question) return;
  els.askInput.value = '';
  addQACard(question);
}

// ─── Generate Answer For Transcript Badge ──────────────────────
function generateForTranscript(badgeEl) {
  const bubble = badgeEl.closest('.transcript-bubble');
  const textEl = bubble.querySelector('.transcript-text');
  if (!textEl) return;
  const question = textEl.textContent;
  addQACard(question);
  showToast('⚡ Generating answer...', 'success');
}

// ═══════════════════════════════════════════════════════════════════
//  AI Q&A Card — Real Cerebras Streaming
// ═══════════════════════════════════════════════════════════════════

// Map to track active streaming cards by requestId
const activeCards = new Map();

async function addQACard(question) {
  state.messageCount++;
  const requestId = `req-${state.messageCount}-${Date.now()}`;
  const timestamp = getTimestamp();

  // Remove welcome card if present
  const welcome = els.answersFeed.querySelector('.welcome-card');
  if (welcome) welcome.remove();

  // Create Q&A card immediately
  const card = document.createElement('div');
  card.className = 'qa-card';
  card.id = `card-${requestId}`;
  card.innerHTML = `
    <div class="qa-question">
      <span class="qa-q-label">Q</span>
      <span class="qa-q-text">${escHtml(question)}</span>
    </div>
    <div class="qa-answer">
      <div class="qa-a-label">⚡ CocoAI Answer</div>
      <div class="qa-a-text" id="answer-${requestId}">
        <div class="thinking-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="thinking-text">Connecting to Cerebras AI...</span>
      </div>
    </div>
    <div class="qa-footer">
      <span class="qa-time">${timestamp}</span>
      <div class="qa-actions">
        <button class="qa-action-btn" onclick="copyAnswer(this)">Copy</button>
        <button class="qa-action-btn" onclick="regenerate(this, '${escAttr(question)}')">↻ Retry</button>
        <button class="qa-action-btn" onclick="thumbsUp(this)">👍</button>
      </div>
    </div>
  `;
  els.answersFeed.appendChild(card);
  scrollToBottom(els.answersFeed);

  // Store the answer element reference
  activeCards.set(requestId, {
    answerEl: $(`answer-${requestId}`),
    fullText: '',
  });

  // Send to Cerebras via main process IPC
  if (window.electronAPI && state.apiKeys.cerebras) {
    window.electronAPI.streamAI(
      question,
      state.currentModel,
      { transcript: state.transcriptHistory.slice(-10) },
      requestId
    );
  } else {
    // Fallback: demo mode (no API key or not in Electron)
    const answerEl = $(`answer-${requestId}`);
    answerEl.innerHTML = '<span class="cursor-blink"></span>';
    const demoAnswer = generateDemoAnswer(question);
    await streamText(answerEl, demoAnswer);
    state.lastAnswer = demoAnswer;
  }
}

// ─── AI Stream Handlers ────────────────────────────────────────

function handleAIChunk({ requestId, chunk, fullText }) {
  const cardData = activeCards.get(requestId);
  if (!cardData) return;

  const { answerEl } = cardData;

  // On first chunk, clear the thinking indicator
  if (!cardData.streaming) {
    answerEl.innerHTML = '';
    cardData.streaming = true;
  }

  // Append the new chunk directly as text
  cardData.fullText = fullText;

  // Render the full text with markdown-like formatting
  answerEl.innerHTML = formatAnswer(fullText) + '<span class="cursor-blink"></span>';
  scrollToBottom(els.answersFeed);
}

function handleAIDone({ requestId, fullText }) {
  const cardData = activeCards.get(requestId);
  if (!cardData) return;

  const { answerEl } = cardData;
  answerEl.innerHTML = formatAnswer(fullText);
  state.lastAnswer = fullText;
  activeCards.delete(requestId);
  scrollToBottom(els.answersFeed);
}

function handleAIError({ requestId, error }) {
  const cardData = activeCards.get(requestId);
  if (!cardData) return;

  const { answerEl } = cardData;
  answerEl.innerHTML = `
    <div class="error-message">
      <span class="error-icon">⚠️</span>
      <span>${escHtml(error)}</span>
    </div>
  `;
  activeCards.delete(requestId);
  showToast('❌ AI Error: ' + error);
}

// ─── Format AI Answer (simple markdown) ────────────────────────
function formatAnswer(text) {
  let html = escHtml(text);

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Code inline: `text`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Code blocks: ```...```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
  });

  // Bullet points: - or *
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`);

  // Numbered lists: 1. 2. etc
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

// ─── Stream text character by character (demo mode) ────────────
async function streamText(el, text) {
  el.innerHTML = '<span class="cursor-blink"></span>';
  const formatted = formatAnswer(text);
  const parts = chunkHTML(formatted);
  let displayed = '';

  for (let i = 0; i < parts.length; i++) {
    displayed += parts[i];
    el.innerHTML = displayed + '<span class="cursor-blink"></span>';
    if (state.autoScroll) els.answersFeed.scrollTop = els.answersFeed.scrollHeight;
    const delay = parts[i].startsWith('<') ? 1 : (6 + Math.random() * 8);
    await sleep(delay);
  }
  el.innerHTML = displayed;
}

function chunkHTML(html) {
  const chunks = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end !== -1) {
        chunks.push(html.slice(i, end + 1));
        i = end + 1;
      } else {
        chunks.push(html[i++]);
      }
    } else {
      chunks.push(html[i++]);
    }
  }
  return chunks;
}

// ─── Demo Answer Generator (fallback when no API key) ──────────
function generateDemoAnswer(question) {
  const lcq = question.toLowerCase();

  if (lcq.includes('tell me about yourself') || lcq.includes('introduce yourself')) {
    return `**Here's a strong "Tell me about yourself" structure:**\n\n- **Present:** Start with your current role and key expertise\n- **Past:** Mention 1-2 relevant achievements with metrics\n- **Future:** Connect why this role excites you specifically\n\nKeep it under **90 seconds**. Practice until it sounds natural.`;
  }

  if (lcq.includes('binary search') || lcq.includes('time complexity')) {
    return `**Binary Search** operates on **sorted arrays**:\n\n- **Time Complexity:** \`O(log n)\` — halves the search space each iteration\n- **Space Complexity:** \`O(1)\` iterative, \`O(log n)\` recursive\n- **Best Case:** \`O(1)\` — target is the middle element\n- **Worst Case:** \`O(log n)\` — element at end or not present\n\nKey insight: each comparison eliminates **half** the remaining candidates.`;
  }

  return `**Here's a structured approach to answer this:**\n\n- Start with the **core concept** in one clear sentence\n- Use a **concrete example** from your experience\n- Quantify your impact with **specific metrics** where possible\n- Connect it to the **role's requirements** you're interviewing for\n\nTake a **2-3 second pause** before answering — interviewers appreciate thoughtfulness.`;
}

// ─── Analyze Screen ────────────────────────────────────────────
function analyzeScreen() {
  addQACard('[Screenshot captured] Please analyze this coding problem and provide a step-by-step solution with code.');
  showToast('📸 Screen captured — analyzing...', 'success');
}

// ─── Button Actions ────────────────────────────────────────────
function copyAnswer(btn) {
  const card = btn.closest('.qa-card');
  const text = card.querySelector('.qa-a-text').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Answer copied!', 'success');
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

function copyLastAnswer() {
  if (!state.lastAnswer) {
    showToast('No answers yet');
    return;
  }
  navigator.clipboard.writeText(state.lastAnswer).then(() => showToast('📋 Last answer copied!', 'success'));
}

function regenerate(btn, question) {
  const card = btn.closest('.qa-card');
  card.remove();
  addQACard(question);
}

function thumbsUp(btn) {
  btn.textContent = '👍 Saved';
  btn.style.color = 'var(--accent-secondary)';
  showToast('✅ Answer saved!', 'success');
}

function clearAnswers() {
  els.answersFeed.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-icon">🥥</div>
      <div class="welcome-text">
        <strong>CocoAI is active & listening</strong>
        <p>Cleared! Ask a question or wait for automatic detection.</p>
      </div>
    </div>
  `;
  showToast('🗑 Answers cleared');
}

function endSession() {
  if (confirm('End this interview session? All data will be cleared.')) {
    // Stop audio
    if (state.deepgramService) {
      state.deepgramService.stop();
    }
    state.transcriptHistory = [];
    showToast('Session ended. Good luck! 🍀', 'success');
    setTimeout(() => {
      clearAnswers();
      if (window.electronAPI) {
        window.electronAPI.closeApp();
      }
    }, 1500);
  }
}

function minimizeWindow() {
  if (window.electronAPI) {
    window.electronAPI.minimizeApp();
  }
}

function closeWindow() {
  if (window.electronAPI) {
    window.electronAPI.closeApp();
  }
}

// ─── Auto-add Transcript Entries ──────────────────────────────
function addTranscriptEntry(role, text) {
  const timestamp = getTimestamp();
  const isInterviewer = role === 'interviewer';

  const entry = document.createElement('div');
  entry.className = `transcript-entry ${isInterviewer ? 'interviewer' : 'user'}`;
  entry.innerHTML = `
    <div class="transcript-avatar ${isInterviewer ? 'interviewer-avatar' : 'user-avatar'}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
    <div class="transcript-bubble">
      <div class="transcript-badges">
        <span class="badge ${isInterviewer ? 'badge-interviewer' : 'badge-you'}">
          ${isInterviewer ? 'Interviewer' : 'You'}
        </span>
        ${isInterviewer ? `<span class="badge badge-answer" onclick="generateForTranscript(this)">Answer</span>` : ''}
      </div>
      <div class="transcript-text">${escHtml(text)}</div>
      <div class="transcript-time">${timestamp}</div>
    </div>
  `;

  els.transcriptFeed.appendChild(entry);
  scrollToBottom(els.transcriptFeed);
}

// ─── Toast ─────────────────────────────────────────────────────
let toastTimer = null;
function showToast(message, type = '') {
  const t = els.toast;
  t.textContent = message;
  t.className = `toast ${type}`;
  clearTimeout(toastTimer);
  requestAnimationFrame(() => {
    t.classList.add('show');
    toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  });
}

// ─── Utilities ─────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function escAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
