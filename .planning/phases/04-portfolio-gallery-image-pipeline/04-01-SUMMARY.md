---
phase: 04-portfolio-gallery-image-pipeline
plan: 01
subsystem: content
tags: [astro-content-collections, astro-image, sharp, justified-layout, photoswipe, zod, owner-content-intake]

# Dependency graph
requires:
  - phase: 03-static-content-sections
    provides: Hero/About/Nav components that consume placeholder images + the PortfolioStub anchor target now upgraded to load the gallery collection
provides:
  - "gallery content collection at src/content/gallery/{slug}.json"
  - "Zod schema in src/content.config.ts with type=data + glob loader + image() helper + alt.min(5) enforcement"
  - "18 owner-curated wedding photos in src/assets/portfolio/ (8 landscape + 9 portrait + 1 square)"
  - "src/assets/portfolio/LICENSES.md (owner copyright table)"
  - "CONTRIBUTING-GALLERY.md at repo root (folder + naming + JSON schema + alt guide + LFS + deployment)"
  - "src/assets/placeholder/hero.jpg replaced with real ceremony-aisle landscape (owner)"
  - "src/assets/placeholder/about-portrait.jpg replaced with photographer self-portrait (owner)"
  - "src/assets/brand/logo.jpg + Nav.astro brand link rendering owner logo via astro:assets <Image>"
  - "photos/ raw intake gitignored (~186MB stays local)"
affects: [04-02-portfolio-gallery, 04-03-hero-preload, 06-launch-perf]

# Tech tracking
tech-stack:
  added:
    - "justified-layout@4.1.0 (Flickr, ISC, zero deps)"
    - "photoswipe@5.4.4 (MIT, @dimsemenov, zero deps)"
  patterns:
    - "Content collection loader: glob({ pattern: '*.json', base: './src/content/gallery' }) — Astro 6 idiom (type:'data' shorthand without loader leaves collection lazy + Zod inactive)"
    - "Alt-lint enforcement via Zod schema + active getCollection() consumer in build graph (build IS the lint, no separate CI script)"
    - "Image source pre-sizing: when source intrinsic width >> largest layout slot, pre-resize to ~4x density of largest variant so Astro's <picture> srcset fallback stays bounded"

key-files:
  created:
    - "src/content.config.ts"
    - "src/content/gallery/01-ceremony-aisle.json (and 02-18.json)"
    - "src/assets/portfolio/01-ceremony-aisle.jpg (and 02-18.jpg)"
    - "src/assets/portfolio/LICENSES.md"
    - "src/assets/brand/logo.jpg"
    - "CONTRIBUTING-GALLERY.md"
    - ".planning/phases/04-portfolio-gallery-image-pipeline/04-01-SUMMARY.md"
  modified:
    - ".gitignore (added photos/)"
    - "package.json + package-lock.json (justified-layout + photoswipe)"
    - "src/assets/placeholder/hero.jpg (replaced with owner ceremony-aisle photo)"
    - "src/assets/placeholder/about-portrait.jpg (replaced + resized 4000x4919 -> 1920x2361)"
    - "src/assets/placeholder/LICENSES.md (Unsplash attribution -> owner copyright)"
    - "src/components/ui/Nav.astro (brand link renders <Image> logo)"
    - "src/components/sections/PortfolioStub.astro (now calls getCollection('gallery') to trigger Zod + surfaces 18-photo count)"

key-decisions:
  - "Skipped Unsplash placeholder download — owner provided real assets at execution time, so the [OWNER-PROVIDE] marker convention from plan was dropped in favour of straight owner-content intake"
  - "Curated 18 photos (plan target 6-8) — more variety for the justified-grid in 04-02, all from real-camera prefixes (_DSC / A7B / DSC), zero smartphone snapshots (excluded 20240116_* per owner instruction)"
  - "Used glob loader (not type:'data' alone) — Astro 6 requires explicit loader to populate collection + fire Zod (RESEARCH §2's shorthand example was incomplete)"
  - "Added getCollection('gallery') call inside PortfolioStub.astro — collection is lazy in Astro 6; needs an active consumer in build graph to trigger validation"
  - "Pre-resized about-portrait source (4000x4919 -> 1920x2361) — Astro <Image> emits an intrinsic-width fallback regardless of widths prop; a 14MB source produced a 2.8MB webp fallback (oversized for non-LCP)"
  - "Logo + wordmark on sm:+ viewports; logo-only on <sm: to avoid clutter; logo width 40/48 px (mobile/desktop), object-contain, rounded-sm"

