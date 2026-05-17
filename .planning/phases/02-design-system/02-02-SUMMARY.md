---
phase: 02-design-system
plan: 02
subsystem: design
tags: [astro, astro-6, tailwind-v4, components, primitives, styleguide, accessibility, motion, noindex, slot, head-injection]

requires:
  - phase: 02-design-system/02-01
    provides: "@theme tokens (cream/ink/bronze + EB Garamond/Inter) + @layer base type scale + self-hosted fonts via Astro 6 Fonts API"
provides:
  - "BaseLayout <slot name=\"head\" /> — named head slot after <Font /> preloads with HTML comment documenting slot-ordering invariant for Phase 6 SEO meta"
  - "Button primitive (src/components/ui/Button.astro) — 3 variants (primary/secondary/ghost) × 3 sizes (sm/md/lg), polymorphic as=button|a, motion-safe:transition-colors hover, focus-visible:outline-bronze, loading?: boolean prop with aria-busy + motion-safe:animate-spin CSS-only spinner"
  - "Section primitive (src/components/ui/Section.astro) — required id, tone='cream'|'cream-deep', py-16/sm:py-24/lg:py-32 vertical rhythm, max-w-6xl content well"
  - "Nav primitive (src/components/ui/Nav.astro) — static non-sticky, aria-label=\"Primary\", brand + 4 anchor links (sticky/hamburger deferred to Phase 3 CONTENT-06)"
  - "Footer primitive (src/components/ui/Footer.astro) — semantic <footer> with 4 named slots (brand/links/social/legal), 4-col lg grid, auto-rendered copyright year"
  - "/styleguide route (src/pages/styleguide.astro) — production-shipped reference page with noindex meta (via head slot) + Disallow in robots.txt; demos all 7 palette swatches, h1-h4+body+small typography ladder, 9 Button cells + 4 states, Nav, Footer; ONE motion demo (Button hover) wrapped in motion-safe:"
  - "public/robots.txt update — `Disallow: /styleguide` line; Sitemap line preserved byte-identical (sitemap-index.xml, NOT sitemap.xml)"
affects: [03-static-content-sections, 04-portfolio-gallery, 05-contact-form, 06-seo-sitemap]

tech-stack:
  added: []
  patterns:
    - "Astro primitive pattern (D-07): plain .astro files with `interface Props extends HTMLAttributes<'tag'>` + `<slot />` + `class:list={[...]}`. No tailwind-merge, no class-variance-authority. Variant selection via plain `Record<Variant, string>` lookup objects."
    - "/styleguide ships in production behind defense-in-depth noindex (per-page <meta robots=\"noindex, nofollow\"> + robots.txt Disallow) — owner-accessible reference, search-engine invisible"
    - "Button `loading` state: combines `disabled` attribute + `aria-busy=\"true\"` + a CSS-only spinner span (border trick: `h-3 w-3 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin`). Zero JS, zero SVG, zero dependencies. Phase 5 contact form will wire `loading={isSubmitting}` directly."
    - "BaseLayout slot-ordering invariant for SEO meta: `<slot name=\"head\" />` placed AFTER `<Font />` preloads, with HTML comment in the file documenting why. Phase 6 06-01 must preserve this order so injected `<link rel=\"preload\">` for images/scripts does not preempt the higher-priority font preloads."
    - "Tailwind v4 dynamic class safelist via HTML comment at top of file: lists `bg-cream bg-cream-deep bg-ink bg-ink-soft bg-bronze bg-bronze-hover bg-rule` as plain string literals so the v4 content scanner emits the CSS for the swatch grid's `bg-${c.name}` interpolation"

key-files:
  created:
    - src/components/ui/Button.astro
    - src/components/ui/Section.astro
    - src/components/ui/Nav.astro
    - src/components/ui/Footer.astro
    - src/pages/styleguide.astro
    - .planning/phases/02-design-system/02-02-SUMMARY.md
  modified:
    - src/layouts/BaseLayout.astro
    - public/robots.txt

