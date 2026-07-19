import './assets/styles.css';
import { App } from './App.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  
  // Attach app instance to window for global debugging if needed
  window.app = app;
});