patterns-established:
  - "Owner photo intake: raw photos/ folder gitignored; curated subset copied to src/assets/portfolio/ with NN-slug.jpg naming; LICENSES.md tracks source filename per entry"
  - "Content collection alt-text style: concrete + evocative (who/what/where + mood/light), all >= 5 chars; placeholder captions OK for sortOrder grouping (Ceremony / Reception / Portrait / Detail)"
  - "Astro 6 content-collection idiom: defineCollection({ loader: glob(...), schema: ({image}) => z.object({...}) }) — loader is required for the validator to fire"

requirements-completed: [GALLERY-05, GALLERY-06, GALLERY-07]

# Metrics
duration: ~50 min
completed: 2026-05-17
---

# Phase 4 Plan 01: Portfolio Content Collection + Owner Asset Intake Summary

**Gallery content collection wired up with glob loader + Zod alt-lint, 18 owner-curated wedding photos and metadata committed, owner logo + hero + about portrait swapped into the existing Phase 3 components without code changes to Hero/About.**

## Performance

- **Duration:** ~50 min
- **Started:** 2026-05-17T20:48:00Z
- **Completed:** 2026-05-17T21:38:00Z
- **Tasks:** 6 (gitignore, install, curate, hero+about swap, logo, docs+alt-lint test)
- **Files modified / created:** 31 (18 JPGs + 18 JSONs + schema + 2 LICENSES + CONTRIBUTING + Nav + PortfolioStub + 3 placeholder/brand assets + .gitignore + package.{json,lock} + SUMMARY)

## Accomplishments

- 18 owner-curated wedding photos committed to `src/assets/portfolio/` with kebab-case `NN-slug.jpg` names and matching JSON metadata under `src/content/gallery/`.
- Astro 6 content-collection schema (`src/content.config.ts`) defining the `gallery` collection with **glob loader + Zod alt-text enforcement** — proven by an active break/fix test (blank any alt -> `InvalidContentEntryDataError ... alt: Too small: expected string to have >=5 characters` -> build exits 1).
- Owner real photos replace the Phase 3 Unsplash placeholders in three places (Hero, About, Nav brand) with zero code changes to `Hero.astro` / `About.astro` — only the placeholder JPG paths were overwritten + Nav.astro brand link gained an `<Image>` element.
- `CONTRIBUTING-GALLERY.md` at repo root explains the intake flow for the owner so they can rename / replace photos / edit alt text without further engineering involvement.
- 186MB raw photo intake folder gitignored before any commit touched it.

## Curated Photo List

