import http from './http.js';
import auth from '../state/auth.js';
import store from '../state/store.js';

const authenticate = async (token) => {
  auth.setToken(token);
  const user = await me();
  auth.setUser(user);
  return user;
};

export const login = async ({ email, password }) => {
  const data = await http.request('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  return authenticate(data.token);
};

export const signup = async ({ name, email, password }) => {
  await http.request('/auth/signup', {
    method: 'POST',
    auth: false,
    body: { name, email, password },
  });
  return login({ email, password });
};

export const me = async () => {
  const user = await http.request('/me', { method: 'GET' });
  store.set('auth:user', user);
  return user;
};

// Helpers CRUD genéricos
const buildCrud = (basePath) => ({
  list: (query = {}) => http.request(`${basePath}${buildQuery(query)}`),
  create: (payload) => http.request(basePath, { method: 'POST', body: payload }),
  update: (id, payload) => http.request(`${basePath}/${id}`, { method: 'PATCH', body: payload }),
  remove: (id) => http.request(`${basePath}/${id}`, { method: 'DELETE' }),
});

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!entries.length) return '';
  const search = new URLSearchParams(entries).toString();
  return `?${search}`;
};

export const accountsApi = buildCrud('/accounts');
export const categoriesApi = buildCrud('/categories');
export const transactionsApi = {
  ...buildCrud('/transactions'),
  list: (query = {}) => http.request(`/transactions${buildQuery(query)}`),
};
export const transfersApi = buildCrud('/transfers');
export const recurringsApi = buildCrud('/recurrings');
export const budgetsApi = buildCrud('/budgets');

export const getSummary = ({ from, to }) => http.request(`/reports/summary${buildQuery({ from, to })}`);
export const getCashflowDaily = ({ from, to }) => http.request(`/reports/cashflow-daily${buildQuery({ from, to })}`);
export const getByCategory = ({ from, to }) => http.request(`/reports/by-category${buildQuery({ from, to })}`);

export default {
  login,
  signup,
  me,
  accountsApi,
  categoriesApi,
  transactionsApi,
  transfersApi,
  recurringsApi,
  budgetsApi,
  getSummary,
  getCashflowDaily,
  getByCategory,
};
