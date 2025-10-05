import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Card from '../components/Card.js';
import DateRange from '../components/DateRange.js';
import Chart from '../components/Chart.js';
import Loader from '../components/Loader.js';
import Toast from '../components/Toast.js';
import parallax from '../effects/parallax.js';
import { formatCurrency } from '../utils/format.js';
import { getSummary, getCashflowDaily, getByCategory } from '../api/endpoints.js';
import store from '../state/store.js';

const DashboardView = () => {
  const createLayout = () => {
    const sidebar = Sidebar();
    const navbar = Navbar();
    const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
    const contentWrapper = el('div', { class: 'app-content', children: [navbar, main] });
    const layout = el('div', { class: 'app-layout dashboard', children: [sidebar, contentWrapper] });
    return { layout, main };
  };

  const { layout, main } = createLayout();

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const header = el('section', {
    class: 'dashboard-hero',
    children: [
      el('div', {
        class: 'hero-bg',
      }),
      el('div', {
        class: 'hero-content',
        children: [
          el('h1', { text: 'Olá! Vamos dominar suas finanças.' }),
          el('p', { text: 'Visualize seus KPIs, cashflow diário e despesas por categoria.' }),
        ],
      }),
    ],
  });

  let currentRange = { from, to };
  const rangePicker = DateRange({
    from,
    to,
    onChange: ({ from: f, to: t }) => {
      currentRange = { from: f, to: t };
      loadData(f, t);
    },
  });

  const summaryContainer = el('div', { class: 'dashboard-cards' });
  const chartsContainer = el('div', { class: 'dashboard-charts' });

  const cashflowChart = Chart({ type: 'line' });
  const categoryChart = Chart({ type: 'bar' });

  chartsContainer.append(
    Card({
      title: 'Cashflow diário',
      subtitle: 'Entradas x Saídas',
      content: cashflowChart.element,
    }),
    Card({
      title: 'Gastos por categoria',
      subtitle: 'Último período selecionado',
      content: categoryChart.element,
    })
  );

  main.append(header, el('section', { class: 'panel', children: [rangePicker.element, summaryContainer] }), chartsContainer);

  const renderSummary = (summary) => {
    summaryContainer.innerHTML = '';
    const cards = [
      { title: 'Total recebido', value: summary.totalIn, accent: 'positive' },
      { title: 'Total gasto', value: summary.totalOut, accent: 'negative' },
      { title: 'Saldo atual', value: summary.balance, accent: 'neutral' },
    ];
    cards.forEach((card) => {
      summaryContainer.append(
        Card({
          title: card.title,
          subtitle: 'Período selecionado',
          content: el('p', { class: `kpi ${card.accent}`, text: formatCurrency(card.value) }),
        })
      );
    });
  };

  const loadData = async (fromDate, toDate) => {
    try {
      Loader.show();
      const [summary, cashflow, byCategory] = await Promise.all([
        getSummary({ from: fromDate, to: toDate }),
        getCashflowDaily({ from: fromDate, to: toDate }),
        getByCategory({ from: fromDate, to: toDate }),
      ]);
      renderSummary(summary);

      cashflowChart.update({
        type: 'line',
        data: {
          labels: cashflow.map((item) => item.date),
          datasets: [
            {
              data: cashflow.map((item) => item.balance),
              borderColor: '#7c3aed',
            },
          ],
        },
      });

      categoryChart.update({
        type: 'bar',
        data: {
          labels: byCategory.map((item) => item.category),
          datasets: [
            {
              data: byCategory.map((item) => Math.abs(item.amount)),
              backgroundColor: byCategory.map((item) => item.color || '#7c3aed'),
            },
          ],
        },
      });
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar dashboard.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  parallax(header.querySelector('.hero-bg'));

  const unsubscribe = store.subscribe('dashboard:refresh', () => {
    loadData(currentRange.from, currentRange.to);
  });

  const destroy = () => {
    store.set('ui:search', '');
    unsubscribe();
  };

  return {
    render: async () => {
      currentRange = { from, to };
      await loadData(from, to);
      return layout;
    },
    destroy,
  };
};

export default DashboardView;
