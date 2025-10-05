// Funções básicas de validação de formulários
export const isEmail = (value = '') => /\S+@\S+\.\S+/.test(value);
export const minLength = (value = '', length = 0) => value.trim().length >= length;
export const isRequired = (value = '') => value.trim().length > 0;
export const match = (value, other) => value === other;

export const validateForm = (fields) => {
  const errors = {};
  Object.entries(fields).forEach(([name, validators]) => {
    validators.some((validator) => {
      const { rule, message } = validator;
      if (!rule()) {
        errors[name] = message;
        return true;
      }
      return false;
    });
  });
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
