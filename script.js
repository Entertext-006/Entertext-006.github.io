/* ============================================
   ALEX CHEN — PORTFOLIO JS
   All interactive behaviors
   ============================================ */

'use strict';

/* ── THEME TOGGLE ───────────────────────────── */
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
}

// Persist preference
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) {
  setTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme('light');
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

/* ── HAMBURGER MENU ─────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

// Close on nav link click
navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* ── HEADER SCROLL STATE ────────────────────── */
const header = document.querySelector('.header');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  header.classList.toggle('scrolled', scrollY > 20);
  backToTop.classList.toggle('visible', scrollY > 500);
  backToTop.hidden = false; // Remove hidden attr once revealed
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── ACTIVE NAV HIGHLIGHT ───────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__link');

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 80;
    if (window.scrollY >= top) current = section.id;
  });
  navAnchors.forEach(a => {
    const href = a.getAttribute('href').slice(1);
    a.classList.toggle('active', href === current);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ── HERO CANVAS — PARTICLE FIELD ──────────── */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const particles = [];
  const pawTrails = [];
  const PARTICLE_COUNT = 60;
  let W, H, animId;
  let mouseX = -9999, mouseY = -9999;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  window.addEventListener('resize', () => {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randomParticle());
  });

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    // Spawn a tiny paw trail dot on mouse move
    if (Math.random() < 0.18) {
      pawTrails.push({
        x: mouseX + (Math.random() - 0.5) * 10,
        y: mouseY + (Math.random() - 0.5) * 10,
        alpha: 0.55,
        r: Math.random() * 3 + 2,
      });
    }
  });
  canvas.parentElement.addEventListener('mouseleave', () => {
    mouseX = -9999; mouseY = -9999;
  });

  resize();
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(randomParticle());

  function getAccentColor() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--accent').trim() || '#00d9b8';
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const accent = getAccentColor();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const force = (80 - dist) / 80 * 0.8;
        p.vx += (dx / dist) * force * 0.08;
        p.vy += (dy / dist) * force * 0.08;
      }
      // Velocity damping
      p.vx *= 0.992;
      p.vy *= 0.992;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    }

    // Draw connecting lines
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = accent;
          ctx.globalAlpha = (1 - dist / 110) * 0.12;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);

    // Draw fading paw trail dots
    for (let i = pawTrails.length - 1; i >= 0; i--) {
      const t = pawTrails[i];
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.globalAlpha = t.alpha;
      ctx.fill();
      // Draw tiny toe beans around the main dot
      const toeR = t.r * 0.45;
      const offsets = [[-t.r*0.9,-t.r*1.1],[t.r*0.9,-t.r*1.1],[-t.r*1.5,-t.r*0.2],[t.r*1.5,-t.r*0.2]];
      for (const [ox, oy] of offsets) {
        ctx.beginPath();
        ctx.arc(t.x + ox, t.y + oy, toeR, 0, Math.PI * 2);
        ctx.fill();
      }
      t.alpha -= 0.025;
      if (t.alpha <= 0) pawTrails.splice(i, 1);
    }
    ctx.globalAlpha = 1;
  }

  // Pause when not visible
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      draw();
    } else {
      cancelAnimationFrame(animId);
    }
  });
  observer.observe(canvas);

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cancelAnimationFrame(animId);
    return;
  }
  draw();
})();

/* ── TYPING ANIMATION ───────────────────────── */
(function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const phrases = [
    'Full-Stack Developer 🐾',
    'UI/UX Designer',
    'Cat Lover & Coder 🐱',
    'BCA @ PES University',
    'Python Enthusiast',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let paused = false;

  function tick() {
    const phrase = phrases[phraseIndex];

    if (paused) {
      paused = false;
      setTimeout(tick, deleting ? 60 : 1400);
      return;
    }

    if (!deleting && charIndex <= phrase.length) {
      el.textContent = phrase.slice(0, charIndex++);
      setTimeout(tick, 75 + Math.random() * 35);
    } else if (!deleting && charIndex > phrase.length) {
      deleting = true;
      paused = true;
      setTimeout(tick, 1400);
    } else if (deleting && charIndex > 0) {
      el.textContent = phrase.slice(0, --charIndex);
      setTimeout(tick, 38);
    } else {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, 350);
    }
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = phrases[0];
    return;
  }
  tick();
})();

