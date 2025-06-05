// my-site/js/main.js
/* ───────── Hamburger toggle ───────── */
const hamburger = document.querySelector('.hamburger');
const navList   = document.querySelector('#primary-nav ul');

if (hamburger && navList){
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !expanded);
    navList.setAttribute('aria-expanded', !expanded);
  });
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
