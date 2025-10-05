import { el, qs } from '../utils/dom.js';

const Toast = {
  container: null,
  queue: [],
  init() {
    this.container = qs('#toast-root');
    if (!this.container) {
      this.container = el('div', { id: 'toast-root', class: 'toast-root' });
      document.body.appendChild(this.container);
    }
  },
  show({ message, type = 'success', duration = 4000 }) {
    if (!this.container) this.init();
    const toast = el('div', {
      class: `toast toast-${type}`,
      attrs: { role: 'status' },
      children: [
        el('p', { text: message }),
        el('button', {
          class: 'toast-close',
          attrs: { 'aria-label': 'Fechar notificação' },
          html: '&times;',
        }),
      ],
    });

    const remove = () => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 250);
    };

    toast.querySelector('.toast-close').addEventListener('click', remove);
    this.container.appendChild(toast);

    if (duration) {
      setTimeout(remove, duration);
    }
  },
};

export default Toast;
