---
phase: 03-static-content-sections
plan: 01
subsystem: editorial
tags: [astro, astro-6, tailwind-v4, sections, hero, about, pricing, portfolio-stub, placeholder-images, unsplash, picture-element, avif, lcp, fetchpriority, owner-confirm]

requires:
  - phase: 02-design-system/02-02
    provides: "Section/Button/Nav/Footer primitives + BaseLayout <slot name=\"head\" /> + Tailwind v4 @theme tokens + editorial @layer base type scale"
provides:
  - "src/components/sections/Hero.astro — full-bleed <Picture> (AVIF+WebP at 640/1024/1536/1920/2400 widths) + scrim + h1+tagline+Enquire CTA → #contact, fetchpriority=high + loading=eager (CONTENT-01)"
  - "src/components/sections/PortfolioStub.astro — empty #portfolio anchor target (Section cream-deep) for Phase 3 smooth-scroll resolution + Phase 4 gallery replacement (D-03)"
  - "src/components/sections/About.astro — Section cream, 2-col lg grid (image right + text left at desktop, stacked image-then-text on mobile via order utilities), Image at widths 480/720/960, literal [OWNER-CONFIRM:first-name] + [OWNER-CONFIRM:years] tokens preserved per D-05, Get-in-touch secondary CTA (CONTENT-02)"
  - "src/components/sections/Pricing.astro — Section cream-deep, h2 + 2-card grid (6h Half day LEFT + 10h Full day RIGHT per D-04), each card preceded by HTML-comment OWNER-CONFIRM marker AND visible [OWNER-CONFIRM] span (D-01 dual marker), €1,800 / €2,400 starting-from anchors, closing paragraph (CONTENT-03)"
  - "src/pages/index.astro — assembled home page: <Nav /> + <main>Hero/PortfolioStub/About/Pricing</main> + <Footer /> (Testimonials+Contact land in 03-02; Footer slot-less, 03-02 fills)"
  - "src/assets/placeholder/{hero,about-portrait}.jpg — 488KB total under src/assets/ (build inputs, NOT public/)"
  - "src/assets/placeholder/LICENSES.md — Unsplash provenance (2 rows: Nathan Dumlao hero + Jakob Owens portrait)"
affects: [03-02 (Testimonials+Contact+Footer wiring), 03-03 (sticky-nav+smooth-scroll-offset+hamburger), 04 (Portfolio gallery — must DELETE PortfolioStub + placeholder/ dir)]

tech-stack:
  added: []
  patterns:
    - "src/components/sections/ established as the home for composed editorial sections (Phase 2 reserved ui/ for primitives)"
    - "Hero full-bleed pattern: <Section id=\"hero\" tone=\"cream\" class=\"relative overflow-hidden p-0\"> + sibling <Picture absolute inset-0 object-cover> + sibling scrim div + relative text well. The `p-0` overrides Section's default py-16/sm:py-24/lg:py-32 so the Picture fills the section box; the text well restores per-side padding via its own pb-/pt- utilities."
    - "About 2-col layout uses `order-2 lg:order-1` on text column + `order-1 lg:order-2` on image column to deliver image-first stacking on mobile (visual hook before reading) while keeping portrait-on-the-right at lg: per editorial convention."
    - "Tailwind v4 emits all utilities used in this plan from default scanning — no safelist needed (no string interpolation). `bg-ink/30` scrim opacity utility worked first-try at v4."
    - "D-01 dual-marker enforcement: per pricing tier we ship BOTH an HTML-comment immediately preceding the price element (visible in source view) AND a visible [OWNER-CONFIRM] span styled `text-ink-soft text-sm` (visible to owner during preview)."
    - "Astro `<Picture>` emits sibling <source> entries for AVIF + WebP and an <img> fallback. `fetchpriority=\"high\"` lands on the <img> fallback element — modern browsers respect this on the picked source. Verify gates correctly grep for fetchpriority in built HTML."

key-files:
  created:
    - src/assets/placeholder/hero.jpg
    - src/assets/placeholder/about-portrait.jpg
    - src/assets/placeholder/LICENSES.md
    - src/components/sections/.gitkeep
    - src/components/sections/Hero.astro
    - src/components/sections/PortfolioStub.astro
    - src/components/sections/About.astro
    - src/components/sections/Pricing.astro
    - .planning/phases/03-static-content-sections/03-01-SUMMARY.md
  modified:
    - src/pages/index.astro

