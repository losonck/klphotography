# Adding Photos to the KL Photography Portfolio

## Folder + Naming

- Originals live in `src/assets/portfolio/` (not `public/`).
- Naming: `NN-description-kebab.jpg` where `NN` is a two-digit sort order.
  Example: `01-powerscourt-ceremony.jpg`, `12-cliff-vows.jpg`.
- Accepted formats: `.jpg`, `.jpeg`, `.png`. Astro's image pipeline emits
  AVIF / WebP / JPEG variants automatically — **do NOT pre-convert**.

## Metadata File

Every photo needs a matching JSON under `src/content/gallery/{same-slug}.json`:

```json
{
  "image":     "../../assets/portfolio/01-powerscourt-ceremony.jpg",
  "alt":       "Bride and groom exchanging vows under a rose arch at Powerscourt Estate",
  "caption":   "Powerscourt Estate, Co. Wicklow",
  "sortOrder": 1,
  "exif": {
    "venue":       "Powerscourt Estate",
    "weddingYear": 2024
  }
}
```

Required: `image`, `alt` (≥5 chars), `sortOrder` (integer ≥1).
Optional: `caption`, `exif.{camera,lens,focalLength,venue,weddingYear}`.

The `image` path is **relative from the JSON file** — start with `../../assets/portfolio/`
(two `..` up from `src/content/gallery/` to `src/`). Absolute paths fail with
"Could not resolve image" at build time.

## Alt-Text Guide

Good: "Bride and groom exchanging vows under a rose arch at Powerscourt Estate"
Bad:  "wedding photo", "img001", "DSC_4592"

Rule: be concrete (who / what / where) and evocative when the moment warrants it.

**Minimum length: 5 characters.** `npm run build` fails on every shorter alt — the
build IS the lint (Zod schema enforcement in `src/content.config.ts`).

## Adding / Replacing Photos

1. Drop a new `NN-your-slug.jpg` into `src/assets/portfolio/` (replace or supplement
   an existing NN — use the next NN if you want a new position).
2. Add `src/content/gallery/NN-your-slug.json` with your alt, sortOrder, optional
   caption + EXIF.
3. Add a row to `src/assets/portfolio/LICENSES.md`.
4. `git add . && git commit -m "feat(gallery): add NN-your-slug"` and push to `main`.
   Cloudflare Pages redeploys in ~60 seconds.

## Editing the Current 18 Photos

The 18 photos shipped in Plan 04-01 were curated from `photos/weddings/` (the raw
intake folder, gitignored). Captions + alt text were written by Claude based on the
visual content. Edit the JSONs to match the actual people, venues, and moments shown
before final launch.

If you want a different photo in a given slot:

1. Pick a replacement from `photos/weddings/` locally.
2. `cp photos/weddings/SOURCE.jpg src/assets/portfolio/NN-your-slug.jpg`.
3. Update / rename the matching JSON.
4. Update the row in `src/assets/portfolio/LICENSES.md`.

## EXIF + Privacy

Astro's sharp pipeline strips ALL EXIF metadata from emitted images by default
(GPS, camera serials, timestamps). Wedding-venue GPS coordinates will NOT leak. If
you want EXIF fields displayed publicly (camera, lens, venue, year) put them in the
JSON's `exif` object — the gallery component may surface those in captions.

## Git LFS (if you exceed ~200 MB total)

Raw photo total under 200 MB → keep regular git. Above 200 MB → switch to Git LFS:

```bash
git lfs install
git lfs track "src/assets/portfolio/*.jpg"
git lfs track "src/assets/portfolio/*.png"
git add .gitattributes
git commit -m "chore: track gallery originals in LFS"
```

Cloudflare Pages free tier supports LFS-backed repos. Check current total with
`du -sh src/assets/portfolio/`.

## Hero + About Portraits

These two images live in `src/assets/placeholder/` (legacy directory name preserved
because `Hero.astro` and `About.astro` import from this path):

- `src/assets/placeholder/hero.jpg` — large landscape, full-bleed Hero section.
- `src/assets/placeholder/about-portrait.jpg` — photographer self-portrait, About section.

To replace either, overwrite the file and commit — same path, Astro re-encodes on next
build. License attribution lives in `src/assets/placeholder/LICENSES.md`.

## Logo

`src/assets/brand/logo.jpg` is rendered in `Nav.astro` via `astro:assets` `<Image>`.
Replace by overwriting the file — Astro re-encodes on next build.

## Deployment

Push to `main` → Cloudflare Pages rebuilds (~60s) → live.

Build will **FAIL** if any `alt` is missing or <5 chars (Zod schema enforcement).
Fix the JSON locally with `npm run build`, then push.
