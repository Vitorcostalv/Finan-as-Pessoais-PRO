const parallax = (element) => {
  if (!element) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const handle = () => {
    const offset = window.scrollY * 0.3;
    element.style.transform = `translate3d(0, ${offset}px, 0)`;
  };

  window.addEventListener('scroll', handle, { passive: true });
  handle();
};

export default parallax;
