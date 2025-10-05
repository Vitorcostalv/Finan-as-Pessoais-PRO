import { el } from '../utils/dom.js';
import tilt from '../effects/tilt.js';

const Card = ({ title, subtitle, content, footer, interactive = true }) => {
  const card = el('article', {
    class: 'card',
    children: [
      title ? el('header', { class: 'card-header', children: [el('h3', { text: title }), subtitle ? el('p', { class: 'card-subtitle', text: subtitle }) : null] }) : null,
      el('div', { class: 'card-content', children: [content] }),
      footer ? el('footer', { class: 'card-footer', children: [footer] }) : null,
    ].filter(Boolean),
  });

  if (interactive) {
    tilt(card);
    card.classList.add('card-interactive');
  }

  return card;
};

export default Card;
