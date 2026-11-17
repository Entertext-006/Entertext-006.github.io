/* ============================================
   DEDEEPYA — PORTFOLIO JS
   ============================================ */
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ── THEME ──────────────────────────────────── */
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

const savedTheme = store.get('portfolio-theme');
if (savedTheme) root.dataset.theme = savedTheme;
else if (matchMedia('(prefers-color-scheme: light)').matches) root.dataset.theme = 'light';

$('#theme-toggle').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('portfolio-theme', next);
});

/* ── MOBILE MENU ────────────────────────────── */
const burger = $('#hamburger');
const links = $('#nav-links');

function toggleMenu(open) {
  burger.classList.toggle('open', open);
  links.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
}
burger.addEventListener('click', () => toggleMenu(!burger.classList.contains('open')));
links.addEventListener('click', e => { if (e.target.closest('a')) toggleMenu(false); });
document.addEventListener('click', e => { if (!e.target.closest('.nav')) toggleMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

/* ── SCROLL STATE: header, back-to-top, active link ── */
const header = $('.header');
const toTop = $('#back-to-top');
const sections = [...document.querySelectorAll('main section[id]')];
const navAnchors = [...document.querySelectorAll('.nav__link')];

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 20);
  toTop.classList.toggle('visible', y > 500);

  let current = '';
  for (const s of sections) if (y >= s.offsetTop - 120) current = s.id;
  navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* ── HERO: PARTICLES + PAW TRAIL ────────────── */
(function particles() {
  const canvas = $('#hero-canvas');
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  const dots = [];
  const paws = [];
  const TOES = [[0, 0, 1], [-.9, -1.1, .45], [.9, -1.1, .45], [-1.5, -.2, .45], [1.5, -.2, .45]];
  let W, H, raf = 0, mx = -9999, my = -9999;

  const accent = () => getComputedStyle(root).getPropertyValue('--accent').trim() || '#f472b6';
  const make = () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
    r: Math.random() * 1.6 + .6, a: Math.random() * .5 + .15,
  });

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    dots.length = 0;
    for (let i = 0; i < 70; i++) dots.push(make());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = accent();

    for (const p of dots) {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
      if (d > 0 && d < 80) {
        const f = (80 - d) / 80 * .06;
        p.vx += dx / d * f;
        p.vy += dy / d * f;
      }
      p.vx *= .992;
      p.vy *= .992;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = paws.length - 1; i >= 0; i--) {
      const t = paws[i];
      ctx.globalAlpha = t.a;
      for (const [ox, oy, k] of TOES) {
        ctx.beginPath();
        ctx.arc(t.x + ox * t.r, t.y + oy * t.r, t.r * k, 0, Math.PI * 2);
        ctx.fill();
      }
      t.a -= .025;
      if (t.a <= 0) paws.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }

  hero.addEventListener('mousemove', e => {
    const b = canvas.getBoundingClientRect();
    mx = e.clientX - b.left;
    my = e.clientY - b.top;
    if (Math.random() < .18) {
      paws.push({ x: mx + (Math.random() - .5) * 10, y: my + (Math.random() - .5) * 10, a: .55, r: Math.random() * 2 + 1.5 });
    }
  });
  hero.addEventListener('mouseleave', () => { mx = my = -9999; });
  addEventListener('resize', resize);
  resize();

  if (reduceMotion) return;
  // One loop, and only while the hero is on screen
  new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf);
    if (entry.isIntersecting) draw();
  }).observe(canvas);
})();

/* ── HERO: TYPING ───────────────────────────── */
(function typing() {
  const el = $('#typed-text');
  // Array.from keeps emoji intact when slicing
  const phrases = [
    'Full-Stack Developer 🐾',
    'UI/UX Designer',
    'Cat Lover & Coder 🐱',
    'BCA @ PES University',
    'Python Enthusiast',
  ].map(p => Array.from(p));

  if (reduceMotion) { el.textContent = phrases[0].join(''); return; }

  let i = 0, n = 0, deleting = false;
  function tick() {
    const chars = phrases[i];
    el.textContent = chars.slice(0, n).join('');
    let delay = deleting ? 35 : 70 + Math.random() * 30;
    if (!deleting && n === chars.length) { deleting = true; delay = 1600; }
    else if (deleting && n === 0) { deleting = false; i = (i + 1) % phrases.length; delay = 350; }
    else n += deleting ? -1 : 1;
    setTimeout(tick, delay);
  }
  tick();
})();

/* ── SCROLL REVEAL + SKILL BARS ─────────────── */
(function reveal() {
  const items = document.querySelectorAll('.fade-in');
  items.forEach(el => {
    const i = [...el.parentElement.children].indexOf(el);
    el.style.setProperty('--d', Math.min(i, 3) * 0.1 + 's'); // stagger siblings
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      el.querySelectorAll('.skill-bar').forEach((bar, i) => {
        setTimeout(() => { bar.querySelector('.skill-bar__fill').style.width = bar.dataset.level + '%'; }, 250 + i * 120);
      });
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();

/* ── CONTACT FORM ───────────────────────────── */
(function contactForm() {
  const form = $('#contact-form');
  // 1. Create a free form at https://formspree.io  2. Paste its endpoint below
  const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
  const success = $('#form-success');
  let hideTimer;

  function showStatus(text, isError) {
    $('#form-status').textContent = text;
    success.classList.toggle('is-error', isError);
    $('i', success).className = isError ? 'fa fa-circle-exclamation' : 'fa fa-check-circle';
    success.hidden = false;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { success.hidden = true; }, 6000);
  }
  const rules = {
    name: v => v.length < 2 && 'Enter your name (at least 2 characters).',
    email: v => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && 'Enter a valid email address.',
    subject: v => v.length < 4 && 'Add a short subject (at least 4 characters).',
    message: v => v.length < 20 && 'Write a message of at least 20 characters.',
  };

  function check(id) {
    const input = form.elements[id];
    const msg = rules[id](input.value.trim()) || '';
    input.classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', String(!!msg));
    $('#' + id + '-error').textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(id => {
    const input = form.elements[id];
    input.addEventListener('blur', () => check(id));
    input.addEventListener('input', () => { if (input.classList.contains('invalid')) check(id); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const results = Object.keys(rules).map(check); // validate every field
    if (!results.every(Boolean)) return;

    const btn = $('[type="submit"]', form);
    const label = $('.btn__text', btn);
    btn.disabled = true;
    label.textContent = 'Sending…';

    try {
      if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) throw new Error('Set FORM_ENDPOINT in script.js first.');
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Request failed (' + res.status + ')');
      form.reset();
      showStatus("Message sent. I'll get back to you soon.", false);
    } catch (err) {
      console.warn(err.message);
      showStatus('Could not send right now. Please email me at dedeepya944@gmail.com.', true);
    } finally {
      btn.disabled = false;
      label.textContent = 'Send message';
    }
  });
})();