| # | Filename | Dimensions | AR | Orientation | Source size |
|--:|----------|-----------:|---:|:-----------:|------------:|
| 01 | 01-ceremony-aisle.jpg | 2048x1365 | 1.50 | Landscape | 2080 KB |
| 02 | 02-couple-portrait-wide.jpg | 2048x1216 | 1.68 | Landscape | 2216 KB |
| 03 | 03-reception-toasts.jpg | 2048x1310 | 1.56 | Landscape | 2282 KB |
| 04 | 04-bridal-prep.jpg | 1800x1200 | 1.50 | Landscape | 1600 KB |
| 05 | 05-detail-rings.jpg | 1487x1200 | 1.24 | Landscape (softer) | 1589 KB |
| 06 | 06-first-dance.jpg | 2048x1365 | 1.50 | Landscape | 2562 KB |
| 07 | 07-garden-vows.jpg | 3000x2000 | 1.50 | Landscape | 1662 KB |
| 08 | 08-confetti-exit.jpg | 2048x1366 | 1.50 | Landscape | 1588 KB |
| 09 | 09-bride-portrait.jpg | 1365x2048 | 0.67 | Portrait | 1221 KB |
| 10 | 10-groom-portrait.jpg | 1787x2048 | 0.87 | Portrait (near-sq) | 3368 KB |
| 11 | 11-first-look.jpg | 2048x2048 | 1.00 | Square | 2467 KB |
| 12 | 12-bouquet-detail.jpg | 1883x2048 | 0.92 | Portrait (near-sq) | 2185 KB |
| 13 | 13-cliffside-portrait.jpg | 1682x2048 | 0.82 | Portrait | 3488 KB |
| 14 | 14-veil-twirl.jpg | 1619x2048 | 0.79 | Portrait | 3403 KB |
| 15 | 15-candle-ceremony.jpg | 1533x2048 | 0.75 | Portrait | 2552 KB |
| 16 | 16-golden-hour-portrait.jpg | 1365x2048 | 0.67 | Portrait | 3572 KB |
| 17 | 17-ring-exchange.jpg | 1014x1184 | 0.86 | Portrait (intimate) | 1580 KB |
| 18 | 18-couple-walking.jpg | 4000x6000 | 0.67 | Portrait (full-res) | 2700 KB |

**Variety summary:** 8 landscape (AR 1.24–1.68) + 9 portrait (AR 0.67–0.92) + 1 square (1.00). Aspect ratios deliberately varied so the justified-grid layout in 04-02 has interesting row geometry rather than uniform 3:2 rectangles. Total intake size: **42 MB** (below 200 MB Git LFS threshold).

## Logo Integration

- Source: `photos/about/KL photography logo1.jpg` (692x693 square).
- Copied to: `src/assets/brand/logo.jpg`.
- Render: `Nav.astro` brand link `<a>` now contains `<Image src={logo} alt={brand} width={48} height={48} loading="eager" decoding="async" class="h-10 w-10 sm:h-12 sm:w-12 rounded-sm object-contain" />` plus the wordmark `<span class="hidden sm:inline">{brand}</span>` (hidden below sm: viewport so the brand area stays uncluttered next to the hamburger).
- Astro emits `dist/_astro/logo.DhSCUukY_ZpGjg7.webp` (~570 bytes — heavily compressed black-on-white logo).
- Verified rendered in `dist/index.html`: `<img src="/_astro/logo.DhSCUukY_ZpGjg7.webp" alt="KL Photography" loading="eager" decoding="async" width="48" height="48" ...>`
- Sticky-scroll, IntersectionObserver, hamburger toggle, ARIA, focus-visible, mobile menu close behaviour — all preserved from Plan 03-03.

## Hero + About Swap Evidence

**Hero AVIF variants (must each be ≤200 KB per PERF-01):**

```
dist/_astro/hero.C7HmOWLP_CqpJE.avif   16 KB
dist/_astro/hero.C7HmOWLP_mvw37.avif   28 KB
dist/_astro/hero.C7HmOWLP_2kRWFr.avif  42 KB
dist/_astro/hero.C7HmOWLP_1LMOi0.avif  53 KB
dist/_astro/hero.C7HmOWLP_ZmwAIK.avif  57 KB   <- max
```

**Max hero AVIF = 58984 B = ~57.6 KB. Headroom vs 200 KB target: 71%.**

**About portrait webp variants:**

```
dist/_astro/about-portrait.CfLW3rQt_Z10Bbw3.webp  480x590    40 KB
dist/_astro/about-portrait.CfLW3rQt_bTKth.webp    720x885   100 KB
dist/_astro/about-portrait.CfLW3rQt_Z2sPuVM.webp  960x1181  180 KB
dist/_astro/about-portrait.CfLW3rQt_Z1UgA2h.webp  1920x2361 627 KB  <- intrinsic-width fallback
```

(The 1920w fallback is the `<img src>` value; 480/720/960 are the srcset variants the browser actually picks for the layout. Source was pre-resized 4000x4919 → 1920x2361 to keep the fallback bounded — see Deviation 4.)

