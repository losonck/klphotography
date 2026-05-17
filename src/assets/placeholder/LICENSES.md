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
(4000x4919, Sony A7M3, ~14MB JPG). Astro's sharp pipeline resizes to
`widths={[480, 720, 960]}` and emits AVIF/WebP variants at build time — the 14MB source
is fine on disk because nothing >960px wide is ever served.
