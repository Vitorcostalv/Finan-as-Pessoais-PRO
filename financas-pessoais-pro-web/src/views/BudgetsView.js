import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Table from '../components/Table.js';
import Modal from '../components/Modal.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import confetti from '../effects/confetti.js';
import { formatCurrency } from '../utils/format.js';
import { categoriesApi, budgetsApi } from '../api/endpoints.js';
import store from '../state/store.js';

const BudgetsView = () => {
  const sidebar = Sidebar();
  const navbar = Navbar();
  const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
  const layout = el('div', { class: 'app-layout', children: [sidebar, el('div', { class: 'app-content', children: [navbar, main] })] });

  const header = el('header', {
    class: 'view-header',
    children: [
      el('div', { children: [el('h1', { text: 'Metas e Orçamentos' }), el('p', { class: 'muted', text: 'Defina limites por categoria e acompanhe o progresso.' })] }),
      el('button', { class: 'btn primary', text: 'Nova meta', attrs: { type: 'button' } }),
    ],
  });

  const monthInput = el('input', { type: 'month', value: new Date().toISOString().slice(0, 7) });
  const controls = el('div', { class: 'panel controls', children: [el('label', { text: 'Mês', children: [monthInput] })] });

  const table = Table({
    columns: [
      { key: 'categoryName', label: 'Categoria', sortable: true },
      { key: 'amount', label: 'Meta', sortable: true, render: (value) => formatCurrency(value) },
      { key: 'spent', label: 'Gasto', sortable: true, render: (value) => formatCurrency(value) },
      {
        key: 'progress',
        label: 'Progresso',
        render: (value, item) => {
          const percent = Math.min(150, Math.round((item.spent / item.amount) * 100 || 0));
          const bar = el('div', { class: 'progress-bar' });
          bar.style.setProperty('--progress', `${percent}`);
          bar.title = `${percent}%`;
          return bar;
        },
      },
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
          remove.addEventListener('click', async (event) => {
            event.stopPropagation();
            try {
              Loader.show();
              await budgetsApi.remove(item.id);
              Toast.show({ message: 'Meta removida.', type: 'success' });
              loadBudgets();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao remover meta.', type: 'danger' });
            } finally {
              Loader.hide();
            }
          });
          wrapper.append(edit, remove);
          return wrapper;
        },
      },
    ],
  });

  main.append(header, controls, table.element);

  let categories = [];

  const loadCategories = async () => {
    categories = await categoriesApi.list();
  };

  const loadBudgets = async () => {
    try {
      Loader.show();
      const month = `${monthInput.value}-01`;
      const budgets = await budgetsApi.list({ month });
      const formatted = budgets.map((budget) => ({
        ...budget,
        categoryName: budget.category?.name ?? '-',
        categoryId: budget.category?.id,
        spent: budget.spent ?? 0,
        amount: budget.amount ?? 0,
      }));
      table.update(formatted);
      formatted.forEach((budget) => {
        const percent = (budget.spent / (budget.amount || 1)) * 100;
        if (percent >= 100) {
          Toast.show({ message: `${budget.categoryName} atingiu ou ultrapassou a meta!`, type: 'warning' });
          confetti();
        }
      });
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar metas.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  const openForm = (budget = null) => {
    const form = el('form', {
      class: 'form-grid',
      children: [
        el('label', { text: 'Categoria', children: [el('select', { id: 'budget-category', children: categories.map((category) => el('option', { value: category.id, text: category.name })) })] }),
        el('label', { text: 'Mês', children: [el('input', { type: 'month', id: 'budget-month', value: budget ? budget.month?.slice(0, 7) : monthInput.value })] }),
        el('label', { text: 'Valor', children: [el('input', { type: 'number', step: '0.01', id: 'budget-amount', value: budget?.amount ?? 0 })] }),
      ],
    });

    const categorySelect = form.querySelector('#budget-category');
    if (budget) {
      categorySelect.value = budget.categoryId;
    }

    const modal = Modal({
      title: budget ? 'Editar meta' : 'Nova meta',
      content: form,
      actions: [
        { label: 'Cancelar', class: 'ghost', onClick: ({ close }) => close() },
        {
          label: budget ? 'Atualizar' : 'Criar',
          class: 'primary',
          onClick: async ({ close }) => {
            const payload = {
              categoryId: categorySelect.value,
              month: `${form.querySelector('#budget-month').value}-01`,
              amount: Number(form.querySelector('#budget-amount').value),
            };
            try {
              Loader.show();
              if (budget) {
                await budgetsApi.update(budget.id, payload);
                Toast.show({ message: 'Meta atualizada.', type: 'success' });
              } else {
                await budgetsApi.create(payload);
                Toast.show({ message: 'Meta criada.', type: 'success' });
              }
              close();
              loadBudgets();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao salvar meta.', type: 'danger' });
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
  monthInput.addEventListener('change', loadBudgets);
  store.subscribe('ui:search', (term) => table.filter(term));

  return {
    render: async () => {
      await loadCategories();
      await loadBudgets();
      return layout;
    },
  };
};

export default BudgetsView;
