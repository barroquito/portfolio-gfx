import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://www.jorgepindadogfx.com',
  output: 'static',
  devToolbar: { enabled: false },
  server: { allowedHosts: ['terminal.local'] }
});
