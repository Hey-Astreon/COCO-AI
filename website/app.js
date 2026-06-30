/* ═══════════════════════════════════════════════════════════════════
   CocoAI Landing Page — App.js
   Three.js 3D custom morphing shader background
   Lenis smooth scroll + GSAP ScrollTrigger camera choreography
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Register GSAP Plugins ────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─── Initialize Lenis Smooth Scroll ──────────────────────────────
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expoOut
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

// Synchronize Lenis scroll ticker with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Link anchor smooth navigations with Lenis instead of default ScrollTo
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target, { offset: -80 });
    }
  });
});


// ─── Three.js Upgraded Particle Shader Background ─────────────────
let shaderMaterial;
(function initThreeJS() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 650;

  // ── Particle Grid Coordinate Generation ──────────────────────────
  const gridW = 65;
  const gridH = 65;
  const PARTICLE_COUNT = gridW * gridH;
  
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  // High-fidelity vibrant brand HSL colors translated to RGB
  const colorA = new THREE.Color('#ff007f'); // Pink
  const colorB = new THREE.Color('#6c63ff'); // Violet
  const colorC = new THREE.Color('#00d4aa'); // Emerald Teal

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const col = i % gridW;
    const row = Math.floor(i / gridW);

    // Initial flat Cartesian coordinates
    const x = (col / gridW - 0.5) * 1500;
    const y = (row / gridH - 0.5) * 1500;
    const z = (Math.random() - 0.5) * 20;

    const i3 = i * 3;
    positions[i3]     = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    sizes[i] = Math.random() * 2.2 + 0.8;

    // Linear gradient transitions
    const mixVal = col / gridW;
    const c = colorB.clone().lerp(colorC, mixVal);
    if (row / gridH > 0.5) {
      c.lerp(colorA, (row / gridH - 0.5) * 1.5);
    }

    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('customSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

  // ── Custom Morphing GLSL Shader ────────────────────────────────
  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute float customSize;
      attribute vec3 customColor;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uScroll;
      uniform float uPixelRatio;

      void main() {
        vColor = customColor;
        vec3 pos = position;

        // Shape 1: Hero fluid mathematical sine waves
        float wave1 = sin(pos.x * 0.005 + uTime * 0.6) * cos(pos.y * 0.004 + uTime * 0.4) * 110.0;
        vec3 shapeHero = vec3(pos.x, pos.y, wave1);

        // Shape 2: Digital Matrix grid (flat, structured space plane)
        float wave2 = sin(pos.x * 0.01 + uTime * 0.2) * 15.0;
        vec3 shapeMatrix = vec3(pos.x * 1.2, pos.y * 0.85, wave2 - 180.0);

        // Shape 3: Cylinder vortex tunnel
        float angle = pos.x * 0.01 + uTime * 0.08;
        float radius = 320.0 + sin(pos.y * 0.01 + uTime * 0.4) * 60.0;
        vec3 shapeVortex = vec3(cos(angle) * radius, sin(angle) * radius, pos.y * 1.8 - 400.0);

        // Transition logic based on scroll percentage
        vec3 finalPos = shapeHero;
        float t = 0.0;
        if (uScroll < 0.35) {
          t = uScroll / 0.35;
          finalPos = mix(shapeHero, shapeMatrix, smoothstep(0.0, 1.0, t));
        } else {
          t = (uScroll - 0.35) / 0.65;
          finalPos = mix(shapeMatrix, shapeVortex, smoothstep(0.0, 1.0, t));
        }

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_PointSize = customSize * uPixelRatio * (380.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
        float alpha = 1.0 - smoothstep(0.0, 1.0, d);
        alpha = pow(alpha, 1.6);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha * 0.75);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, shaderMaterial);
  scene.add(particles);

  // ── Mouse Parallax ────────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Scroll Event mapping scroll progress to uniform ───────────
  window.addEventListener('scroll', () => {
    const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (shaderMaterial) {
      shaderMaterial.uniforms.uScroll.value = scrollPct;
    }
  });

  // ── Animation Loop ─────────────────────────────────────────────
  const clock = new THREE.Clock();

  (function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    shaderMaterial.uniforms.uTime.value = elapsed;

    // Gentle camera parallax movement
    camera.position.x += (mouseX * 50 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 30 - camera.position.y) * 0.04;

    // Subtle automatic rotation to maintain particle dynamics
    particles.rotation.y = elapsed * 0.01;
    particles.rotation.x = elapsed * 0.005;

    renderer.render(scene, camera);
  })();

  // ── Resize Handler ────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


// ─── Cursor Radial Glow highlight tracker ──────────────────────────
(function initCursorGlowTracker() {
  const updateCoords = (e) => {
    // Globally maps coordinates to target elements via CSS vars
    const targets = document.querySelectorAll('.feature-card, .pricing-card, .hotkey, .btn-primary, .btn-ghost');
    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
    });
  };
  document.addEventListener('mousemove', updateCoords);
})();


// ─── GSAP Scroll Animations ───────────────────────────────────────
(function initScrollAnimations() {

  // Helper: animate elements in when they enter view (uses from() so always visible at rest)
  function revealOnScroll(selector, vars = {}) {
    document.querySelectorAll(selector).forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 35,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        ...vars
      });
    });
  }

  // ── Hero Entrance ─────────────────────────────────────────────
  const heroTl = gsap.timeline({ delay: 0.1 });
  heroTl
    .from('.hero-badge',    { opacity: 0, y: 25, duration: 0.7, ease: 'expo.out' })
    .from('.hero-title',    { opacity: 0, y: 35, duration: 0.9, ease: 'expo.out' }, '-=0.4')
    .from('.hero-subtitle', { opacity: 0, y: 25, duration: 0.8, ease: 'expo.out' }, '-=0.5')
    .from('.hero-actions',  { opacity: 0, y: 20, duration: 0.7, ease: 'expo.out' }, '-=0.4')
    .from('.hero-stats',    { opacity: 0, y: 20, duration: 0.7, ease: 'expo.out' }, '-=0.3')
    .from('.hero-mockup',   { opacity: 0, x: 50, duration: 1.1, ease: 'expo.out' }, '-=0.8');

  // ── Section labels & titles ────────────────────────────────────
  revealOnScroll('.section-label', { delay: 0 });
  revealOnScroll('.section-title', { delay: 0.1 });
  revealOnScroll('.section-desc',  { delay: 0.2 });

  // ── Stealth Demo ──────────────────────────────────────────────
  revealOnScroll('.stealth-demo', { delay: 0.1 });

  // ── Features Grid — per-card ScrollTrigger with refresh ────────
  gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      scale: 0.96,
      duration: 0.7,
      ease: 'expo.out',
      delay: i * 0.08,
      scrollTrigger: {
        trigger: card,
        start: 'top 95%',
        toggleActions: 'play none none none',
        onLeaveBack: () => {},
      },
    });
  });

  // Refresh all triggers after full page render to fix any missed cards
  setTimeout(() => ScrollTrigger.refresh(), 600);

  // ── Steps stagger ─────────────────────────────────────────────
  gsap.utils.toArray('.step').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
      },
      delay: i * 0.12
    });
  });

  revealOnScroll('.hotkeys-grid', { delay: 0.1 });

  // ── Pricing stagger ───────────────────────────────────────────
  ScrollTrigger.create({
    trigger: '.pricing-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.pricing-card', {
        opacity: 0,
        y: 60,
        duration: 0.9,
        stagger: 0.15,
        ease: 'expo.out',
      });
    }
  });

  // ── CTA section ───────────────────────────────────────────────
  revealOnScroll('.cta-title',    { delay: 0 });
  revealOnScroll('.cta-subtitle', { delay: 0.1 });
  revealOnScroll('.cta-actions',  { delay: 0.2 });

  // ── Parallax on section titles when scrolling past them ───────
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.to(el, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  });

  // ── Mockup 3D rotation on scroll ─────────────────────────────
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 2,
    onUpdate: (self) => {
      const p = self.progress;
      const mockup = document.querySelector('.mockup-window');
      if (mockup) {
        mockup.style.transform = `rotateX(${p * 14}deg) rotateY(${p * -18}deg) scale(${1 - p * 0.12})`;
      }
    }
  });

})();


// ─── 3D Tilt Cards ────────────────────────────────────────────────
(function initTilt() {
  document.querySelectorAll('.card-glow').forEach(card => {
    const MAX_TILT = 8;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(card, {
        rotateX: -dy * MAX_TILT,
        rotateY:  dx * MAX_TILT,
        duration: 0.45,
        ease: 'power2.out',
        transformStyle: 'preserve-3d',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.6)',
      });
    });
  });
})();


// ─── Navbar scroll effect ─────────────────────────────────────────
(function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
})();


// ─── Hero Mockup Typewriter ───────────────────────────────────────
(function initTypewriter() {
  const DEMO_TEXT = 'Use a HashMap for O(1) lookups. For each number nums[i], check if target - nums[i] exists in the map. Return indices when found. Time: O(n), Space: O(n).';
  const streamEl = document.getElementById('stream-text');
  if (!streamEl) return;

  let idx = 0;
  let forward = true;

  function type() {
    if (forward) {
      if (idx < DEMO_TEXT.length) {
        streamEl.textContent = DEMO_TEXT.slice(0, ++idx);
        setTimeout(type, 30 + Math.random() * 25);
      } else {
        setTimeout(() => { forward = false; type(); }, 2800);
      }
    } else {
      if (idx > 0) {
        streamEl.textContent = DEMO_TEXT.slice(0, --idx);
        setTimeout(type, 12);
      } else {
        setTimeout(() => { forward = true; type(); }, 400);
      }
    }
  }

  setTimeout(type, 1600);
})();


// ─── Hero Mockup mouse tilt ───────────────────────────────────────
(function initMockupTilt() {
  const mockup = document.querySelector('.hero-mockup');
  const win = document.querySelector('.mockup-window');
  if (!mockup || !win) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    gsap.to(win, {
      rotateY:  dx * 8,
      rotateX: -dy * 6,
      duration: 0.8,
      ease: 'power2.out',
      transformStyle: 'preserve-3d',
      transformOrigin: 'center center',
    });
  });
})();


// ─── Copy Code Buttons ────────────────────────────────────────────
function copyCode(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText.replace(/\n/g, '\n');
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.color = '#00d4aa';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
    }, 2000);
  });
}


// ─── Notify Modal ─────────────────────────────────────────────────
function notifyMe() {
  document.getElementById('notify-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('notify-modal').classList.remove('active');
}

function submitNotify() {
  const email = document.getElementById('notify-email').value.trim();
  if (!email || !email.includes('@')) {
    document.getElementById('notify-email').style.borderColor = '#ff6584';
    return;
  }
  // Simulate success
  const box = document.querySelector('.modal-box');
  box.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
      <h3 style="color: #f0f0ff; margin-bottom: 8px;">You're on the list!</h3>
      <p style="color: #8888aa; margin-bottom: 24px;">We'll notify you at <strong style="color:#6c63ff">${email}</strong> when CocoAI Pro launches.</p>
      <button onclick="closeModal()" style="padding:12px 28px; background:linear-gradient(135deg,#6c63ff,#8b5cf6); border:none; border-radius:8px; color:#fff; font-size:14px; font-weight:700; cursor:pointer;">
        Awesome, Thanks! 🥥
      </button>
    </div>
  `;
}

// ─── Escape key closes modal ──────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── Expose for onclick handlers ──────────────────────────────────
window.copyCode    = copyCode;
window.notifyMe    = notifyMe;
window.closeModal  = closeModal;
window.submitNotify = submitNotify;
