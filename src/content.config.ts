// Astro 6 content-collection config (NOT src/content/config.ts — Astro 6 moved it up one level).
// See .planning/phases/04-portfolio-gallery-image-pipeline/04-RESEARCH.md §2 + Pitfall 1.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const gallery = defineCollection({
  // Astro 6's content layer requires an explicit loader. The `glob` loader scans the
  // pattern and resolves each match to a content entry. The `type: 'data'` legacy
  // shorthand is deprecated — passing a loader is the v6 idiom.
  loader: glob({ pattern: '*.json', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      // Relative path FROM the JSON file (e.g. "../../assets/portfolio/01-foo.jpg").
      // The image() helper resolves the path to an ImageMetadata with intrinsic width/height,
      // which the gallery component (Plan 04-02) feeds to justified-layout for grid geometry.
      image: image(),
      // Alt-lint (GALLERY-05): Zod fails `npm run build` if any alt is missing or <5 chars.
      // The build IS the lint — Cloudflare Pages CI runs `npm run build` on every push.
      alt: z.string().min(5),
      caption: z.string().optional(),
      sortOrder: z.number().int().min(1),
      exif: z
        .object({
          camera: z.string().optional(),
          lens: z.string().optional(),
          focalLength: z.string().optional(),
          venue: z.string().optional(),
          weddingYear: z.number().int().optional(),
        })
        .partial()
        .optional(),
    }),
});

export const collections = { gallery };
