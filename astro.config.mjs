import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://jorge-pindado-ideas-en-forma.dreamycabin22.chatgpt.site',
  output: 'static',
  devToolbar: { enabled: false },
  server: { allowedHosts: ['terminal.local'] }
});
