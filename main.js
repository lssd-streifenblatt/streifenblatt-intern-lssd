import './style.css'
import { App } from './js/app.js'

const app = new App();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
