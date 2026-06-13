import { initCursor } from './cursor.js';
import { initNav } from './nav.js';
import { initScroll } from './scroll.js';
import { initViews } from './views.js';
import { initEmailGate } from './emailgate.js';
import { initContact } from './contact.js';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initScroll();
  initViews();
  initEmailGate();
  initContact();
});
