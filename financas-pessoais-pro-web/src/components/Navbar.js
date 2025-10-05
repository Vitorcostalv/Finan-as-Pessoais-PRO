import auth from '../state/auth.js';
import store from '../state/store.js';
import Toast from './Toast.js';
import router from '../router.js';
import { el } from '../utils/dom.js';

const Navbar = () => {
  const user = auth.getUser();

  const searchInput = el('input', {
    type: 'search',
    placeholder: 'Buscar... (/)',
    attrs: { 'aria-label': 'Buscar', autocomplete: 'off' },
  });

  const themeToggle = el('button', {
    class: 'btn-icon',
    attrs: { 'aria-label': 'Alternar tema' },
  });

  const profileButton = el('button', {
    class: 'avatar-button',
    attrs: { 'aria-haspopup': 'menu', 'aria-expanded': 'false' },
    children: [
      el('span', { class: 'avatar', text: user?.name?.[0] ?? '?' }),
    ],
  });

  const menu = el('div', {
    class: 'dropdown-menu',
    attrs: { role: 'menu' },
    children: [
      el('button', { class: 'dropdown-item', text: 'Perfil', attrs: { role: 'menuitem' } }),
      el('button', { class: 'dropdown-item', text: 'Tema', attrs: { role: 'menuitem' } }),
      el('button', { class: 'dropdown-item danger', text: 'Sair', attrs: { role: 'menuitem' } }),
    ],
  });

  const container = el('header', {
    class: 'app-navbar glass',
    children: [
      el('div', {
        class: 'navbar-left',
        children: [
          el('button', {
            class: 'btn-icon',
            attrs: { 'aria-label': 'Alternar menu lateral', 'data-toggle-sidebar': 'true' },
            html: '<span class="icon-menu"></span>',
          }),
          el('div', {
            class: 'search-field',
            attrs: { 'data-global-search': 'true' },
            children: [
              el('label', { class: 'sr-only', attrs: { for: 'global-search' }, text: 'Buscar' }),
              Object.assign(searchInput, { id: 'global-search' }),
            ],
          }),
        ],
      }),
      el('div', {
        class: 'navbar-right',
        children: [
          themeToggle,
          el('div', { class: 'profile-menu', children: [profileButton, menu] }),
        ],
      }),
    ],
  });

  const toggleMenu = () => {
    const expanded = profileButton.getAttribute('aria-expanded') === 'true';
    profileButton.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open', !expanded);
  };

  profileButton.addEventListener('click', toggleMenu);
  profileButton.addEventListener('blur', () => setTimeout(() => menu.classList.remove('open'), 200));

  menu.children[0].addEventListener('click', () => router.go('#/settings'));
  menu.children[1].addEventListener('click', () => {
    const current = localStorage.getItem('fp:theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('fp:theme', next);
    document.documentElement.setAttribute('data-theme', next);
    store.set('ui:theme', next);
    Toast.show({ message: `Tema ${next === 'dark' ? 'escuro' : 'claro'} ativado`, type: 'info' });
  });
  menu.children[2].addEventListener('click', () => {
    auth.logout();
    Toast.show({ message: 'Sessão encerrada com sucesso.', type: 'info' });
    router.go('#/login');
  });

  searchInput.addEventListener('input', (event) => {
    store.set('ui:search', event.target.value);
  });

  store.subscribe('ui:theme', (theme) => {
    themeToggle.innerHTML = theme === 'dark' ? '<span aria-hidden="true">🌙</span>' : '<span aria-hidden="true">☀️</span>';
  });
  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  themeToggle.innerHTML = initialTheme === 'dark' ? '<span aria-hidden="true">🌙</span>' : '<span aria-hidden="true">☀️</span>';

  themeToggle.addEventListener('click', () => {
    const current = localStorage.getItem('fp:theme') || 'dark';
    const next = current === 'dark' ? 'light' : current === 'light' ? 'system' : 'dark';
    localStorage.setItem('fp:theme', next);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = next === 'system' ? (prefersDark ? 'dark' : 'light') : next;
    document.documentElement.setAttribute('data-theme', resolved);
    store.set('ui:theme', resolved);
    Toast.show({ message: `Tema ${resolved} ativado`, type: 'success' });
  });

  return container;
};

export default Navbar;
