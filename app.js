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
  apiKeys: { cerebras: '', deepgram: '', gemini: '', nvidia: '' },
  resume: '',
  jobDescription: '',
  activeTab: 'answers',           // 'answers' | 'transcript',
  audioMode: 'interviewer', // 'interviewer' | 'both' | 'candidate'
  transcriptHistory: [],  // { role, text } for AI context
  deepgramService: null,
  interimTranscriptEl: null, // For updating interim results
  replayMode: false,
  savedStateBeforeReplay: null,
  stealthMode: 'full', // 'full' | 'compact' | 'ghost'
  // Multi-screenshot buffer for long scrollable problems
  screenshotBuffer: [],       // Array of base64 image data URLs
  screenshotBufferTimer: null, // Timer to auto-clear buffer after inactivity
  lastScreenshotCardId: null, // Track the card to update with re-analysis
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
  stealthBtn: $('stealthBtn'),
  stealthLabel: $('stealthLabel'),
};

// ─── Initialization ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initOpacitySlider();
  initHotkeys();
  initAutoScroll();
  initModelSelector();
  startSessionTimer();
  await initElectronBridge();
  loadSettings();
  initDeepgram();
  initDragAndDrop();
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

    // Listen for stealth cycle from main process (global hotkey)
    if (window.electronAPI.onCycleStealth) {
      window.electronAPI.onCycleStealth(() => {
        cycleStealthMode();
      });
    }

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

  // Handle transcription results — add to transcript feed & accumulate utterance
  state.deepgramService.onTranscript = (text, isFinal, speaker, speechFinal) => {
    if (isFinal) {
      // Final chunk — add to transcript feed
      addTranscriptEntry(speaker, text);

      // Notify badge if user is on answers tab
      if (state.activeTab !== 'transcript') {
        const badge = $('badgeTranscript');
        if (badge) badge.classList.add('visible');
      }

      // Store in history for AI context
      state.transcriptHistory.push({ role: speaker, text });

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

  // UtteranceEnd fires ONLY after speaker fully stops talking (1500ms silence).
  // This is the correct place to trigger AI — full question is guaranteed to be complete.
  state.deepgramService.onUtteranceEnd = (fullUtterance) => {
    if (DeepgramService.isQuestion(fullUtterance)) {
      showToast('❓ Question detected — generating answer...', 'success');
      addQACard(fullUtterance);
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
async function initModelSelector() {
  // Wire the hidden backing input's change event to update state
  const modelInput = $('modelSelect');
  if (modelInput) {
    modelInput.addEventListener('change', () => {
      state.currentModel = modelInput.value;
    });
  }

  // Models known to be deprecated or end-of-life — shown with a warning badge
  // and made unselectable so the user is never accidentally locked onto them.
  const DEPRECATED_MODELS = [
    'glm-4.7',
    'glm-4-7',
    'zai-glm-4.7',
  ];

  // Preferred default: best coding/reasoning model on Cerebras in 2026
  const PREFERRED_DEFAULT = 'gpt-oss-120b';

  if (window.electronAPI) {
    try {
      const models = await window.electronAPI.getCerebrasModels();
      if (models && models.length > 0) {
        const dropdown = $('modelSelectDropdown');
        if (dropdown) {
          dropdown.innerHTML = '';
          let firstActive = null;

          models.forEach((modelId) => {
            const isDeprecated = DEPRECATED_MODELS.some(d =>
              modelId.toLowerCase().includes(d.toLowerCase())
            );

            let emoji = '👾';
            if (modelId.includes('llama'))  emoji = '⚡';
            else if (modelId.includes('qwen'))   emoji = '🧠';
            else if (modelId.includes('gpt'))    emoji = '🚀';
            else if (modelId.includes('gemma'))  emoji = '💎';
            else if (modelId.includes('glm'))    emoji = '⚠️';

            const div = document.createElement('div');

            if (isDeprecated) {
              // Deprecated: show warning badge, disable selection
              div.className = 'custom-option deprecated';
              div.dataset.value = modelId;
              div.title = `⚠️ ${modelId} is deprecated and will be removed soon. Do not use.`;
              div.innerHTML = `<span style="text-decoration:line-through;opacity:0.45">${emoji} ${modelId}</span> <span class="deprecated-badge">⚠️ Deprecated</span>`;
              // Block selection entirely
              div.onclick = (e) => {
                e.stopPropagation();
                showToast(`⚠️ ${modelId} is deprecated — please choose another model.`, 'error');
              };
            } else {
              div.className = 'custom-option';
              div.dataset.value = modelId;
              div.textContent = `${emoji} ${modelId}`;
              div.onclick = () => selectCustomOption('modelSelectWrapper', div);
              if (!firstActive) firstActive = modelId;
            }

            dropdown.appendChild(div);
          });

          // Prefer gpt-oss-120b, then fall back to first non-deprecated model
          const bestDefault = models.includes(PREFERRED_DEFAULT)
            ? PREFERRED_DEFAULT
            : firstActive || models[0];

          state.currentModel = bestDefault;
          syncCustomSelect('modelSelectWrapper', bestDefault);
          console.log(`🥥 Dynamic models loaded. Active: ${state.currentModel}`);
        }
      }
    } catch (e) {
      console.warn('Failed to load Cerebras models dynamically, using defaults:', e);
    }
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
let sessionTimerId = null;
function startSessionTimer() {
  if (sessionTimerId) clearInterval(sessionTimerId);
  sessionTimerId = setInterval(() => { state.sessionTime++; }, 1000);
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
    if (ctrl && shift && key === 'g') {
      e.preventDefault();
      cycleStealthMode();
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

// ─── Tab Switching ─────────────────────────────────────────────
function switchTab(tabName) {
  state.activeTab = tabName;

  // Update body class
  document.body.classList.remove('tab-answers', 'tab-transcript');
  document.body.classList.add(`tab-${tabName}`);

  // Update active button styles
  const btnAnswers = $('tabBtnAnswers');
  const btnTranscript = $('tabBtnTranscript');
  if (btnAnswers) btnAnswers.classList.toggle('active', tabName === 'answers');
  if (btnTranscript) btnTranscript.classList.toggle('active', tabName === 'transcript');

  // Clear the notification badge for this tab
  const badge = tabName === 'answers' ? $('badgeAnswers') : $('badgeTranscript');
  if (badge) badge.classList.remove('visible');

  // Auto-scroll if switching to transcript
  if (tabName === 'transcript' && state.autoScroll) {
    setTimeout(() => scrollToBottom(els.transcriptFeed), 50);
  }
}

// ─── Stealth Mode Cycling ──────────────────────────────────────
// Cycles: Full → Compact → Ghost → Full
const STEALTH_FULL_WIDTH = 850;
const STEALTH_COMPACT_WIDTH = 580;

function cycleStealthMode() {
  const body = document.body;
  const current = state.stealthMode;

  if (current === 'full') {
    // ── Full → Compact ──────────────────────────────────────
    state.stealthMode = 'compact';
    body.classList.add('compact-mode');
    body.classList.remove('ghost-mode');

    // Resize window via IPC
    if (window.electronAPI?.setWindowSize) {
      window.electronAPI.setWindowSize(STEALTH_COMPACT_WIDTH);
    }

    updateStealthButton('compact');
    showToast('📐 Compact Mode — transcript hidden', 'success');

  } else if (current === 'compact') {
    // ── Compact → Ghost ─────────────────────────────────────
    state.stealthMode = 'ghost';
    body.classList.add('ghost-mode');
    // Keep compact-mode class so transcript stays hidden

    // Enable click-through
    if (window.electronAPI?.setClickthrough) {
      window.electronAPI.setClickthrough(true);
    }

    updateStealthButton('ghost');
    showToast('👻 Ghost Mode — clicks pass through', 'success');

  } else {
    // ── Ghost → Full ────────────────────────────────────────
    state.stealthMode = 'full';
    body.classList.remove('compact-mode', 'ghost-mode');

    // Disable click-through
    if (window.electronAPI?.setClickthrough) {
      window.electronAPI.setClickthrough(false);
    }

    // Restore window size
    if (window.electronAPI?.setWindowSize) {
      window.electronAPI.setWindowSize(STEALTH_FULL_WIDTH);
    }

    // Reset inline opacity overrides from ghost
    els.mainContainer.style.opacity = '';
    els.mainContainer.style.pointerEvents = '';

    updateStealthButton('full');
    showToast('👁 Full Mode — all panels restored', 'success');
  }
}

function updateStealthButton(mode) {
  if (!els.stealthLabel) return;
  const labels = { full: 'Full', compact: 'Compact', ghost: 'Ghost' };
  els.stealthLabel.textContent = labels[mode] || 'Full';

  // Update the SVG icon
  const svg = document.getElementById('stealthIcon');
  if (!svg) return;

  if (mode === 'full') {
    // Eye open icon
    svg.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  } else if (mode === 'compact') {
    // Minimize/compress icon
    svg.innerHTML = `
      <polyline points="4 14 10 14 10 20"/>
      <polyline points="20 10 14 10 14 4"/>
      <line x1="14" y1="10" x2="21" y2="3"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    `;
  } else {
    // Ghost / invisible icon (eye with slash)
    svg.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  }
}

// ─── Ghost Mode Hot-Zone ───────────────────────────────────────
// In ghost mode, the window ignores mouse events but forwards hover.
// When hovering over the stealth button, temporarily allow clicks.
(function initGhostHotZone() {
  const stealthBtn = document.getElementById('stealthBtn');
  if (!stealthBtn) return;

  stealthBtn.addEventListener('mouseenter', () => {
    if (state.stealthMode === 'ghost' && window.electronAPI?.setClickthrough) {
      window.electronAPI.setClickthrough(false);
    }
  });

  stealthBtn.addEventListener('mouseleave', () => {
    if (state.stealthMode === 'ghost' && window.electronAPI?.setClickthrough) {
      window.electronAPI.setClickthrough(true);
    }
  });
})();

// ─── Mic Toggle ────────────────────────────────────────────────
function toggleMic() {
  if (!state.deepgramService) {
    showToast('🎙 Audio service not initialized. Check API key.', 'error');
    return;
  }

  if (state.micActive) {
    state.deepgramService.pause();
    showToast('🔇 Audio capture paused');
  } else {
    if (state.deepgramService.isListening) {
      state.deepgramService.resume();
    } else {
      state.deepgramService.startMicrophone(state.audioMode);
    }
    
    if (state.audioMode === 'interviewer') {
      showToast('🎙️ Interviewer mode active (Mic Disabled)', 'success');
    } else if (state.audioMode === 'both') {
      showToast('🎙️ Mixed audio capture active', 'success');
    } else {
      showToast('🎙️ Microphone capture active', 'success');
    }
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

  // Notify badge if user is on transcript tab
  if (state.activeTab !== 'answers') {
    const badge = $('badgeAnswers');
    if (badge) badge.classList.add('visible');
  }

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
      { 
        transcript: state.transcriptHistory.slice(-10),
        resume: state.resume,
        jobDescription: state.jobDescription
      },
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
function createCodeBlockHtml(lang, codeText) {
  var displayLang = (lang && lang.trim()) ? lang.trim().toLowerCase() : 'code';
  var cleanCode = codeText.trim();
  return '<div class="code-container">' +
           '<div class="code-header">' +
             '<span class="code-lang-tag">' + escHtml(displayLang) + '</span>' +
             '<button class="code-copy-btn" onclick="copyCodeBlock(this)" title="Copy code to clipboard">' +
               '<svg class="copy-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg> Copy Code' +
             '</button>' +
           '</div>' +
           '<pre class="code-block"><code>' + cleanCode + '</code></pre>' +
         '</div>';
}

function formatAnswer(text) {
  // Extract ALL code fences first, before any markdown regex runs.
  // This prevents print("****") from having its stars eaten by the bold regex.
  var stash = [];
  var html = escHtml(text);

  // 1a. Triple-backtick fenced blocks: ```lang\n...\n```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, function(_m, lang, code) {
    var idx = stash.length;
    stash.push(createCodeBlockHtml(lang, code));
    return '\x00B' + idx + '\x00';
  });

  // 1b. Double-backtick blocks: ``lang\n...\n`` (some models output these)
  html = html.replace(/``(\w*)\n?([\s\S]*?)``/g, function(_m, lang, code) {
    var idx = stash.length;
    stash.push(createCodeBlockHtml(lang, code));
    return '\x00B' + idx + '\x00';
  });

  // 1c. Inline code: `text`
  html = html.replace(/`([^`]+)`/g, function(_m, code) {
    var idx = stash.length;
    stash.push('<code>' + code + '</code>');
    return '\x00B' + idx + '\x00';
  });

  // 2. Apply markdown on remaining (non-code) text.
  // Use .+? (one-or-more) not .*? (zero-or-more) to avoid matching empty ** **
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Generate list items with distinct class markers BEFORE wrapping
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ul-item">$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>');
  // Wrap each group separately so numbered lists go into <ol>, not <ul>
  html = html.replace(/(<li class="ul-item">.*?<\/li>\n?)+/gs, m => '<ul>' + m + '</ul>');
  html = html.replace(/(<li class="ol-item">.*?<\/li>\n?)+/gs, m => '<ol>' + m + '</ol>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // 3. Restore all protected code blocks.
  stash.forEach(function(block, idx) {
    html = html.split('\x00B' + idx + '\x00').join(block);
  });

  return '<p>' + html + '</p>';
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

// ─── Analyze Screen (with Multi-Screenshot Buffer for long problems) ───
async function analyzeScreen() {
  state.messageCount++;
  const requestId = `req-${state.messageCount}-${Date.now()}`;
  const timestamp = getTimestamp();

  // Remove welcome card if present
  const welcome = els.answersFeed.querySelector('.welcome-card');
  if (welcome) welcome.remove();

  // ── Step 1: Capture the screenshot ──
  showToast('📸 Capturing screen...', 'success');
  let imgDataUrl = '';
  if (window.electronAPI && window.electronAPI.captureScreen) {
    imgDataUrl = await window.electronAPI.captureScreen();
  } else {
    console.log('🥥 Browser mode: mocking screenshot');
    await sleep(1000);
    imgDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  // ── Step 2: Add to multi-screenshot buffer ──
  state.screenshotBuffer.push(imgDataUrl);
  const captureCount = state.screenshotBuffer.length;

  // Reset the auto-clear timer (45s of inactivity clears the buffer)
  if (state.screenshotBufferTimer) clearTimeout(state.screenshotBufferTimer);
  state.screenshotBufferTimer = setTimeout(() => {
    state.screenshotBuffer = [];
    state.lastScreenshotCardId = null;
    console.log('🥥 Screenshot buffer auto-cleared after 45s inactivity.');
  }, 45000);

  // ── Step 3: Create or reuse card ──
  let card, answerEl;

  if (captureCount > 1 && state.lastScreenshotCardId) {
    // Reuse existing card — user scrolled down and captured more context
    card = $(state.lastScreenshotCardId);
    const qText = card?.querySelector('.qa-q-text');
    if (qText) qText.textContent = `Screenshot Analysis (${captureCount} captures — full problem)`;
    answerEl = card?.querySelector('.qa-a-text');
    if (answerEl) {
      answerEl.innerHTML = `
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        <span class="thinking-text">Re-analyzing with ${captureCount} screenshots...</span>
      `;
    }
    showToast(`📸 Captured page ${captureCount} — re-analyzing full problem...`, 'success');
  } else {
    // First capture — create new card
    card = document.createElement('div');
    card.className = 'qa-card';
    card.id = `card-${requestId}`;
    state.lastScreenshotCardId = `card-${requestId}`;
    card.innerHTML = `
      <div class="qa-question">
        <span class="qa-q-label">📸</span>
        <span class="qa-q-text">Screenshot Capture Analysis</span>
      </div>
      <div class="qa-answer">
        <div class="qa-a-label">⚡ CocoAI Code Solver</div>
        <div class="qa-a-text" id="answer-${requestId}">
          <div class="thinking-dots">
            <span></span><span></span><span></span>
          </div>
          <span class="thinking-text">Analyzing problem...</span>
        </div>
      </div>
      <div class="qa-footer">
        <span class="qa-time">${timestamp}</span>
        <div class="qa-actions">
          <button class="qa-action-btn" onclick="copyAnswer(this)">Copy</button>
          <button class="qa-action-btn" onclick="thumbsUp(this)">👍</button>
        </div>
      </div>
    `;
    els.answersFeed.appendChild(card);
    answerEl = $(`answer-${requestId}`);
  }
  scrollToBottom(els.answersFeed);

  if (!answerEl) {
    console.error('Answer element not found');
    return;
  }

  try {
    // ── Step 4: Build prompt ──
    const multiImageNote = captureCount > 1
      ? `\n\nIMPORTANT: You are receiving ${captureCount} screenshots of the SAME problem. The user scrolled down to capture the full question. Combine ALL visible information from ALL images to understand the complete problem before writing your solution.`
      : '';

    const prompt = `You are a world-class competitive programmer. Analyze the screenshot(s) and solve the problem.${multiImageNote}

FOR CODING PROBLEMS:
1. OUTPUT THE CODE BLOCK FIRST on Line 1 (\`\`\`language ... \`\`\`). This is mandatory.
2. DETECT LANGUAGE from editor dropdown/header (JavaScript, Python3, C++, Java, etc.) and write in that exact language.
3. If editor is blank (e.g. Micro1), infer function signature from the problem's input/output description.
4. Read ALL constraints, edge cases, and sample test cases. Write correct, complete, runnable code.
5. AFTER code block: 1 sentence with approach + O(?) time/space. Nothing more.

FOR MCQ/QUIZ:
1. Bold the correct answer on Line 1.
2. 1-sentence explanation.

RULES: No preambles. No filler. Code block Line 1. Minimal explanation.`;

    let fullText = '';

    const onChunk = (chunk) => {
      if (!fullText) answerEl.innerHTML = '';
      fullText += chunk;
      answerEl.innerHTML = formatAnswer(fullText) + '<span class="cursor-blink"></span>';
      if (state.autoScroll) els.answersFeed.scrollTop = els.answersFeed.scrollHeight;
    };

    const onStatus = (msg) => {
      const thinkingText = answerEl.querySelector('.thinking-text');
      if (thinkingText) thinkingText.textContent = msg;
      showToast(msg, 'warning');
    };

    // ── Step 5: Send ALL buffered screenshots to Vision API ──
    const imagesToSend = [...state.screenshotBuffer];

    // ── Primary: Gemini Vision ──
    if (state.apiKeys.gemini) {
      answerEl.innerHTML = `
        <div class="thinking-dots"><span></span><span></span><span></span></div>
        <span class="thinking-text">Gemini is solving the problem...</span>
      `;
      try {
        const analysis = await window.GeminiService.analyzeImage(
          state.apiKeys.gemini,
          imagesToSend,  // Pass array of images
          prompt,
          onChunk,
          onStatus
        );
        answerEl.innerHTML = formatAnswer(analysis || fullText);
        state.lastAnswer = analysis || fullText;
        showToast('✅ Problem solved!', 'success');
        return;
      } catch (geminiErr) {
        console.warn('⚠️ Gemini Vision failed, trying NVIDIA NIM fallback:', geminiErr.message);
        showToast('⚠️ Gemini busy — trying NVIDIA...', 'warning');
        fullText = '';
      }
    }

    // ── Secondary Fallback: NVIDIA NIM ──
    if (!state.apiKeys.nvidia) {
      throw new Error('No Vision API key available. Ensure Gemini or NVIDIA key is set in Settings.');
    }

    answerEl.innerHTML = `
      <div class="thinking-dots"><span></span><span></span><span></span></div>
      <span class="thinking-text">🟢 NVIDIA is solving the problem...</span>
    `;
    const analysis = await window.NvidiaService.analyzeImage(
      state.apiKeys.nvidia,
      imagesToSend,  // Pass array of images
      prompt,
      onChunk,
      onStatus
    );
    answerEl.innerHTML = formatAnswer(analysis || fullText);
    state.lastAnswer = analysis || fullText;
    showToast('✅ Problem solved via NVIDIA!', 'success');

  } catch (err) {
    console.error('Screen analysis failed:', err);
    answerEl.innerHTML = `
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span>Screen Analysis Failed: ${escHtml(err.message || err)}</span>
      </div>
    `;
    showToast('❌ Analysis failed', 'error');
  }
}

// ─── Button & Code Copy Actions ────────────────────────────────
function copyCodeBlock(btn) {
  const container = btn.closest('.code-container');
  if (!container) return;
  const codeEl = container.querySelector('code');
  if (!codeEl) return;

  const codeText = codeEl.innerText || codeEl.textContent;
  navigator.clipboard.writeText(codeText).then(() => {
    showToast('📋 Code copied to clipboard!', 'success');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#2ed573" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.classList.remove('copied');
    }, 1800);
  }).catch(err => {
    console.error('Failed to copy code block:', err);
    showToast('❌ Copy failed', 'error');
  });
}

function copyAnswer(btn) {
  const card = btn.closest('.qa-card');
  if (!card) return;
  const codeBlock = card.querySelector('.code-block code');
  let text = '';
  if (codeBlock) {
    text = codeBlock.innerText || codeBlock.textContent;
  } else {
    text = card.querySelector('.qa-a-text')?.textContent || '';
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast(codeBlock ? '📋 Code copied!' : '📋 Answer copied!', 'success');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = orig, 2000);
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
      <div class="welcome-icon">
        <img src="Coco UI Logo.png" class="welcome-icon-img" alt="Logo" />
      </div>
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
    
    // Reset state variables
    state.transcriptHistory = [];
    state.sessionTime = 0;
    state.messageCount = 0;
    state.lastAnswer = '';
    // Restart the session timer cleanly
    startSessionTimer();
    
    // Reset UI feeds
    clearAnswers();
    if (els.transcriptFeed) {
      els.transcriptFeed.innerHTML = `
        <div class="welcome-card">
          <div class="welcome-icon">🎙️</div>
          <div class="welcome-text">
            <strong>Transcript is empty</strong>
            <p>Transcript will appear here in real time as audio is detected.</p>
          </div>
        </div>
      `;
    }

    // Reset status elements
    updateStatus('idle', 'Ready');
    if (els.micBtn) {
      els.micBtn.classList.remove('active');
      state.micActive = false;
    }
    document.querySelectorAll('.wave-bar').forEach(b => b.style.animationPlayState = 'paused');

    showToast('Interview session ended & cleared! 🍀', 'success');
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

// ─── Custom Stealth Dropdown ─────────────────────────────────────────────
// Native <select> renders as an OS popup that bypasses Electron content
// protection and leaks on screen share. These custom divs stay inside
// the protected BrowserWindow and are fully invisible to Discord/Zoom.

function toggleCustomSelect(wrapperId) {
  const wrapper = $(wrapperId);
  if (!wrapper) return;
  const isOpen = wrapper.classList.contains('open');
  // Close all open dropdowns first
  document.querySelectorAll('.custom-select.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) wrapper.classList.add('open');
}

function selectCustomOption(wrapperId, optionEl) {
  const wrapper = $(wrapperId);
  if (!wrapper) return;
  const value = optionEl.dataset.value;
  const label = optionEl.textContent;

  // Update the hidden backing input
  const input = wrapper.querySelector('input[type="hidden"]');
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Update the visible label
  const labelEl = wrapper.querySelector('.custom-select-value');
  if (labelEl) labelEl.textContent = label;

  // Mark selected option
  wrapper.querySelectorAll('.custom-option').forEach(el => el.classList.remove('selected'));
  optionEl.classList.add('selected');

  // Close the dropdown
  wrapper.classList.remove('open');
}

function syncCustomSelect(wrapperId, value) {
  // Sync the custom dropdown label to match a programmatically set value
  const wrapper = $(wrapperId);
  if (!wrapper) return;
  const option = wrapper.querySelector(`.custom-option[data-value="${value}"]`);
  if (option) {
    const labelEl = wrapper.querySelector('.custom-select-value');
    if (labelEl) labelEl.textContent = option.textContent;
    wrapper.querySelectorAll('.custom-option').forEach(el => el.classList.remove('selected'));
    option.classList.add('selected');
    const input = wrapper.querySelector('input[type="hidden"]');
    if (input) input.value = value;
  }
}

// Close custom dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.custom-select.open').forEach(el => el.classList.remove('open'));
  }
});

// ─── Settings Panel Logic ──────────────────────────────────────
function loadSettings() {
  try {
    // Load keys
    const storedKeys = localStorage.getItem('cocoai_api_keys');
    if (storedKeys) {
      const parsedKeys = JSON.parse(storedKeys);
      // Only overwrite keys if they are not already set by Electron / .env
      state.apiKeys.cerebras = state.apiKeys.cerebras || parsedKeys.cerebras || '';
      state.apiKeys.deepgram = state.apiKeys.deepgram || parsedKeys.deepgram || '';
      state.apiKeys.gemini = state.apiKeys.gemini || parsedKeys.gemini || '';
    }
    
    // Load resume & JD
    state.resume = localStorage.getItem('cocoai_resume') || '';
    state.jobDescription = localStorage.getItem('cocoai_jd') || '';
    
    // Load audio mode
    state.audioMode = localStorage.getItem('cocoai_audio_mode') || 'interviewer';
    
    // Set UI input values
    $('settingCerebrasKey').value = state.apiKeys.cerebras;
    $('settingDeepgramKey').value = state.apiKeys.deepgram;
    $('settingGeminiKey').value = state.apiKeys.gemini || '';
    $('settingResume').value = state.resume;
    $('settingJd').value = state.jobDescription;
    // Sync custom dropdowns
    syncCustomSelect('audioModeWrapper', state.audioMode || 'interviewer');
    syncCustomSelect('modelSelectWrapper', state.currentModel || 'llama-3.3-70b');
    
    updateResumeDropZoneState();
    
    console.log('🥥 Local settings loaded');
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
  }
}

function saveSettings() {
  try {
    const keys = {
      cerebras: $('settingCerebrasKey').value.trim(),
      deepgram: $('settingDeepgramKey').value.trim(),
      gemini: $('settingGeminiKey').value.trim(),
    };
    
    const resume = $('settingResume').value.trim();
    const jd = $('settingJd').value.trim();
    const audioMode = $('settingAudioMode').value;
    
    localStorage.setItem('cocoai_api_keys', JSON.stringify(keys));
    localStorage.setItem('cocoai_resume', resume);
    localStorage.setItem('cocoai_jd', jd);
    localStorage.setItem('cocoai_audio_mode', audioMode);
    
    // Update active state — preserve nvidia key (it comes from .env via Electron, not the settings UI)
    state.apiKeys = {
      cerebras: keys.cerebras,
      deepgram: keys.deepgram,
      gemini: keys.gemini,
      nvidia: state.apiKeys.nvidia, // keep the env-loaded key intact
    };
    state.resume = resume;
    state.jobDescription = jd;
    state.audioMode = audioMode;
    
    showToast('⚙ Configuration saved successfully!', 'success');
    toggleSettings();
    
    // Re-initialize Deepgram if key changed and not already running
    if (keys.deepgram && !state.deepgramService) {
      initDeepgram();
    }
  } catch (e) {
    showToast('❌ Failed to save configuration', 'error');
  }
}

function toggleSettings() {
  const drawer = $('settingsDrawer');
  const overlay = $('drawerOverlay');
  
  if (drawer.classList.contains('open')) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    overlay.style.display = 'none';
  } else {
    // Populate latest values before opening
    $('settingCerebrasKey').value = state.apiKeys.cerebras || '';
    $('settingDeepgramKey').value = state.apiKeys.deepgram || '';
    $('settingGeminiKey').value = state.apiKeys.gemini || '';
    $('settingResume').value = state.resume || '';
    $('settingJd').value = state.jobDescription || '';
    // Sync custom dropdowns to current state
    syncCustomSelect('audioModeWrapper', state.audioMode || 'interviewer');
    syncCustomSelect('modelSelectWrapper', state.currentModel || 'llama-3.3-70b');
    
    updateResumeDropZoneState();
    
    drawer.classList.add('open');
    overlay.style.display = 'block';
    // Small delay to trigger opacity transition
    setTimeout(() => overlay.classList.add('open'), 10);
  }
}

// ─── Session Management: Export & Replay (Option C) ─────────────

function getQAHistory() {
  const cards = [];
  document.querySelectorAll('#answersFeed .qa-card').forEach(card => {
    const qEl = card.querySelector('.qa-q-text');
    const aEl = card.querySelector('.qa-a-text');
    const timeEl = card.querySelector('.qa-time');
    
    if (qEl && aEl) {
      cards.push({
        question: qEl.textContent.trim(),
        answerHtml: aEl.innerHTML,
        answerText: aEl.innerText.trim(),
        timestamp: timeEl ? timeEl.textContent.trim() : ''
      });
    }
  });
  return cards;
}

function exportSession(format = 'txt') {
  const qaCards = getQAHistory();
  const transcript = [];
  document.querySelectorAll('#transcriptFeed .transcript-entry').forEach(entry => {
    const isInterviewer = entry.classList.contains('interviewer');
    const textEl = entry.querySelector('.transcript-text');
    const timeEl = entry.querySelector('.transcript-time');
    if (textEl) {
      transcript.push({
        role: isInterviewer ? 'Interviewer' : 'You',
        text: textEl.textContent.trim(),
        time: timeEl ? timeEl.textContent.trim() : ''
      });
    }
  });

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  const filename = `cocoai-session-${dateStr}_${now.toTimeString().slice(0,2)}${now.toTimeString().slice(3,5)}.${format}`;

  let content = '';
  let mimeType = 'text/plain';

  if (format === 'txt') {
    content = `==================================================
COCOAI - INTERVIEW SESSION EXPORT
Date: ${dateStr} ${timeStr}
Session Timer: ${getTimestamp()}
==================================================

--------------------------------------------------
JOB DESCRIPTION CONTEXT
--------------------------------------------------
${state.jobDescription || 'None provided'}

--------------------------------------------------
TRANSCRIPT LOG
--------------------------------------------------
`;
    if (transcript.length === 0) {
      content += 'No transcript entries recorded.\n';
    } else {
      transcript.forEach(t => {
        content += `[${t.time}] ${t.role}: ${t.text}\n`;
      });
    }

    content += `
--------------------------------------------------
AI QUESTIONS & ANSWERS
--------------------------------------------------
`;
    if (qaCards.length === 0) {
      content += 'No AI answers generated.\n';
    } else {
      qaCards.forEach((qa, idx) => {
        content += `\n[${qa.timestamp}] Card #${idx + 1}
Q: ${qa.question}
A: ${qa.answerText}
--------------------------------------------------\n`;
      });
    }
  } else if (format === 'json') {
    mimeType = 'application/json';
    const sessionData = {
      exportedAt: now.toISOString(),
      sessionTime: state.sessionTime,
      resume: state.resume,
      jobDescription: state.jobDescription,
      transcriptHistory: state.transcriptHistory,
      transcriptFeed: transcript,
      qaCards: qaCards
    };
    content = JSON.stringify(sessionData, null, 2);
  }

  // Trigger download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`💾 Session exported as ${format.toUpperCase()}`, 'success');
}

function handleSessionReplayUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      // Basic validation
      if (!data.exportedAt || !Array.isArray(data.transcriptFeed) || !Array.isArray(data.qaCards)) {
        throw new Error('Invalid CocoAI session replay format.');
      }

      // Cache the current live state before entering replay mode (only if not already in replay mode)
      if (!state.replayMode) {
        state.savedStateBeforeReplay = {
          sessionTime: state.sessionTime,
          transcriptHistory: [...state.transcriptHistory],
          answersFeedHtml: els.answersFeed.innerHTML,
          transcriptFeedHtml: els.transcriptFeed.innerHTML,
          lastAnswer: state.lastAnswer
        };
      }

      // Close mic if active
      if (state.micActive && state.deepgramService) {
        toggleMic();
      }

      // Populate UI feeds
      els.answersFeed.innerHTML = '';
      els.transcriptFeed.innerHTML = '';

      // Set Replay Mode variables
      state.sessionTime = data.sessionTime || 0;
      state.transcriptHistory = data.transcriptHistory || [];
      state.replayMode = true;

      // Populate answers feed
      if (data.qaCards.length === 0) {
        els.answersFeed.innerHTML = `
          <div class="welcome-card">
            <div class="welcome-icon">📂</div>
            <div class="welcome-text">
              <strong>Empty Q&A history</strong>
              <p>This replayed session does not contain any AI generated answers.</p>
            </div>
          </div>
        `;
      } else {
        data.qaCards.forEach((qa, idx) => {
          const card = document.createElement('div');
          card.className = 'qa-card replay';
          card.innerHTML = `
            <div class="qa-question">
              <span class="qa-q-label">Q</span>
              <span class="qa-q-text">${escHtml(qa.question)}</span>
            </div>
            <div class="qa-answer">
              <div class="qa-a-label">⚡ CocoAI Replay Answer</div>
              <div class="qa-a-text">${qa.answerHtml}</div>
            </div>
            <div class="qa-footer">
              <span class="qa-time">${qa.timestamp}</span>
              <div class="qa-actions">
                <button class="qa-action-btn" onclick="copyAnswer(this)">Copy</button>
              </div>
            </div>
          `;
          els.answersFeed.appendChild(card);
        });
      }

      // Populate transcript feed
      if (data.transcriptFeed.length === 0) {
        els.transcriptFeed.innerHTML = `
          <div class="welcome-card">
            <div class="welcome-text">
              <p>No speech transcript recorded in this session.</p>
            </div>
          </div>
        `;
      } else {
        data.transcriptFeed.forEach(t => {
          const isInterviewer = t.role === 'Interviewer';
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
              </div>
              <div class="transcript-text">${escHtml(t.text)}</div>
              <div class="transcript-time">${t.time}</div>
            </div>
          `;
          els.transcriptFeed.appendChild(entry);
        });
      }

      // Update UI Banner and classes
      const bannerDate = new Date(data.exportedAt);
      $('replayBannerText').textContent = `⚠️ Replay Mode: Viewing session from ${bannerDate.toLocaleDateString()} ${bannerDate.toLocaleTimeString()}`;
      $('replayBanner').style.display = 'flex';
      document.body.classList.add('replay-active');
      
      toggleSettings(); // Close settings drawer
      showToast('📂 Session replay loaded!', 'success');

    } catch (err) {
      console.error(err);
      showToast('❌ Failed to load replay: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function exitReplayMode() {
  if (!state.replayMode || !state.savedStateBeforeReplay) return;

  // Restore live session state
  const cached = state.savedStateBeforeReplay;
  state.sessionTime = cached.sessionTime;
  state.transcriptHistory = cached.transcriptHistory;
  state.lastAnswer = cached.lastAnswer;
  els.answersFeed.innerHTML = cached.answersFeedHtml;
  els.transcriptFeed.innerHTML = cached.transcriptFeedHtml;

  // Reset Replay Mode flags
  state.replayMode = false;
  state.savedStateBeforeReplay = null;

  // Hide Replay Banner and remove styles
  $('replayBanner').style.display = 'none';
  document.body.classList.remove('replay-active');
  $('replayFileSelector').value = '';

  showToast('👁 Returned to Live Session', 'success');
}

// ─── Resume PDF Drag-and-Drop & Parser ─────────────────────────

function initDragAndDrop() {
  const dropZone = $('resumeDropZone');
  const fileInput = $('resumeFileSelector');

  if (!dropZone || !fileInput) return;

  // Open file selector on click
  dropZone.addEventListener('click', () => fileInput.click());

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Handle hover visual states
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
  });
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
  });

  // Handle dropped files
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      processResumeFile(files[0]);
    }
  }, false);

  // Handle file picker selection
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processResumeFile(e.target.files[0]);
    }
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function processResumeFile(file) {
  const dropZone = $('resumeDropZone');
  if (!dropZone || !file) return;
  const dropZoneText = dropZone.querySelector('.drop-zone-text');
  if (!dropZoneText) return;

  // Enforce PDF format only
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    dropZone.className = 'drop-zone error';
    dropZoneText.textContent = '❌ Only PDF format is supported';
    showToast('Failed: Resume must be a PDF file', 'error');
    return;
  }

  // Update visual UI state to loading/parsing
  dropZone.className = 'drop-zone';
  dropZoneText.textContent = `⏳ Reading ${file.name}...`;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const arrayBuffer = e.target.result;
      const text = await parsePDF(arrayBuffer);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No readable text contents found in PDF');
      }

      // Populate settings textarea & auto-save immediately to state + localStorage
      const resumeTextArea = $('settingResume');
      if (resumeTextArea) {
        resumeTextArea.value = text;
      }
      state.resume = text;
      localStorage.setItem('cocoai_resume', text);
      
      // Update drop zone success state
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      updateResumeDropZoneState();
      showToast(`✅ PDF resume parsed & activated (${wordCount} words)!`, 'success');

    } catch (err) {
      console.error(err);
      dropZone.className = 'drop-zone error';
      dropZoneText.textContent = `❌ Error: ${err.message}`;
      showToast('Failed to parse PDF: ' + err.message, 'error');
    }
  };

  reader.onerror = () => {
    dropZone.className = 'drop-zone error';
    dropZoneText.textContent = '❌ Failed to read file';
    showToast('Failed to read file contents', 'error');
  };

  reader.readAsArrayBuffer(file);
}

async function parsePDF(arrayBuffer) {
  const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
  if (!pdfjsLib) {
    throw new Error('PDF.js engine is loading... Please try again in a moment.');
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'services/pdf.worker.min.js';

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

function updateResumeDropZoneState() {
  const dropZone = $('resumeDropZone');
  if (!dropZone) return;
  const dropZoneText = dropZone.querySelector('.drop-zone-text');
  if (!dropZoneText) return;

  const currentResumeText = $('settingResume') ? $('settingResume').value.trim() : state.resume;

  if (currentResumeText) {
    const wordCount = currentResumeText.split(/\s+/).filter(Boolean).length;
    dropZone.className = 'drop-zone success';
    dropZoneText.textContent = `✅ Active Resume Injected (${wordCount} words)`;
  } else {
    dropZone.className = 'drop-zone';
    dropZoneText.textContent = 'Drag & drop PDF Resume or click to upload';
  }
}
