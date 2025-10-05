import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Table from '../components/Table.js';
import Modal from '../components/Modal.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import { accountsApi, categoriesApi, recurringsApi } from '../api/endpoints.js';
import store from '../state/store.js';

const RecurringsView = () => {
  const sidebar = Sidebar();
  const navbar = Navbar();
  const main = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
  const layout = el('div', { class: 'app-layout', children: [sidebar, el('div', { class: 'app-content', children: [navbar, main] })] });

  const header = el('header', {
    class: 'view-header',
    children: [
      el('div', { children: [el('h1', { text: 'Recorrências' }), el('p', { class: 'muted', text: 'Automatize lançamentos periódicos.' })] }),
      el('button', { class: 'btn primary', text: 'Nova regra', attrs: { type: 'button' } }),
    ],
  });

  const table = Table({
    columns: [
      { key: 'descriptionTemplate', label: 'Descrição', sortable: true },
      { key: 'account', label: 'Conta', sortable: true },
      { key: 'category', label: 'Categoria', sortable: true },
      { key: 'baseAmount', label: 'Valor', sortable: true, render: (value) => formatCurrency(value) },
      { key: 'frequency', label: 'Frequência', sortable: true },
      { key: 'nextRun', label: 'Próxima execução', sortable: true, render: (value) => formatDate(value) },
      { key: 'active', label: 'Status', sortable: true, render: (value) => (value ? '<span class="tag positive">Ativa</span>' : '<span class="tag warning">Pausada</span>') },
      {
        key: 'actions',
        label: 'Ações',
        render: (_, item) => {
          const wrapper = el('div', { class: 'table-actions' });
          const edit = el('button', { class: 'btn ghost', text: 'Editar', attrs: { type: 'button' } });
          const toggle = el('button', { class: 'btn ghost', text: item.active ? 'Pausar' : 'Retomar', attrs: { type: 'button' } });
          const remove = el('button', { class: 'btn ghost danger', text: 'Excluir', attrs: { type: 'button' } });
          edit.addEventListener('click', (event) => {
            event.stopPropagation();
            openForm(item);
          });
          toggle.addEventListener('click', async (event) => {
            event.stopPropagation();
            try {
              Loader.show();
              await recurringsApi.update(item.id, { active: !item.active });
              Toast.show({ message: item.active ? 'Recorrência pausada.' : 'Recorrência retomada.', type: 'success' });
              loadRecurrings();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao atualizar regra.', type: 'danger' });
            } finally {
              Loader.hide();
            }
          });
          remove.addEventListener('click', async (event) => {
            event.stopPropagation();
            try {
              Loader.show();
              await recurringsApi.remove(item.id);
              Toast.show({ message: 'Regra excluída.', type: 'success' });
              loadRecurrings();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao excluir regra.', type: 'danger' });
            } finally {
              Loader.hide();
            }
          });
          wrapper.append(edit, toggle, remove);
          return wrapper;
        },
      },
    ],
  });

  main.append(header, table.element);

  let accounts = [];
  let categories = [];

  const loadDependencies = async () => {
    const [accountsList, categoriesList] = await Promise.all([accountsApi.list(), categoriesApi.list()]);
    accounts = accountsList;
    categories = categoriesList;
  };

  const loadRecurrings = async () => {
    try {
      Loader.show();
      const recurrings = await recurringsApi.list();
      const mapped = recurrings.map((rule) => ({
        ...rule,
        account: rule.account?.name ?? '-',
        category: rule.category?.name ?? '-',
      }));
      table.update(mapped);
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar recorrências.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  const openForm = (rule = null) => {
    const form = el('form', {
      class: 'form-grid',
      children: [
        el('label', { text: 'Conta', children: [el('select', { id: 'recurring-account', children: accounts.map((account) => el('option', { value: account.id, text: account.name })) })] }),
        el('label', { text: 'Categoria', children: [el('select', { id: 'recurring-category', children: [el('option', { value: '', text: 'Nenhuma' }), ...categories.map((category) => el('option', { value: category.id, text: category.name }))] })] }),
        el('label', { text: 'Tipo base', children: [el('select', { id: 'recurring-base-type', children: [el('option', { value: 'FIXED', text: 'Valor fixo' }), el('option', { value: 'PERCENT', text: 'Percentual' })] })] }),
        el('label', { text: 'Valor base', children: [el('input', { type: 'number', step: '0.01', id: 'recurring-base-amount', value: rule?.baseAmount ?? 0 })] }),
        el('label', { text: 'Descrição padrão', children: [el('input', { type: 'text', id: 'recurring-description', value: rule?.descriptionTemplate ?? '' })] }),
        el('label', { text: 'Frequência', children: [el('select', { id: 'recurring-frequency', children: [el('option', { value: 'DAILY', text: 'Diário' }), el('option', { value: 'WEEKLY', text: 'Semanal' }), el('option', { value: 'MONTHLY', text: 'Mensal' }), el('option', { value: 'YEARLY', text: 'Anual' })] })] }),
        el('label', { text: 'Próxima execução', children: [el('input', { type: 'date', id: 'recurring-next-run', value: rule?.nextRun?.slice(0, 10) ?? new Date().toISOString().slice(0, 10) })] }),
        el('label', { text: 'Ativa', children: [el('input', { type: 'checkbox', id: 'recurring-active', checked: rule?.active ?? true })] }),
      ],
    });

    const accountSelect = form.querySelector('#recurring-account');
    const categorySelect = form.querySelector('#recurring-category');
    const baseTypeSelect = form.querySelector('#recurring-base-type');
    const frequencySelect = form.querySelector('#recurring-frequency');

    if (rule) {
      accountSelect.value = rule.account?.id;
      categorySelect.value = rule.category?.id ?? '';
      baseTypeSelect.value = rule.baseType;
      frequencySelect.value = rule.frequency;
    }

    const modal = Modal({
      title: rule ? 'Editar regra' : 'Nova regra',
      content: form,
      actions: [
        { label: 'Cancelar', class: 'ghost', onClick: ({ close }) => close() },
        {
          label: rule ? 'Atualizar' : 'Criar',
          class: 'primary',
          onClick: async ({ close }) => {
            const payload = {
              accountId: accountSelect.value,
              categoryId: categorySelect.value || null,
              baseType: baseTypeSelect.value,
              baseAmount: Number(form.querySelector('#recurring-base-amount').value),
              descriptionTemplate: form.querySelector('#recurring-description').value,
              frequency: frequencySelect.value,
              nextRun: form.querySelector('#recurring-next-run').value,
              active: form.querySelector('#recurring-active').checked,
            };
            try {
              Loader.show();
              if (rule) {
                await recurringsApi.update(rule.id, payload);
                Toast.show({ message: 'Regra atualizada.', type: 'success' });
              } else {
                await recurringsApi.create(payload);
                Toast.show({ message: 'Regra criada.', type: 'success' });
              }
              close();
              loadRecurrings();
            } catch (error) {
              Toast.show({ message: error.message || 'Erro ao salvar regra.', type: 'danger' });
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
      await loadDependencies();
      await loadRecurrings();
      return layout;
    },
  };
};

export default RecurringsView;
