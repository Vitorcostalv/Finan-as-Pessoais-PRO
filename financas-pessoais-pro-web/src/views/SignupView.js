import { el } from '../utils/dom.js';
import { isEmail, minLength, match, validateForm } from '../utils/validate.js';
import { signup } from '../api/endpoints.js';
import router from '../router.js';
import Toast from '../components/Toast.js';
import Loader from '../components/Loader.js';
import confetti from '../effects/confetti.js';

const SignupView = () => {
  const container = el('div', { class: 'auth-view' });

  const nameInput = el('input', {
    type: 'text',
    id: 'signup-name',
    attrs: { placeholder: ' ', autocomplete: 'name' },
  });
  const emailInput = el('input', {
    type: 'email',
    id: 'signup-email',
    attrs: { placeholder: ' ', autocomplete: 'email' },
  });
  const passwordInput = el('input', {
    type: 'password',
    id: 'signup-password',
    attrs: { placeholder: ' ', autocomplete: 'new-password' },
  });
  const confirmInput = el('input', {
    type: 'password',
    id: 'signup-confirm',
    attrs: { placeholder: ' ', autocomplete: 'new-password' },
  });

  const form = el('form', {
    class: 'auth-card glass',
    attrs: { novalidate: 'true' },
    children: [
      el('h1', { text: 'Crie sua conta' }),
      el('p', { class: 'muted', text: 'Organize suas finanças com estilo.' }),
      el('label', { class: 'floating', attrs: { for: 'signup-name' }, children: [nameInput, el('span', { text: 'Nome completo' })] }),
      el('label', { class: 'floating', attrs: { for: 'signup-email' }, children: [emailInput, el('span', { text: 'E-mail' })] }),
      el('label', { class: 'floating', attrs: { for: 'signup-password' }, children: [passwordInput, el('span', { text: 'Senha' })] }),
      el('label', { class: 'floating', attrs: { for: 'signup-confirm' }, children: [confirmInput, el('span', { text: 'Confirmar senha' })] }),
      el('button', { class: 'btn primary', text: 'Cadastrar', attrs: { type: 'submit' } }),
      el('p', { class: 'muted', html: 'Já possui login? <a href="#/login">Entrar</a>' }),
    ],
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { valid, errors } = validateForm({
      name: [{ rule: () => minLength(nameInput.value, 3), message: 'Informe seu nome completo.' }],
      email: [{ rule: () => isEmail(emailInput.value), message: 'E-mail inválido.' }],
      password: [{ rule: () => minLength(passwordInput.value, 8), message: 'Senha deve ter ao menos 8 caracteres.' }],
      confirm: [{ rule: () => match(confirmInput.value, passwordInput.value), message: 'As senhas não coincidem.' }],
    });
    if (!valid) {
      Toast.show({ message: Object.values(errors)[0], type: 'danger' });
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 400);
      return;
    }
    try {
      Loader.show();
      await signup({ name: nameInput.value, email: emailInput.value, password: passwordInput.value });
      confetti();
      Toast.show({ message: 'Conta criada com sucesso!', type: 'success' });
      router.go('#/dashboard');
    } catch (error) {
      Toast.show({ message: error.message || 'Erro ao criar conta.', type: 'danger' });
    } finally {
      Loader.hide();
    }
  });

  container.appendChild(form);

  return {
    render: async () => container,
  };
};

export default SignupView;