key-decisions:
  - "Tailwind v4 dynamic-class safelist comment placed ABOVE the Astro frontmatter (rendered as an HTML comment in the dist output) rather than inside the frontmatter as a JS comment. Either location feeds the v4 scanner; HTML-comment-at-top makes the safelist purpose visible to anyone opening the source file. The comment renders into dist/styleguide/index.html above <html>, which is harmless on a noindex page (and is plain documentation, not a leak)."
  - "Lighthouse a11y verified via headless CLI (lighthouse@13.3.0) with --form-factor=mobile, score 100/100. Mitigation in <risks> (bronze-on-cream ghost-hover swap to ink) NOT triggered — color-contrast audit passed cleanly at 1.0."
  - "h1 count = 2 in the styleguide (one in #intro section per BaseLayout pattern + one in #typography section per the plan's literal template demoing the h1 type scale). Lighthouse heading-order audit passes (1.0); modern Lighthouse no longer enforces single-h1. See Deviation 2."

patterns-established:
  - "src/components/ui/ as the home for design-system primitives (Button, Section, Nav, Footer here; Phase 3 will add composed sections under src/components/sections/)"
  - "Polymorphic `as=button|a` pattern using a local `const Tag = as;` so Astro can render either tag from the same primitive — avoids a separate ButtonLink primitive"
  - "Required-id Section pattern: `interface Props { id: string }` (NOT optional) so Phase 3 smooth-scroll nav anchors against guaranteed-present targets"
  - "Named slots with default fallback content in Footer (`<slot name=\"brand\"><p>...</p></slot>`) — primitives render with zero props in the styleguide AND accept full content overrides in Phase 3"
  - "Loading-state convention for any future async-button: `loading?: boolean` → toggles `disabled` + `aria-busy=\"true\"` + renders the same CSS spinner span. Phase 5 contact form inherits this directly."

requirements-completed: [DESIGN-03, DESIGN-05]

duration: ~7min
completed: 2026-05-17

human_checkpoint_pending:
  description: "Per plan Task 3 <how-to-verify>, the following sub-tests cannot be automated end-to-end and require a human reviewer at the browser. Lighthouse automated portion completed cleanly (100/100); the items below are visual / interaction tests that no headless tool can substitute for."
  items:
    - "Visual smoke test (Step 3): all 7 swatches render correct cream/ink/bronze hues, all 9 Buttons render in 3×3 grid, disabled is visibly faded, loading shows spinning ring + cannot be clicked, Nav + Footer render correctly with current year (2026)"
    - "Type scale sweep (Step 4) at 320 / 640 / 1024 / 1280px viewport widths: confirm h1 ≈ 40px at 320, ≈ 112px at 1280; body 16→18px crossover at sm; line-length ≤ 65ch"
    - "Tab-focus indicator (Step 5): visible bronze outline with ~4px offset on every interactive element (nav links, every Button except disabled/loading) when navigating with Tab key"
    - "Reduced-motion verification (Step 6): DevTools → Rendering → 'prefers-reduced-motion: reduce' → hover Button gives INSTANT color change (no transition), Loading button spinner is STATIC. Toggle back: transition + spin restored."
    - "Same-origin font verification (Step 9): DevTools Network → reload /styleguide → all .woff2 requests served from localhost (NOT fonts.googleapis.com / fonts.gstatic.com / cdn.jsdelivr.net). Critical for GDPR — no third-party request from EU visitor IPs."

---

# Phase 2 Plan 02: Component Primitives + /styleguide Summary

**Editorial design-system surface: four zero-JS Astro primitives (Button with `loading` state, Section, Nav, Footer) consuming Plan 02-01's tokens, plus a production-shipped `/styleguide` reference page (noindex + robots Disallow) demonstrating every token and the phase's one `motion-safe:` hover example — Lighthouse mobile accessibility 100/100.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-05-17T15:47:30Z
- **Completed:** 2026-05-17T15:54:00Z
- **Tasks:** 3 (2 auto + 1 partial-checkpoint with automated Lighthouse portion completed)
- **Files modified:** 7 (5 created + 2 modified)
- **Net-new npm packages:** 0
- **Commits:** 2 task commits + 1 summary commit = 3 total for plan

## Accomplishments

