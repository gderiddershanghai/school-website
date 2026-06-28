// my-site/js/main.js
/* ───────── Hamburger toggle ───────── */
const hamburger = document.querySelector('.hamburger');
const navList   = document.querySelector('#primary-nav ul');

if (hamburger && navList){
  const setMenu = open => {
    hamburger.setAttribute('aria-expanded', String(open));
    navList.setAttribute('aria-expanded', String(open));
  };
  hamburger.addEventListener('click', () => {
    setMenu(hamburger.getAttribute('aria-expanded') !== 'true');
  });
  // close the menu after tapping a link or pressing Escape
  navList.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
}

/* ───────── Fade-in on scroll ───────── */
const faders = document.querySelectorAll('.fade');
if ('IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(e=>e.isIntersecting && e.target.classList.add('in'));
  },{threshold:0.2});
  faders.forEach(el=>observer.observe(el));
}else{
  faders.forEach(el=>el.classList.add('in')); // fallback
}
