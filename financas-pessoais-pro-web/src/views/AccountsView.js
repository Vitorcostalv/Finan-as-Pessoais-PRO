import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Table from '../components/Table.js';
import Modal from '../components/Modal.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import { formatCurrency } from '../utils/format.js';
import { accountsApi } from '../api/endpoints.js';
import store from '../state/store.js';

const AccountsView = () => {
  const createLayout = () => {
    const sidebar = Sidebar();
    const navbar = Navbar();
    const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
    const contentWrapper = el('div', { class: 'app-content', children: [navbar, main] });
    const layout = el('div', { class: 'app-layout', children: [sidebar, contentWrapper] });
    return { layout, main };
  };

  const { layout, main } = createLayout();

  const header = el('header', {
    class: 'view-header',
    children: [
      el('div', {
        children: [
          el('h1', { text: 'Contas' }),
          el('p', { class: 'muted', text: 'Gerencie suas contas bancárias e carteiras.' }),
        ],
      }),
      el('button', { class: 'btn primary', text: 'Nova conta', attrs: { type: 'button' } }),
    ],
  });

  const table = Table({
    columns: [
      { key: 'name', label: 'Nome', sortable: true },
      { key: 'balance', label: 'Saldo', sortable: true, render: (value) => formatCurrency(value) },
      {
        key: 'actions',
        label: 'Ações',
        render: (_, item) => {
          const wrapper = el('div', { class: 'table-actions' });
          const edit = el('button', { class: 'btn ghost', text: 'Editar', attrs: { type: 'button' } });
          const remove = el('button', { class: 'btn ghost danger', text: 'Excluir', attrs: { type: 'button' } });
          edit.addEventListener('click', (event) => {
            event.stopPropagation();
            openForm(item);
          });
          remove.addEventListener('click', (event) => {
            event.stopPropagation();
            confirmDelete(item);
          });
          wrapper.append(edit, remove);
          return wrapper;
        },
      },
    ],
    data: [],
  });

  main.append(header, table.element);

  const loadAccounts = async () => {
    try {
      Loader.show();
      const accounts = await accountsApi.list();
      table.update(accounts);
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar contas.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  const openForm = (account = null) => {
    const nameInput = el('input', {
      type: 'text',
      value: account?.name ?? '',
      attrs: { placeholder: 'Nome da conta', required: 'true' },
    });
    const balanceInput = el('input', {
      type: 'number',
      value: account?.balance ?? 0,
      attrs: { placeholder: 'Saldo inicial', step: '0.01' },
    });
    const formContent = el('div', {
      class: 'form-grid',
      children: [
        el('label', { text: 'Nome', children: [nameInput] }),
        el('label', { text: 'Saldo inicial', children: [balanceInput] }),
      ],
    });

    const modal = Modal({
      title: account ? 'Editar conta' : 'Nova conta',
      content: formContent,
      actions: [
        {
          label: 'Cancelar',
          class: 'ghost',
          onClick: ({ close }) => close(),
        },
        {
          label: account ? 'Atualizar' : 'Criar',
          class: 'primary',
          onClick: async ({ close }) => {
            if (!nameInput.value.trim()) {
              Toast.show({ message: 'Informe o nome da conta.', type: 'danger' });
              return;
            }
            try {
              Loader.show();
              if (account) {
                await accountsApi.update(account.id, { name: nameInput.value, balance: Number(balanceInput.value) });
                Toast.show({ message: 'Conta atualizada!', type: 'success' });
              } else {
                await accountsApi.create({ name: nameInput.value, balance: Number(balanceInput.value) });
                Toast.show({ message: 'Conta criada com sucesso!', type: 'success' });
              }
              close();
              loadAccounts();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao salvar conta.', type: 'danger' });
            } finally {
              Loader.hide();
            }
          },
        },
      ],
    });

    document.getElementById('modal-root').appendChild(modal.element);
  };

  const confirmDelete = (account) => {
    const content = el('p', { text: `Deseja realmente excluir a conta ${account.name}?` });
    const modal = Modal({
      title: 'Excluir conta',
      content,
      actions: [
        { label: 'Cancelar', class: 'ghost', onClick: ({ close }) => close() },
        {
          label: 'Excluir',
          class: 'danger',
          onClick: async ({ close }) => {
            try {
              Loader.show();
              await accountsApi.remove(account.id);
              Toast.show({ message: 'Conta removida!', type: 'success' });
              close();
              loadAccounts();
            } catch (error) {
              Toast.show({
                message: error.status === 409 ? 'Conta vinculada a transações. Ajuste antes de excluir.' : (error.message || 'Erro ao remover conta.'),
                type: 'danger',
              });
            } finally {
              Loader.hide();
            }
          },
        },
      ],
    });
    document.getElementById('modal-root').appendChild(modal.element);
  };

  header.querySelector('button').addEventListener('click', () => openForm());

  store.subscribe('ui:search', (term) => table.filter(term));

  return {
    render: async () => {
      await loadAccounts();
      return layout;
    },
  };
};

export default AccountsView;
