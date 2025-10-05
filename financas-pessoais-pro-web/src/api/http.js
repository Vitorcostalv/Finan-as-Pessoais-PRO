import CONFIG from '../config.js';
import auth from '../state/auth.js';
import router from '../router.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  if (response.status === 401) {
    auth.logout();
    router.go('#/login');
    throw { status: 401, message: 'Sessão expirada. Faça login novamente.' };
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = { message: response.statusText };
  }

  throw {
    status: response.status,
    message: data?.message || 'Ocorreu um erro inesperado.',
    details: data?.details || null,
  };
};

const request = async (path, { method = 'GET', headers = {}, body = null, auth: useAuth = true } = {}) => {
  const maxRetries = 2;
  let attempt = 0;
  let lastError;

  while (attempt <= maxRetries) {
    try {
      const token = auth.getToken();
      const requestHeaders = new Headers(headers);
      if (body && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
      }
      if (useAuth && token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : null,
        credentials: 'same-origin',
      });

      return await handleResponse(response);
    } catch (error) {
      lastError = error;
      if ([429, 503].includes(error.status) && attempt < maxRetries) {
        await sleep(2 ** attempt * 300);
        attempt += 1;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Falha ao processar requisição');
};

export default {
  request,
};
