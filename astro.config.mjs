// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://klphotography.ie',
  output: 'static',
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
