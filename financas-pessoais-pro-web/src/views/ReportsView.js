import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Table from '../components/Table.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { getSummary, getCashflowDaily, getByCategory } from '../api/endpoints.js';
import store from '../state/store.js';

const ReportsView = () => {
  const sidebar = Sidebar();
  const navbar = Navbar();
  const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
  const layout = el('div', { class: 'app-layout', children: [sidebar, el('div', { class: 'app-content', children: [navbar, main] })] });

  const header = el('header', {
    class: 'view-header',
    children: [
      el('div', { children: [el('h1', { text: 'Relatórios' }), el('p', { class: 'muted', text: 'Resumo completo das suas movimentações.' })] }),
    ],
  });

  const dateControls = el('div', {
    class: 'panel controls',
    children: [
      el('label', { text: 'De', children: [el('input', { type: 'date', id: 'reports-from' })] }),
      el('label', { text: 'Até', children: [el('input', { type: 'date', id: 'reports-to' })] }),
      el('button', { class: 'btn primary', text: 'Atualizar', attrs: { type: 'button', id: 'reports-refresh' } }),
      el('button', { class: 'btn ghost', text: 'Exportar CSV', attrs: { type: 'button', id: 'reports-export' } }),
      el('button', { class: 'btn ghost', text: 'Copiar JSON', attrs: { type: 'button', id: 'reports-copy' } }),
    ],
  });

  const summaryCard = el('div', { class: 'report-summary panel' });
  const cashflowTable = Table({
    columns: [
      { key: 'date', label: 'Data', sortable: true, render: (value) => formatDate(value) },
      { key: 'in', label: 'Entradas', sortable: true, render: (value) => formatCurrency(value) },
      { key: 'out', label: 'Saídas', sortable: true, render: (value) => formatCurrency(value) },
      { key: 'balance', label: 'Saldo', sortable: true, render: (value) => formatCurrency(value) },
    ],
  });

  const categoriesTable = Table({
    columns: [
      { key: 'category', label: 'Categoria', sortable: true },
      { key: 'amount', label: 'Valor', sortable: true, render: (value) => formatCurrency(value) },
    ],
  });

  main.append(header, dateControls, summaryCard, el('section', { class: 'report-section', children: [el('h2', { text: 'Cashflow diário' }), cashflowTable.element] }), el('section', { class: 'report-section', children: [el('h2', { text: 'Por categoria' }), categoriesTable.element] }));

  const fromInput = dateControls.querySelector('#reports-from');
  const toInput = dateControls.querySelector('#reports-to');

  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const defaultTo = today.toISOString().slice(0, 10);
  fromInput.value = defaultFrom;
  toInput.value = defaultTo;

  let lastData = { summary: null, cashflow: [], categories: [] };

  const renderSummary = (summary) => {
    summaryCard.innerHTML = `
      <div class="summary-grid">
        <div><span>Total de entradas</span><strong>${formatCurrency(summary.totalIn)}</strong></div>
        <div><span>Total de saídas</span><strong>${formatCurrency(summary.totalOut)}</strong></div>
        <div><span>Saldo</span><strong>${formatCurrency(summary.balance)}</strong></div>
      </div>
    `;
  };

  const loadReports = async () => {
    try {
      Loader.show();
      const params = { from: fromInput.value, to: toInput.value };
      const [summary, cashflow, categories] = await Promise.all([
        getSummary(params),
        getCashflowDaily(params),
        getByCategory(params),
      ]);
      lastData = { summary, cashflow, categories };
      renderSummary(summary);
      cashflowTable.update(cashflow);
      categoriesTable.update(categories);
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar relatórios.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  const exportCSV = () => {
    const rows = [['Tipo', 'Categoria/Data', 'Valor']];
    lastData.categories.forEach((row) => rows.push(['Categoria', row.category, row.amount]));
    lastData.cashflow.forEach((row) => rows.push(['Cashflow', row.date, row.balance]));
    const csv = rows.map((row) => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorios.csv';
    link.click();
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(lastData, null, 2));
      Toast.show({ message: 'JSON copiado para a área de transferência.', type: 'success' });
    } catch (error) {
      Toast.show({ message: 'Não foi possível copiar.', type: 'danger' });
    }
  };

  dateControls.querySelector('#reports-refresh').addEventListener('click', loadReports);
  dateControls.querySelector('#reports-export').addEventListener('click', exportCSV);
  dateControls.querySelector('#reports-copy').addEventListener('click', copyJSON);
  store.subscribe('ui:search', (term) => {
    cashflowTable.filter(term);
    categoriesTable.filter(term);
  });

  return {
    render: async () => {
      await loadReports();
      return layout;
    },
  };
};

export default ReportsView;
