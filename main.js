import { TRANSLATIONS } from './i18n.js';

document.documentElement.classList.add('has-js');

const DEFAULT_LANG = 'ru';
const SUPPORTED = ['uk', 'ru', 'en'];

function detectInitialLang() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang && SUPPORTED.includes(urlLang)) return urlLang;
  const stored = localStorage.getItem('lang');
  if (stored && SUPPORTED.includes(stored)) return stored;
  return DEFAULT_LANG;
}

function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
  const dict = TRANSLATIONS[lang];

  document.documentElement.lang = lang;

  const sig = document.getElementById('navSignature');
  if (sig) {
    sig.src = `images/signature-${lang}.svg`;
    sig.alt = dict['hero.name'] || sig.alt;
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = dict[key];
    if (val === undefined) return;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, val);
    } else {
      el.textContent = val;
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  localStorage.setItem('lang', lang);
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url);
}

function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

function initRevealObserver() {
  const items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => io.observe(el));

  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.in-view)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.1 && r.bottom > 0) {
        el.classList.add('in-view');
        io.unobserve(el);
      }
    });
  }, 200);
}

function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  links.addEventListener('click', e => {
    if (e.target.matches('a')) {
      links.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
}

function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    last = y;
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  setLang(detectInitialLang());
  initLangSwitcher();
  initRevealObserver();
  initNavToggle();
  initNavScroll();
});