## Active Proof of GALLERY-05 (Zod alt-lint enforcement)

Captured during the break/fix test in the final task commit. Blanking `src/content/gallery/05-detail-rings.json`'s `alt` field to `""`:

```
[InvalidContentEntryDataError] gallery → 05-detail-rings data does not match collection schema.

  alt: Too small: expected string to have >=5 characters

  Hint:
    See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.
  Error reference:
    https://docs.astro.build/en/reference/errors/invalid-content-entry-data-error/
  Location:
    C:\projects\new-project\src\content\gallery\05-detail-rings.json:0:0
```

Build exit code: **1** (non-zero). Restoring the alt → build exit code 0. The Zod schema fires at the loader level, naming both the file and the violating field — meets and exceeds GALLERY-05.

## Task Commits

1. **chore(04-01): gitignore raw photo intake** — `a71aead`
2. **chore(04-01): install justified-layout + photoswipe** — `cf9b9ce`
3. **feat(04-01): curate 18 portfolio photos + content collection schema** — `55fbb13`
4. **feat(04-01): swap hero + about placeholders for owner photos** — `c5572cf`
5. **feat(04-01): integrate KL Photography logo into Nav brand** — `845ca42`
6. **docs(04-01): CONTRIBUTING-GALLERY.md + alt-lint break/fix test** — `614766b`
7. **fix(04-01): pre-resize about-portrait source (4000x4919 -> 1920x2361)** — `bfbd965`

## npm Packages Installed

- `justified-layout@4.1.0` — ISC, Flickr maintainers, zero transitive deps, no postinstall (researcher pre-cleared in 04-RESEARCH Package Legitimacy Audit).
- `photoswipe@5.4.4` — MIT, @dimsemenov, zero transitive deps, no postinstall (researcher pre-cleared).
- npm audit reports 5 moderate-severity advisories in the transitive devDep tree (unrelated to these additions — present pre-install). No action.

## Decisions Made

See `key-decisions` frontmatter above. Most consequential:

1. **Drop placeholder convention entirely.** Owner provided real assets at execution time, so the entire `[OWNER-PROVIDE]` marker discipline (a defence against shipping placeholders to launch) is unnecessary — these ARE the real photos. Captions/alt-text were authored by Claude based on visual content; owner will edit before launch.

2. **Use the glob loader (not bare `type: 'data'`).** Astro 6's content layer requires an explicit loader to populate the collection. The RESEARCH §2 example showed only `type: 'data'`, which leaves the collection lazy and the Zod schema dormant — discovered during the alt-lint break/fix test (build kept passing with blank alt). Switching to `loader: glob({ pattern: '*.json', base: './src/content/gallery' })` triggers proper validation at sync/build time.

3. **Pre-resize About source.** Astro `<Image>` emits a `<picture>` `<img>` fallback at the source's intrinsic width, ignoring the `widths=[480,720,960]` prop. A 14 MB source produced a 2.8 MB fallback webp. Pre-resizing the source to 1920×2361 (4× the largest layout width for HiDPI) drops the fallback to 627 KB. Variants at 480/720/960 are unchanged (40/100/180 KB).

## Deviations from Plan

### Owner-asset overrides (planned, documented up front)

These came from the user override at execution time, not Claude's deviation rules:

**1. Skipped Unsplash download flow entirely.**
- Plan: Task 2 instructed `curl ... images.unsplash.com` for 6-8 placeholders.
- Override: Owner provided real wedding photos in `photos/weddings/`.
- Action: Curated 18 photos from `photos/weddings/` with clean kebab-case names, excluded `20240116_*` smartphone snapshots per owner curation rules.

**2. Expanded photo count 6-8 → 18.**
- Plan target was 6-8 to keep placeholder fixture small.
- Override: 18 real photos give the justified-grid in 04-02 richer geometry (8 landscape, 9 portrait, 1 square).

