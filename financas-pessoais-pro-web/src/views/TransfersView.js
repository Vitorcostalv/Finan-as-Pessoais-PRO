import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Table from '../components/Table.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import confetti from '../effects/confetti.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';
import { accountsApi, transfersApi } from '../api/endpoints.js';
import store from '../state/store.js';

const TransfersView = () => {
  const sidebar = Sidebar();
  const navbar = Navbar();
  const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
  const layout = el('div', { class: 'app-layout', children: [sidebar, el('div', { class: 'app-content', children: [navbar, main] })] });

  const header = el('header', {
    class: 'view-header',
    children: [
      el('div', { children: [el('h1', { text: 'Transferências' }), el('p', { class: 'muted', text: 'Transfira entre contas e acompanhe o histórico.' })] }),
    ],
  });

  const form = el('form', {
    class: 'panel form-grid',
    children: [
      el('label', { text: 'Conta origem', children: [el('select', { id: 'transfer-from' })] }),
      el('label', { text: 'Conta destino', children: [el('select', { id: 'transfer-to' })] }),
      el('label', { text: 'Valor', children: [el('input', { type: 'number', step: '0.01', id: 'transfer-amount' })] }),
      el('label', { text: 'Descrição', children: [el('input', { type: 'text', id: 'transfer-description' })] }),
      el('label', { text: 'Data/Hora', children: [el('input', { type: 'datetime-local', id: 'transfer-date', value: new Date().toISOString().slice(0, 16) })] }),
      el('button', { class: 'btn primary', text: 'Transferir', attrs: { type: 'submit' } }),
    ],
  });

  const table = Table({
    columns: [
      { key: 'occurredAt', label: 'Data', render: (value) => formatDateTime(value), sortable: true },
      { key: 'fromAccount', label: 'Origem', sortable: true },
      { key: 'toAccount', label: 'Destino', sortable: true },
      { key: 'amount', label: 'Valor', sortable: true, render: (value) => formatCurrency(value) },
      { key: 'description', label: 'Descrição', sortable: true },
    ],
    perPage: 10,
  });

  main.append(header, form, table.element);

  const loadAccounts = async () => {
    const accounts = await accountsApi.list();
    const options = accounts.map((account) => `<option value="${account.id}">${account.name}</option>`).join('');
    form.querySelector('#transfer-from').innerHTML = options;
    form.querySelector('#transfer-to').innerHTML = options;
  };

  const loadTransfers = async () => {
    try {
      Loader.show();
      const transfers = await transfersApi.list();
      const formatted = transfers.map((transfer) => ({
        ...transfer,
        fromAccount: transfer.fromAccount?.name,
        toAccount: transfer.toAccount?.name,
      }));
      table.update(formatted);
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar transferências.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      fromAccountId: form.querySelector('#transfer-from').value,
      toAccountId: form.querySelector('#transfer-to').value,
      amount: Number(form.querySelector('#transfer-amount').value),
      description: form.querySelector('#transfer-description').value,
      occurredAt: (() => {
        const value = form.querySelector('#transfer-date').value;
        return value ? new Date(value).toISOString() : new Date().toISOString();
      })(),
    };

    if (payload.fromAccountId === payload.toAccountId) {
      Toast.show({ message: 'Escolha contas diferentes para transferir.', type: 'danger' });
      return;
    }

    try {
      Loader.show();
      await transfersApi.create(payload);
      Toast.show({ message: 'Transferência realizada!', type: 'success' });
      confetti();
      form.reset();
      form.querySelector('#transfer-date').value = new Date().toISOString().slice(0, 16);
      loadTransfers();
      store.set('dashboard:refresh', Date.now());
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao realizar transferência.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  });

  store.subscribe('ui:search', (term) => table.filter(term));

  return {
    render: async () => {
      await loadAccounts();
      await loadTransfers();
      return layout;
    },
  };
};

export default TransfersView;
