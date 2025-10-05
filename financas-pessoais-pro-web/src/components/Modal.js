import { el, focusTrap } from '../utils/dom.js';

const Modal = ({ title, content, actions = [] }) => {
  const overlay = el('div', {
    class: 'modal-overlay',
    attrs: { role: 'presentation' },
  });

  const modal = el('div', {
    class: 'modal',
    attrs: {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'modal-title',
    },
    children: [
      el('header', {
        class: 'modal-header',
        children: [
          el('h2', { id: 'modal-title', text: title }),
          el('button', {
            class: 'modal-close',
            attrs: { 'aria-label': 'Fechar', type: 'button' },
            html: '&times;',
          }),
        ],
      }),
      el('div', { class: 'modal-content', children: [content] }),
      el('footer', {
        class: 'modal-footer',
        children: actions.map((action) => {
          const btn = el('button', {
            class: `btn ${action.class || ''}`,
            text: action.label,
            attrs: { type: action.type || 'button' },
          });
          btn.addEventListener('click', () => action.onClick?.({ close }));
          return btn;
        }),
      }),
    ],
  });

  overlay.appendChild(modal);

  const trap = focusTrap(modal);

  const close = () => {
    trap();
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 200);
  };

  const onKey = (event) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  modal.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('modal:close', close);
  document.addEventListener('keydown', onKey, { once: true });

  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
    modal.classList.add('is-open');
  });

  return {
    element: overlay,
    close,
  };
};

export default Modal;
