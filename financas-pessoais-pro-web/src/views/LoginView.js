import { el } from '../utils/dom.js';
import { isEmail, minLength, validateForm } from '../utils/validate.js';
import { login } from '../api/endpoints.js';
import auth from '../state/auth.js';
import router from '../router.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';

const LoginView = () => {
  const container = el('div', { class: 'auth-view' });

  const emailInput = el('input', {
    type: 'email',
    id: 'login-email',
    required: true,
    attrs: { autocomplete: 'email', placeholder: ' ' },
  });

  const passwordInput = el('input', {
    type: 'password',
    id: 'login-password',
    required: true,
    attrs: { autocomplete: 'current-password', placeholder: ' ' },
  });

  const showPassword = el('button', {
    class: 'btn ghost',
    text: 'Mostrar',
    attrs: { type: 'button' },
  });

  const rememberInput = el('input', { type: 'checkbox', id: 'remember-me' });

  const form = el('form', {
    class: 'auth-card glass',
    attrs: { novalidate: 'true' },
    children: [
      el('h1', { text: 'Bem-vindo de volta!' }),
      el('p', { class: 'muted', text: 'Entre para acessar seu painel financeiro.' }),
      el('label', { class: 'floating', attrs: { for: 'login-email' }, children: [emailInput, el('span', { text: 'E-mail' })] }),
      el('label', { class: 'floating', attrs: { for: 'login-password' }, children: [passwordInput, el('span', { text: 'Senha' })] }),
      el('div', { class: 'form-row', children: [
        el('label', { class: 'checkbox', attrs: { for: 'remember-me' }, children: [rememberInput, el('span', { text: 'Lembrar de mim' })] }),
        showPassword,
      ] }),
      el('button', { class: 'btn primary', text: 'Entrar', attrs: { type: 'submit' } }),
      el('p', {
        class: 'muted',
        html: 'Não possui conta? <a href="#/signup">Cadastre-se</a>',
      }),
    ],
  });

  showPassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    showPassword.textContent = isPassword ? 'Ocultar' : 'Mostrar';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { valid, errors } = validateForm({
      email: [
        { rule: () => isEmail(emailInput.value), message: 'Informe um e-mail válido.' },
      ],
      password: [
        { rule: () => minLength(passwordInput.value, 8), message: 'A senha deve possuir ao menos 8 caracteres.' },
      ],
    });

    if (!valid) {
      Toast.show({ message: Object.values(errors)[0], type: 'danger' });
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 400);
      return;
    }

    try {
      Loader.show();
      await login({ email: emailInput.value, password: passwordInput.value });
      if (!rememberInput.checked) {
        sessionStorage.setItem('fp:last-login-email', emailInput.value);
      }
      Toast.show({ message: 'Login realizado com sucesso!', type: 'success' });
      router.go('#/dashboard');
    } catch (error) {
      Toast.show({ message: error.message || 'Credenciais inválidas.', type: 'danger' });
      auth.logout();
    } finally {
      Loader.hide();
    }
  });

  container.appendChild(form);

  return {
    render: async () => container,
  };
};

export default LoginView;
