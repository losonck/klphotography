---
phase: 02-design-system
plan: 01
subsystem: design
tags: [astro, astro-6, tailwind-v4, fonts, fontsource, design-tokens, typography, color, accessibility, gdpr]

requires:
  - phase: 01-foundation-dns-pre-flight
    provides: Astro 6 scaffold + Tailwind v4 via @tailwindcss/postcss + BaseLayout.astro + src/styles/global.css entry
provides:
  - "@theme tokens (7 colors, 2 font stacks, 3 text sizes, base spacing) compile to Tailwind v4 utilities (bg-cream, text-ink, border-bronze, font-serif, font-sans, etc.)"
  - "@layer base type scale: clamp() h1/h2/h3, static rem h4, body 16→18px at sm:, small/figcaption muted ink-soft, reduced-motion blanket rule"
  - "Self-hosted EB Garamond (weights 400/700 + italic) and Inter (400/500/600) via Astro 6 Fonts API + Fontsource provider — zero runtime third-party requests (GDPR-safe)"
  - "BaseLayout.astro renders <Font /> components for both families in <head> (EB Garamond preloaded as hero h1 font); body carries default bg-cream / text-ink / font-sans / antialiased"
affects: [02-02-styleguide, 03-static-content-sections, 04-portfolio-gallery, 05-contact-form]

tech-stack:
  added: []
  patterns:
    - "Design tokens live in src/styles/global.css inside a single @theme {} block — no tailwind.config.* (CSS-first v4 convention established in Phase 1, filled in here)"
    - "Type scale lives in @layer base on bare element selectors — content components do not need to remember utility class chains for headings/body"
    - "Self-hosted fonts via Astro 6 Fonts API (`<Font cssVariable=\"--font-*\" preload? />`) instead of @fontsource-variable/* npm imports — automatic fallback metrics, hashed asset URLs, opt-in preload"
    - "cssVariable names on <Font /> + fontProviders config match @theme --font-* names; Astro merges generated @font-face with theme declarations transparently"

key-files:
  created:
    - .planning/phases/02-design-system/02-01-SUMMARY.md
  modified:
    - src/styles/global.css
    - astro.config.mjs
    - src/layouts/BaseLayout.astro

key-decisions:
  - "Omit --breakpoint-sm/--breakpoint-lg/--breakpoint-xl from @theme — defaults (40rem/64rem/80rem) already match DESIGN-04 (≤640/≥1024/≥1280); redeclaring a subset risks deactivating undeclared variants (A8 mitigation per RESEARCH.md)"
  - "EB Garamond loaded with italic style for Phase 3 testimonial pull-quotes — ~10 KB more in build cache, avoids a Phase 3 config edit"
  - "<body class=\"bg-cream text-ink font-sans antialiased\"> on BaseLayout — Task 3 sanctioned this as recommended; consumers don't need to remember to apply the editorial defaults"
  - "Preload EB Garamond only (Inter loads on-demand via @font-face) — per RESEARCH.md Pitfall 2 (preloading every weight is anti-pattern)"

patterns-established:
  - "@theme tokens in src/styles/global.css (Tailwind v4 CSS-first) — every future color/font/spacing token lands in this single block"
  - "@layer base for bare-element editorial type scale — Phase 3 sections do not declare per-heading typography utilities"
  - "Astro 6 Fonts API for any future font addition — declare in astro.config.mjs fonts[] with fontProviders.fontsource(); inject via <Font cssVariable> in <head>"

requirements-completed: [DESIGN-01, DESIGN-02, DESIGN-04, DESIGN-05]

duration: ~6min
completed: 2026-05-17
---

# Phase 2, Plan 1: Design System Tokens + Self-Hosted Fonts Summary

**Editorial design token layer (cream/ink/bronze palette + EB Garamond × Inter type scale with clamp-based headlines) wired into Tailwind v4 via `@theme` and `@layer base`; both font families self-hosted through Astro 6's built-in Fonts API + Fontsource provider — zero runtime requests to Google Fonts, GDPR-safe by construction.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-17T14:35:47Z
- **Completed:** 2026-05-17T14:41:42Z
- **Tasks:** 3 (3 auto, no checkpoints)
- **Files modified:** 3 (all in plan scope)
- **Net-new npm packages:** 0 (Astro Fonts API is core; Fontsource provider needs no separate npm install)

## Accomplishments

