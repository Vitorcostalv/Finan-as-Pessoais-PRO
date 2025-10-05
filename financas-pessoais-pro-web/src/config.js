// Configuração global do app e carregamento dinâmico de URL da API
const storedApiUrl = localStorage.getItem('fp:api_url');
const apiBase = storedApiUrl && storedApiUrl.trim() ? storedApiUrl.trim() : (window.CONFIG?.API_BASE_URL ?? 'http://localhost:8080/api');

window.CONFIG = {
  API_BASE_URL: apiBase,
};

export default window.CONFIG;
