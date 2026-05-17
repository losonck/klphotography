---
phase: 04-portfolio-gallery-image-pipeline
plan: 02
subsystem: ui
tags: [astro-picture, justified-layout, content-collections, ssg-geometry, lazy-load, photoswipe-prewire]

# Dependency graph
requires:
  - phase: 04-portfolio-gallery-image-pipeline
    plan: 01
    provides: "18-photo content collection + glob loader + Zod alt-lint + justified-layout/photoswipe deps + Nav logo"
provides:
  - "src/components/sections/Gallery.astro — justified-grid component, 100% SSG geometry, zero client JS"
  - "Nav.astro with /#portfolio link restored between Home and About"
  - "18 thumbnails in dist/index.html each carrying data-pswp-src / data-pswp-width / data-pswp-height attributes — PhotoSwipe (04-03) attaches with zero further markup change"
  - "Above-fold/below-fold split: first 4 thumbs eager (loading/decoding=auto, fetchpriority=auto), other 14 lazy (loading=lazy, decoding=async, fetchpriority=low)"
  - "Empty-collection guard: items.length === 0 path renders 'Portfolio launching soon' fallback (RESEARCH Pitfall 6 / Threat T-04-07)"
  - "Ambient TypeScript declaration for justified-layout (src/types/justified-layout.d.ts) so astro check / strict tsconfig stop failing ts(7016) on the depless Flickr lib"
affects: [04-03-portfolio-lightbox-and-hero-preload, 06-launch-perf]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Build-time grid geometry: justifiedLayout(items.map(i => i.data.image.width/i.data.image.height), { containerWidth: 1280, targetRowHeight: 320, boxSpacing: 4 }) returns { containerHeight, boxes[] }; boxes index 1:1 with items"
    - "Inline-positioned thumb wrappers: <a class='absolute' style='width:{w}px;height:{h}px;top:{t}px;left:{l}px'> inside a position:relative; height:{containerHeight}px container — CLS=0 because container height is set before any image bytes arrive"
    - "PhotoSwipe pre-wiring: every <a> ships data-pswp-src / -width / -height in Plan 04-02 so the 04-03 lightbox bootstrap is a single PhotoSwipeLightbox({ children: 'a[data-pswp-src]' }).init() — no markup change"
    - "Astro <Picture> per-photo lossless source-pre-resize as a budget control: if a source photo cannot meet a per-AVIF byte budget at the largest emitted width, pre-resize the source so Astro only emits at narrower widths (same shape as 04-01 about-portrait fix)"

key-files:
  created:
    - "src/components/sections/Gallery.astro"
    - "src/types/justified-layout.d.ts"
    - ".planning/phases/04-portfolio-gallery-image-pipeline/04-02-SUMMARY.md"
  modified:
    - "src/components/ui/Nav.astro"
    - "src/pages/index.astro"
    - "src/assets/portfolio/16-golden-hour-portrait.jpg"
  deleted:
    - "src/components/sections/PortfolioStub.astro"

key-decisions:
  - "Apply per-photo source pre-resize (16-golden-hour-portrait.jpg: 1365x2048 -> 640x960) instead of global quality={60} on Gallery's <Picture>. Empirical sharp encoder testing showed quality=60 produced LARGER AVIFs for this specific photo than the default (encoder rate-distortion edge case on uniform sunset gradients); only quality<=35 met the 200 KB gate at 960w, which would degrade the 17 other photos unnecessarily. Pre-resizing one source instead means Astro emits only 320w/640w variants for this one portrait while the rest keep all three widths."
  - "Add src/types/justified-layout.d.ts ambient declaration (Rule 3 fix). The justified-layout package is pure JS with no @types/* upstream; strict tsconfig failed astro check with ts(7016). One small .d.ts unblocks the typecheck without adding any runtime dep."
  - "Use /#anchor (not bare #anchor) for every link in Nav.astro links array, not just the new /#portfolio entry — keeps the array consistent and unbreakable from future top-level pages (e.g. /privacy will eventually link back to /#about etc.). RESEARCH §12 already called this out as the intended end state."

