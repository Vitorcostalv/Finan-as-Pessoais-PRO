import { el } from '../utils/dom.js';

const Chip = ({ label, color }) =>
  el('span', {
    class: 'chip',
    text: label,
    style: color ? `--chip-color: ${color};` : '',
  });

export default Chip;
