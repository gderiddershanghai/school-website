// js/main.js — Flying English Center
// Shared behaviour for all pages: off-canvas mobile nav, scroll reveals, gallery lightbox.

/* ───────── Off-canvas mobile nav ───────── */
const hamburger = document.querySelector('.hamburger');
const nav       = document.getElementById('primary-nav');
const backdrop  = document.querySelector('.nav-backdrop');

if (hamburger && nav){
  const setNav = open => {
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
  };
  hamburger.addEventListener('click', () => setNav(hamburger.getAttribute('aria-expanded') !== 'true'));
  // close after tapping a link, clicking the backdrop, or pressing Escape
  nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  if (backdrop) backdrop.addEventListener('click', () => setNav(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
}

/* ───────── Reveal-on-scroll ───────── */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting){
        en.target.classList.add('in');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in')); // fallback: show everything
}

/* ───────── Gallery lightbox ───────── */
const lightbox = document.querySelector('.lightbox');
if (lightbox){
  const lbImg   = lightbox.querySelector('img');
  const lbCap   = lightbox.querySelector('figcaption');
  const lbClose = lightbox.querySelector('.lb-close');
  let lastFocus = null;

  const openLb = (src, alt) => {
    lbImg.src = src;
    lbImg.alt = alt || '';
    if (lbCap) lbCap.textContent = alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    if (lbClose) lbClose.focus();
  };
  const closeLb = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll('[data-lightbox] button').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (!img) return;
      lastFocus = btn;
      openLb(img.currentSrc || img.src, img.alt);
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLb);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLb();
  });
}