key-decisions:
  - "Hero `class=\"relative overflow-hidden p-0\"` on the Section primitive — per plan-mandated literal. The `p-0` override is required because Section's default py-* rhythm would create banding above/below the full-bleed Picture; the text well re-introduces vertical breathing via its own pt-32 sm:pt-40 / pb-16 sm:pb-24 lg:pb-32. Confirmed by visual inspection of dist/index.html — the structure matches the plan exactly (Picture as first sibling, scrim div as second, text well as third)."
  - "About image-column visual order: `order-1 lg:order-2` (image first on mobile, second column on desktop) + `order-2 lg:order-1` on text column. Editorial convention is portrait-on-the-right at desktop; on mobile we lead with the image because it's the strongest hook above scroll."
  - "Pricing cards rendered in pure source order — `<div>` for Half day first, `<div>` for Full day second, no `flex-row-reverse` or grid-area tricks. Confirmed in dist/index.html via byte-offset: Half day at byte 11778, Full day at byte 12487 (Half day strictly precedes Full day per D-04)."
  - "Description meta replaced per plan: new copy `\"Dublin-based wedding photographer for couples who want to remember the quiet moments. Documentary coverage across Ireland.\"` (previous BaseLayout placeholder had different wording starting with `\"...serving Ireland nationwide...\"`). The new copy carries the Hero h1's craft promise (`quiet moments`) into the SEO blurb — improves topical coherence per Phase 3 RESEARCH §11."
  - "No copy adjustments required for widow/orphan control. All h1/h2/p paragraphs from <copy_source> rendered exactly as specified."

patterns-established:
  - "Section composition via @/components/sections/<Name>.astro consuming @/components/ui/<Primitive>.astro — Phase 2 reserved ui/ for primitives, Phase 3 fills sections/ with composed editorial blocks"
  - "Hero full-bleed three-sibling pattern (Picture / scrim / text well, all positioned within a single p-0 Section)"
  - "Image-first responsive stacking via tailwind `order-1/2 lg:order-1/2` utilities (mobile-first hook, desktop editorial layout)"
  - "OWNER-CONFIRM dual marker on pricing (HTML comment + visible span) — Phase 5 contact-form / Phase 6 SEO meta should follow this convention for any provisional copy/value"
  - "Astro `<Picture>` for LCP-critical images with explicit `widths={[...]}` + `sizes` + `fetchpriority=\"high\"` + `loading=\"eager\"` — pattern reuseable for Phase 4 gallery hero"

requirements-completed: [CONTENT-01, CONTENT-02, CONTENT-03]

duration: ~5min
completed: 2026-05-17

unsplash_photos_used:
  - filename: hero.jpg
    photo_id: photo-1519741497674-611481863552
    photographer: Nathan Dumlao
    intrinsic_dimensions: 2400x1600 (3:2 landscape)
    file_size: 341KB
    license: Unsplash License (commercial reuse, no attribution required)
    phase_4_replacement: required
  - filename: about-portrait.jpg
    photo_id: photo-1554048612-b6a482bc67e5
    photographer: Jakob Owens
    intrinsic_dimensions: 1200x1500 (4:5 portrait)
    file_size: 135KB
    license: Unsplash License (commercial reuse, no attribution required)
    phase_4_replacement: required

---

# Phase 3 Plan 01: Hero + PortfolioStub + About + Pricing Summary

**Top-half editorial assembly: four section components (Hero/PortfolioStub/About/Pricing) consuming Phase 2 primitives, plus 2 Unsplash placeholder JPEGs and `LICENSES.md` provenance — `dist/index.html` ships with the four anchor IDs, LCP-prioritised hero, and dual-marker OWNER-CONFIRM tags on both pricing anchors.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-17T17:22:11Z
- **Completed:** 2026-05-17T17:27:14Z
- **Tasks:** 3 (all auto, all completed)
- **Files created:** 8 (2 JPEGs + LICENSES.md + .gitkeep + 4 .astro section components)
- **Files modified:** 1 (`src/pages/index.astro`)
- **Net-new npm packages:** 0
- **Commits:** 3 task commits + 1 summary commit (this file) = 4 total for plan

## Accomplishments

