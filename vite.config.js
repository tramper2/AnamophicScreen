import { defineConfig } from 'vite';

export default defineConfig({
  base: '/AnamophicScreen/',
  server: {
    port: 3000,
    host: '127.0.0.1' // Listen on localhost/127.0.0.1 for security
  }
});
