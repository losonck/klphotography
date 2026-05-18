// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://klphotography.ie',
  output: 'static',
  integrations: [
    sitemap({
      // Exclude /styleguide (design reference, robots.txt Disallow) from the sitemap.
      // /privacy stays included — GDPR transparency, indexable per RESEARCH §3 Q2.
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  fonts: [
    {
      name: 'EB Garamond',
      cssVariable: '--font-serif',
      provider: fontProviders.fontsource(),
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Cambria', 'Times New Roman', 'serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-sans',
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
    },
  ],
});
