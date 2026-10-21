// js/main.js — Flying English Center
// Content stays visible without JavaScript. JS enhances the mobile menu and gallery.
document.documentElement.classList.add('js');

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
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  };
  const closeLb = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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
    if (e.key === 'Tab' && lightbox.classList.contains('open')) {
      e.preventDefault();
      lbClose.focus();
    }
  });
}

// Load third-party players only when requested; local posters and direct links remain available.
document.querySelectorAll('[data-video]').forEach(button => {
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://player.vimeo.com/video/${button.dataset.video}?autoplay=1`;
    frame.title = button.dataset.title;
    frame.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    button.parentElement.append(frame);
    button.remove();
    frame.focus();
  });
});

// Manual carousel: no automatic motion, with native touch swiping.
document.querySelectorAll('.city-carousel').forEach(carousel => {
  const track = carousel.querySelector('.city-track');
  const slides = [...track.querySelectorAll('figure')];
  const count = carousel.querySelector('.city-count');
  const current = () => Math.round(track.scrollLeft / track.clientWidth);
  const go = direction => {
    const index = (current() + direction + slides.length) % slides.length;
    track.scrollTo({left: index * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  };
  carousel.querySelector('[data-city-prev]').addEventListener('click', () => go(-1));
  carousel.querySelector('[data-city-next]').addEventListener('click', () => go(1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      go(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let timer;
  track.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { count.textContent = `${current() + 1} / ${slides.length}`; }, 120);
  }, {passive:true});
});
