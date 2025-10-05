import router from './router.js';
import auth from './state/auth.js';
import store from './state/store.js';
import Toast from './components/Toast.js';
import Loader from './components/Loader.js';
import { qs } from './utils/dom.js';

const THEME_KEY = 'fp:theme';

const applyTheme = (theme) => {
  const html = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
  html.setAttribute('data-theme', resolved);
  localStorage.setItem(THEME_KEY, theme);
  store.set('ui:theme', resolved);
};

const initTheme = () => {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
};

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/src/sw.js');
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            Toast.show({ message: 'Atualização disponível! Recarregue para ver as novidades.', type: 'info', duration: 6000 });
          }
        });
      });
    } catch (error) {
      console.warn('Service Worker não registrado', error);
    }
  }
};

const registerKeyboardShortcuts = () => {
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      const modal = qs('.modal.is-open');
      modal?.dispatchEvent(new CustomEvent('modal:close'));
    }
    if (event.key === '/' && !event.target.matches('input, textarea')) {
      event.preventDefault();
      const search = qs('[data-global-search] input');
      search?.focus();
    }
    if (event.key === 'd' && event.ctrlKey) {
      event.preventDefault();
      applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
  });

  let sequence = [];
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    sequence.push(event.key.toLowerCase());
    if (sequence.slice(-2).join('+') === 'g+d') {
      router.go('#/dashboard');
      sequence = [];
    }
    if (sequence.length > 2) {
      sequence.shift();
    }
  });
};

const initAuthState = () => {
  const token = auth.getToken();
  store.set('auth:token', token);
  const user = auth.getUser();
  if (user) {
    store.set('auth:user', user);
  }
};

const initLoaders = () => {
  store.subscribe('ui:loading', (isLoading) => {
    const app = qs('#app');
    if (!app) return;
    if (isLoading) {
      app.classList.add('is-loading');
    } else {
      app.classList.remove('is-loading');
    }
  });
};

const boot = () => {
  initTheme();
  initAuthState();
  initLoaders();
  registerServiceWorker();
  registerKeyboardShortcuts();
  Loader.inject();
  Toast.init();
  router.init();
};

document.addEventListener('DOMContentLoaded', boot);