patterns-established:
  - "Per-AVIF budget enforcement as a build gate: find dist/_astro -name '*.avif' -size +200k must return empty before each plan in this phase ships. Per-photo source pre-resize is the supported escape valve when a specific image's content is fundamentally AVIF-unfriendly at the target output width."
  - "SSG-time justified-grid pattern reusable for any future image collection: getCollection -> sort -> justifiedLayout(aspectRatios, config) -> map(items, boxes) -> <a><Picture></a>. No client JS for layout, lightbox attaches via data-pswp-* attributes."

requirements-completed: [GALLERY-01, GALLERY-02, GALLERY-03]

# Metrics
duration: ~11 min
completed: 2026-05-17
---

# Phase 4 Plan 02: Portfolio Gallery Component Summary

**Built Gallery.astro as a justified-grid SSG component, swapped it into the home page in place of PortfolioStub, restored the Portfolio link in Nav, and shipped 18 thumbnails wired with PhotoSwipe-ready data attributes — all with zero client JS for layout.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-05-17T21:44:08Z
- **Completed:** 2026-05-17T21:54:45Z
- **Tasks:** 3 (Gallery.astro + Nav update + index swap/build verify)
- **Files created:** 2 (Gallery.astro, justified-layout.d.ts) + SUMMARY
- **Files modified:** 3 (Nav.astro, index.astro, 16-golden-hour-portrait.jpg)
- **Files deleted:** 1 (PortfolioStub.astro)

## Accomplishments

- **Gallery.astro shipped** at `src/components/sections/Gallery.astro` — 100% SSG geometry: `justifiedLayout()` runs in the frontmatter, returns `{ containerHeight, boxes[] }`, and each box becomes inline styles on a `position:absolute` `<a>` wrapper inside a fixed-height container. No client JS for layout. Lightbox client JS lands in 04-03.
- **18 thumbnails rendered** with `<Picture formats={['avif','webp']} widths={[320,640,960]}>` — AVIF + WebP + JPEG variants emitted per photo. First 4 thumbs eager (sortOrder 1–4 = ceremony-aisle, couple-portrait-wide, reception-toasts, bridal-prep), other 14 lazy.
- **PhotoSwipe pre-wiring complete:** every `<a>` ships `data-pswp-src`, `data-pswp-width`, `data-pswp-height`, `aria-label={alt}`, and a cursor:zoom-in style. Plan 04-03's bootstrap is a one-line `new PhotoSwipeLightbox({ gallery: '#portfolio', children: 'a[data-pswp-src]' }).init()` with zero further markup change.
- **Nav.astro `links` array** now has 6 entries with Portfolio inserted between Home (line 16) and About (line 18). All hrefs switched to `/#anchor` form for cross-page robustness.
- **index.astro swap** complete: `PortfolioStub` import + usage replaced with `Gallery` in the same slot between `<Hero />` and `<About />`. PortfolioStub.astro deleted via `git rm` (triple-gated absence verified: file gone, no `src/` references, no `dist/index.html` references).
- **Empty-state guard** ships per RESEARCH Pitfall 6 / Threat T-04-07 — `items.length === 0` short-circuits to a "Portfolio launching soon" fallback before computing geometry on `[]`.
- **Build, check, and preview all green** — `npm run build` exits 0, `npm run check` reports 0 errors, `npm run preview` serves HTTP 200 with 18 `data-pswp-src` attributes in the response.

## Geometry Result

`justifiedLayout(18 aspect ratios, { containerWidth: 1280, targetRowHeight: 320, boxSpacing: 4 })` returned:

- **18 thumbs across 6 rows**, layout pattern **2 / 2 / 3 / 3 / 4 / 4** (top → bottom).
- **Container height: 2259 px** at containerWidth=1280.
- **Widow count: 4** (last row holds 4 cells; algorithm did not need to force-stretch them).
- Row top coordinates (px): 10 → 408 → 822 → 1122 → 1538 → 1895.
- The 8 landscape photos cluster in the first 3 rows (filling fewer-but-wider cells); the 9 portrait + 1 square photo fill rows 4–6 with more cells per row.

