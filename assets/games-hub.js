const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

if (!reduceMotion) {
  window.addEventListener('pointermove', (event) => {
    root.style.setProperty('--pointer-x', `${event.clientX}px`);
    root.style.setProperty('--pointer-y', `${event.clientY}px`);
  }, { passive: true });
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.setProperty('--delay', `${Math.min(index % 4, 3) * 70}ms`);
  observer.observe(element);
});

document.querySelector('#year').textContent = new Date().getFullYear();
