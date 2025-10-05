import { el } from '../utils/dom.js';

const DateRange = ({ from, to, onChange }) => {
  const startInput = el('input', {
    type: 'date',
    value: from,
    attrs: { 'aria-label': 'Data inicial' },
  });
  const endInput = el('input', {
    type: 'date',
    value: to,
    attrs: { 'aria-label': 'Data final' },
  });

  const container = el('div', {
    class: 'date-range',
    children: [startInput, el('span', { class: 'separator', text: 'até' }), endInput],
  });

  const emitChange = () => onChange?.({ from: startInput.value, to: endInput.value });
  startInput.addEventListener('change', emitChange);
  endInput.addEventListener('change', emitChange);

  return {
    element: container,
    setRange({ from: newFrom, to: newTo }) {
      startInput.value = newFrom;
      endInput.value = newTo;
    },
  };
};

export default DateRange;
