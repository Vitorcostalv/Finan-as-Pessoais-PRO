import { el } from '../utils/dom.js';

const Loader = {
  inject() {
    if (document.getElementById('global-loader')) return;
    const loader = el('div', {
      id: 'global-loader',
      class: 'loader-overlay hidden',
      attrs: { role: 'status', 'aria-live': 'polite' },
      children: [
        el('div', { class: 'loader-spinner', html: '<span class="sr-only">Carregando...</span>' }),
      ],
    });
    document.body.appendChild(loader);
  },
  show() {
    document.getElementById('global-loader')?.classList.remove('hidden');
  },
  hide() {
    document.getElementById('global-loader')?.classList.add('hidden');
  },
  skeleton(lines = 3) {
    const container = el('div', { class: 'skeleton shimmer' });
    for (let i = 0; i < lines; i += 1) {
      container.appendChild(el('div', { class: 'skeleton-line' }));
    }
    return container;
  },
};

export default Loader;