- `src/styles/global.css`: `@theme { ... }` registers 7 color tokens (cream, cream-deep, ink, ink-soft, bronze, bronze-hover, rule), 2 font stacks (serif/sans), 3 static text sizes (body/small/caption) + body line-height companion, and `--spacing: 0.25rem` base. `@layer base` ships the type scale with clamp() h1/h2/h3, static rem h4, body 16→18px at `sm:`, muted small/figcaption, plus the reduced-motion blanket rule.
- `astro.config.mjs`: `fonts[]` declares EB Garamond (weights 400/700 + italic) and Inter (weights 400/500/600), both via `fontProviders.fontsource()`. `cssVariable` names align with `@theme` `--font-serif` / `--font-sans`.
- `src/layouts/BaseLayout.astro`: imports `Font` from `astro:assets`; renders `<Font cssVariable="--font-serif" preload />` + `<Font cssVariable="--font-sans" />` in `<head>` before `<title>`; `<body>` carries `bg-cream text-ink font-sans antialiased` so the editorial defaults apply globally.
- Build pipeline emits 7 hashed `.woff2` files into `dist/_astro/fonts/`, compiles utility classes `bg-cream`/`text-ink`/`border-bronze`/`font-serif`/`font-sans` into `dist/_astro/*.css`, and inlines `@font-face` declarations into `<head><style>` of `dist/index.html` (with size-adjusted fallback metrics).
- `npm run check` exits 0 (TypeScript happy with `astro:assets` Font import). `npm run build` exits 0. Zero references to `googleapis.com` / `gstatic.com` anywhere in `dist/`.
- No `tailwind.config.{js,mjs,ts}` exists.

## Task Commits

| Task | Subject | Hash | Files |
|------|---------|------|-------|
| 1 | feat(02-01): add @theme tokens and @layer base typography | `aed457e` | `src/styles/global.css` |
| 2 | chore(02-01): configure Astro Fonts API for EB Garamond + Inter via Fontsource | `4ba098a` | `astro.config.mjs` |
| 3 | feat(02-01): inject <Font /> components into BaseLayout head | `7f27171` | `src/layouts/BaseLayout.astro` |

## Files Created/Modified

- `src/styles/global.css` — appended `@theme {}` (7 colors + 2 font stacks + 3 text tokens + `--spacing`; comment explaining breakpoint omission), `@layer base {}` (h1–h4 + body + small + sm: body step), and reduced-motion blanket rule (with `html { scroll-behavior: smooth }`).
- `astro.config.mjs` — added `fontProviders` import; appended `fonts[]` array with two entries (EB Garamond and Inter) per RESEARCH.md §2.
- `src/layouts/BaseLayout.astro` — added `import { Font } from 'astro:assets'`; added two `<Font />` elements in `<head>` between `<link rel="icon">` and `<title>`; added `class="bg-cream text-ink font-sans antialiased"` to `<body>`.

## Decisions Made

See `key-decisions` in frontmatter. The substantive call: dropping the `--breakpoint-*` overrides from `@theme` (per RESEARCH.md A8 mitigation) because Tailwind v4's defaults already match DESIGN-04 exactly, and redeclaring a subset risks deactivating the `md:` variant that Plan 02-02 / Phase 3 may want. A CSS comment in the file documents this.

## Deviations from Plan

### Auto-fixed (regex / verify-gate adjustments to match real build output)

**1. [Rule 3 — Blocking issue] Task 1 verify gate regex assumes whitespace around `@media (min-width: 64rem)` but production CSS is minified.**
- **Found during:** Task 1 verify.
- **Issue:** Gate `grep -rE "@media \(min-width: ?64rem\)" dist/_astro/*.css` fails because the Tailwind/Vite-emitted CSS is minified to `@media(min-width:64rem)` (no space between `@media` and `(`).
- **Fix:** Interpreted the gate's intent (confirm `lg:` breakpoint = 1024px = 64rem is emitted somewhere in `dist/_astro/*.css`) and ran a whitespace-tolerant variant: `grep -rE "@media ?\(min-width: ?64rem\)"`. Confirmed `@media(min-width:64rem)` appears in `dist/_astro/index.v6UYTASt.css`. The DESIGN-04 observable assertion is satisfied semantically.
- **Files modified:** None (regex-only deviation in the verify step).
- **Committed in:** N/A (no code change).

**2. [Rule 1 — Behavior mismatch with documented expectation] Astro 6 Fonts API inlines `@font-face` in `<head><style>` of `dist/index.html`, not in the external `dist/_astro/*.css` bundle.**
- **Found during:** Task 3 verify.
- **Issue:** Plan's Task 3 verify and plan-level verification both grep for `@font-face` in `dist/_astro/*.css`. They fail because Astro 6's Fonts API emits `@font-face` declarations (plus size-adjusted fallback metrics + the `:root { --font-serif/sans: ... }` mapping) as inline critical CSS in the page's `<head><style>` block, not into the external CSS bundle. This is an Astro API behavior the plan author did not anticipate.
- **Fix:** Interpreted the gate's intent (confirm `@font-face` rules for EB Garamond and Inter are emitted into the rendered output and active on the page) and verified inline in `dist/index.html`. Confirmed: 4 `@font-face` rules for `"EB Garamond-..."` (400 normal, 700 normal, 400 italic, 700 italic) + 3 `@font-face` rules for Inter (400/500/600 normal) + matching size-adjusted fallback metrics + `:root { --font-serif: ...; --font-sans: ...; }` overrides. Semantic intent ("fonts active on page") is fully satisfied; the location is just inline rather than external. Inline is also better for LCP because there is no extra CSS request to start font loading.
- **Files modified:** None.
- **Committed in:** N/A.

