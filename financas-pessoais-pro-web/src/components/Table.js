import { el, fragment } from '../utils/dom.js';

const sortData = (data, column, direction) => {
  const sorted = [...data];
  sorted.sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];
    if (valueA === valueB) return 0;
    if (valueA === undefined) return 1;
    if (valueB === undefined) return -1;
    return direction === 'asc' ? (valueA > valueB ? 1 : -1) : valueA > valueB ? -1 : 1;
  });
  return sorted;
};

const paginate = (data, page, perPage) => {
  const start = (page - 1) * perPage;
  return data.slice(start, start + perPage);
};

const Table = ({ columns = [], data = [], emptyMessage = 'Nenhum dado encontrado.', perPage = 10, onRowClick }) => {
  let sourceData = [...data];
  let currentPage = 1;
  let sortColumn = null;
  let sortDirection = 'asc';
  let filteredData = [...sourceData];

  const table = el('table', { class: 'table' });
  const thead = el('thead');
  const tbody = el('tbody');
  const pagination = el('div', { class: 'table-pagination' });

  const renderHead = () => {
    thead.innerHTML = '';
    const row = el('tr');
    columns.forEach((column) => {
      const th = el('th', {
        text: column.label,
        attrs: column.sortable ? { 'data-key': column.key, role: 'button', tabindex: '0' } : {},
      });
      if (column.sortable) {
        th.classList.add('sortable');
        th.addEventListener('click', () => sort(column.key));
        th.addEventListener('keypress', (event) => {
          if (event.key === 'Enter') sort(column.key);
        });
      }
      row.appendChild(th);
    });
    thead.appendChild(row);
  };

  const renderBody = () => {
    tbody.innerHTML = '';
    const items = paginate(filteredData, currentPage, perPage);
    if (!items.length) {
      const emptyRow = el('tr', {
        children: [el('td', { class: 'empty-state', attrs: { colspan: String(columns.length) }, text: emptyMessage })],
      });
      tbody.appendChild(emptyRow);
      return;
    }

    tbody.appendChild(
      fragment(
        items.map((item) => {
          const tr = el('tr');
          if (onRowClick) {
            tr.classList.add('clickable');
            tr.addEventListener('click', () => onRowClick(item));
          }
          columns.forEach((column) => {
            const value = column.render ? column.render(item[column.key], item) : item[column.key];
            const td = el('td');
            if (value instanceof Node) {
              td.appendChild(value);
            } else {
              td.innerHTML = value ?? '';
            }
            tr.appendChild(td);
          });
          return tr;
        })
      )
    );
  };

  const renderPagination = () => {
    pagination.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
    const info = el('span', { text: `Página ${currentPage} de ${totalPages}` });
    const prev = el('button', { class: 'btn ghost', text: 'Anterior', attrs: { type: 'button', disabled: currentPage === 1 } });
    const next = el('button', { class: 'btn ghost', text: 'Próxima', attrs: { type: 'button', disabled: currentPage === totalPages } });

    prev.addEventListener('click', () => {
      currentPage = Math.max(1, currentPage - 1);
      renderBody();
      renderPagination();
    });
    next.addEventListener('click', () => {
      currentPage = Math.min(totalPages, currentPage + 1);
      renderBody();
      renderPagination();
    });

    pagination.append(prev, info, next);
  };

  const sort = (key) => {
    if (sortColumn === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = key;
      sortDirection = 'asc';
    }
    filteredData = sortData(filteredData, sortColumn, sortDirection);
    currentPage = 1;
    renderBody();
    renderPagination();
  };

  const filter = (term) => {
    const query = term.trim().toLowerCase();
    filteredData = !query
      ? [...sourceData]
      : sourceData.filter((item) =>
          columns.some((column) => {
            if (column.key === 'actions') return false;
            const value = item[column.key];
            return String(value ?? '').toLowerCase().includes(query);
          })
        );
    if (sortColumn) {
      filteredData = sortData(filteredData, sortColumn, sortDirection);
    }
    currentPage = 1;
    renderBody();
    renderPagination();
  };

  renderHead();
  renderBody();
  renderPagination();

  table.append(thead, tbody);

  return {
    element: el('div', { class: 'table-wrapper', children: [table, pagination] }),
    update(newData) {
      sourceData = [...newData];
      filter('');
    },
    filter,
  };
};

export default Table;