- **BaseLayout extended:** `<slot name="head" />` injected between `<Font />` preload elements and `<title>`, preceded by an HTML comment documenting the slot-ordering invariant for Phase 6 SEO meta. No reordering of existing `<head>` content.
- **Four primitives shipped** under `src/components/ui/`, all following the D-07 pattern (`interface Props extends HTMLAttributes<'tag'>` + `<slot />` + `class:list`). Zero `<script>` blocks. Zero client JS.
  - **Button:** 3 variants × 3 sizes; polymorphic `as=button|a`; motion-safe hover; bronze focus-visible ring; `loading?: boolean` prop that toggles `disabled` + `aria-busy="true"` and renders a CSS-only border-trick spinner with `motion-safe:animate-spin`.
  - **Section:** required `id`, `tone='cream'|'cream-deep'`, max-width 6xl content well, py-16/sm:py-24/lg:py-32 rhythm.
  - **Nav:** static (non-sticky) with `aria-label="Primary"`, brand + 4 anchor links, hidden on mobile (sm:flex). Sticky + hamburger explicitly deferred to Phase 3 CONTENT-06.
  - **Footer:** semantic `<footer>` with 4 named slots (`brand`/`links`/`social`/`legal`), 4-col lg grid, auto-rendered copyright year via `new Date().getFullYear()`.
- **`/styleguide` route shipped** at `src/pages/styleguide.astro` — production-built (`dist/styleguide/index.html`, 17,035 bytes), noindex via `<meta slot="head" ...>` consuming the new BaseLayout head slot. Renders 7 color swatches, h1→h4 + body + small type ladder, 9 Button cells (3×3) + 4 states row (disabled, loading, icon-only with aria-label, link-as-button), Nav at top, Footer at bottom.
- **`public/robots.txt` updated:** `Disallow: /styleguide` appended after `Allow: /`. Existing `Sitemap: https://klphotography.ie/sitemap-index.xml` line preserved byte-identical (verified — still reads `sitemap-index.xml`, NOT `sitemap.xml`).
- **Tailwind v4 dynamic-class safelist comment** added at the top of `styleguide.astro` listing all 7 palette `bg-*` literals so the content scanner emits CSS for the swatch grid's `bg-${c.name}` interpolation. Verified in `dist/_astro/BaseLayout.CWx709VC.css` — all 7 utilities (`.bg-cream`, `.bg-cream-deep`, `.bg-ink`, `.bg-ink-soft`, `.bg-bronze`, `.bg-bronze-hover`, `.bg-rule`) emitted with correct `var(--color-*)` values.
- **Motion demo compiled** into `dist/_astro/BaseLayout.CWx709VC.css` as `.motion-safe\:transition-colors{...}` and `.motion-safe\:animate-spin{...}`, both nested inside `@media(prefers-reduced-motion:no-preference){...}` — neutralized under reduced-motion as required.
- **Lighthouse mobile accessibility: 100/100** (lighthouse@13.3.0 headless, against `http://localhost:4321/styleguide`). 0 failed audits, 18 passed, 10 manual (the standard non-automatable items the human checkpoint covers).

## Task Commits

| Task | Subject | Hash | Files |
|------|---------|------|-------|
| 1 | feat(02-02): add BaseLayout head slot + 4 UI primitives | `3a82315` | `src/layouts/BaseLayout.astro`, `src/components/ui/Button.astro`, `src/components/ui/Section.astro`, `src/components/ui/Nav.astro`, `src/components/ui/Footer.astro` |
| 2 | feat(02-02): ship /styleguide route + robots Disallow | `f13063f` | `src/pages/styleguide.astro`, `public/robots.txt` |

(Summary commit `docs(02-02): summary` follows separately per execute-plan protocol.)

## Files Created/Modified

**Created:**
- `src/components/ui/Button.astro` — 67 lines
- `src/components/ui/Section.astro` — 22 lines
- `src/components/ui/Nav.astro` — 36 lines
- `src/components/ui/Footer.astro` — 28 lines
- `src/pages/styleguide.astro` — 107 lines (incl. 7-line safelist comment block)

**Modified:**
- `src/layouts/BaseLayout.astro` — added 2 lines inside `<head>`: HTML comment documenting slot-ordering invariant + `<slot name="head" />`
- `public/robots.txt` — appended 1 line: `Disallow: /styleguide` (Sitemap line untouched)

## Decisions Made

See `key-decisions` in frontmatter. The substantive notes:

1. **Safelist comment placement (above frontmatter, HTML-comment form):** the plan offered two valid options (HTML comment at top, or JS comment inside frontmatter). I chose HTML-comment-at-top because it remains visible to anyone opening the source without parsing the frontmatter delimiters. The comment renders into `dist/styleguide/index.html` above the `<html>` tag — harmless on a noindex page.