**3. [Rule 1 — Behavior mismatch with documented expectation] Astro's `<Font preload />` emits one preload `<link>` per declared weight × style of the family, not "exactly one preload link" per family.**
- **Found during:** Task 3 verify.
- **Issue:** Plan's must_haves / Task 3 done / success_criteria / plan-level verification say `dist/index.html` should contain "exactly one" `<link rel="preload" as="font">`. Actual output contains 4 preload links — one for each EB Garamond weight × style (400 normal, 700 normal, 400 italic, 700 italic). Astro 6's `<Font preload />` is family-level, not per-weight; there is no per-weight preload knob.
- **Fix considered:** Reducing EB Garamond `weights` / `styles` in `astro.config.mjs` would limit preload count, but that breaks the Task 2 requirement (italic for Phase 3 pull-quotes per RESEARCH.md §2) and 700 weight for hero h1 emphasis. The 4 preloads are intrinsic to having the declared font roster preloaded.
- **Resolution:** Accept the deviation. Inter (3 weights) is correctly NOT preloaded — semantic intent ("preload hero font, not body sans") is satisfied. Tally is 4 preload links, all for EB Garamond. Plan author's "exactly one" wording reflected an inaccurate mental model of the Astro Fonts API rather than an architectural requirement. Automated gate (`grep -q 'as="font"'`) passes (presence, not count).
- **Files modified:** None.
- **Committed in:** N/A.
- **Forward-looking note:** If the 4-preload tally regresses LCP in Phase 6 Lighthouse audit, options are: drop italic and 700-italic from EB Garamond `styles` (saves 2 preloads — italic loads on first use without preload; minor FOIT for testimonial pull-quotes), or drop 700 from `weights` (saves 1 preload; hero h1 stays 400-weight). Both are 1-line config edits in `astro.config.mjs`.

### Total deviations

**3 auto-resolved.** All three are documentation / gate-wording vs. real Astro 6 + Tailwind v4 emit behavior. Zero changes were made to the deliverable scope. Zero new npm packages introduced. The plan's substance (token layer, self-hosted fonts, GDPR-safe pipeline, reduced-motion respect) is fully shipped.

## Verify Gates

### Per-task verify gates

| Task | Gate | Result | Notes |
|------|------|--------|-------|
| 1 | `@theme` / `color-cream` / `color-bronze` / `font-serif` / `prefers-reduced-motion` in `global.css` | PASS | All greps return matches |
| 1 | `clamp(2.5rem` / `clamp(2rem` / `clamp(1.5rem` in `global.css` | PASS | h1/h2/h3 clamp values present |
| 1 | `bg-cream` / `text-ink` / `border-bronze` / `font-serif` utilities in `dist/_astro/*.css` | PASS | Tailwind v4 emits utilities for `@theme` colors when used in body class |
| 1 | `@media (min-width: 64rem)` in `dist/_astro/*.css` | PASS (semantic) | Minified to `@media(min-width:64rem)`; whitespace-tolerant regex used (Deviation 1) |
| 1 | No `tailwind.config.*` | PASS | None exists |
| 2 | `fontProviders` / `EB Garamond` / `Inter` / `'--font-serif'` / `'--font-sans'` in `astro.config.mjs` | PASS | All five greps return matches |
| 2 | At least one `.woff2` in `dist/_astro/fonts/` | PASS | 7 files: 7 hashed `.woff2` |
| 3 | `import { Font } from 'astro:assets'` in `BaseLayout.astro` | PASS | Present |
| 3 | `Font cssVariable="--font-serif" preload` + `Font cssVariable="--font-sans"` in `BaseLayout.astro` | PASS | Both present, in `<head>` before `<title>` |
| 3 | `rel="preload"` + `as="font"` in `dist/*.html` | PASS | 4 matches (per Deviation 3) |
| 3 | `@font-face` referencing EB Garamond in `dist/_astro/*.css` | PASS (semantic) | Inline in `dist/index.html <style>` instead (Deviation 2) |
| 3 | `npm run check` exits 0 | PASS | 0 errors / 0 warnings / 0 hints |