/* ── SCROLL FADE-IN ─────────────────────────── */
(function initFadeIn() {
  const items = document.querySelectorAll('.fade-in');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(item => io.observe(item));
})();

/* ── SKILL BARS ─────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar');
  if (!bars.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const level = bar.dataset.level;
        const fill = bar.querySelector('.skill-bar__fill');
        if (fill) {
          // Small delay for stagger effect
          const delay = Array.from(bars).indexOf(bar) % 3 * 120;
          setTimeout(() => {
            fill.style.width = level + '%';
          }, delay + 200);
        }
        io.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => io.observe(b));
})();

/* ── PROJECT FILTER ─────────────────────────── */
(function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update buttons
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards with animation
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          // Trigger fade-in reflow
          card.classList.remove('visible');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => card.classList.add('visible'));
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ── CONTACT FORM ───────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');

  function getField(id) { return document.getElementById(id); }
  function getError(id) { return document.getElementById(id + '-error'); }

  function showError(id, msg) {
    const input = getField(id);
    const err = getError(id);
    if (input) input.classList.add('invalid');
    if (err) err.textContent = msg;
  }

  function clearError(id) {
    const input = getField(id);
    const err = getError(id);
    if (input) input.classList.remove('invalid');
    if (err) err.textContent = '';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validate() {
    let valid = true;
    const fields = ['name', 'email', 'subject', 'message'];
    fields.forEach(f => clearError(f));

    const name = getField('name')?.value.trim();
    const email = getField('email')?.value.trim();
    const subject = getField('subject')?.value.trim();
    const message = getField('message')?.value.trim();

    if (!name || name.length < 2) {
      showError('name', 'Please enter your name (min 2 characters)');
      valid = false;
    }
    if (!email) {
      showError('email', 'Please enter your email address');
      valid = false;
    } else if (!validateEmail(email)) {
      showError('email', 'Please enter a valid email address');
      valid = false;
    }
    if (!subject || subject.length < 4) {
      showError('subject', 'Please enter a subject (min 4 characters)');
      valid = false;
    }
    if (!message || message.length < 20) {
      showError('message', 'Please enter a message (min 20 characters)');
      valid = false;
    }
    return valid;
  }

  // Live validation on blur
  ['name', 'email', 'subject', 'message'].forEach(id => {
    const input = getField(id);
    if (input) {
      input.addEventListener('blur', () => {
        // Clear and re-validate just this field
        clearError(id);
        const val = input.value.trim();
        if (!val) {
          showError(id, 'This field is required');
        } else if (id === 'email' && !validateEmail(val)) {
          showError('email', 'Please enter a valid email address');
        } else if ((id === 'name') && val.length < 2) {
          showError('name', 'Please enter your name (min 2 characters)');
        } else if (id === 'message' && val.length < 20) {
          showError('message', 'Please enter a message (min 20 characters)');
        }
      });
      input.addEventListener('input', () => clearError(id));
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitBtn = form.querySelector('[type="submit"]');
    const btnText = submitBtn.querySelector('.btn__text');

    // Loading state
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';

    // Simulate async send
    await new Promise(resolve => setTimeout(resolve, 1200));

    form.reset();
    submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Send Message';
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.focus();
      setTimeout(() => { successMsg.hidden = true; }, 6000);
    }
  });
})();

/* ── SMOOTH SCROLL (supplement for browsers) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── KEYBOARD NAV: skip to main ─────────────── */
(function initSkipNav() {
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
})();