2. **Lighthouse via lighthouse@13.3.0 (current latest as of 2026-05-17):** the plan permitted either DevTools or CLI; CLI is reproducible. First `npx --yes lighthouse@latest ...` call failed mid-install with `ERR_SSL_CIPHER_OPERATION_FAILED` (transient Windows npm registry SSL hiccup); retry succeeded. No package install was added to `package.json` — npx ran the cached `_npx` copy.

3. **No mitigation triggered:** the plan's `<risks>` listed a bronze-on-cream ghost-hover contrast warning as a possible <95 failure mode, with the fallback of "swap ghost hover to ink for ≥body sizes". Lighthouse `color-contrast` audit scored 1.0 — mitigation not needed.

## Deviations from Plan

### 1. [Rule 3 — Verify gate wording vs real build output] `motion-safe:transition-colors` grep in Task 2 verify gate matches escaped form in built CSS

- **Found during:** Task 2 verify.
- **Issue:** Plan's verify gate `grep -E 'motion-safe:transition-colors' dist/_astro/*.css > /dev/null` does not match because CSS spec requires colon characters in class selectors to be backslash-escaped. Tailwind v4 emits the rule as `.motion-safe\:transition-colors{...}` (with `\:`), so a literal `motion-safe:transition-colors` pattern does not match.
- **Real-build evidence:** `grep -n 'motion-safe\\\\:transition-colors' dist/_astro/BaseLayout.CWx709VC.css` returns the rule at offset, nested inside `@media(prefers-reduced-motion:no-preference){...}`. The motion demo is shipped, compiled, and correctly gated. Semantic intent of the gate (confirm motion-safe transition is compiled into the bundle under the no-preference media query) is fully satisfied.
- **Fix:** Documented as deviation per the user's explicit instruction ("Real-build evidence beats text-grep expectations" — same class of issue as Wave 1's Deviation 1). No code change. Same root cause as Wave 1's regex/build-output mismatches.
- **Files modified:** None.
- **Committed in:** N/A (verify-gate-wording deviation only).
- **Forward-looking note:** Phase 6 / future plan verify gates that grep built CSS for `:`-containing classes should account for backslash-escaped output, e.g. `grep -E 'motion-safe\\\\:transition-colors'` or `grep -E 'motion-safe[:\\\\]+transition-colors'`.

### 2. [Rule 3 — Plan internal inconsistency] h1 count = 2 vs plan `<done>` "exactly one h1"

- **Found during:** Task 2 verify and plan-level review.
- **Issue:** Plan Task 2's `<done>` says "The page contains exactly one `<h1>` (in the `#intro` section)." But the same Task 2's `<action>` template explicitly includes BOTH `<h1>Styleguide</h1>` in `#intro` AND `<h1>Hero h1 — clamp(2.5rem, 8vw, 7rem)</h1>` in the `#typography` ladder demo. Following the plan's literal action template ships 2 h1s; the `<done>` criterion contradicts the action it precedes.
- **Decision:** Followed the plan's literal `<action>` template (2 h1s — Studio + Hero-ladder-demo) because (a) the typography section's purpose IS to demonstrate the h1 type scale visually, and (b) the must_haves "User sees... typography ladder (h1 clamp → h4 + body + small)" explicitly expects an h1 in the typography demo.
- **Real-build evidence:** Lighthouse `heading-order` audit scored 1.0 (PASS). Modern Lighthouse (13.x) does NOT audit single-h1 — the audit was removed because real-world heading semantics with multiple h1s (one per `<section>` in HTML5 outline algorithm) are valid. Lighthouse a11y still scored 100/100.
- **Fix:** Documented as deviation. No code change. The literal `<action>` template is the source of truth for what to render; the `<done>` "exactly one h1" line is an internal inconsistency in the plan to flag for future revisions.
- **Files modified:** None.
- **Committed in:** N/A.

### 3. [Rule 3 — Transient env issue, resolved on retry] First `npx lighthouse` invocation failed mid-install with SSL cipher error

- **Found during:** Task 3 automated Lighthouse run.
- **Issue:** First `npx --yes lighthouse@latest ...` invocation downloaded most of the package tree, then failed with `npm error code ERR_SSL_CIPHER_OPERATION_FAILED` / `OpenSSL ossl_gcm_stream_update cipher operation failed`. This is a transient Windows / npm registry SSL handshake issue; no package corruption.
- **Fix:** Re-ran the identical command — succeeded on retry, producing the expected `lighthouse-styleguide.json` report. No code change. No package install (npx ran the cached `_npx` copy; `package.json` untouched).
- **Files modified:** None.
- **Committed in:** N/A.

