/* ═══════════════════════════════════════════════════════════════════
   CocoAI Landing Page — App.js
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─── FAQ Accordion Interactive Click Handlers ───────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const trigger = item.querySelector('.faq-trigger');
  const content = item.querySelector('.faq-content');

  trigger.addEventListener('click', () => {
    const isActive = item.classList.contains('active');

    // Close all other open items
    document.querySelectorAll('.faq-item').forEach(otherItem => {
      otherItem.classList.remove('active');
      otherItem.querySelector('.faq-content').style.maxHeight = null;
    });

    if (!isActive) {
      item.classList.add('active');
      // Set scrollHeight for smooth transition height animation
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
});

// ─── Stealth View Mode Switcher Demo ─────────────────────────────────
const btnShowYou = document.getElementById('btn-show-you');
const btnShowInterviewer = document.getElementById('btn-show-interviewer');
const interactiveOverlay = document.getElementById('interactive-overlay');

if (btnShowYou && btnShowInterviewer && interactiveOverlay) {
  btnShowYou.addEventListener('click', () => {
    btnShowYou.classList.add('active');
    btnShowInterviewer.classList.remove('active');
    interactiveOverlay.style.opacity = '1';
    interactiveOverlay.style.transform = 'translateY(0) scale(1)';
  });

  btnShowInterviewer.addEventListener('click', () => {
    btnShowInterviewer.classList.add('active');
    btnShowYou.classList.remove('active');
    interactiveOverlay.style.opacity = '0';
    interactiveOverlay.style.transform = 'translateY(10px) scale(0.95)';
  });
}

// ─── Mockup Typewriter Animation ─────────────────────────────────────
const DEMO_ANSWER = `def is_palindrome(s: str) -> bool:
    # Cleanup non-alphanumeric chars
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    # Match forward and backward bounds
    return cleaned == cleaned[::-1]`;

const typedAnswerEl = document.getElementById('typed-answer');
if (typedAnswerEl) {
  let charIdx = 0;
  
  function typeText() {
    if (charIdx < DEMO_ANSWER.length) {
      typedAnswerEl.textContent = DEMO_ANSWER.slice(0, ++charIdx);
      setTimeout(typeText, 25 + Math.random() * 20);
    } else {
      setTimeout(() => {
        charIdx = 0;
        typedAnswerEl.textContent = '';
        setTimeout(typeText, 1000);
      }, 4000);
    }
  }

  // Delay typing startup slightly
  setTimeout(typeText, 1200);
}

// ─── Copy Command Line to Clipboard ────────────────────────────────
function copyText(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText || el.textContent;

  navigator.clipboard.writeText(text).then(() => {
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied';
    btn.style.color = '#00D4AA';
    btn.style.borderColor = '#00D4AA';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  });
}

// ─── Waitlist Modal Actions ────────────────────────────────────────
function openModal() {
  const modal = document.getElementById('notify-modal');
  if (modal) modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('notify-modal');
  if (modal) modal.classList.remove('active');
}

function submitNotify() {
  const emailInput = document.getElementById('notify-email');
  if (!emailInput) return;
  const email = emailInput.value.trim();

  if (!email || !email.includes('@')) {
    emailInput.style.borderColor = '#ff5f56';
    return;
  }

  const modalBox = document.querySelector('.modal-box');
  if (modalBox) {
    modalBox.innerHTML = `
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 40px; display: block; margin-bottom: 12px;">🎉</span>
        <h3 style="margin-bottom: 8px;">Success!</h3>
        <p>You have been added to the waitlist at <strong>${email}</strong>.</p>
        <button class="btn-primary" onclick="closeModal()" style="margin-top: 20px; width: 100%;">Close</button>
      </div>
    `;
  }
}

// Close modal when pressing Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Expose globals for inline event handlers
window.copyText = copyText;
window.openModal = openModal;
window.closeModal = closeModal;
window.submitNotify = submitNotify;

// ─── GSAP Scroll Trigger Reveals ─────────────────────────────────────
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Fade-in reveals on scroll
  gsap.utils.toArray('.feature-card, .setup-step, .comparison-section, .faq-item').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 25,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
}