- **Two Unsplash placeholder JPEGs committed locally** under `src/assets/placeholder/` (488KB total, well under 10MB cap). NO hot-linking — `grep -r images.unsplash.com src/` returns nothing. Provenance recorded in `LICENSES.md` (table with 2 rows: filename / photo ID / photographer / source URL / download date).
- **`src/components/sections/` directory created** with `.gitkeep` (Task 1) so subsequent tasks could write into a tracked location.
- **Four section components shipped** under `src/components/sections/`, all consuming Phase 2 primitives (`Section`, `Button`) and Astro `astro:assets` (`Picture`, `Image`). Zero `<script>` blocks. Zero client JS.
  - **Hero.astro** (CONTENT-01): full-bleed `<Picture>` with AVIF + WebP variants at 5 widths (640/1024/1536/1920/2400), `sizes="100vw"`, `loading="eager"`, `fetchpriority="high"`. Scrim div at `bg-ink/30` for text contrast. Text well with h1 ("Wedding photography for couples\<br />who want to remember the quiet moments."), tagline ("Dublin-based. Nationwide. Documentary, calm, present."), and primary `<Button as="a" href="#contact" size="lg">Enquire</Button>`.
  - **PortfolioStub.astro** (anchor target for Phase 4 per D-03): `<Section id="portfolio" tone="cream-deep">` + h2 ("Selected work") + paragraph with bronze-underlined Instagram link to `https://instagram.com/klphotography.ie`.
  - **About.astro** (CONTENT-02): `<Section id="about" tone="cream">` + `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center` with mobile-image-first ordering (`order-1 lg:order-2` on image / `order-2 lg:order-1` on text). Three paragraphs preserving literal `[OWNER-CONFIRM:first-name]` and `[OWNER-CONFIRM:years]` tokens per D-05. Fact panel + secondary `Get in touch` Button → #contact.
  - **Pricing.astro** (CONTENT-03): `<Section id="pricing" tone="cream-deep">` + h2 (`Coverage &amp; what's included`) + `grid grid-cols-1 lg:grid-cols-2 gap-8` with **Half day LEFT, Full day RIGHT** in source order (D-04). Each card has bordered cream background, h3 / coverage line / large serif price `Starting from €1,800` (and `€2,400`) wrapped with `[OWNER-CONFIRM]` span + preceding HTML-comment marker (D-01 dual marker). Inclusion bullet lists separated by bronze `<hr>`. Closing paragraph after both cards.
- **`src/pages/index.astro` assembled** with the new section imports replacing the prior `Site under construction` placeholder. `<Nav />` + `<main>Hero/PortfolioStub/About/Pricing</main>` + `<Footer />` in plan-mandated order. Footer slot-less per plan (03-02 fills brand/links/social/legal). Title `KL Photography — Wedding Photographer, Dublin, Ireland` preserved; description rewritten to the plan's new copy carrying the Hero "quiet moments" promise into the SEO blurb.
- **Build pipeline produced** 9 AVIF variants + 8 WebP variants + 4 JPG variants of the hero, plus AVIF/WebP/JPG variants of the about portrait. Hero LCP at the 2400w breakpoint = 313KB JPG (or 90KB WebP / 34KB AVIF picked by modern browsers) — comfortable below RESEARCH §12's ≤200KB AVIF target.
- **All four section anchor IDs ship in `dist/index.html`:** `#hero`, `#portfolio`, `#about`, `#pricing`. 03-03's smooth-scroll offset will apply to these automatically.

## Task Commits

| Task | Subject | Hash | Files |
|------|---------|------|-------|
| 1 | `chore(03-01): add Unsplash placeholder images + sections directory` | `4753d9b` | `src/assets/placeholder/hero.jpg`, `src/assets/placeholder/about-portrait.jpg`, `src/assets/placeholder/LICENSES.md`, `src/components/sections/.gitkeep` |
| 2 | `feat(03-01): add Hero + PortfolioStub + About section components` | `2092821` | `src/components/sections/Hero.astro`, `src/components/sections/PortfolioStub.astro`, `src/components/sections/About.astro` |
| 3 | `feat(03-01): add Pricing section + wire home page assembly` | `9a84d61` | `src/components/sections/Pricing.astro`, `src/pages/index.astro` |

(Summary commit `docs(03-01): summary` follows separately per execute-plan protocol.)

## Files Created/Modified

**Created:**
- `src/assets/placeholder/hero.jpg` — 341KB JPEG, 2400×1600
- `src/assets/placeholder/about-portrait.jpg` — 135KB JPEG, 1200×1500
- `src/assets/placeholder/LICENSES.md` — Unsplash provenance, 2 rows
- `src/components/sections/.gitkeep` — empty (directory marker)
- `src/components/sections/Hero.astro` — 26 lines
- `src/components/sections/PortfolioStub.astro` — 14 lines
- `src/components/sections/About.astro` — 39 lines
- `src/components/sections/Pricing.astro` — 36 lines
- `.planning/phases/03-static-content-sections/03-01-SUMMARY.md` — this file

**Modified:**
- `src/pages/index.astro` — replaced Site-under-construction placeholder body with Nav/main/Footer assembly + 6 imports; removed `<p data-deploy-marker>` line + "Site under construction" copy; updated description meta. Title preserved unchanged.