This geometry is exactly what the 18 owner-curated aspect ratios were chosen to produce in 04-01 (8 landscape AR 1.24–1.68 + 9 portrait AR 0.67–0.92 + 1 square AR 1.00).

## AVIF Budget

`find dist/_astro -name '*.avif' -size +200k` returned **empty** — every emitted gallery AVIF is under the 200 KiB (204 800-byte) budget after the 16-golden-hour-portrait source pre-resize.

**Largest portfolio AVIFs (top 5, with `-size +200k` threshold = 204 800 bytes):**

| File (suffix trimmed for clarity) | Size (bytes) | Size (KB) | Under 200 KiB? |
|-----------------------------------|-------------:|----------:|:--------------:|
| 10-groom-portrait …1QTNTb.avif    | 204 638      | 199.8     | YES (right at the line) |
| 14-veil-twirl …ZsudnC.avif        | 192 543      | 188       | YES |
| 13-cliffside-portrait …hWRK4.avif | 159 596      | 156       | YES |
| 16-golden-hour-portrait …Z2s0SaW.avif | 149 008  | 145       | YES (was 344 KB before source pre-resize) |
| 17-ring-exchange …ZQzN4Y.avif     | 119 596      | 117       | YES |

**Per-thumb AVIF budget headroom for 04-03:** the largest gallery AVIF (10-groom @ 199.8 KB) is right at the line, but 16-golden-hour-portrait was the only true problem and is now bounded. 04-03 should treat 200 KiB as the per-thumb ceiling and surface a fix if any *new* gallery photo from the owner breaches it.

**fetchpriority="high" count in `dist/index.html`: exactly 1** (hero only). No gallery thumb gets `fetchpriority="high"` — confirms the LCP race stays uncontested.

## Above-Fold / Lazy Split

Counted inside the portfolio section of `dist/index.html` (between `id="portfolio"` and the next `id="about"`):

| Attribute              | Count | Expected | Match |
|------------------------|------:|---------:|:-----:|
| `loading="eager"`      | 4     | 4        | OK    |
| `loading="lazy"`       | 14    | 14       | OK    |
| `fetchpriority="auto"` | 4     | 4        | OK    |
| `fetchpriority="low"`  | 14    | 14       | OK    |
| `<a data-pswp-src=`    | 18    | 18       | OK    |

## Task Commits

1. **feat(04-02): Gallery.astro justified-grid (build-time geometry, AVIF/WebP, above-fold/lazy split)** — `72db7b3`
   - Created `src/components/sections/Gallery.astro` + `src/types/justified-layout.d.ts` (ambient module declaration for strict tsconfig).
2. **feat(04-02): restore Portfolio link in Nav between Home and About** — `996526c`
   - 6-entry `links` array; all hrefs switched to `/#anchor` form.
3. **feat(04-02): wire Gallery into index.astro, delete PortfolioStub, pre-resize one source** — `a873393`
   - `index.astro` swap, `git rm src/components/sections/PortfolioStub.astro`, source pre-resize on `16-golden-hour-portrait.jpg` to clear the AVIF size gate.

## Decisions Made