### Total deviations

**3 documented.** All three are gate/wording/transient-environment issues, not scope or implementation deviations. Zero changes to deliverable scope. Zero new npm dependencies. Plan substance (4 primitives + head-slot + /styleguide + robots Disallow + ONE motion demo + Lighthouse ≥95) is fully shipped.

## Verify Gates

### Per-task verify gates

| Task | Gate | Result | Notes |
|------|------|--------|-------|
| 1 | `slot name="head"` + `Slot ordering:` in BaseLayout | PASS | Both present |
| 1 | All 4 primitive files exist under `src/components/ui/` | PASS | |
| 1 | Button has `HTMLAttributes` + `class:list` + `motion-safe:transition-colors` + `focus-visible:outline-bronze` + `loading` + `aria-busy` + `motion-safe:animate-spin` | PASS | All 7 greps return matches |
| 1 | Nav has `aria-label="Primary"` | PASS | |
| 1 | No `tailwind-merge` or `class-variance-authority` in `package.json` | PASS | |
| 1 | `npm run check` + `npm run build` exit 0 | PASS | 0 errors / 0 warnings / 0 hints |
| 2 | `styleguide.astro` imports `BaseLayout`, contains `noindex` + `slot="head"` + safelist comment + 7-bg literal block | PASS | All greps match |
| 2 | `Disallow: /styleguide` AND `Sitemap: https://klphotography.ie/sitemap-index.xml` in `public/robots.txt` | PASS | Byte-identical Sitemap line preserved (sitemap-index.xml) |
| 2 | `dist/styleguide/index.html` contains literal `<meta name="robots" content="noindex, nofollow"` | PASS | Not entity-escaped |
| 2 | All 7 palette `bg-*` utilities in `dist/_astro/*.css` (≥7 unique matches) | PASS | All 7 emitted with `var(--color-*)` |
| 2 | `motion-safe:transition-colors` compiled into `dist/_astro/*.css` | PASS (semantic) | Emitted as escaped `.motion-safe\:transition-colors{...}` nested in `@media(prefers-reduced-motion:no-preference){...}` (Deviation 1) |
| 3 (auto) | `npm run preview` boots on localhost:4321 | PASS | Background process |
| 3 (auto) | Lighthouse mobile accessibility ≥ 95 | PASS — **100/100** | 0 failed / 18 passed / 10 manual / 48 N/A audits |
| 3 (auto) | color-contrast, heading-order, button-name, link-name, landmark-one-main audits all 1.0 | PASS | None triggered the `<risks>` ghost-hover mitigation |

### Plan-level verification

| Check | Result | Notes |
|-------|--------|-------|
| `npm run check` exit 0 | PASS | 10 files checked, 0 errors |
| `npm run build` exit 0 | PASS | 2 pages built (index + styleguide) |
| `npm run preview` serves `/styleguide` HTTP 200 | PASS | 17,035 bytes |
| `/robots.txt` serves expected 5 lines incl. Disallow + Sitemap | PASS | Curl-verified |
| Lighthouse mobile a11y ≥95 on /styleguide | PASS — 100/100 | lighthouse@13.3.0, headless Chrome |

### Decision-traceability self-check

- **D-03** (styleguide ships in production with noindex meta + robots/sitemap exclusion; BaseLayout has `<slot name="head" />`): Tasks 1 + 2 ✓. **Sitemap exclusion deferred to Phase 6 06-01** per plan — documented in next-phase-readiness as explicit blocker.
- **D-04** (exactly ONE motion example, motion-safe-wrapped): Task 1 Button `motion-safe:transition-colors` + the styleguide #buttons section copy ✓. Loading spinner uses the same `motion-safe:` gate (`motion-safe:animate-spin`), not a second uncovered motion source.
- **D-07** (plain .astro files with `HTMLAttributes` extension + `<slot />` + `class:list`; no `tailwind-merge`, no CVA): All 4 primitives ✓ per Task 1 verify.

### Source coverage (ROADMAP Phase 2 success criteria)

