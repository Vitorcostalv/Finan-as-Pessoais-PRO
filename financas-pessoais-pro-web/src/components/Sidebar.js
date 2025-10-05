import router from '../router.js';
import store from '../state/store.js';
import { el } from '../utils/dom.js';

const links = [
  { hash: '#/dashboard', label: 'Dashboard', icon: '📊' },
  { hash: '#/accounts', label: 'Contas', icon: '🏦' },
  { hash: '#/categories', label: 'Categorias', icon: '🗂️' },
  { hash: '#/transactions', label: 'Transações', icon: '💳' },
  { hash: '#/transfers', label: 'Transferências', icon: '🔁' },
  { hash: '#/recurrings', label: 'Recorrências', icon: '⏰' },
  { hash: '#/budgets', label: 'Metas', icon: '🎯' },
  { hash: '#/reports', label: 'Relatórios', icon: '📈' },
  { hash: '#/settings', label: 'Configurações', icon: '⚙️' },
];

const Sidebar = () => {
  const nav = el('nav', {
    class: 'app-sidebar glass',
    attrs: { 'aria-label': 'Navegação principal' },
  });

  const toggleButton = el('button', {
    class: 'sidebar-toggle',
    text: '⇔',
    attrs: { 'aria-label': 'Alternar tamanho do menu' },
  });

  const list = el('ul', {
    class: 'sidebar-links',
    children: links.map((link) => {
      const item = el('li', {
        children: [
          el('a', {
            href: link.hash,
            class: 'sidebar-link',
            attrs: { 'data-hash': link.hash },
            html: `<span class="icon">${link.icon}</span><span class="label">${link.label}</span>`,
          }),
        ],
      });
      item.querySelector('a').addEventListener('click', (event) => {
        event.preventDefault();
        router.go(link.hash);
      });
      return item;
    }),
  });

  nav.append(toggleButton, list);

  toggleButton.addEventListener('click', () => {
    nav.classList.toggle('collapsed');
    store.set('ui:sidebar', nav.classList.contains('collapsed'));
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-toggle-sidebar]')) {
      nav.classList.toggle('collapsed');
    }
  });

  store.subscribe('app:route', (hash) => {
    list.querySelectorAll('a').forEach((a) => {
      a.classList.toggle('active', a.dataset.hash === hash);
    });
  });

  return nav;
};

export default Sidebar;
