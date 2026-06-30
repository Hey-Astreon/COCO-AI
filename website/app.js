/* ═══════════════════════════════════════════════════════════════════
   CocoAI Landing Page — App.js
   Three.js 3D background + GSAP ScrollTrigger scroll animations
   Lenis smooth scroll + 3D card tilt + interactive UI
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Register GSAP Plugins ────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ─── Three.js Particle Background ────────────────────────────────
(function initThreeJS() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 600;

  // ── Particle Geometry ──────────────────────────────────────────
  const PARTICLE_COUNT = 2800;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  const colorA = new THREE.Color('#6c63ff'); // violet
  const colorB = new THREE.Color('#00d4aa'); // teal
  const colorC = new THREE.Color('#ff6584'); // pink

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    // Spread particles across a deep 3D volume
    positions[i3]     = (Math.random() - 0.5) * 1800;
    positions[i3 + 1] = (Math.random() - 0.5) * 1800;
    positions[i3 + 2] = (Math.random() - 0.5) * 1200;
    sizes[i] = Math.random() * 2.5 + 0.5;

    // Mix colors randomly
    const mix = Math.random();
    let c;
    if (mix < 0.5)  c = colorA.clone().lerp(colorB, mix * 2);
    else            c = colorB.clone().lerp(colorC, (mix - 0.5) * 2);

    colors[i3]     = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('customSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // ── Custom Shader Material (glow dots) ────────────────────────
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute float customSize;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        vec3 pos = position;
        // Gentle floating drift
        pos.x += sin(uTime * 0.25 + position.z * 0.003) * 12.0;
        pos.y += cos(uTime * 0.2  + position.x * 0.003) * 12.0;
        pos.z += sin(uTime * 0.15 + position.y * 0.003) * 8.0;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = customSize * uPixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float alpha = 1.0 - smoothstep(0.0, 1.0, d);
        alpha = pow(alpha, 1.8);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor, alpha * 0.65);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ── Connecting Lines / Grid ───────────────────────────────────
  const GRID_COUNT = 18;
  const gridGeo = new THREE.BufferGeometry();
  const gridPositions = [];

  for (let i = 0; i < GRID_COUNT; i++) {
    for (let j = 0; j < GRID_COUNT; j++) {
      const x1 = (i / GRID_COUNT - 0.5) * 1400;
      const y1 = (j / GRID_COUNT - 0.5) * 1200;
      const x2 = ((i + 1) / GRID_COUNT - 0.5) * 1400;
      const y2 = (j / GRID_COUNT - 0.5) * 1200;
      gridPositions.push(x1, y1, -200, x2, y2, -200);
    }
  }

  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x6c63ff,
    transparent: true,
    opacity: 0.06,
    blending: THREE.AdditiveBlending,
  });
  const gridLines = new THREE.LineSegments(gridGeo, gridMat);
  scene.add(gridLines);

  // ── Mouse Parallax ────────────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Scroll Camera Depth ───────────────────────────────────────
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  });

  // ── Animation Loop ─────────────────────────────────────────────
  const clock = new THREE.Clock();

  (function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    material.uniforms.uTime.value = elapsed;

    // Subtle particle rotation
    particles.rotation.y = elapsed * 0.015;
    particles.rotation.x = elapsed * 0.008;

    // Camera parallax from mouse
    camera.position.x += (mouseX * 60 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 40 - camera.position.y) * 0.04;

    // Camera Z moves as user scrolls (fly-through effect)
    const targetZ = 600 - scrollProgress * 400;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    // Grid gentle drift
    gridLines.rotation.z = elapsed * 0.008;

    renderer.render(scene, camera);
  })();

  // ── Resize Handler ────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


// ─── GSAP Scroll Animations ───────────────────────────────────────
(function initScrollAnimations() {

  // Helper: animate elements in when they enter view (uses from() so always visible at rest)
  function revealOnScroll(selector, vars = {}) {
    document.querySelectorAll(selector).forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
        ...vars
      });
    });
  }

  // ── Hero Entrance ─────────────────────────────────────────────
  const heroTl = gsap.timeline({ delay: 0.1 });
  heroTl
    .to('.hero-badge',    { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' })
    .to('.hero-title',    { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, '-=0.4')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, '-=0.5')
    .to('.hero-actions',  { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '-=0.4')
    .to('.hero-stats',    { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, '-=0.3')
    .to('.hero-mockup',   { opacity: 1, x: 0, duration: 1.1, ease: 'expo.out' }, '-=0.8');

  // ── Section labels & titles ────────────────────────────────────
  revealOnScroll('.section-label', { delay: 0 });
  revealOnScroll('.section-title', { delay: 0.1 });
  revealOnScroll('.section-desc',  { delay: 0.2 });

  // ── Stealth Demo ──────────────────────────────────────────────
  revealOnScroll('.stealth-demo', { delay: 0.1 });

  // ── Features Grid — stagger each card ─────────────────────────
  ScrollTrigger.create({
    trigger: '.features-grid',
    start: 'top 80%',
    onEnter: () => {
      gsap.from('.feature-card', {
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
      });
    }
  });

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
        mockup.style.transform = `rotateX(${p * 10}deg) rotateY(${p * -15}deg) scale(${1 - p * 0.1})`;
      }
    }
  });

})();


// ─── 3D Tilt Cards ────────────────────────────────────────────────
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const MAX_TILT = 10;
    const GLOW_SIZE = 180;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(card, {
        rotateX: -dy * MAX_TILT,
        rotateY:  dx * MAX_TILT,
        duration: 0.4,
        ease: 'power2.out',
        transformStyle: 'preserve-3d',
      });

      // Inner glow follow
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `
        radial-gradient(circle ${GLOW_SIZE}px at ${x}px ${y}px,
          rgba(108, 99, 255, 0.12) 0%,
          rgba(12, 12, 30, 0.65) 60%
        )
      `;
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.6)',
      });
      card.style.background = '';
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


// ─── Smooth anchor navigation ─────────────────────────────────────
(function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: 80 },
          duration: 1.2,
          ease: 'expo.inOut'
        });
      }
    });
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