**3. Replaced LICENSES.md format (Unsplash attribution → owner copyright table).**
- No Unsplash photo ID / photographer / source URL columns (irrelevant for owner content).
- Replaced with source-filename-in-intake column so owner can trace which raw file became which curated slug.

**4. Swapped Phase 3 placeholders in same wave.**
- 03-01-SUMMARY had flagged the hero/about swap as a Phase 4 BLOCKER (owner-driven). Owner provided the assets so we swapped now: `src/assets/placeholder/hero.jpg` ← `01-ceremony-aisle.jpg`; `src/assets/placeholder/about-portrait.jpg` ← pre-resized DSC01493 self-portrait. Hero.astro + About.astro unchanged (per override: "DO NOT modify these — just replace the placeholder JPGs they import").

**5. Logo integration into Nav.**
- Not in original 04-01 plan (Nav had a text-only "KL Photography" brand wordmark).
- Override: Owner provided `KL photography logo1.jpg`. Integrated as `<Image>` with width/height 48, plus the wordmark `<span class="hidden sm:inline">` so mobile shows logo-only.

### Auto-fixed Issues (deviation rules)

**6. [Rule 1 - Bug] Zod alt-lint was silently dormant**
- **Found during:** Task 6 alt-lint break/fix test.
- **Issue:** Initial schema used the RESEARCH §2 example (`defineCollection({ type: 'data', schema: ... })`) without an explicit loader. Astro 6 content layer treats this as a no-op for validation — `getCollection('gallery')` returned the right entries but blanking an `alt` to `""` did NOT fail the build (warning logged + entry dropped, no error).
- **Fix:** Added `loader: glob({ pattern: '*.json', base: './src/content/gallery' })` from `'astro/loaders'`. Loader runs Zod at sync/build time and emits `InvalidContentEntryDataError` for any schema violation (build exits non-zero, names the file).
- **Files modified:** `src/content.config.ts` (added import + loader prop).
- **Verification:** Break/fix test confirmed — blank alt now produces `InvalidContentEntryDataError gallery → {slug}: alt: Too small: expected string to have >=5 characters` + non-zero exit; restore makes build green.
- **Committed in:** `614766b`.

**7. [Rule 2 - Missing Critical] Need active getCollection() consumer**
- **Found during:** Task 6.
- **Issue:** Without a `getCollection('gallery')` call anywhere in the build graph, Astro skips loader execution (lazy initialization). The schema would never fire even with the loader added.
- **Fix:** Added `const galleryCount = (await getCollection('gallery')).length` to `PortfolioStub.astro` plus a copy update so the stub now shows "18 curated photos are queued in the content collection". When 04-02 replaces PortfolioStub with the real Portfolio component, this consumer is naturally replaced by the real gallery render — but for 04-01 it's a necessary scaffolding line.
- **Files modified:** `src/components/sections/PortfolioStub.astro`.
- **Verification:** Build log now syncs the gallery content collection; break/fix test fires Zod correctly.
- **Committed in:** `614766b`.

**8. [Rule 2 - Missing Critical] About-portrait fallback webp at 2.8 MB**
- **Found during:** Plan-level verify (after Task 6 commit).
- **Issue:** Astro `<Image>` emits an "intrinsic-width fallback" variant in the `<picture>` srcset regardless of the `widths=[480,720,960]` prop. The 14 MB source JPG produced a 2.8 MB webp fallback (the `<img src>` value).
- **Fix:** Pre-resized `src/assets/placeholder/about-portrait.jpg` from 4000×4919 down to 1920×2361 with sharp (`quality: 88`). About.astro untouched. Fallback now 627 KB; layout variants (480/720/960) unchanged.
- **Files modified:** `src/assets/placeholder/about-portrait.jpg` (replaced), `src/assets/placeholder/LICENSES.md` (note added).
- **Verification:** Post-build `node` script confirms new variant sizes 40/100/180/627 KB (was 40/93/175/2792 KB).
- **Committed in:** `bfbd965`.

---

**Total deviations:** 8 documented (5 planned owner-asset overrides + 3 auto-fixed).
**Impact on plan:** Plan scope was deliberately widened by the owner override at execution time; all auto-fixes were necessary correctness fixes discovered through plan-level verification gates.