**Footer state:** `<Footer />` rendered slot-less (no `<slot name="brand">`, no `<slot name="links">`, no `<slot name="social">`, no `<slot name="legal">` overrides). Phase 2 Footer's default fallback content renders: brand placeholder "KL Photography", auto-rendered © 2026 copyright. **03-02 will replace this slot-less call with slot-filled content** per Footer primitive's documented contract.

## Decisions Made

See `key-decisions` in frontmatter. Substantive notes:

1. **Hero full-bleed structure matches plan literal** — `<Section ... class="relative overflow-hidden p-0">` + 3 children (Picture / scrim / text well). The `p-0` Tailwind override neutralizes Section's default `py-16 sm:py-24 lg:py-32` so the Picture can absolute-position to the section box. The text well re-introduces vertical padding via its own `pb-16 sm:pb-24 lg:pb-32 pt-32 sm:pt-40` so copy doesn't touch the section edges. Confirmed by reading dist/index.html — the three siblings render as expected, in the order specified.

2. **About column visual order** — chose image-first stacking on mobile (`order-1 lg:order-2` on image div) per editorial convention that the strongest hook (the portrait) leads above the scroll on small viewports. On lg+ the conventional portrait-right layout restores. Plan permitted executor's call ("recommended portrait on the right at desktop, stacked image-then-text on mobile"); chose the recommended path.

3. **Pricing card source order verified via byte offset** in built HTML, not the awk-line-number gate. The minified output puts everything on one line so the plan's `awk '/Half day/ {h=NR} /Full day/ {f=NR}'` check found h==f==13 (same line). The semantic intent (Half day strictly precedes Full day in DOM source order per D-04) is satisfied: Half day text appears at byte 11778, Full day at byte 12487. See Deviation 1 below.

4. **Description meta** rewritten per plan — replaced the prior BaseLayout default `"Dublin-based wedding photographer serving Ireland nationwide..."` with the plan-specified `"Dublin-based wedding photographer for couples who want to remember the quiet moments. Documentary coverage across Ireland."`. Both start with `"Dublin-based wedding photographer"` so the verify gate matches either; the new copy carries the Hero's craft promise into SEO.

## Deviations from Plan

### 1. [Rule 3 — Verify-gate wording vs minified built HTML] Plan's `awk` gate for 6h-before-10h source order returns false-negative against minified `dist/index.html`

- **Found during:** Task 3 plan-level verification.
- **Issue:** Plan's verify gate `awk '/Half day/ {h=NR} /Full day/ {f=NR} END { exit (h>0 && f>0 && h<f ? 0 : 1) }' dist/index.html` returns `h=13 f=13` and exits 1 (failure) because Astro emits minified HTML — both "Half day" and "Full day" land on the same line (line 13). The line-number comparison is structurally incapable of measuring intra-line source order.
- **Real-build evidence:** `grep -bo "Half day" dist/index.html` returns byte offset 11778. `grep -bo "Full day" dist/index.html` returns byte offset 12487. 11778 < 12487 → Half day strictly precedes Full day in DOM source order, satisfying D-04. The source-side awk check on `src/components/sections/Pricing.astro` (NR-based, not minified) PASSED in Task 3 verify (recorded as `TASK3-SOURCE-PASS`).
- **Fix:** No code change. Documented as gate-wording deviation per the user's explicit instruction (`Real-build evidence beats text-grep wording (same standard as Phase 2 deviations)`) and per Phase 2 SUMMARY Deviation 1's precedent (verify-gate regex vs build-output mismatch is Rule 3, not a real failure). Semantic intent fully met.
- **Files modified:** None.
- **Committed in:** N/A.
- **Forward-looking note:** Verify gates intended to assert in-HTML source order against Astro's minified output should use byte-offset comparison (`grep -bo`) or pretty-print the HTML first, not line-number-based `awk`.

### 2. [Rule 3 — Verify-gate wording vs minified built HTML] Plan's `grep -v '<!--' | grep -c -E '\[OWNER-CONFIRM\]'` for visible-marker count returns 0 against minified `dist/index.html`