1. **Source pre-resize over global quality reduction for the one AVIF-unfriendly photo.** `16-golden-hour-portrait.jpg` (sunset gradients) breached the 200 KiB AVIF budget at 960w with 344 KB even at sharp's default quality. Empirical testing showed quality=60 made it LARGER (481 KB) and quality<=35 was the first value that fit — at the cost of degrading the 17 other photos. Pre-resizing only this one source to 640×960 means Astro emits only 320w/640w variants for it (both <200 KB), while every other photo keeps all three widths.
2. **Ambient TypeScript declaration over silencing the typecheck.** `justified-layout` is pure JS with no `@types/*` upstream; the strict tsconfig failed `astro check` with ts(7016). A 40-line `.d.ts` (covering the documented config + result shapes) unblocks the typecheck without touching any runtime code.
3. **All hrefs in Nav switched to `/#anchor`, not just the new Portfolio entry.** Keeping the array consistent and forward-compatible (RESEARCH §12 already documented this as the intended end state).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `astro check` failed ts(7016) for `justified-layout` (no @types/* upstream).**
- **Found during:** Task 1 verify gate (`npm run check`).
- **Issue:** Strict tsconfig with no ambient declaration available for the depless Flickr lib — typecheck blocked the Task 1 commit.
- **Fix:** Added `src/types/justified-layout.d.ts` declaring the `JustifiedLayoutBox`, `JustifiedLayoutResult`, `JustifiedLayoutConfig` shapes + `JustifiedLayoutInput = number | { width, height }` + default export signature.
- **Files modified:** `src/types/justified-layout.d.ts` (created).
- **Verification:** `npm run check` now reports 0 errors / 0 warnings / 11 hints.
- **Committed in:** `72db7b3` (Task 1).

**2. [Rule 1 - Budget breach] `16-golden-hour-portrait.jpg` AVIF at 960w exceeded the 200 KiB gate (344 KB).**
- **Found during:** Task 3 verify gate (`find dist/_astro -name '*.avif' -size +200k`).
- **Issue:** One AVIF variant breached the per-thumb byte budget. Content was AVIF-unfriendly (uniform sunset gradients); sharp empirical testing showed default quality already optimal — quality=60 produced 481 KB, quality=70 produced 588 KB, only quality<=35 met the budget (and would degrade 17 other photos).
- **Fix:** Pre-resized source `src/assets/portfolio/16-golden-hour-portrait.jpg` from 1365×2048 to 640×960 (sharp resize, JPEG q=88, mozjpeg). Astro now emits only 320w/640w variants for this photo (149 KB / 47 KB AVIF); the 17 other photos keep all three widths at 320/640/960.
- **Files modified:** `src/assets/portfolio/16-golden-hour-portrait.jpg` (in-place re-encode).
- **Verification:** `find dist/_astro -name '*.avif' -size +200k` returns empty; largest portfolio AVIF now = 199.8 KB (10-groom-portrait at 960w).
- **Committed in:** `a873393` (Task 3).

**3. [Rule 2 - Critical] `quality={60}` from RESEARCH §8 is wrong for some content.**
- **Found during:** Task 3 — applying the documented remediation as a sanity-check before resorting to source-resize.
- **Issue:** RESEARCH §8 said "if any variant exceeds 200 KB, apply `quality: 60`". For most photos this works (lowers bytes); for some AVIF-unfriendly content (uniform gradients) it raises bytes because the encoder switches rate-distortion paths.
- **Fix:** Documented the source-pre-resize escape valve as the supported alternative when global `quality` reduction backfires. Logged into patterns-established for future plans / owners to reference.
- **Files modified:** none (this deviation is a documentation correction for future plans).
- **Committed in:** `a873393` SUMMARY context (this file).

**Total deviations:** 3 (all auto-fixed, no Rule 4 escalations).

## Issues Encountered

- **Astro `<Picture>` always emits an intrinsic-width variant.** Originally suspected as the cause of the 344 KB breach. Inspection with sharp showed the offending variant was actually 960×1440 (matching the `widths={[320,640,960]}` explicit max), NOT the intrinsic 1365×2048 fallback. Different from Plan 04-01's about-portrait diagnosis (which WAS the fallback). The fix shape (source pre-resize) is the same, but the root cause was content entropy at 960w, not a hidden fallback variant.
- **sharp's AVIF encoder is content-adaptive in surprising ways.** For 16-golden-hour-portrait at 960w: default → 344 KB, quality=50 → 344 KB (default == 50 for this image), quality=60 → 481 KB, quality=70 → 588 KB. Higher quality = larger output in this regime. Counter-intuitive but reproducible.
- **The 200 KiB gate is a strict `find -size +200k` boundary = 204 800 bytes.** 10-groom-portrait at 204 638 bytes is right at the line (199.8 KB). One more KB on that file would fail the gate. Future owners should be made aware of the per-thumb ceiling via CONTRIBUTING-GALLERY.md (already documented in Plan 04-01).

## Deferred Items

- **Source-pre-resize trade-off documentation in CONTRIBUTING-GALLERY.md.** Future owner-supplied photos may breach the 200 KiB AVIF gate. The current spec mentions ≤200 MB LFS threshold and alt-text rules but does not call out per-AVIF byte budgets. Deferred to a Phase 4 polish or a Phase 6 launch-perf task — not blocking 04-03.
- **Owner alt-text review pass.** 18 alts were authored by Claude in 04-01; owner refinement is still pending (called out in 04-01 SUMMARY as a Known Stub). No change to that disposition in 04-02.

## Known Stubs

- **First thumb deduplicates with hero image.** Because Plan 04-01 swapped `src/assets/placeholder/hero.jpg` with the content of `src/assets/portfolio/01-ceremony-aisle.jpg`, Astro's content-hash deduplication emits a single physical file for both. The first gallery thumb's `<a href="/_astro/hero.C7HmOWLP.jpg">` points to the hero's hashed URL. This is correct deduplication behavior, NOT a stub — but worth noting because the lightbox in 04-03 will open the same image users see at the top of the page. If the owner later changes the curated ceremony-aisle photo without changing the hero, the dedup will naturally split.

## Self-Check: PASSED

3 created/modified files verified on disk:
- `src/components/sections/Gallery.astro` — exists, 91 lines.
- `src/types/justified-layout.d.ts` — exists, 41 lines.
- `.planning/phases/04-portfolio-gallery-image-pipeline/04-02-SUMMARY.md` — this file.

3 task commits verified in `git log`: `72db7b3`, `996526c`, `a873393`.

PortfolioStub.astro absence verified: `test ! -f src/components/sections/PortfolioStub.astro` returns true; `grep -r PortfolioStub src/` returns nothing; `grep PortfolioStub dist/index.html` returns nothing.

## Next Phase Readiness

**04-03 (Portfolio lightbox + Hero `<link rel="preload">`)** is unblocked with the following contract already shipped:

- **PhotoSwipe selector ready:** `new PhotoSwipeLightbox({ gallery: '#portfolio', children: 'a[data-pswp-src]', pswpModule: () => import('photoswipe') }).init()` — every `<a>` already carries `data-pswp-src`, `data-pswp-width`, `data-pswp-height`. No further markup change needed inside Gallery.astro.
- **CSS:** `import 'photoswipe/style.css'` in the bootstrap script will work; brand overrides via `--pswp-bg` / `--pswp-icon-color` apply at the layout level.
- **Hero preload context:** the hero AVIFs (Plan 04-01 measurement) max out at 57 KB; abundant headroom for a `<link rel="preload" as="image" imagesrcset>` injection.
- **Per-thumb AVIF budget:** 199.8 KB max — close to the 200 KiB ceiling. If 04-03 introduces any new gallery photo (or the owner replaces a thumbnail), the same `find dist/_astro -name '*.avif' -size +200k` gate should run in that plan's verify.
- **No client JS exists yet for the gallery** — Gallery.astro emits zero `<script>` tags. 04-03's lightbox bootstrap is a clean add.

**Blockers:** None.

## Threat Flags

None new. Threat register stayed within the registered T-04-06 through T-04-10 + T-04-SC mitigations:
- **T-04-06 (alt-text XSS):** Astro JSX interpolation escapes by default — verified inert in output.
- **T-04-07 (empty-collection DoS):** mitigated by the `items.length === 0` early return rendering "Portfolio launching soon".
- **T-04-08 (oversize AVIF):** mitigated by per-photo source pre-resize (16-golden-hour-portrait) when global quality reduction backfires; gate now passes.
- **T-04-09 (EXIF leak):** no `withMetadata()` anywhere in Gallery.astro — sharp default strips EXIF.
- **T-04-10 (stale PortfolioStub):** mitigated by `git rm` + triple-gated absence verification (disk, src grep, dist grep).

No new network surface, no new auth paths, no new file-access patterns introduced.

---
*Phase: 04-portfolio-gallery-image-pipeline*
*Plan: 02*
*Completed: 2026-05-17*
