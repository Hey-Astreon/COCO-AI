/* ═════════════════════════════════════════════════════════════
   CocoAI — JavaScript Logic
   Features: AI Q&A simulation, transcript, streaming text,
             hotkeys, opacity control, mic toggle, toast
   ═════════════════════════════════════════════════════════════ */

'use strict';

// ─── State ────────────────────────────────────────────────────
const state = {
  micActive: true,
  sessionTime: 0,
  messageCount: 0,
  autoScroll: true,
  lastAnswer: '',
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
};

// ─── Demo Data ────────────────────────────────────────────────
const DEMO_QA = [
  {
    q: "Can you explain the difference between a list and a tuple in Python?",
    a: `Both lists and tuples are sequence data types in Python, but they have key differences:

<ul>
  <li><strong>Lists are mutable</strong> — You can add, remove, or change elements after creation.</li>
  <li><strong>Tuples are immutable</strong> — Once created, their elements cannot be changed.</li>
  <li>Lists use <code>square brackets</code>: <code>[1, 2, 3]</code></li>
  <li>Tuples use <code>parentheses</code>: <code>(1, 2, 3)</code></li>
  <li><strong>Lists are generally slower</strong> for iteration due to their mutability.</li>
  <li><strong>Tuples can be used as dictionary keys</strong> or set elements; lists cannot.</li>
</ul>

Use <strong>lists</strong> when you need to modify the sequence; use <strong>tuples</strong> for fixed collections or as keys.`
  },
  {
    q: "What is the time complexity of binary search?",
    a: `Binary search operates on <strong>sorted arrays</strong> and has the following complexity:

<ul>
  <li><strong>Time Complexity:</strong> <code>O(log n)</code> — halves the search space each iteration</li>
  <li><strong>Space Complexity:</strong> <code>O(1)</code> for iterative, <code>O(log n)</code> for recursive (call stack)</li>
  <li><strong>Best Case:</strong> <code>O(1)</code> — target is the middle element</li>
  <li><strong>Worst Case:</strong> <code>O(log n)</code> — element is at end or not present</li>
</ul>

Key insight: each comparison eliminates <strong>half</strong> the remaining candidates, hence logarithmic time.`
  },
  {
    q: "Tell me about yourself and your experience.",
    a: `Here's a strong STAR-structured response:

<strong>Situation:</strong> I'm a passionate full-stack developer with X years of experience building scalable web applications.

<strong>Task & Action:</strong>
<ul>
  <li>Built production systems using <strong>React, Node.js, and Python</strong></li>
  <li>Led a team of 3 engineers to deliver a high-traffic feature handling 50k+ daily users</li>
  <li>Reduced API response time by <strong>40%</strong> through query optimization and caching</li>
</ul>

<strong>Result:</strong> Consistently delivered projects on time, received a "Top Performer" rating, and contributed to a 2x growth in product users.

Tailor this with YOUR specific projects and metrics for maximum impact.`
  },
  {
    q: "Design a URL shortening service like bit.ly",
    a: `Here's a high-level system design for a URL shortener:

<strong>Core Components:</strong>
<ul>
  <li><strong>API Layer:</strong> POST /shorten → returns short code; GET /{code} → 301 redirect</li>
  <li><strong>Encoding:</strong> Base62 encoding (a-z, A-Z, 0-9) — 6 chars = 62⁶ ≈ 56 billion URLs</li>
  <li><strong>Database:</strong> NoSQL (DynamoDB/Cassandra) for key→URL mapping; Redis for hot URL caching</li>
  <li><strong>Scale:</strong> 100:1 read/write ratio — optimize for reads with CDN + cache</li>
</ul>

<strong>Scale estimates:</strong> 500M new URLs/day → ~100M redirects/day → need horizontal scaling + sharding.`
  },
];

const DEMO_TRANSCRIPTS = [
  { role: 'interviewer', text: "Can you walk me through a challenging project you've worked on?", delay: 5000 },
  { role: 'interviewer', text: "What's your approach to debugging a complex issue in production?", delay: 12000 },
  { role: 'you', text: "My approach starts with isolating the issue using logs and metrics...", delay: 18000 },
];