- **Found during:** Task 3 plan-level verification.
- **Issue:** Plan's verify gate `[ "$(grep -v '<!--' dist/index.html | grep -c -E '\[OWNER-CONFIRM\]')" -ge 2 ]` returns 0 because the minified `dist/index.html` is essentially one line; `grep -v '<!--'` filters out the ENTIRE line when ANY HTML comment appears on it, erasing the visible spans on the same line. Same root class as Deviation 1.
- **Real-build evidence:** `grep -oE '\[OWNER-CONFIRM\]' dist/index.html | wc -l` returns **6** total occurrences. Context inspection: **2 visible** (`<span class="text-ink-soft text-sm">[OWNER-CONFIRM]</span>` — one per pricing tier, exactly per D-01) + **4 inside HTML comments** (2 comment headers immediately preceding each tier + 2 mentions of "[OWNER-CONFIRM] tag" within the same comment bodies). D-01 dual-marker requirement (visible span AND HTML-comment marker per tier) is fully met.
- **Fix:** No code change. Documented as gate-wording deviation. Semantic intent (≥2 visible markers AND HTML-comment markers per tier) verified by inspection.
- **Files modified:** None.
- **Committed in:** N/A.
- **Forward-looking note:** A correct minified-HTML test would be `[ "$(sed -E 's/<!--[^>]*-->//g' dist/index.html | grep -oE '\[OWNER-CONFIRM\]' | wc -l)" -ge 2 ]` (strip comments then count occurrences with `-o`, not lines with `-c`). Worth fixing in 03-02 and onwards if the same pattern recurs.

### Total deviations

**2 documented.** Both are gate-wording vs minified-HTML mismatches, not implementation deviations. Zero changes to deliverable scope. Zero new npm dependencies. Plan substance (4 sections + 2 placeholder images + LICENSES.md + index.astro assembly + LCP/AVIF/WebP pipeline + dual OWNER-CONFIRM markers + literal D-05 tokens) is fully shipped.

## Verify Gates

### Per-task verify gates

| Task | Gate | Result | Notes |
|------|------|--------|-------|
| 1 | 2 JPEGs + LICENSES.md + .gitkeep exist | PASS | |
| 1 | `file src/assets/placeholder/hero.jpg` reports JPEG | PASS | `JPEG image data ... 2400x1600` |
| 1 | LICENSES.md contains "Unsplash" | PASS | |
| 1 | Exactly 2 `*.jpg` files | PASS | `wc -l` = 2 |
| 1 | Exactly 2 filename rows in LICENSES.md table | PASS | `grep -c -E '^\| [a-z0-9-]+\.jpg'` = 2 |
| 1 | No `images.unsplash.com` hot-link in `src/` | PASS | `grep -r` returns empty |
| 1 | Total `src/assets/placeholder/` size < 10MB | PASS | 488K |
| 2 | All 3 section files exist | PASS | |
| 2 | Hero has `id="hero"` + `fetchpriority="high"` + `loading="eager"` + `href="#contact"` | PASS | All 4 greps match |
| 2 | PortfolioStub has `id="portfolio"` | PASS | |
| 2 | About has `id="about"` + literal `OWNER-CONFIRM:first-name` + `OWNER-CONFIRM:years` | PASS | All 3 greps match |
| 2 | No `images.unsplash.com` in `src/components/sections/` | PASS | `grep -r` returns empty |
| 2 | `npm run check` exits 0 | PASS | 0 errors / 0 warnings / 0 hints (14 files) |
| 3 | Pricing.astro has `id="pricing"` + `Half day` + `Full day` + `€1,800` + `€2,400` | PASS | All 5 greps match |
| 3 | `[OWNER-CONFIRM]` count in Pricing.astro ≥ 2 | PASS | 4 occurrences (2 visible spans + 2 HTML-comment headers) |
| 3 | Source-side `Half day` before `Full day` in Pricing.astro (NR-based) | PASS | source order h=11, f=21 |
| 3 | index.astro imports Hero and Pricing | PASS | |
| 3 | Source-side `<Hero/<PortfolioStub/<About/<Pricing` render order in index.astro | PASS | NR sequence strictly increasing |
| 3 | `data-deploy-marker` removed from index.astro | PASS | |
| 3 | `npm run check` exits 0 | PASS | 0 errors / 0 warnings / 0 hints |
| 3 | `npm run build` exits 0 | PASS | 2 pages, 19 optimized images |
| 3 | `dist/index.html` contains 4 section IDs + `href="#contact"` + `Starting from` + `6 hours` + `10 hours` + `fetchpriority="high"` + `<title>KL Photography` + `meta name="description" content="Dublin-based wedding photographer` | PASS | All 12 greps match |
| 3 | Built-HTML `awk` Half-day-before-Full-day | DEVIATION (Rule 3) | Minified HTML one-line — awk NR-based check structurally cannot measure intra-line order. Byte-offset verification via `grep -bo` confirms source order correct (Half=11778 < Full=12487). See Deviation 1. |

### Plan-level verification