| Roadmap success criterion | Implemented in |
|---|---|
| 1. Design tokens visible on styleguide | `/styleguide` #palette (7 swatches with hex labels) and #typography (h1-h4 + body + small ladder) sections render every Plan 02-01 token via Tailwind utilities |
| 2. Button, Nav, Section, Footer primitives render + pass responsive checks | All 4 created in Task 1; pre-built styleguide HTML inspected shows all 9 Button cells + 4 states row, Nav with brand + 4 links, Footer with copyright. Visual responsive sweep at 320/640/1024/1280px is human-checkpoint pending. |
| 3. Animation respects prefers-reduced-motion | Button `motion-safe:transition-colors` + `motion-safe:animate-spin` compiled into `@media(prefers-reduced-motion:no-preference){...}` in `dist/_astro/*.css` — verified semantically. Human DevTools toggle test pending. |
| 4. Lighthouse a11y ≥95 on styleguide | **100/100** via lighthouse@13.3.0 headless mobile — explicit gate satisfied with maximum score. |

## Threat Surface Scan

No new surface introduced beyond what the plan's `<threat_model>` enumerated. All four `mitigate` dispositions verified:

- **T-02-06 (robots.txt mis-edit):** Sitemap line byte-identical (`grep -q 'Sitemap: https://klphotography.ie/sitemap-index.xml' public/robots.txt` PASS). No accidental rename to `sitemap.xml`.
- **T-02-07 (noindex bypass via single signal):** BOTH `<meta name="robots" content="noindex, nofollow">` (verified literal in built HTML) AND `Disallow: /styleguide` in robots.txt are present — defense in depth.
- **T-02-08 (motion-sensitive user encounters un-gated animation):** Button transition + spinner both wrapped in `motion-safe:`, plus the blanket reduced-motion rule from 02-01 (`*, ::before, ::after { transition-duration: 0.01ms !important; ... }`) is the backstop. Lighthouse confirms zero contrast/motion-related failed audits.
- **T-02-09 (XSS via consumer className):** All 4 primitives use Astro's `class:list` directive which only accepts strings/arrays/objects and is HTML-attribute-escaped. No `set:html` anywhere in this plan's surface.
- **T-02-SC (package legitimacy):** Zero new npm packages installed. lighthouse@13.3.0 was run via npx for verification only — `package.json` unmodified.

No new threat flags discovered.

## Known Stubs

None. All four primitives are fully wired with no placeholder/mock data:
- Button renders functional `<button>` or `<a>` tags with real variant/size class chains; loading state really toggles `aria-busy`.
- Section renders functional `<section>` with real id-anchor target.
- Nav renders 4 real anchor links (`#about`, `#pricing`, `#testimonials`, `#contact`) — they point at sections Phase 3 will create; the styleguide intentionally doesn't have matching IDs because its purpose is to demo the Nav primitive, not provide working in-page jumps.
- Footer renders real copyright year (`new Date().getFullYear()` → `2026`).
- /styleguide renders all primitives with real, not mocked, data.

## Issues Encountered

**Lighthouse install transient SSL failure (one retry).** Documented as Deviation 3. Not blocking; resolved on second attempt.

**No environment / no build / no commit issues.** All commits respect git hooks (no `--no-verify` used). Working tree clean throughout.

## User Setup Required

None. All work is committed; no external-service config needed for Phase 2 Plan 2.

## Human Checkpoint Items Still Pending

Per `human_checkpoint_pending` in frontmatter — the following items from Plan Task 3 `<how-to-verify>` (steps 3, 4, 5, 6, 9) cannot be automated by headless Lighthouse and require a human at a browser:

1. **Step 3 — Visual smoke test:** swatches, buttons, Nav, Footer all render with correct hues + current year.
2. **Step 4 — Type scale viewport sweep** at 320 / 640 / 1024 / 1280px (h1 ≈ 40px / 56px / 80px / 112px progression; body 16→18px at sm; ≤65ch line-length).
3. **Step 5 — Tab focus indicator:** bronze outline visible with ~4px offset on every interactive element when tabbing.
4. **Step 6 — Reduced-motion verification:** DevTools toggle `prefers-reduced-motion: reduce` → Button hover gives INSTANT color change; loading spinner is STATIC. Toggle back: behavior restored.
5. **Step 9 — Same-origin font verification:** DevTools Network → reload `/styleguide` → all `.woff2` requests from localhost, NONE from `fonts.googleapis.com` / `fonts.gstatic.com` / `cdn.jsdelivr.net`. GDPR-critical for EU visitors.

