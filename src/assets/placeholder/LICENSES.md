# Hero + About Image Rights

**Copyright:** © KL Photography. All rights reserved.

These two images are owner-supplied (the photographer's own work) and replace the
Unsplash placeholders that were shipped during Phase 3.

The directory name `placeholder/` is preserved because `Hero.astro` and `About.astro`
import from this path — renaming would require a code change across Phase 3 components.
The contents are NOT placeholders any more.

## Hero — src/assets/placeholder/hero.jpg
© KL Photography. From portfolio (see `src/assets/portfolio/LICENSES.md` — same image
as `01-ceremony-aisle.jpg`, deliberately duplicated so the Hero section ships a striking
real wedding moment without coupling Hero.astro to the gallery's content collection).

## About portrait — src/assets/placeholder/about-portrait.jpg
© KL Photography. Self-portrait, 2023. Original source: `photos/about/DSC01493.jpg`
(4000x4919, Sony A7M3, ~14MB JPG). Pre-resized to 1920x2361 (~1MB) before commit so
Astro's "original-size fallback" variant in `<picture>` srcset stays under 700KB —
Astro `<Image>` emits a fallback at the source's intrinsic width regardless of
the `widths=[480,720,960]` prop, and a 14MB source produced a 2.8MB fallback webp.
1920 keeps 4× density vs the largest layout width (960) for HiDPI screens.