| Check | Result | Notes |
|-------|--------|-------|
| `npm run check` exit 0 | PASS | 14 files checked, 0 errors |
| `npm run build` exit 0 | PASS | 2 pages (index + styleguide); 19 optimized images emitted |
| Section IDs (#hero, #portfolio, #about, #pricing) in dist/index.html | PASS | All 4 present |
| CONTENT-01 evidence: h1 + Enquire + href="#contact" + fetchpriority="high" + img loading="eager" | PASS | All 5 greps match |
| CONTENT-02 evidence: "I photograph the day" + OWNER-CONFIRM:first-name + OWNER-CONFIRM:years | PASS | All 3 greps match |
| CONTENT-03 evidence: "Starting from" + €1,800 + €2,400 + "6 hours" + "10 hours" | PASS | All 5 greps match |
| 6h before 10h source order (awk NR-based on minified) | DEVIATION (Rule 3) | See Deviation 1; byte-offset verifies semantic intent |
| Visible [OWNER-CONFIRM] markers ≥2 (grep -v then -c on minified) | DEVIATION (Rule 3) | See Deviation 2; 2 visible spans + 4 comment-internal mentions verified by inspection |
| `<title>KL Photography` + meta description | PASS | Both literal strings present |
| No images.unsplash.com / picsum.photos / source.unsplash.com under src/ | PASS | All 3 hot-link greps return empty |
| AVIF + WebP variants in dist/_astro/ | PASS | 9 AVIF + 8 WebP for hero; 5 WebP for portrait |
| `npm run preview` serves `/` HTTP 200 | PASS | 13,667 bytes |

### Decision-traceability self-check

- **D-01** (dual OWNER-CONFIRM marker on pricing): Both tiers carry an HTML-comment marker immediately preceding the price element AND a visible `[OWNER-CONFIRM]` span styled `text-ink-soft text-sm`. Verified in Pricing.astro and in dist/index.html.
- **D-02** (placeholder images downloaded + committed locally, no hot-link): 2 JPEGs committed under `src/assets/placeholder/`. `grep -r images.unsplash.com src/` returns nothing.
- **D-03** (PortfolioStub anchor target for Phase 4): `<Section id="portfolio">` rendered. Phase 4 must replace this stub in place; documented in Next Phase Readiness.
- **D-04** (6h LEFT, 10h RIGHT in source order, no flex-row-reverse): Pricing.astro `<div>` for Half day appears first in source, `<div>` for Full day appears second. dist/index.html byte offsets confirm.
- **D-05** (literal [OWNER-CONFIRM:first-name] + [OWNER-CONFIRM:years] preserved): Verified in About.astro and dist/index.html.

### Source coverage (ROADMAP Phase 3 success criteria for this plan)

| Criterion | Implemented in |
|---|---|
| CONTENT-01 — Hero | Hero.astro shipped; full-bleed Picture + h1 + tagline + Enquire CTA → #contact verified in dist/index.html |
| CONTENT-02 — About | About.astro shipped; first-person h2 + 3 paragraphs (with D-05 tokens) + portrait Image + fact panel + Get-in-touch CTA verified |
| CONTENT-03 — Pricing | Pricing.astro shipped; 2 tier cards with €1,800/€2,400 anchors + D-01 dual markers + D-04 source order verified |
| (Anchor target for Phase 4) | PortfolioStub.astro shipped; `#portfolio` anchor renders cream-deep section with Instagram link |
| Home page assembly | index.astro imports + renders Nav/Hero/PortfolioStub/About/Pricing/Footer in plan-mandated order; preview HTTP 200 |

## Threat Surface Scan

No new threat surface introduced beyond the plan's `<threat_model>` (T-03-01..T-03-SC). All four `mitigate` dispositions verified:

- **T-03-01 (Unsplash hot-link information disclosure):** Both images downloaded + committed locally under `src/assets/placeholder/`. `grep -r 'images.unsplash.com' src/` returns nothing; `grep -r 'picsum.photos' src/` returns nothing; `grep -r 'source.unsplash.com' src/components/ src/pages/` returns nothing. GDPR-equivalent to Phase 2 self-hosted fonts.
- **T-03-02 (owner ships placeholder pricing as final):** Dual-marker enforced — 2 HTML-comment headers preceding the price elements + 2 visible `[OWNER-CONFIRM]` spans in body copy (D-01). Count verified: 4 OWNER-CONFIRM occurrences in Pricing.astro (≥2 visible per gate).
- **T-03-03 (owner ships About without confirming first name / years):** Both literal tokens (`[OWNER-CONFIRM:first-name]` and `[OWNER-CONFIRM:years]`) preserved in About.astro and verified in dist/index.html.
- **T-03-04 (hero LCP regression):** `fetchpriority="high"` + `loading="eager"` confirmed in dist/index.html on the `<img>` fallback inside the `<picture>` element. AVIF variants emitted at 5 widths; 1024w AVIF = 19KB, well below the ≤200KB target.
- **T-03-05 (future portfolio.astro page conflict):** Accepted disposition; PortfolioStub.astro renders a section inside index.astro, not a separate route. Documented in Next Phase Readiness as Phase 4 must DELETE the stub and reuse the `#portfolio` anchor (or upgrade to `/portfolio` route — Phase 4's call).
- **T-03-SC (package legitimacy):** Zero new npm packages installed; `package.json` unmodified. No slopcheck required.

No new threat flags discovered. No `threat_flag:` entries to add.

## Known Stubs

These are intentional, plan-documented placeholders that must be resolved before launch. The verifier should treat these as expected:

| Stub | File | Reason / Resolves In |
|------|------|---------------------|
| `#portfolio` PortfolioStub (no gallery yet) | `src/components/sections/PortfolioStub.astro` | Phase 4 replaces with real `Portfolio.astro` gallery |
| `[OWNER-CONFIRM]` visible marker on 6h price | `src/components/sections/Pricing.astro:14` | Owner walkthrough — confirms or amends €1,800 anchor (D-01) |
| `[OWNER-CONFIRM]` visible marker on 10h price | `src/components/sections/Pricing.astro:26` | Owner walkthrough — confirms or amends €2,400 anchor (D-01) |
| `[OWNER-CONFIRM:first-name]` token in About | `src/components/sections/About.astro:13` | Owner provides actual first name (D-05) |
| `[OWNER-CONFIRM:years]` token in About | `src/components/sections/About.astro:13` | Owner provides years-in-business (D-05) |
| `[OWNER-REVIEW] optional fact` in About fact panel | `src/components/sections/About.astro:22` | Owner provides or removes |
| `hero.jpg` placeholder photo (Unsplash) | `src/assets/placeholder/hero.jpg` | Phase 4 replaces with owner-supplied hero |
| `about-portrait.jpg` placeholder photo (Unsplash) | `src/assets/placeholder/about-portrait.jpg` | Phase 4 replaces with owner-supplied portrait |
| Empty `<Footer />` (no slot content) | `src/pages/index.astro:21` | 03-02 fills `brand`/`links`/`social`/`legal` slots |
| No Testimonials section | `src/pages/index.astro` `<main>` | 03-02 appends `<Testimonials />` before `</main>` |
| No Contact section | `src/pages/index.astro` `<main>` | 03-02 appends `<Contact />` before `</main>` |
| `[OWNER-REVIEW]` notes in alt text + PortfolioStub copy | Hero/About/PortfolioStub | Phase 4 (images) / Phase 4 (portfolio launch line) |

## Issues Encountered

**Two verify-gate wording mismatches against Astro's minified built HTML** (Deviations 1 + 2 above). Neither is a real implementation failure — both gates' semantic intent is satisfied by alternative measurements (byte offset for source order, occurrence count for marker count).

**No environment / no build / no commit issues.** All commits respect git hooks (no `--no-verify` used). Working tree clean throughout. No untracked files left after Task 3 commit. Zero file deletions across all three task commits.

## User Setup Required

None for this plan. No external services touched. No secrets needed.

## Next Phase Readiness

### READY FOR 03-02 (Testimonials + Contact + Footer wiring)

- **Section primitive usage pattern established** — Phase 3 sections live in `src/components/sections/`, all import `@/components/ui/Section.astro`, all use bare `h1/h2/p` with `@layer base` editorial type scale.
- **`src/pages/index.astro` `<main>` is the insertion point.** 03-02 appends `<Testimonials />` and `<Contact />` BEFORE `</main>`, after `<Pricing />`. The placeholder HTML comment `<!-- 03-02 will append: <Testimonials /> + <Contact /> here, before </main> -->` marks the spot.
- **`<Footer />` currently slot-less.** 03-02 replaces with slot-filled content: `<Footer><Fragment slot="brand">...</Fragment><Fragment slot="links">...</Fragment><Fragment slot="social"><SocialIcons /></Fragment><Fragment slot="legal">...</Fragment></Footer>`. Per RESEARCH §1, Testimonials section ships WITHOUT author photos (no testimonial JPEGs need to be staged in 03-02).
- **Astro `<Picture>` import pattern proven** — Hero demonstrates the AVIF+WebP+widths+sizes+fetchpriority+loading recipe. Contact form's submit button can wire the Phase 2 Button `loading?: boolean` prop directly.

### READY FOR 03-03 (sticky nav + smooth-scroll offset + hamburger)

- **All four anchor IDs ship in built HTML:** `#hero`, `#portfolio`, `#about`, `#pricing`. After 03-02 adds `#testimonials` + `#contact`, the Nav primitive's 4 anchor links (`#about`/`#pricing`/`#testimonials`/`#contact`) will resolve to real on-page targets.
- **03-03's `scroll-margin-top` utility addition on `Section.astro` will apply uniformly to all four (then six) section anchors** because every section is rendered through the Section primitive (no bare `<section>` elements).
- **`<Nav />` is currently static** (Phase 2 baseline). 03-03 extends it in place to add sticky behavior + hamburger toggle. No change to consumer call-site required.

### BLOCKER FOR PHASE 4 (Portfolio Gallery — Wave 0)

> **BLOCKER:** Phase 4 must perform the placeholder swap as its Wave 0 work:
>
> 1. **DELETE `src/assets/placeholder/`** entirely (including `hero.jpg`, `about-portrait.jpg`, and `LICENSES.md`). All three are Unsplash placeholders for owner sign-off only and must NOT ship to production.
> 2. **REPLACE the Hero image import** in `src/components/sections/Hero.astro` — change `import hero from '@/assets/placeholder/hero.jpg'` to whichever owner-supplied path Phase 4 establishes (likely `import hero from '@/assets/portfolio/hero.jpg'` once the owner provides the real asset).
> 3. **REPLACE the About portrait import** in `src/components/sections/About.astro` — change `import portrait from '@/assets/placeholder/about-portrait.jpg'` similarly.
> 4. **REPLACE `PortfolioStub.astro`** with the real `Portfolio.astro` gallery component, OR delete PortfolioStub.astro and re-route `#portfolio` to the gallery's section. The `<PortfolioStub />` call in `src/pages/index.astro` must be updated accordingly.
> 5. **Owner walkthrough should resolve the `[OWNER-CONFIRM]` and `[OWNER-REVIEW]` tags** in Pricing.astro + About.astro before the Phase 4 swap so the owner's real first name / years / pricing land in the same commit as the real photos.

This swap is the explicit precondition documented per T-03-05's accepted disposition.

## Self-Check

Verified before SUMMARY commit:

- `src/assets/placeholder/hero.jpg` exists (JPEG image data, 2400x1600, 341KB).
- `src/assets/placeholder/about-portrait.jpg` exists (JPEG image data, 1200x1500, 135KB).
- `src/assets/placeholder/LICENSES.md` exists; contains "Unsplash" + 2 filename rows matching the regex pattern.
- `src/components/sections/Hero.astro` exists; contains `id="hero"`, `fetchpriority="high"`, `loading="eager"`, `href="#contact"`, import from `@/assets/placeholder/hero.jpg`.
- `src/components/sections/PortfolioStub.astro` exists; contains `id="portfolio"`, Instagram URL, bronze underlined link.
- `src/components/sections/About.astro` exists; contains `id="about"`, literal `[OWNER-CONFIRM:first-name]` and `[OWNER-CONFIRM:years]` tokens, import from `@/assets/placeholder/about-portrait.jpg`, secondary Get-in-touch Button.
- `src/components/sections/Pricing.astro` exists; contains `id="pricing"`, `Half day` + `Full day`, `€1,800` + `€2,400`, 4 occurrences of `[OWNER-CONFIRM]` (2 visible spans + 2 HTML-comment headers), bullet inclusion lists, closing paragraph.
- `src/pages/index.astro` imports Nav, Footer, Hero, PortfolioStub, About, Pricing; renders them in plan-mandated order; uses the plan's title + description; data-deploy-marker removed.
- Commits `4753d9b`, `2092821`, `9a84d61` exist on `main` (verified via `git log --oneline -5`).
- `npm run check` exit 0; `npm run build` exit 0; `npm run preview` serves `/` HTTP 200 with 13,667 bytes.
- `dist/index.html` contains all 4 section IDs + `href="#contact"` + `Starting from` + `6 hours` + `10 hours` + `fetchpriority="high"` + `<title>KL Photography` + `meta name="description" content="Dublin-based wedding photographer`.
- `dist/_astro/` contains AVIF + WebP variants for both images.
- `grep -r images.unsplash.com src/` returns nothing (T-03-01 mitigated).
- Zero new npm packages installed (`package.json` unchanged).

## Self-Check: PASSED

---
*Phase: 03-static-content-sections*
*Completed: 2026-05-17*
