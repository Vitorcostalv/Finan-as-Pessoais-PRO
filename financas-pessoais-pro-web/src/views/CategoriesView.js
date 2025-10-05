import { el } from '../utils/dom.js';
import Navbar from '../components/Navbar.js';
import Sidebar from '../components/Sidebar.js';
import Table from '../components/Table.js';
import Modal from '../components/Modal.js';
import Chip from '../components/Chip.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import { categoriesApi } from '../api/endpoints.js';
import store from '../state/store.js';

const CategoriesView = () => {
  const { layout, main } = (() => {
    const sidebar = Sidebar();
    const navbar = Navbar();
    const mainEl = el('main', { class: 'app-main', attrs: { tabindex: '-1' } });
    const contentWrapper = el('div', { class: 'app-content', children: [navbar, mainEl] });
    return { layout: el('div', { class: 'app-layout', children: [sidebar, contentWrapper] }), main: mainEl };
  })();

  const header = el('header', {
    class: 'view-header',
    children: [
      el('div', {
        children: [
          el('h1', { text: 'Categorias' }),
          el('p', { class: 'muted', text: 'Organize suas categorias de receitas e despesas.' }),
        ],
      }),
      el('button', { class: 'btn primary', text: 'Nova categoria', attrs: { type: 'button' } }),
    ],
  });

  const table = Table({
    columns: [
      { key: 'name', label: 'Nome', sortable: true },
      { key: 'type', label: 'Tipo', sortable: true, render: (value) => (value === 'INCOME' ? 'Entrada' : 'Saída') },
      {
        key: 'color',
        label: 'Cor',
        render: (value, item) => Chip({ label: item.name, color: value }),
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

  const loadCategories = async () => {
    try {
      Loader.show();
      const categories = await categoriesApi.list();
      table.update(categories);
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao carregar categorias.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  };

  const openForm = (category = null) => {
    const nameInput = el('input', {
      type: 'text',
      value: category?.name ?? '',
      attrs: { placeholder: 'Nome da categoria', required: 'true' },
    });
    const typeSelect = el('select', {
      children: [
        el('option', { value: 'INCOME', text: 'Entrada' }),
        el('option', { value: 'EXPENSE', text: 'Saída' }),
      ],
    });
    typeSelect.value = category?.type ?? 'EXPENSE';
    const colorInput = el('input', { type: 'color', value: category?.color ?? '#7c3aed' });

    const formContent = el('div', {
      class: 'form-grid',
      children: [
        el('label', { text: 'Nome', children: [nameInput] }),
        el('label', { text: 'Tipo', children: [typeSelect] }),
        el('label', { text: 'Cor', children: [colorInput] }),
      ],
    });

    const modal = Modal({
      title: category ? 'Editar categoria' : 'Nova categoria',
      content: formContent,
      actions: [
        { label: 'Cancelar', class: 'ghost', onClick: ({ close }) => close() },
        {
          label: category ? 'Atualizar' : 'Criar',
          class: 'primary',
          onClick: async ({ close }) => {
            if (!nameInput.value.trim()) {
              Toast.show({ message: 'Informe o nome da categoria.', type: 'danger' });
              return;
            }
            try {
              Loader.show();
              const payload = { name: nameInput.value, type: typeSelect.value, color: colorInput.value };
              if (category) {
                await categoriesApi.update(category.id, payload);
                Toast.show({ message: 'Categoria atualizada!', type: 'success' });
              } else {
                await categoriesApi.create(payload);
                Toast.show({ message: 'Categoria criada!', type: 'success' });
              }
              close();
              loadCategories();
            } catch (error) {
              Toast.show({
                message: error.status === 409 ? 'Nome já utilizado. Escolha outro.' : (error.message || 'Erro ao salvar categoria.'),
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

  const confirmDelete = (category) => {
    const modal = Modal({
      title: 'Excluir categoria',
      content: el('p', { text: `Excluir a categoria ${category.name}?` }),
      actions: [
        { label: 'Cancelar', class: 'ghost', onClick: ({ close }) => close() },
        {
          label: 'Excluir',
          class: 'danger',
          onClick: async ({ close }) => {
            try {
              Loader.show();
              await categoriesApi.remove(category.id);
              Toast.show({ message: 'Categoria removida.', type: 'success' });
              close();
              loadCategories();
            } catch (error) {
              Toast.show({
                message: error.status === 409 ? 'Categoria utilizada em lançamentos. Atualize-os antes de excluir.' : (error.message || 'Erro ao remover categoria.'),
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
      await loadCategories();
      return layout;
    },
  };
};

export default CategoriesView;
