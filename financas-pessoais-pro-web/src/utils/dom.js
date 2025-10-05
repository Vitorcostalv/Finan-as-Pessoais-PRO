// Helpers de DOM para facilitar criação e manipulação de elementos
export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export const el = (tag, options = {}) => {
  const element = document.createElement(tag);
  Object.entries(options).forEach(([key, value]) => {
    if (key === 'class') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.assign(element.dataset, value);
    } else if (key === 'text') {
      element.textContent = value;
    } else if (key === 'html') {
      element.innerHTML = value;
    } else if (key === 'attrs') {
      Object.entries(value).forEach(([attr, val]) => {
        element.setAttribute(attr, val);
      });
    } else if (key === 'children' && Array.isArray(value)) {
      value.forEach((child) => child && element.appendChild(child));
    } else if (key in element) {
      element[key] = value;
    }
  });
  return element;
};

export const fragment = (nodes = []) => {
  const frag = document.createDocumentFragment();
  nodes.forEach((node) => node && frag.appendChild(node));
  return frag;
};

export const mount = (target, node) => {
  if (typeof target === 'string') {
    const found = qs(target);
    if (!found) return null;
    found.appendChild(node);
    return node;
  }
  target.appendChild(node);
  return node;
};

export const unmount = (node) => {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
};

export const delegate = (element, selector, eventName, handler) => {
  element.addEventListener(eventName, (event) => {
    const potentialTargets = qsa(selector, element);
    const target = event.target.closest(selector);
    if (potentialTargets.includes(target)) {
      handler.call(target, event, target);
    }
  });
};

export const escapeHTML = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

export const focusTrap = (container) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  const getFocusable = () => qsa(focusableSelectors.join(','), container);

  const handleKeyDown = (event) => {
    if (event.key !== 'Tab') return;
    const focusables = getFocusable();
    if (!focusables.length) return;
    const [first, last] = [focusables[0], focusables[focusables.length - 1]];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
};
