// Utilidades de formatação para valores monetários, datas e percentuais
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 2,
});

export const formatCurrency = (value = 0) => currencyFormatter.format(Number(value) || 0);
export const formatPercent = (value = 0) => percentFormatter.format(Number(value) || 0);

export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const toISODate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return date.toISOString().slice(0, 10);
};

export const toISODateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return date.toISOString();
};

export const maskCurrency = (input, locale = 'pt-BR', currency = 'BRL') => {
  const digits = input.replace(/\D/g, '');
  const number = Number(digits) / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(number);
};
