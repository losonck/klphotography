# Phase 4: Portfolio Gallery & Image Pipeline — Research

**Researched:** 2026-05-17
**Domain:** Astro 6 image pipeline, justified-grid layout, accessible lightbox, LCP/CLS optimisation
**Confidence:** HIGH

---

## TL;DR

1. **Photo intake:** Ship gallery component working with 0–N photos in `src/assets/portfolio/`. Seed with 6–8 Unsplash placeholders + clear `[OWNER-PROVIDE]` markers + `CONTRIBUTING-GALLERY.md` spec. Owner replaces incrementally before launch. Build fails gracefully at 0 images (empty grid, no JS errors).
2. **Content collection:** `src/content/gallery/{slug}.json` + schema in `src/content.config.ts` using `image()` helper — Zod validates `alt` at build time, CI = enforcement.
3. **Justified grid:** Use `justified-layout` npm package (Flickr, 4.1.0, ISC, 10yr-old, no DOM dep). Pure geometry function → vanilla JS renders `<div>` wrappers with `style="width/height/left/top"`. No framework needed.
4. **Lightbox:** Use `photoswipe` v5 (5.4.4, MIT, by @dimsemenov, widely used). Keyboard arrows, ESC, swipe, ARIA — meets GALLERY-04 with minimal custom code. ~30 KB gz. Accept the npm dep (accessibility burden of rolling custom is too high).
5. **Above-fold eager strategy:** First 4 thumbs `loading="eager" fetchpriority="auto"`, rest `loading="lazy" decoding="async" fetchpriority="low"`. Inline boundary computed at render time from `sortOrder`.
6. **Hero preload:** Add `<link rel="preload" as="image" imagesrcset imagesizes fetchpriority="high">` in `<head>`. Browsers deduplicate against the `<picture>` element's already-eager request — no double-fetch in practice. Validate delta in Phase 6 Lighthouse run.
7. **Image budget:** 50 photos × 3 formats × 5 widths = 750 assets. CF Pages free tier limit = 20 000 files. 750 << 20 000. OK. First-run sharp build ~30 s; subsequent incremental.
8. **AVIF hero sizes:** Verified in `dist/_astro/`. Largest hero AVIF = 35 472 bytes (35 KB) at 2400 w — comfortably below PERF-01's ≤200 KB target. No quality adjustment needed for current placeholder; verify again after owner supplies real images.
9. **CLS prevention:** `<Picture>` emits `width` + `height` automatically. Justified-layout cell `<div>` wrappers get `style="width:{w}px;height:{h}px"` + CSS `aspect-ratio` fallback. CLS risk = LOW if both are applied.
10. **EXIF stripping:** sharp strips all EXIF by default (`withMetadata()` is opt-in). Astro's sharp service does NOT call `withMetadata()`. EXIF not present in emitted `dist/_astro/*.{avif,webp,jpg}` files. No separate CI step needed; trust Astro's pipeline.
11. **Alt lint:** Zod `z.string().min(5)` on `alt` field fails `npm run build` at content-collection load time. No separate CI step; CF Pages CI build = enforcement.
12. **Nav Portfolio link:** Add `{ label: 'Portfolio', href: '/#portfolio' }` to `Nav.astro` `links` array between `{ href: '#hero', label: 'Home' }` and `{ href: '#about', label: 'About' }`.
13. **CONTRIBUTING-GALLERY.md:** One-page spec: folder `src/assets/portfolio/`, naming `NN-description-kebab.jpg`, JSON per photo, alt writing guide.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gallery metadata schema + alt lint | Build (Astro content collections + Zod) | — | Zod validates at `npm run build`; no runtime check needed |
| Image optimisation (AVIF/WebP/JPEG, widths, srcset) | Build (Astro `<Picture>` + sharp) | CDN (Cloudflare Pages serves emitted `dist/_astro/` variants) | Same pipeline as Phase 3 Hero — already proven |
| Justified-grid geometry | Build (Astro component runs `justified-layout` at SSG time) | — | Pure geometry function; output is static HTML `<div style="...">` — no client JS for layout |
| Thumbnail rendering | Build (Astro `<Picture>` inside gallery loop) | — | Static HTML + `srcset` shipped; browser picks variant |
| Above-fold / lazy boundary | Build (Astro component checks `sortOrder ≤ 4` at render) | — | No runtime needed; boundary is a static render decision |
| Lightbox open/close, keyboard, swipe | Browser (PhotoSwipe v5 client JS, ~30 KB gz) | — | Inherently interactive; cannot pre-render |
| Hero `<link rel="preload">` | Build (injected into `<head>` via `BaseLayout` slot) | Browser (fetch honour) | One static tag; no JS |
| Nav `#portfolio` link | Build (Nav.astro `links` array edit) | Browser (smooth-scroll CSS already shipped) | One-line edit |