Automated portion (Steps 1, 2 build/preview + Step 7 noindex source-view + Step 8 Lighthouse) is complete and PASSING. The user/orchestrator should run Steps 3-6 + 9 in a real browser, then confirm `approved` to close the human gate.

## Next Phase Readiness

**Phase 2 success criteria fully met:**
- Design tokens visible on styleguide ✓
- 4 primitives ship + render ✓
- Animation respects prefers-reduced-motion ✓ (compiled into media query; human DevTools toggle verification pending in checkpoint)
- Lighthouse a11y ≥95 ✓ (100/100)

**Phase 3 (Static Content Sections / CONTENT-01..07) is unblocked.** Phase 3 inherits:
- All 4 primitives importable via `@/components/ui/<Name>.astro`
- Editorial type scale already applied to bare h1-h4 / p / small elements via `@layer base` (no per-component class chains needed)
- BaseLayout with `<slot name="head" />` available for any per-page meta injection (e.g., per-section OG tags Phase 6 will add)
- The `<Footer>` named slots (`brand`/`links`/`social`/`legal`) ready for Phase 3 CONTENT-07 to fill with real content
- The `<Nav>` brand prop overridable; Phase 3 CONTENT-06 will replace this static version with a sticky + hamburger interactive version

**Phase 5 (Contact Form):**

> **READY FOR PHASE 5 (CONTACT-FORM):** The Button primitive accepts a `loading?: boolean` prop that toggles `disabled` + `aria-busy="true"` and renders a CSS-only spinner. Phase 5's contact form submit button can wire this directly with no additional changes to the Button component.

**Phase 6 (SEO + Sitemap):**

> **BLOCKER FOR PHASE 6 PLAN 06-01:** Phase 2 deferred `/styleguide` sitemap exclusion because no sitemap config existed yet. 06-01 MUST filter `/styleguide` from the generated sitemap, e.g. via `@astrojs/sitemap` config `filter: (page) => !page.endsWith('/styleguide/')`. Additionally, 06-01 MUST preserve the BaseLayout `<head>` slot ordering invariant: any new SEO meta tags injected via `<slot name="head" />` must NOT precede the `<Font />` preloads (which carry the higher fetch priority). The HTML comment above `<slot name="head" />` in BaseLayout.astro documents this; do not remove it.

## Self-Check

Verified before commit:

- `src/components/ui/Button.astro` exists and contains `interface Props extends HTMLAttributes<'button'>` + `loading?: boolean` + `aria-busy` + `motion-safe:animate-spin` spinner + `motion-safe:transition-colors` + `focus-visible:outline-bronze`.
- `src/components/ui/Section.astro` exists with required `id: string` + `tone?: Tone` + max-w-6xl content well.
- `src/components/ui/Nav.astro` exists with `aria-label="Primary"` + 4 anchor links + brand default.
- `src/components/ui/Footer.astro` exists with semantic `<footer>` + 4 named slots + auto year.
- `src/pages/styleguide.astro` exists with safelist comment listing all 7 bg-* literals + BaseLayout import + Nav/Footer + 9 Button cells + 4 states + 7 swatches.
- `src/layouts/BaseLayout.astro` contains `<slot name="head" />` inside `<head>` between `<Font />` elements and `<title>`, with slot-ordering HTML comment.
- `public/robots.txt` contains `Disallow: /styleguide` and Sitemap line is byte-identical (`sitemap-index.xml`).
- `dist/styleguide/index.html` exists, 17,035 bytes, contains literal `<meta name="robots" content="noindex, nofollow">`.
- `dist/_astro/BaseLayout.CWx709VC.css` exists and contains all 7 `.bg-*{background-color:var(--color-*)}` palette rules + `.motion-safe\:transition-colors{...}` + `.motion-safe\:animate-spin{...}` inside `@media(prefers-reduced-motion:no-preference){...}`.
- Commits `3a82315` and `f13063f` exist on `main` (verified via `git log --oneline -5`).
- Lighthouse JSON at `$TEMP/lighthouse-styleguide.json` shows `categories.accessibility.score = 1.0` (100/100), 0 failed audits.

## Self-Check: PASSED

---
*Phase: 02-design-system*
*Completed: 2026-05-17*