// ─── Initialization ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initOpacitySlider();
  initHotkeys();
  initAutoScroll();
  startSessionTimer();
  scheduleDemoContent();
});

// ─── Opacity Slider ────────────────────────────────────────────
function initOpacitySlider() {
  const slider = els.opacitySlider;

  const updateSlider = () => {
    const val = slider.value;
    els.opacityValue.textContent = val + '%';

    // Update gradient fill
    slider.style.setProperty('--value', val + '%');
    slider.style.background = `linear-gradient(to right,
      var(--accent-primary) 0%,
      var(--accent-primary) ${val}%,
      rgba(255,255,255,0.15) ${val}%
    )`;

    // Apply to main container
    document.body.style.opacity = (val / 100).toFixed(2);
  };

  slider.addEventListener('input', updateSlider);
  updateSlider(); // init
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
  setInterval(() => {
    state.sessionTime++;
  }, 1000);
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

    // Ctrl+Shift+H — Hide/Show
    if (ctrl && shift && key === 'h') {
      e.preventDefault();
      toggleVisibility();
    }

    // Ctrl+Shift+A — Analyze
    if (ctrl && shift && key === 'a') {
      e.preventDefault();
      analyzeScreen();
    }

    // Enter in ask input
    if (key === 'enter' && document.activeElement === els.askInput) {
      submitQuestion();
    }

    // Escape — focus ask input
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
  state.micActive = !state.micActive;
  els.micBtn.classList.toggle('active', state.micActive);

  if (state.micActive) {
    els.statusDot.className = 'status-dot listening';
    els.statusText.textContent = 'Listening';
    showToast('🎙 Microphone active', 'success');
    // Resume wave animation
    document.querySelectorAll('.wave-bar').forEach(b => b.style.animationPlayState = 'running');
  } else {
    els.statusDot.className = 'status-dot paused';
    els.statusText.textContent = 'Paused';
    showToast('🔇 Microphone paused');
    // Pause wave animation
    document.querySelectorAll('.wave-bar').forEach(b => b.style.animationPlayState = 'paused');
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

// ─── Add Q&A Card ──────────────────────────────────────────────
async function addQACard(question) {
  state.messageCount++;
  const timestamp = getTimestamp();

  // Remove welcome card if present
  const welcome = els.answersFeed.querySelector('.welcome-card');
  if (welcome) welcome.remove();

  // Add thinking indicator
  const thinkingEl = document.createElement('div');
  thinkingEl.className = 'streaming-card';
  thinkingEl.id = `thinking-${state.messageCount}`;
  thinkingEl.innerHTML = `
    <div class="thinking-dots">
      <span></span><span></span><span></span>
    </div>
    <span class="thinking-text">CocoAI is generating your answer...</span>
  `;
  els.answersFeed.appendChild(thinkingEl);
  scrollToBottom(els.answersFeed);

  // Pick a demo answer or generate a generic one
  const demoItem = DEMO_QA.find(d =>
    question.toLowerCase().split(' ').some(w => d.q.toLowerCase().includes(w) && w.length > 4)
  );
  const answerHTML = demoItem ? demoItem.a : generateGenericAnswer(question);
  state.lastAnswer = answerHTML;

  // Simulate API delay (300–800ms)
  await sleep(300 + Math.random() * 500);

  // Remove thinking indicator
  thinkingEl.remove();

  // Create Q&A card
  const card = document.createElement('div');
  card.className = 'qa-card';
  card.innerHTML = `
    <div class="qa-question">
      <span class="qa-q-label">Q</span>
      <span class="qa-q-text">${escHtml(question)}</span>
    </div>
    <div class="qa-answer">
      <div class="qa-a-label">⚡ CocoAI Answer</div>
      <div class="qa-a-text" id="answer-text-${state.messageCount}"></div>
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

  // Stream the answer text
  const answerEl = $(`answer-text-${state.messageCount}`);
  await streamHTML(answerEl, answerHTML);
}

// ─── Stream HTML content ───────────────────────────────────────
async function streamHTML(el, html) {
  // Add blinking cursor placeholder
  el.innerHTML = '<span class="cursor-blink"></span>';

  // Split into characters but preserve HTML tags
  const parts = chunkHTML(html);
  let displayed = '';

  for (let i = 0; i < parts.length; i++) {
    displayed += parts[i];
    el.innerHTML = displayed + '<span class="cursor-blink"></span>';

    if (state.autoScroll) {
      els.answersFeed.scrollTop = els.answersFeed.scrollHeight;
    }

    // Variable delay: faster for tags, slower for text
    const delay = parts[i].startsWith('<') ? 1 : (8 + Math.random() * 10);
    await sleep(delay);
  }

  // Remove cursor at end
  el.innerHTML = displayed;
}

// ─── Chunk HTML for streaming ──────────────────────────────────
function chunkHTML(html) {
  const chunks = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] === '<') {
      // Find end of tag
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

// ─── Generic Answer Generator ──────────────────────────────────
function generateGenericAnswer(question) {
  const lcq = question.toLowerCase();

  if (lcq.includes('tell me about yourself') || lcq.includes('introduce yourself')) {
    return `<strong>Here's a strong "Tell me about yourself" structure:</strong>

<ul>
  <li><strong>Present:</strong> Start with your current role and key expertise</li>
  <li><strong>Past:</strong> Mention 1-2 relevant achievements with metrics</li>
  <li><strong>Future:</strong> Connect why this role excites you specifically</li>
</ul>

Keep it under <strong>90 seconds</strong>. Practice until it sounds natural, not memorized.`;
  }

  if (lcq.includes('weakness') || lcq.includes('challenge')) {
    return `<strong>Answer Formula for "What's your weakness?":</strong>

<ul>
  <li>Name a <strong>real weakness</strong> (not a humble-brag like "I work too hard")</li>
  <li>Show <strong>self-awareness</strong> about how it has impacted you</li>
  <li>Describe the <strong>concrete steps</strong> you're taking to improve it</li>
  <li>Give a <strong>recent example</strong> of improvement</li>
</ul>

Example: <em>"I used to struggle with public speaking. I joined Toastmasters 6 months ago and have since delivered 3 presentations to groups of 30+ people."</em>`;
  }

  return `<strong>Here's a structured approach to answer this question:</strong>

<ul>
  <li>Start with the <strong>core concept</strong> in one clear sentence</li>
  <li>Use a <strong>concrete example</strong> from your experience</li>
  <li>Quantify your impact with <strong>specific metrics</strong> where possible</li>
  <li>Connect it to the <strong>role's requirements</strong> you're interviewing for</li>
</ul>

Take a <strong>2-3 second pause</strong> before answering to organize your thoughts — interviewers appreciate thoughtfulness.`;
}

// ─── Analyze Screen ────────────────────────────────────────────
function analyzeScreen() {
  addQACard('[Image captured from screen] Please analyze this coding problem and provide a step-by-step solution.');
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
  const div = document.createElement('div');
  div.innerHTML = state.lastAnswer;
  navigator.clipboard.writeText(div.innerText).then(() => showToast('📋 Last answer copied!', 'success'));
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
  } else {
    showToast('Minimize not supported in web mode');
  }
}

function closeWindow() {
  if (window.electronAPI) {
    window.electronAPI.closeApp();
  } else {
    showToast('Close not supported in web mode');
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

  // Auto-generate answer if interviewer and a question
  if (isInterviewer && text.endsWith('?')) {
    setTimeout(() => {
      addQACard(text);
    }, 1200);
  }
}

// ─── Schedule Demo Content ─────────────────────────────────────
function scheduleDemoContent() {
  // Simulate first question being asked
  setTimeout(() => {
    showTypingIndicator(1800);
    setTimeout(() => {
      addTranscriptEntry('interviewer', 'Can you explain the difference between a list and a tuple in Python?');
    }, 2000);
  }, 3000);

  // Second question
  setTimeout(() => {
    showTypingIndicator(1500);
    setTimeout(() => {
      addTranscriptEntry('interviewer', "What is the time complexity of binary search?");
    }, 12000);
  }, 10000);
}

function showTypingIndicator(duration) {
  els.typingIndicator.style.display = 'flex';
  setTimeout(() => {
    els.typingIndicator.style.display = 'none';
  }, duration);
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