### Plan-level verification

| Check | Result | Notes |
|-------|--------|-------|
| `npm run check` exit 0 | PASS | |
| `npm run build` exit 0 | PASS | First-after-config build downloaded fonts (~1s; Fontsource cache hot from earlier task-2 build) |
| `dist/_astro/fonts/*.woff2` ≥ 4 | PASS | 7 files |
| Compiled utilities in `dist/_astro/*.css` | PASS | bg-cream, text-ink, border-bronze, font-serif, font-sans all emitted |
| `@font-face` rules in built CSS | PASS (semantic) | Inline in `dist/index.html`, not external CSS (Deviation 2) |
| `rel="preload"` `as="font"` in `dist/index.html` | PASS (4 vs. expected 1) | Deviation 3 — semantic intent satisfied |
| `@media (min-width: 64rem)` in built CSS | PASS (semantic, minified form) | Deviation 1 |
| No `googleapis` or `gstatic` references in `dist/` | PASS | Zero hits — GDPR-safe |
| No `tailwind.config.*` | PASS | None of `.js`, `.mjs`, `.ts` exist |

### Decision-traceability self-check

- **D-01** EB Garamond + Inter via Astro Fonts API + `fontProviders.fontsource()` — Tasks 2 + 3 ✓
- **D-02** 16px mobile → 18px at `sm:`, clamp() headlines from RESEARCH.md §3 — Task 1 ✓
- **D-05** Cream + Ink + Bronze palette, exact hex from RESEARCH.md §4 — Task 1 ✓
- **D-06** Tokens in `src/styles/global.css` `@theme`, no `tailwind.config.*` — Task 1 ✓ (negative verify: file does not exist)

## Threat Surface Scan

No new surface beyond what the plan's `<threat_model>` already enumerated. T-02-01 (info disclosure via font CDN) is mitigated as designed: zero runtime `googleapis`/`gstatic` references in `dist/`. T-02-04 (reduced-motion abuse) is mitigated via the blanket `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; ... } }` rule. T-02-SC (package legitimacy) not triggered — zero new npm dependencies.

## Known Stubs

None. All three deliverables are wired end-to-end (tokens flow through the cascade; fonts load from `dist/_astro/fonts/`; preload links present in HTML). No placeholder values, no mock data, no TODO markers in the modified files.

## Issues Encountered

None blocking. The three deviations above are all gate-wording vs. real-Astro-6-API mismatches that were resolved semantically. No environment problems, no network failures, no build retries.

## User Setup Required

None. All work is committed; no external-service config needed for Phase 2 Plan 1.

## Next Phase Readiness

**Plan 02-02 (component primitives + `/styleguide`) is unblocked.** Consumers can now reference:

- Utility classes: `bg-cream`, `bg-cream-deep`, `text-ink`, `text-ink-soft`, `text-bronze`, `bg-bronze`, `border-bronze`, `border-rule`, `font-serif`, `font-sans`, plus all standard Tailwind utilities derived from `--spacing: 0.25rem`.
- Type scale: bare `<h1>`/`<h2>`/`<h3>`/`<h4>`/`<p>`/`<small>` elements render with the editorial scale automatically — no per-component utility chains needed.
- Fonts: EB Garamond + Inter active on every page using BaseLayout; cssVariables `--font-serif` / `--font-sans` flow through `@theme`.

**Plan 02-02 prerequisite (Wave 0 Gaps from RESEARCH.md):** the styleguide page will need `<slot name="head" />` added to `BaseLayout.astro` (one-line edit) to inject `<meta robots="noindex, nofollow">`. This was intentionally deferred from Plan 02-01 (per Task 3 action note) and is the first task in Plan 02-02.

**Phase 3 (Static Content) and beyond:** every later phase inherits the editorial visual language automatically — no further token work needed.

## Self-Check

Verified before commit:

- `src/styles/global.css` exists and contains `@theme`, all 7 colors, both fonts, clamp() headlines, reduced-motion blanket rule.
- `astro.config.mjs` exists and contains `fontProviders` import and `fonts:` array.
- `src/layouts/BaseLayout.astro` exists and contains Font import + both `<Font />` elements + body class.
- `dist/index.html` exists and contains 4 `rel="preload" as="font"` links + 7 `@font-face` rules inline.
- `dist/_astro/index.v6UYTASt.css` exists and contains compiled utilities + `@media(min-width:64rem)`.
- `dist/_astro/fonts/` contains 7 hashed `.woff2` files.
- Commits `aed457e`, `4ba098a`, `7f27171` exist on `main` (verified via `git log --oneline -5`).

## Self-Check: PASSED

---
*Phase: 02-design-system*
*Completed: 2026-05-17*
