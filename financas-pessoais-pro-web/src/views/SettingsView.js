import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Toast from '../components/Toast.js';
import auth from '../state/auth.js';
import router from '../router.js';
import store from '../state/store.js';
import CONFIG from '../config.js';

const SettingsView = () => {
  const sidebar = Sidebar();
  const navbar = Navbar();
  const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
  const layout = el('div', { class: 'app-layout', children: [sidebar, el('div', { class: 'app-content', children: [navbar, main] })] });

  const user = auth.getUser();

  const profileSection = el('section', {
    class: 'panel',
    children: [
      el('h2', { text: 'Perfil' }),
      el('dl', {
        class: 'profile-grid',
        html: `
          <div><dt>Nome</dt><dd>${user?.name ?? '-'}</dd></div>
          <div><dt>E-mail</dt><dd>${user?.email ?? '-'}</dd></div>
        `,
      }),
    ],
  });

  const themeSelect = el('select', {
    children: [
      el('option', { value: 'light', text: 'Claro' }),
      el('option', { value: 'dark', text: 'Escuro' }),
      el('option', { value: 'system', text: 'Sistema' }),
    ],
  });
  themeSelect.value = localStorage.getItem('fp:theme') || 'dark';

  const themeSection = el('section', {
    class: 'panel',
    children: [
      el('h2', { text: 'Tema' }),
      el('p', { class: 'muted', text: 'Escolha o modo de cor preferido.' }),
      el('label', { text: 'Tema', children: [themeSelect] }),
    ],
  });

  const apiInput = el('input', { type: 'url', value: CONFIG.API_BASE_URL, attrs: { placeholder: 'https://sua.api/endpoint' } });
  const apiSection = el('section', {
    class: 'panel',
    children: [
      el('h2', { text: 'API' }),
      el('p', { class: 'muted', text: 'Atualize a URL base da API caso utilize outro ambiente.' }),
      el('label', { text: 'API_BASE_URL', children: [apiInput] }),
      el('button', { class: 'btn primary', text: 'Salvar API', attrs: { type: 'button' } }),
    ],
  });

  const logoutButton = el('button', { class: 'btn danger', text: 'Sair da conta', attrs: { type: 'button' } });

  const actionsSection = el('section', {
    class: 'panel',
    children: [el('h2', { text: 'Sessão' }), logoutButton],
  });

  main.append(el('header', { class: 'view-header', children: [el('h1', { text: 'Configurações' }), el('p', { class: 'muted', text: 'Preferências pessoais e do app.' })] }), profileSection, themeSection, apiSection, actionsSection);

  themeSelect.addEventListener('change', () => {
    const value = themeSelect.value;
    localStorage.setItem('fp:theme', value);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = value === 'system' ? (prefersDark ? 'dark' : 'light') : value;
    document.documentElement.setAttribute('data-theme', resolved);
    store.set('ui:theme', resolved);
    Toast.show({ message: 'Tema atualizado.', type: 'success' });
  });

  apiSection.querySelector('button').addEventListener('click', () => {
    const value = apiInput.value.trim();
    if (!value) {
      Toast.show({ message: 'Informe uma URL válida.', type: 'danger' });
      return;
    }
    localStorage.setItem('fp:api_url', value);
    Toast.show({ message: 'URL da API salva! O app será recarregado.', type: 'success' });
    setTimeout(() => window.location.reload(), 800);
  });

  logoutButton.addEventListener('click', () => {
    auth.logout();
    Toast.show({ message: 'Até breve!', type: 'info' });
    router.go('#/login');
  });

  return {
    render: async () => layout,
  };
};

export default SettingsView;