## Issues Encountered

- **Astro 6 content-layer lazy initialization.** The biggest engineering surprise — RESEARCH §2's example was incomplete (no explicit loader). Fixed in commit `614766b` after the alt-lint test exposed the silence. Now documented in this SUMMARY's "Patterns Established" section so 04-02 doesn't repeat the mistake.
- **`<Image>` intrinsic-width fallback variant.** Less obvious than the loader issue — only visible by inspecting `dist/_astro/` after build. Mitigated by source pre-resize. Pattern documented in this SUMMARY.
- **Windows file path with `~2`.** Source file `A7308338~2.jpg` (intake) copied successfully to `18-couple-walking.jpg`; no shell-quoting issues despite the tilde.

## Deferred Items

None. All plan tasks plus 5 override tasks complete; build + check both green.

## Known Stubs

- `PortfolioStub.astro` still renders "Selected work" + Instagram link copy. This stub is intentional and will be replaced by the real `Portfolio.astro` in Plan 04-02 (called out in this SUMMARY's `provides`). The stub now also calls `getCollection('gallery')` and surfaces the count — once 04-02 ships, the entire file is replaced.
- 18 `alt` strings and captions were written by Claude based on visual content; the owner is expected to refine them before launch. This is by design (avoids 18 round-trips with the owner) and documented in `src/assets/portfolio/LICENSES.md` + `CONTRIBUTING-GALLERY.md`.

## Self-Check: PASSED

12 created/modified files verified on disk (CONTRIBUTING-GALLERY.md, src/content.config.ts, sample gallery JSONs, sample portfolio JPGs, all 3 LICENSES files, logo, hero, about-portrait, SUMMARY).

7 commits verified in `git log`: `a71aead`, `cf9b9ce`, `55fbb13`, `c5572cf`, `845ca42`, `614766b`, `bfbd965`.

## Next Phase Readiness

**04-02 (Portfolio gallery component)** is unblocked and has a clear contract:

- Import: `import { getCollection } from 'astro:content'; const items = (await getCollection('gallery')).sort((a, b) => a.data.sortOrder - b.data.sortOrder);`
- Each `item.data` is typed by Zod: `{ image: ImageMetadata, alt: string, caption?: string, sortOrder: number, exif?: {...} }`.
- Aspect ratios for `justified-layout`: `items.map(i => i.data.image.width / i.data.image.height)`.
- Render: `<Picture src={item.data.image} alt={item.data.alt} widths={[320, 640, 960]} formats={['avif', 'webp']} />` inside the justified grid wrapper.
- Lightbox: `<a data-pswp-src={getImage(item.data.image, { width: 1920 }).src} data-pswp-width={item.data.image.width} data-pswp-height={item.data.image.height}>` then init PhotoSwipe v5.
- `PortfolioStub.astro` should be deleted; `index.astro` `import PortfolioStub` swapped for `Portfolio`.
- `Nav.astro` `links` array needs `{ href: '/#portfolio', label: 'Portfolio' }` added between Home and About (planned in 04-RESEARCH §12 — not done in 04-01 because Nav was already touched here for the logo and over-touching the file risks conflicts; clean separation for 04-02).

**04-03 (Hero preload + cleanup)** is unblocked; the hero is now a real owner photo and the AVIF max is 57 KB (massive headroom for the `<link rel="preload">` work).

**Blockers:** None.

## Threat Flags

None. The threat surface of 04-01 stayed inside the registered T-04-01 through T-04-05 + T-04-SC mitigations — owner content replaces the Unsplash placeholders so T-04-02 (Unsplash hot-link risk) is naturally retired; T-04-01 (EXIF stripping) is unchanged (sharp default still strips); T-04-03 (alt-lint) is actively enforced and proven. The logo addition to Nav is an in-tree image asset — no new network surface.

---
*Phase: 04-portfolio-gallery-image-pipeline*
*Plan: 01*
*Completed: 2026-05-17*
