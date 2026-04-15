// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://{{CUSTOMER_DOMAIN}}',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/danke/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
