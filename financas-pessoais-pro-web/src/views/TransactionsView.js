import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Table from '../components/Table.js';
import Modal from '../components/Modal.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';
import { accountsApi, categoriesApi, transactionsApi } from '../api/endpoints.js';
import store from '../state/store.js';

const TransactionsView = () => {
  const sidebar = Sidebar();
  const navbar = Navbar();
  const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
  const layout = el('div', { class: 'app-layout', children: [sidebar, el('div', { class: 'app-content', children: [navbar, main] })] });

  const header = el('header', {
    class: 'view-header',
    children: [
      el('div', {
        children: [el('h1', { text: 'Transações' }), el('p', { class: 'muted', text: 'Controle completo de lançamentos.' })],
      }),
      el('button', { class: 'btn primary', text: 'Nova transação', attrs: { type: 'button' } }),
    ],
  });

  const filters = el('form', {
    class: 'filters',
    children: [
      el('label', { text: 'Período', children: [el('input', { type: 'date', id: 'filter-from' }), el('input', { type: 'date', id: 'filter-to' })] }),
      el('label', { text: 'Conta', children: [el('select', { id: 'filter-account', children: [el('option', { value: '', text: 'Todas' })] })] }),
      el('label', { text: 'Categoria', children: [el('select', { id: 'filter-category', children: [el('option', { value: '', text: 'Todas' })] })] }),
      el('label', { text: 'Tipo', children: [el('select', { id: 'filter-type', children: [el('option', { value: '', text: 'Ambos' }), el('option', { value: 'IN', text: 'Entrada' }), el('option', { value: 'OUT', text: 'Saída' })] })] }),
      el('label', { text: 'Buscar', children: [el('input', { type: 'search', id: 'filter-search', attrs: { placeholder: 'Descrição' } })] }),
      el('button', { class: 'btn ghost', text: 'Aplicar', attrs: { type: 'submit' } }),
    ],
  });

  const table = Table({
    columns: [
      { key: 'occurredAt', label: 'Data', sortable: true, render: (value) => formatDateTime(value) },
      { key: 'description', label: 'Descrição', sortable: true },
      { key: 'accountName', label: 'Conta', sortable: true },
      { key: 'categoryName', label: 'Categoria', sortable: true },
      { key: 'type', label: 'Tipo', sortable: true, render: (value) => (value === 'IN' ? '<span class="tag positive">Entrada</span>' : '<span class="tag negative">Saída</span>') },
      { key: 'amount', label: 'Valor', sortable: true, render: (value) => formatCurrency(value) },
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
    perPage: 15,
  });

  main.append(header, filters, table.element);

  const fromInput = filters.querySelector('#filter-from');
  const toInput = filters.querySelector('#filter-to');
  const now = new Date();
  fromInput.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  toInput.value = now.toISOString().slice(0, 10);

  let accounts = [];
  let categories = [];

  const loadFilters = async () => {
    const [accountsList, categoriesList] = await Promise.all([accountsApi.list(), categoriesApi.list()]);
    accounts = accountsList;
    categories = categoriesList;
    const accountSelect = filters.querySelector('#filter-account');
    const categorySelect = filters.querySelector('#filter-category');
    accountSelect.innerHTML = '<option value="">Todas</option>' + accounts.map((account) => `<option value="${account.id}">${account.name}</option>`).join('');
    categorySelect.innerHTML = '<option value="">Todas</option>' + categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join('');
  };

  const getFilterValues = () => ({
    from: filters.querySelector('#filter-from').value,
    to: filters.querySelector('#filter-to').value,
    accountId: filters.querySelector('#filter-account').value,
    categoryId: filters.querySelector('#filter-category').value,
    type: filters.querySelector('#filter-type').value,
    search: filters.querySelector('#filter-search').value,
  });

  const loadTransactions = async () => {
    try {
      Loader.show();
      const params = getFilterValues();
      const transactions = await transactionsApi.list(params);
      const formatted = transactions.map((transaction) => ({
        ...transaction,
        accountName: transaction.account?.name ?? '-',
        categoryName: transaction.category?.name ?? '-',
      }));
      table.update(formatted);
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar transações.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  const openForm = (transaction = null) => {
    const form = el('form', {
      class: 'form-grid',
      children: [
        el('label', {
          text: 'Conta',
          children: [
            el('select', {
              id: 'transaction-account',
              children: accounts.map((account) => el('option', { value: account.id, text: account.name })),
            }),
          ],
        }),
        el('label', {
          text: 'Categoria',
          children: [
            el('select', {
              id: 'transaction-category',
              children: categories.map((category) => el('option', { value: category.id, text: category.name })),
            }),
          ],
        }),
        el('label', {
          text: 'Tipo',
          children: [
            el('select', {
              id: 'transaction-type',
              children: [
                el('option', { value: 'IN', text: 'Entrada' }),
                el('option', { value: 'OUT', text: 'Saída' }),
              ],
            }),
          ],
        }),
        el('label', {
          text: 'Valor',
          children: [el('input', { type: 'number', step: '0.01', id: 'transaction-amount', value: transaction?.amount ?? 0 })],
        }),
        el('label', {
          text: 'Descrição',
          children: [el('input', { type: 'text', id: 'transaction-description', value: transaction?.description ?? '' })],
        }),
        el('label', {
          text: 'Data/Hora',
          children: [el('input', { type: 'datetime-local', id: 'transaction-date', value: transaction ? transaction.occurredAt.slice(0, 16) : new Date().toISOString().slice(0, 16) })],
        }),
      ],
    });

    const accountSelect = form.querySelector('#transaction-account');
    const categorySelect = form.querySelector('#transaction-category');
    const typeSelect = form.querySelector('#transaction-type');

    if (transaction) {
      accountSelect.value = transaction.account?.id;
      categorySelect.value = transaction.category?.id;
      typeSelect.value = transaction.type;
    }

    const modal = Modal({
      title: transaction ? 'Editar transação' : 'Nova transação',
      content: form,
      actions: [
        { label: 'Cancelar', class: 'ghost', onClick: ({ close }) => close() },
        {
          label: transaction ? 'Atualizar' : 'Criar',
          class: 'primary',
          onClick: async ({ close }) => {
            const payload = {
              accountId: accountSelect.value,
              categoryId: categorySelect.value,
              type: typeSelect.value,
              amount: Number(form.querySelector('#transaction-amount').value),
              description: form.querySelector('#transaction-description').value,
              occurredAt: (() => {
                const value = form.querySelector('#transaction-date').value;
                return value ? new Date(value).toISOString() : new Date().toISOString();
              })(),
            };
            try {
              Loader.show();
              if (transaction) {
                await transactionsApi.update(transaction.id, payload);
                Toast.show({ message: 'Transação atualizada.', type: 'success' });
              } else {
                await transactionsApi.create(payload);
                Toast.show({ message: 'Transação registrada!', type: 'success' });
                store.set('dashboard:refresh', Date.now());
              }
              close();
              loadTransactions();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao salvar transação.', type: 'danger' });
            } finally {
              Loader.hide();
            }
          },
        },
      ],
    });
    document.getElementById('modal-root').appendChild(modal.element);
  };

  const confirmDelete = (transaction) => {
    const modal = Modal({
      title: 'Excluir transação',
      content: el('p', { text: `Excluir "${transaction.description}"?` }),
      actions: [
        { label: 'Cancelar', class: 'ghost', onClick: ({ close }) => close() },
        {
          label: 'Excluir',
          class: 'danger',
          onClick: async ({ close }) => {
            try {
              Loader.show();
              await transactionsApi.remove(transaction.id);
              Toast.show({ message: 'Transação removida.', type: 'success' });
              close();
              loadTransactions();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao remover transação.', type: 'danger' });
            } finally {
              Loader.hide();
            }
          },
        },
      ],
    });
    document.getElementById('modal-root').appendChild(modal.element);
  };

  filters.addEventListener('submit', (event) => {
    event.preventDefault();
    loadTransactions();
  });

  header.querySelector('button').addEventListener('click', () => openForm());

  store.subscribe('ui:search', (term) => table.filter(term));

  return {
    render: async () => {
      await loadFilters();
      await loadTransactions();
      return layout;
    },
  };
};

export default TransactionsView;