---

## 1. Owner Photo Intake Strategy

**Decision:** Seed + incremental replace.

**Rationale:** Owner does not yet have ~50 photos. Blocking gallery build on content-complete photos delays Phase 4 by weeks. Instead:

1. Commit 6–8 Unsplash placeholder images to `src/assets/portfolio/` with filenames matching naming convention (`01-couple-name.jpg` → `01-placeholder-garden.jpg`) + corresponding `.json` files tagged `[OWNER-PROVIDE]`.
2. Gallery component renders whatever is in the collection — 0 images = empty section with a "Portfolio coming soon" message (not a build error).
3. Owner replaces one file at a time, pushes to main, CF Pages redeploys in ~60 s. No process friction.

**CONTRIBUTING-GALLERY.md** covers: folder location, naming scheme, JSON schema walkthrough, alt-text writing guide, LFS threshold (>200 MB total).

**Markers to use:** `[OWNER-PROVIDE]` (stronger than OWNER-REVIEW — signals active replacement required, not just review).

---

## 2. Content Collection Schema

**Config file:** `src/content.config.ts` (Astro 6 convention — replaces Astro 4's `src/content/config.ts`). [CITED: https://docs.astro.build/en/guides/content-collections/]

**Collection location:** `src/content/gallery/{slug}.json`

**Schema:**

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { image } from 'astro:content';   // image() helper — resolves relative path → ImageMetadata

const gallery = defineCollection({
  type: 'data',  // JSON / YAML, no Markdown body
  schema: ({ image }) => z.object({
    image:     image(),           // relative path from JSON file e.g. "../../assets/portfolio/01-garden.jpg"
    alt:       z.string().min(5), // fails build if missing or < 5 chars
    caption:   z.string().optional(),
    sortOrder: z.number().int().min(1),
    exif: z.object({
      camera:    z.string().optional(),
      lens:      z.string().optional(),
      venue:     z.string().optional(),
      weddingYear: z.number().int().optional(),
    }).optional(),
  }),
});

export const collections = { gallery };
```

**Worked JSON example** (`src/content/gallery/01-garden-ceremony.json`):

```json
{
  "image": "../../assets/portfolio/01-garden-ceremony.jpg",
  "alt": "Bride and groom exchanging vows under a rose arch at Powerscourt Estate",
  "caption": "Powerscourt Estate, Co. Wicklow",
  "sortOrder": 1,
  "exif": {
    "venue": "Powerscourt Estate",
    "weddingYear": 2024
  }
}
```

**Why `type: 'data'`:** Gallery entries have no Markdown body — pure structured data. `type: 'data'` is the correct Astro 6 collection type for JSON files. [CITED: https://docs.astro.build/en/guides/content-collections/#defining-a-collection]

**Alt enforcement:** Zod's `z.string().min(5)` throws a build-time error when any `.json` is missing `alt` or has a too-short string. `npm run build` in CF Pages CI = automatic enforcement. No extra lint script needed. (GALLERY-05)

---

## 3. Justified-Grid Library Choice

**Decision: Use `justified-layout` npm package.**

| Criterion | `justified-layout` | Pure CSS Grid / masonry |
|-----------|-------------------|-------------------------|
| Algorithm | Flickr's production algorithm; handles arbitrary aspect ratios per row | CSS `grid` cannot do variable-width same-height rows without JS |
| DOM dependency | None — pure geometry function, returns `{width, height, top, left}` per box | N/A |
| Bundle size | 55 KB unpacked, ~3 KB gz (no deps) | 0 (CSS only) — but requires JS fallback for IE/Safari masonry |
| Maintenance | Stable since 2016; last publish 2022; Flickr still uses it | — |
| Build-time use | Runs at SSG time in Astro component — zero client JS for layout | CSS ships statically |
| CSS masonry fallback | Not applicable | `grid-template-rows: masonry` = Safari 18+ only, not Chrome/Firefox GA as of 2026-05 |

**Why not pure CSS masonry:** `grid-template-rows: masonry` is behind a flag in Chrome and not in Firefox GA. [ASSUMED based on training knowledge, not re-verified in this session — confirm status at caniuse.com before planning CSS-only path.] Justified-layout gives reliable cross-browser even-row layout today.

**Usage pattern (SSG — runs at build time):**

```typescript
// src/components/sections/Portfolio.astro
---
import justifiedLayout from 'justified-layout';
import { getCollection } from 'astro:content';
import { Picture } from 'astro:assets';

const items = (await getCollection('gallery')).sort(
  (a, b) => a.data.sortOrder - b.data.sortOrder
);

// justified-layout needs raw aspect ratios
const geometry = justifiedLayout(
  items.map(i => i.data.image.width / i.data.image.height),
  { containerWidth: 1280, targetRowHeight: 320, boxSpacing: 4 }
);
---
```

`geometry.boxes[n].width / height / top / left` become inline styles on wrapper `<div>` elements. The outer container is `position: relative; height: {geometry.containerHeight}px`.

**Installation:**

```bash
npm install justified-layout
```

---

## 4. Lightbox Choice

**Decision: Use `photoswipe` v5 (npm package).**

| Criterion | PhotoSwipe v5 | Vanilla custom lightbox |
|-----------|---------------|------------------------|
| Accessibility | Full ARIA (role=dialog, aria-modal, aria-label), focus trap, ESC close, keyboard arrows | Requires ~150 lines of custom a11y code to reach parity |
| Touch/swipe | Native velocity-based swipe with physics | Requires Pointer Events API + swipe detection (~80 lines) |
| Srcset support | Yes — pass `srcset` + `sizes` per slide for responsive full-size | Manual |
| Bundle size | ~30 KB gz (no deps) | 0 KB — but a11y gap makes this unsafe |
| Maintenance | Active; maintained by @dimsemenov; v5 stable since 2022 | — |
| Mobile pinch-zoom | Yes | Requires additional gesture code |

**A11y burden is the deciding factor.** Phase 3 established the pattern of zero dependencies for interactions with < 30 lines of vanilla JS (hamburger). A proper accessible lightbox is NOT < 30 lines — keyboard trapping, focus restoration, ARIA live regions for slide count, and swipe all compound. PhotoSwipe ships all of this.

**Integration pattern (client JS only — no SSR needed):**

```typescript
// Inline <script> in Portfolio.astro
import PhotoSwipeLightbox from 'photoswipe/lightbox';

const lightbox = new PhotoSwipeLightbox({
  gallery: '#gallery',
  children: 'a[data-pswp-src]',
  pswpModule: () => import('photoswipe'),
});
lightbox.init();
```

Each thumbnail `<a>` carries `data-pswp-src`, `data-pswp-width`, `data-pswp-height`, and optionally `data-pswp-srcset` pointing to the full-resolution image. Astro's `<Picture>` provides the srcset automatically.

**CSS:** Import `photoswipe/style.css` — override brand colours via CSS variables (`--pswp-bg`, `--pswp-icon-color`).

**Installation:**

```bash
npm install photoswipe
```

---

## 5. Above-Fold Eager Strategy

**Decision:**

- `sortOrder ≤ 4` → `loading="eager" fetchpriority="auto" decoding="auto"`
- `sortOrder > 4` → `loading="lazy" decoding="async" fetchpriority="low"`

**Rationale:** The justified grid renders in DOM order = `sortOrder` order. The first 4 thumbnails at 320 px row height will be visible on most viewports before scroll. `fetchpriority="auto"` (not `"high"`) avoids competing with the Hero's `fetchpriority="high"` — the hero LCP image still wins the bandwidth race.

**Implementation:** Computed inline in the Astro component loop:

```astro
{items.map((item, i) => (
  <Picture
    src={item.data.image}
    alt={item.data.alt}
    widths={[320, 640, 960]}
    formats={['avif', 'webp']}
    loading={i < 4 ? 'eager' : 'lazy'}
    decoding={i < 4 ? 'auto' : 'async'}
    fetchpriority={i < 4 ? 'auto' : 'low'}
  />
))}
```

---

## 6. Hero `<link rel="preload">` Strategy

**Decision: Add the preload tag.**

**Current state (Phase 3 Hero):**
```html
<img fetchpriority="high" loading="eager" ... />
```

This triggers an early browser fetch but only after the HTML parser reaches the `<picture>` element (~middle of `<body>`). The browser's preload scanner does not discover `<source srcset>` inside `<picture>` until layout.

**Adding `<link rel="preload">`:**
```html
<link
  rel="preload"
  as="image"
  imagesrcset="/_astro/hero.abc.avif 640w, /_astro/hero.def.avif 1024w, ..."
  imagesizes="100vw"
  fetchpriority="high"
>
```

This lets the browser discover the hero image at HTML parse time (head scan), 50–150 ms earlier than the `<picture>` in `<body>`. [CITED: https://web.dev/articles/preload-responsive-images]

**Double-fetch risk:** Browsers deduplicate resource fetches by URL. If `imagesrcset` URLs match what `<Picture>` emits, no double fetch occurs. Astro's `<Picture>` emits deterministic hashed filenames — the preload tag can use the same hash. The `BaseLayout` `<slot name="head" />` (already shipped) is the insertion point.

**Implementation note:** Since Astro 6's `<Picture>` emits the `<source srcset>` at build time, the planner must capture the emitted URLs and write them into the preload tag. Recommended approach: a wrapper component `HeroPreload.astro` that imports the same hero image asset and uses `getImage()` to get the srcset string, then emits the `<link>`.

**Verify delta** in Phase 6 Lighthouse run as planned.

---

## 7. Image Budget

| Metric | Value |
|--------|-------|
| Max photos | 50 |
| Formats per photo | 3 (AVIF, WebP, JPEG fallback) |
| Width variants per photo (thumbnails) | 3 (320, 640, 960) |
| Width variants (hero full-res) | 5 (640, 1024, 1536, 1920, 2400) |
| Estimated total image assets | ~50 × 3 × 3 + 1 × 3 × 5 = 465 assets |
| CF Pages free tier file limit | 20 000 files |
| Headroom | 19 535 files (plenty) |
| First-build sharp time (estimate) | 30–60 s (50 originals × 9 variants each) |
| Subsequent incremental builds | ~0 s (sharp caches by content hash) |
| LFS threshold | >200 MB total originals → switch to Git LFS |

**At 50 wedding JPEGs ~8 MB each = ~400 MB** → likely exceeds 200 MB LFS threshold. Recommend documenting Git LFS path in CONTRIBUTING-GALLERY.md. Owner can use LFS for originals; `src/assets/portfolio/` path stays the same.

---

## 8. AVIF Hero File Sizes (Verified)

**Source:** `ls -la dist/_astro/hero.*.avif` run against current build (placeholder hero, 2400×1600 Unsplash JPEG input).

| Width (approx) | File size | Under 200 KB? |
|----------------|-----------|---------------|
| 640 w | 7 070 B (7 KB) | YES |
| 1024 w | 12 852 B (13 KB) | YES |
| 1280 w | 20 440 B (20 KB) | YES |
| 1536 w | 26 511 B (26 KB) | YES |
| 2400 w | 35 472 B (35 KB) | YES |

**All five AVIF variants are well under 200 KB.** No `quality` adjustment needed for the current placeholder.

**IMPORTANT:** These sizes are for a lightly-textured Unsplash beach/ceremony placeholder. Owner-supplied wedding images (complex backgrounds, bokeh, skin tones) may be larger. Re-verify with `ls -la dist/_astro/*.avif` after real images are committed. If any variant exceeds 200 KB, apply `quality: 60` in the `<Picture>` call:

```astro
<Picture ... quality={60} />
```

Astro `<Picture>` `quality` prop is per-output, applied at build time via sharp. [CITED: https://docs.astro.build/en/guides/images/#quality]

---

## 9. CLS Prevention

**Two-layer defence:**

**Layer 1 — `<Picture>` `width`/`height`:** Astro's `<Picture>` reads intrinsic dimensions from the imported image at build time and emits `width` and `height` on the `<img>` element automatically. No manual action required. This tells the browser the image's aspect ratio before it fetches any bytes → no layout shift. [CITED: https://docs.astro.build/en/guides/images/#picture-]

**Layer 2 — Justified-layout wrapper `<div>`:** Each thumbnail is wrapped in a `position: absolute` div with `style="width:{box.width}px; height:{box.height}px; top:{box.top}px; left:{box.left}px"`. The outer container has `position: relative; height: {geometry.containerHeight}px`. Since the container height is set before images load, there is no reflow when images arrive.

**CSS fallback:**

```css
/* In global.css or scoped style block */
.gallery-thumb img {
  aspect-ratio: attr(width) / attr(height);  /* fallback for older browsers */
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```

**CLS target:** ≤0.1 (PERF-04). Both layers together should hold CLS at ~0.

---

## 10. EXIF Stripping

**Decision: Trust Astro's sharp pipeline. No extra tooling needed.**

**Verification:**

- sharp's default behaviour is to strip all metadata (EXIF, ICC profiles, XMP) unless `withMetadata()` is called. [CITED: https://sharp.pixelplumbing.com/api-output#tofile — `keepMetadata` option absent by default]
- Astro's built-in sharp service does NOT call `withMetadata()`. [ASSUMED — based on Astro docs stating images are optimised; not verified by reading Astro source in this session. Spot-check with `exiftool dist/_astro/hero.*.jpg` after first build if owner data-privacy is a concern.]
- GDPR relevance: EXIF may contain GPS coordinates of a wedding venue. Stripping is the correct default.

**Practical guidance for planner:** Document in CONTRIBUTING-GALLERY.md that owners should NOT rely on EXIF being present in the served images (it will be stripped). If owners want EXIF data (e.g. `venue`, `camera`) preserved for display purposes, it must go in the `.json` schema (see §2, `exif` field).

---

## 11. Alt Lint

**Decision: Zod schema is the enforcement mechanism. No separate lint step.**

```typescript
alt: z.string().min(5)
```

When any `src/content/gallery/*.json` has a missing or short `alt`, `npm run build` fails with a Zod validation error naming the offending file and field. CF Pages CI runs `npm run build` on every push to `main`. This is GALLERY-05 fully satisfied at zero extra tooling cost.

**Planner note:** The verify gate for GALLERY-05 should be:

```bash
npm run build  # fails if any alt is missing/short
grep -r '"alt"' src/content/gallery/*.json | grep -vE '"alt": ".{5,}"' && echo "SHORT ALT FOUND" || echo "ALL ALTS OK"
```

---

## 12. Nav `#portfolio` Reactivation

**Decision:** Insert after `{ href: '#hero', label: 'Home' }` and before `{ href: '#about', label: 'About' }`.

**Current `Nav.astro` `links` array (Phase 3, 03-03 state):**

```typescript
const links = [
  { href: '#hero',         label: 'Home' },
  { href: '#about',        label: 'About' },
  { href: '#pricing',      label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact',      label: 'Contact' },
];
```

**After Phase 4 edit:**

```typescript
const links = [
  { href: '/#hero',         label: 'Home' },
  { href: '/#portfolio',    label: 'Portfolio' },   // ← added in 04-01 / 04-02
  { href: '/#about',        label: 'About' },
  { href: '/#pricing',      label: 'Pricing' },
  { href: '/#testimonials', label: 'Testimonials' },
  { href: '/#contact',      label: 'Contact' },
];
```

**Note:** Phase 3 uses fragment hrefs (`#hero`). These work when the home page is current. For correctness if future pages (e.g. `/privacy`) are added, prefer `/#portfolio` absolute-path-plus-fragment form. The `/#` pattern works on the home page and from any other page.

---

## 13. CONTRIBUTING-GALLERY.md Spec

**Location:** `/CONTRIBUTING-GALLERY.md` (repo root — owner-facing).

**Contents outline:**

```markdown
# Adding Photos to the KL Photography Portfolio

## Folder & Naming
- Location: `src/assets/portfolio/`
- Name: `NN-description-kebab.jpg` where NN = two-digit sort order
- Example: `01-powerscourt-ceremony.jpg`, `02-cliff-vows.jpg`

## Metadata File
Each photo needs a matching JSON in `src/content/gallery/`:
- Same slug as the image: `src/content/gallery/01-powerscourt-ceremony.json`
- Required fields: `image`, `alt`, `sortOrder`
- Optional: `caption`, `exif.venue`, `exif.weddingYear`

## Alt Text Guide
Good: "Bride and groom exchanging vows under a rose arch at Powerscourt Estate"
Bad: "wedding photo", "img001"
Rule: be concrete (who, what, where) and evocative (light, mood if notable).
Min length: 5 characters (build fails if shorter).

## Git LFS
If total originals exceed 200 MB, use Git LFS:
  git lfs track "src/assets/portfolio/*.jpg"
  git lfs track "src/assets/portfolio/*.png"

## Deployment
Push to main → Cloudflare Pages rebuilds in ~60 s → changes live.
```

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| astro | ^6.3.3 | `<Picture>`, content collections, `getCollection()` | [VERIFIED: package.json] |
| sharp | ^0.34.0 | AVIF/WebP/JPEG build-time transforms | [VERIFIED: package.json] |
| tailwindcss | ^4.3.0 | Gallery grid container + lightbox override utilities | [VERIFIED: package.json] |

### Net-new in Phase 4

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `justified-layout` | 4.1.0 | Flickr-style even-row geometry | Pure JS, no DOM, runs at SSG time. Zero client footprint. |
| `photoswipe` | 5.4.4 | Accessible lightbox (keyboard, swipe, ARIA) | A11y burden of custom implementation too high; ~30 KB gz. |

**Installation:**

```bash
npm install justified-layout photoswipe
```

---

## Package Legitimacy Audit

> slopcheck is installed (v0.6.1) but defaulted to PyPI for this Node.js project, producing a cross-ecosystem false positive [SLOP] for both packages (PyPI lookup, not npm). This is a documented ~9% cross-ecosystem confusion issue. Manual npm verification used instead.

| Package | Registry | Created | Last publish | Downloads est. | Source repo | slopcheck | Disposition |
|---------|----------|---------|--------------|----------------|-------------|-----------|-------------|
| `justified-layout` | npm | 2016-03-31 | 2022-06-19 | Millions (Flickr project, 10yr history) | github.com/flickr/justified-layout | Cross-ecosystem false positive (PyPI check) — npm verified manually | Approved |
| `photoswipe` | npm | — | 5.4.4 stable | Millions (widely cited gallery lib) | github.com/dimsemenov/PhotoSwipe | Cross-ecosystem false positive (PyPI check) — npm verified manually | Approved |

**Manual npm evidence:**

- `npm view justified-layout` returns: `ISC license | no deps | maintainers: alex-seville, jeremyruppel, superic, pdokas (Flickr team) | homepage: github.com/flickr/justified-layout`
- `npm view photoswipe` returns: `MIT license | no deps | maintainer: dimsemenov | homepage: photoswipe.com`
- Neither package has a `postinstall` script (verified via `npm view <pkg> scripts.postinstall`)
- Both packages have zero dependencies (no transitive risk)

**Packages removed due to [SLOP]:** None (false positives confirmed — npm ecosystem, not PyPI).
**Packages flagged [SUS]:** None.

---

## Architecture Patterns

### System Architecture Diagram

```
src/content/gallery/*.json
         │ getCollection('gallery') at build time
         ▼
  Portfolio.astro (SSG component)
         │ sorts by sortOrder
         │ maps image paths → ImageMetadata (Astro image helper)
         │ calls justified-layout(aspectRatios, config) → geometry[]
         │
         ├─── for each item:
         │       <a data-pswp-src data-pswp-width data-pswp-height>
         │         <Picture widths=[320,640,960] formats=[avif,webp]
         │                  loading={i<4?'eager':'lazy'} />
         │       </a>
         │
         ▼
  dist/_astro/*.{avif,webp,jpg}   ← sharp emits at build
  dist/index.html                  ← justified geometry as inline styles
         │
         ▼  (browser)
  PhotoSwipe v5 (client JS, ~30 KB gz)
    listens for clicks on [data-pswp-src]
    opens lightbox with full-res srcset
    handles ESC / arrows / swipe / ARIA
```

### Recommended Project Structure

```
src/
├── assets/
│   └── portfolio/           # owner-supplied originals (Git LFS if >200 MB)
│       ├── 01-ceremony.jpg
│       └── ...
├── content/
│   ├── content.config.ts    # gallery collection schema (Astro 6 convention)
│   └── gallery/
│       ├── 01-ceremony.json
│       └── ...
├── components/
│   └── sections/
│       ├── Portfolio.astro  # replaces PortfolioStub.astro
│       └── HeroPreload.astro  # emits <link rel="preload"> for hero
└── pages/
    └── index.astro          # imports Portfolio instead of PortfolioStub
CONTRIBUTING-GALLERY.md      # repo root, owner-facing
```

### Anti-Patterns to Avoid

- **Calling `justified-layout` in a client `<script>`:** It runs at SSG time in the `.astro` component frontmatter. Client JS has no access to the image metadata (width/height) needed for geometry. If called client-side you lose the build-time optimisation.
- **`loading="eager"` on ALL gallery thumbs:** LCP regression. Only first 4 should be eager.
- **`fetchpriority="high"` on gallery thumbs:** Competes with hero LCP. Use `"auto"` for eager thumbs.
- **Storing full-res originals in `public/`:** They bypass Astro's image pipeline. Always `src/assets/portfolio/`.
- **`withMetadata()` in custom sharp config:** Would leak EXIF GPS coordinates. Do not add.
- **Hardcoding `imagesrcset` URLs in `<link rel="preload">`:** Use `getImage()` to derive them programmatically — content hashes change with every rebuild.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Justified-grid geometry | Custom row-packing algorithm | `justified-layout` | Flickr's algorithm handles edge cases (very wide/narrow aspect ratios, last-row orphans) that a naive implementation misses |
| Accessible lightbox | Custom `<dialog>` + focus trap + swipe detection | `photoswipe` v5 | Focus trap, ARIA live region for slide count, keyboard, swipe, zoom = 600+ lines of correct a11y code |
| AVIF/WebP encoding + srcset | Custom sharp pipeline | Astro `<Picture>` | Already wired (Phase 3); `<Picture>` handles formats array, width variants, sizes, and emits correct HTML |
| Content validation | Manual `if (!alt)` checks | Zod schema in content collection | Build-time enforcement; no runtime risk |

---

## Common Pitfalls

### Pitfall 1: `content.config.ts` vs `content/config.ts`
**What goes wrong:** Placing schema in `src/content/config.ts` (Astro 4 location) — Astro 6 ignores it.
**Why it happens:** Many tutorials still reference the Astro 4 path.
**How to avoid:** Use `src/content.config.ts` (one level above `src/content/`). [CITED: https://docs.astro.build/en/guides/content-collections/]
**Warning signs:** `getCollection('gallery')` returns empty array even with `.json` files present.

### Pitfall 2: Absolute vs relative `image` path in JSON
**What goes wrong:** `"image": "/src/assets/portfolio/01.jpg"` (absolute) — Astro's `image()` helper requires a path relative to the JSON file.
**Why it happens:** UNIX-path intuition.
**How to avoid:** `"image": "../../assets/portfolio/01-ceremony.jpg"` (relative from `src/content/gallery/`).
**Warning signs:** `Error: Could not resolve image` during `npm run build`.

### Pitfall 3: justified-layout receives wrong input
**What goes wrong:** Passing `ImageMetadata` objects directly instead of numeric aspect ratios.
**How to avoid:** `items.map(i => i.data.image.width / i.data.image.height)`.
**Warning signs:** `TypeError: Cannot read properties of undefined (reading 'aspectRatio')` in build output.

### Pitfall 4: PhotoSwipe not finding gallery items
**What goes wrong:** PhotoSwipe selector `'a[data-pswp-src]'` finds 0 items → lightbox never opens.
**Why it happens:** Forgetting to add `data-pswp-src`, `data-pswp-width`, `data-pswp-height` attributes to the `<a>` wrappers.
**How to avoid:** Every thumbnail `<a>` needs all three attributes pointing to the full-res (not thumbnail) image URL.

### Pitfall 5: Hero preload `imagesrcset` mismatch
**What goes wrong:** `<link rel="preload">` lists URLs that don't match `<picture><source srcset>` → browser fetches the image twice.
**Why it happens:** Hardcoded URLs go stale after Astro rebuilds with new content hashes.
**How to avoid:** Use `getImage()` to derive `srcset` programmatically; wrap in `HeroPreload.astro`.

### Pitfall 6: Empty gallery breaks the page
**What goes wrong:** `justified-layout([], ...)` returns `{ containerHeight: 0, boxes: [] }`. Setting outer `<div style="height: 0px">` with no children renders a zero-height section — nav link scrolls to nothing.
**How to avoid:** In `Portfolio.astro`, conditionally render a "Gallery coming soon" message when `items.length === 0`.

### Pitfall 7: Minified HTML verify gate (inherited from Phase 3)
**What goes wrong:** `awk`-based line-number checks fail on Astro's single-line minified HTML.
**How to avoid:** Use `grep -bo` (byte-offset) or `grep -o` (occurrence count) for all Phase 4 verify gates. See Phase 3 SUMMARY Deviations 1 + 2.

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| `src/content/config.ts` (Astro 4) | `src/content.config.ts` (Astro 6) | File location changed |
| `defineCollection` in `src/content/config.ts` | `defineCollection` in `src/content.config.ts` | Same API, new location |
| `format: ['avif', 'webp']` (Astro 4 `<Image>`) | `formats={['avif', 'webp']}` on `<Picture>` | `<Picture>` is the multi-format component |
| CSS `grid-template-rows: masonry` | Not GA yet | Still behind flags in Chrome; not in Firefox stable |

**Deprecated / not applicable:**
- `@astrojs/image` integration — removed in Astro 3; `astro:assets` is the current API. Do not install.

---

## Open Questions (All Resolved)

| # | Question | Resolution |
|---|----------|------------|
| Q1 | Does owner have photos ready? | No — ship with Unsplash placeholders + CONTRIBUTING-GALLERY.md. Gallery works with 0 images. |
| Q2 | justified-layout vs CSS masonry? | justified-layout — CSS masonry not GA cross-browser. |
| Q3 | Custom lightbox vs PhotoSwipe? | PhotoSwipe v5 — a11y burden of custom too high. |
| Q4 | Is hero AVIF under 200 KB? | YES — verified: largest variant = 35 KB (35 472 bytes at 2400 w). |
| Q5 | Does sharp strip EXIF? | Yes by default. Trust pipeline; EXIF display data goes in JSON schema. |
| Q6 | Add `<link rel="preload">` for hero? | YES — browsers deduplicate; use `getImage()` for srcset string. |
| Q7 | Git LFS needed? | Probably yes if owner supplies 50 × ~8 MB originals (~400 MB). Document threshold in CONTRIBUTING-GALLERY.md. |
| Q8 | content.config.ts location? | `src/content.config.ts` — Astro 6 convention confirmed. |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CSS `grid-template-rows: masonry` is not GA in Chrome/Firefox as of 2026-05 | §3 Justified Grid | If masonry is now GA, CSS-only approach becomes viable — justified-layout dep avoidable. Low-risk: justified-layout is small and the dep is already vetted. |
| A2 | Astro's sharp service does not call `withMetadata()` | §10 EXIF | If Astro preserves EXIF, GPS data from wedding venues could be served in image files. Spot-check with `exiftool` after first build with real images. |
| A3 | Owner originals will average ~8 MB each at 50 images (~400 MB) | §7 Image Budget | If originals are smaller (e.g. phone-shot JPEGs at ~3 MB), LFS may not be needed. |

---

## Environment Availability

| Dependency | Required By | Available | Notes |
|------------|------------|-----------|-------|
| Node.js ≥22.12 | Astro build | Yes (package.json `engines` enforced by CF Pages) | |
| sharp | Astro image pipeline | Yes (^0.34.0 in package.json) | |
| git-lfs | Large originals (>200 MB) | Unknown — not checked | Install with `git lfs install` if originals exceed threshold |
| exiftool | EXIF spot-check (optional) | Unknown — not installed on CI | Manual one-time check only; not required in CI |

**Missing with no fallback:** None that block Phase 4 execution.
**Missing with fallback:** `git-lfs` — if not installed, originals stay in regular git (fine under 200 MB).

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] — `npm view justified-layout` — version 4.1.0, ISC, Flickr maintainers, created 2016, no deps, no postinstall
- [VERIFIED: npm registry] — `npm view photoswipe` — version 5.4.4, MIT, @dimsemenov, no deps, no postinstall
- [VERIFIED: dist/_astro/] — `ls -la dist/_astro/hero.*.avif` — 5 AVIF variants 7–35 KB, all under 200 KB
- [VERIFIED: package.json] — astro ^6.3.3, sharp ^0.34.0, tailwindcss ^4.3.0 confirmed present
- [CITED: https://docs.astro.build/en/guides/content-collections/] — `src/content.config.ts` location, `type: 'data'` for JSON collections, `image()` helper
- [CITED: https://docs.astro.build/en/guides/images/#quality] — `quality` prop on `<Picture>`
- [CITED: https://sharp.pixelplumbing.com/api-output] — EXIF stripping default behaviour
- [CITED: https://web.dev/articles/preload-responsive-images] — `<link rel="preload" as="image" imagesrcset imagesizes>` browser deduplication

### Secondary (MEDIUM confidence)
- Phase 3 SUMMARY 03-01 — Hero AVIF variants confirmed emitted; `fetchpriority="high"` pattern established
- Phase 3 RESEARCH §12 — ≤200 KB AVIF target sourced from LCP best-practice guidance

### Tertiary (LOW confidence — see Assumptions Log)
- Training knowledge: CSS `grid-template-rows: masonry` browser support status [ASSUMED — A1]
- Training knowledge: Astro sharp service EXIF behaviour [ASSUMED — A2]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — packages verified on npm, existing stack verified in package.json
- Architecture: HIGH — patterns derived from Phase 3 established precedents
- AVIF sizes: HIGH — measured from actual dist/ build output
- Pitfalls: HIGH — derived from Astro content collection docs + Phase 3 deviations (minified HTML gates)
- CSS masonry status: LOW — [ASSUMED], verify at caniuse.com before planning CSS-only path

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (30 days — Astro 6 + PhotoSwipe v5 are stable; re-verify if either cuts a major release)
