import auth from './state/auth.js';
import store from './state/store.js';
import { qs } from './utils/dom.js';

import LoginView from './views/LoginView.js';
import SignupView from './views/SignupView.js';
import DashboardView from './views/DashboardView.js';
import AccountsView from './views/AccountsView.js';
import CategoriesView from './views/CategoriesView.js';
import TransactionsView from './views/TransactionsView.js';
import TransfersView from './views/TransfersView.js';
import RecurringsView from './views/RecurringsView.js';
import BudgetsView from './views/BudgetsView.js';
import ReportsView from './views/ReportsView.js';
import SettingsView from './views/SettingsView.js';

const routes = [
  { path: '#/login', component: LoginView, public: true },
  { path: '#/signup', component: SignupView, public: true },
  { path: '#/dashboard', component: DashboardView },
  { path: '#/accounts', component: AccountsView },
  { path: '#/categories', component: CategoriesView },
  { path: '#/transactions', component: TransactionsView },
  { path: '#/transfers', component: TransfersView },
  { path: '#/recurrings', component: RecurringsView },
  { path: '#/budgets', component: BudgetsView },
  { path: '#/reports', component: ReportsView },
  { path: '#/settings', component: SettingsView },
];

let currentViewInstance = null;

const findRoute = (hash) => routes.find((route) => route.path === hash);

const render = async (route) => {
  const app = qs('#app');
  if (!app) return;
  app.setAttribute('data-view', route.path);

  if (currentViewInstance?.destroy) {
    currentViewInstance.destroy();
  }

  app.classList.add('view-leave');
  await new Promise((resolve) => setTimeout(resolve, 120));
  app.innerHTML = '';
  app.classList.remove('view-leave');
  app.classList.add('view-enter');

  currentViewInstance = route.component();
  const element = await currentViewInstance.render();
  app.appendChild(element);
  requestAnimationFrame(() => app.classList.remove('view-enter'));
};

const guard = (route) => {
  if (route.public) return true;
  const token = auth.getToken();
  if (!token) {
    window.location.hash = '#/login';
    return false;
  }
  return true;
};

const handleRouteChange = async () => {
  const hash = window.location.hash || '#/dashboard';
  const route = findRoute(hash) || routes[0];

  if (!guard(route)) return;

  store.set('app:route', route.path);
  await render(route);
};

const go = (hash) => {
  if (window.location.hash === hash) {
    handleRouteChange();
  } else {
    window.location.hash = hash;
  }
};

window.addEventListener('hashchange', handleRouteChange);

const init = () => {
  if (!window.location.hash) {
    window.location.hash = auth.getToken() ? '#/dashboard' : '#/login';
  } else {
    handleRouteChange();
  }
};

export default {
  init,
  go,
  routes,
};
