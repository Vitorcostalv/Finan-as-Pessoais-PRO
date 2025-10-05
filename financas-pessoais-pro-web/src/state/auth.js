import store from './store.js';

const TOKEN_KEY = 'fp:token';
const USER_KEY = 'fp:user';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  store.set('auth:token', token);
};

const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Erro ao parsear usuário salvo', error);
    return null;
  }
};

const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  store.set('auth:user', user);
};

const logout = () => {
  setToken(null);
  setUser(null);
};

export default {
  getToken,
  setToken,
  getUser,
  setUser,
  logout,
};
