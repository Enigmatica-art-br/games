const header = document.querySelector('[data-header]');
const heroImage = document.querySelector('.hero-image');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (!reduceMotion) {
  window.addEventListener('scroll', () => {
    if (window.scrollY < window.innerHeight * 1.15) {
      heroImage.style.transform = `translateY(${window.scrollY * 0.12}px) scale(1.02)`;
    }
  }, { passive: true });
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
  observer.observe(element);
});

document.querySelector('#year').textContent = new Date().getFullYear();
