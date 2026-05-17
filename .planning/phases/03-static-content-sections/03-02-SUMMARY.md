---
phase: 03-static-content-sections
plan: 02
subsystem: editorial
tags: [astro, astro-6, tailwind-v4, sections, testimonials, contact, footer-wiring, privacy-stub, social-icons, simple-icons, whatsapp, html5-form-validation, gdpr, robots-txt]

requires:
  - phase: 02-design-system/02-02
    provides: "Section/Button/Nav/Footer primitives + BaseLayout <slot name=\"head\" /> + Tailwind v4 @theme tokens + EB Garamond italic + bronze focus utilities"
  - phase: 03-static-content-sections/03-01
    provides: "Hero/PortfolioStub/About/Pricing section components + initial src/pages/index.astro assembly with bare <Footer /> + placeholder JPEGs under src/assets/placeholder/"
provides:
  - "src/components/icons/SocialIcons.astro — single-source brand SVG component with `brand: 'instagram' | 'facebook' | 'whatsapp'` union; inline CC0 paths verified from raw.githubusercontent.com/simple-icons/simple-icons on 2026-05-17 (D-12)"
  - "src/components/sections/Testimonials.astro — Section cream, 3-col lg grid (1 col mobile) of figure/blockquote/figcaption; 1 VERIFIED Louise & Jonathan quote (HTML-comment marker) + 2 [OWNER-REVIEW] placeholder figures with [OWNER-CONFIRM:first-name] / [OWNER-CONFIRM:couple-names] / [OWNER-CONFIRM:venue] literal tokens; EB Garamond italic body; bronze oversized opening quote glyph; NO author photos (RESEARCH §1) (CONTENT-04)"
  - "src/components/sections/Contact.astro — Section cream-deep, 2-col lg grid (form left col-span-2 + direct contact aside right); form id=contact-form novalidate + off-screen honeypot contact_company + 5 visible fields + Turnstile Phase-5 comment stub + privacy-adjacent disclosure (link to /privacy) + Button submit + #cf-notice live region; checkValidity submit handler + 'Form not yet active' notice; direct contact aside with tel:+353851665472 + mailto:klphotography.ie@gmail.com + 3 SocialIcons links (IG verified, FB deliberately broken [OWNER-CONFIRM:facebook-handle] per D-05, WhatsApp wa.me/353851665472 per D-06) (CONTENT-05)"
  - "src/pages/privacy.astro — stub privacy page per D-09: BaseLayout title/description + <meta slot=\"head\" name=\"robots\" content=\"noindex, nofollow\"> + Nav + Section cream with h1+stub body+[OWNER-REVIEW] italic trailer + slot-filled Footer identical to home (Phase 5 GDPR-01 swaps body only)"
  - "public/robots.txt — appended `Disallow: /privacy`; preserved byte-identical `Disallow: /styleguide` and `Sitemap: https://klphotography.ie/sitemap-index.xml` (NOT sitemap.xml — T-03-11 mitigation)"
  - "src/pages/index.astro — extended: imports Testimonials + Contact + SocialIcons; renders Testimonials + Contact inside <main> after Pricing; bare <Footer /> replaced with slot-filled brand/links/social (6 links incl. /privacy, NO Portfolio per D-03); legal slot left to Footer's default copyright fallback (CONTENT-07)"
affects: [03-03 (sticky nav + hamburger + scroll-mt baseline on Section.astro will apply to all 6 anchor sections now shipped), 05 (Contact form backend wiring + GDPR-01 swaps privacy.astro body)]

tech-stack:
  added: []
  patterns:
    - "src/components/icons/ established as the home for non-primitive non-section presentation atoms (frontmatter typed-prop SVG dispatcher pattern; future Phase 6 SEO favicons / share-image meta-images can follow same convention)"
    - "Slot-filled Footer pattern proven on TWO consumers (src/pages/index.astro AND src/pages/privacy.astro) with byte-identical brand/links/social children — confirmed simpler than a shared <FooterContent /> partial when both copies are identical (zero divergence risk; one less file)"
    - "Absolute in-page anchor links (`href=\"/#about\"`) work from both `/` and `/privacy` with zero conditional logic — browser resolves `/#about` to current page when on `/`, navigates to `/` then scrolls to `#about` when on `/privacy`. Single markup, path-symmetric."
    - "Contact form HTML5 validation timing: `novalidate` on form + `e.preventDefault()` + `form.checkValidity() || form.reportValidity()` in submit handler. Disables browser auto-popup on input change but preserves `required` / `type=email` / `minlength` enforcement at submit time (RESEARCH §8). Phase 5 swaps the no-op body for `fetch('/api/contact')` without touching the validation gate."
    - "Honeypot positioned via `absolute -left-[9999px] h-0 w-0 overflow-hidden` + `aria-hidden=\"true\"` + `tabindex=\"-1\"` + `autocomplete=\"off\"`, NOT `display:none` — bots increasingly inspect computed style to skip hidden fields; off-screen positioning still renders. Defense-in-depth alongside Phase 5 backend enforcement (T-03-07 accept disposition)."
    - "Astro scoped `<script>` in Contact.astro is Vite-hoisted into the bundled module — no inline script, no CSP concerns. Form/notice referenced by `getElementById` (stable IDs survive across server/client boundary)."

key-files:
  created:
    - src/components/icons/SocialIcons.astro
    - src/components/sections/Testimonials.astro
    - src/components/sections/Contact.astro
    - src/pages/privacy.astro
    - .planning/phases/03-static-content-sections/03-02-SUMMARY.md
  modified:
    - public/robots.txt
    - src/pages/index.astro

key-decisions:
  - "Footer slot children DUPLICATED across src/pages/index.astro and src/pages/privacy.astro (byte-identical brand/links/social blocks) rather than extracted into a shared <FooterContent /> partial. Rationale: both copies are byte-identical and the absolute `href=\"/#about\"` anchor format works from both routes — duplication risk is zero, file count is lower, and Phase 5's privacy.astro body swap touches only the Section body, not the Footer wiring. Plan's <output> Decisions section explicitly mandates this choice."
  - "Absolute anchor href format `href=\"/#about\"` (etc.) used in BOTH footers — chosen over `href=\"#about\"` (which would break the /privacy footer's About link) and over conditional rendering (`currentPath === '/' ? '#about' : '/#about'` — adds branching for zero functional difference)."
  - "Contact submit handler kept inside Contact.astro as scoped Astro `<script>` rather than extracted to a separate src/scripts/ module — single-page consumer, ~12 lines of JS, no shared utility. Phase 5 backend swap touches only this script body."
  - "FacebookURL ships as literal `https://facebook.com/[OWNER-CONFIRM:facebook-handle]` in BOTH the Contact aside AND both footer copies (3 occurrences total in source, 3 in built HTML — visible to owner during walkthrough) per D-05 / T-03-06 — the broken URL is the mitigation, not a flaw."
  - "robots.txt: `Disallow: /privacy` inserted IMMEDIATELY after `Disallow: /styleguide` (line 4), preserving every other line byte-identical (User-agent / Allow / blank-separator / Sitemap). Sitemap line MUST remain `sitemap-index.xml` per Phase 2 lesson (T-03-11) — verify gate's negative grep for `sitemap.xml` confirms no accidental rename."
  - "Testimonials does NOT import any image assets — RESEARCH §1 + revised 03-01 plan deliberately skip author photos to avoid faces competing with the portfolio. No JPEGs in `src/assets/placeholder/` for testimonials, so there is no unused-asset to flag."

patterns-established:
  - "src/components/icons/<Name>.astro for inline brand/utility SVG dispatchers (CC0 source path-string lookups; class-overridable; aria-label via typed brand prop)"
  - "Slot-filled Footer pattern with absolute /#anchor href format — works uniformly from `/` and any sub-route"
  - "HTML5 form validation gate: `novalidate` + `e.preventDefault()` + `checkValidity()` / `reportValidity()` — disable browser auto-popup but preserve constraint validation; Phase 5 backend wiring is a script-body swap, not a markup change"
  - "Honeypot off-screen positioning (-left-[9999px] h-0 w-0 overflow-hidden) — defeats trivial scrapers; bots that check display:none are blocked at the source"
  - "Stub-page convention: `<meta slot=\"head\" name=\"robots\" content=\"noindex, nofollow\">` + visible [OWNER-REVIEW] tag in body + robots.txt Disallow line — three-way defense against placeholder content being indexed before launch (T-03-08 mitigation)"

requirements-completed: [CONTENT-04, CONTENT-05, CONTENT-07]

duration: ~5min
completed: 2026-05-17

---

# Phase 3 Plan 02: Testimonials + Contact + Footer wiring + /privacy stub Summary

**Bottom-half editorial assembly: SocialIcons brand-SVG dispatcher (single source for IG/FB/WhatsApp) + Testimonials section (3 figures, no author photos) + Contact section (form UI + honeypot + Turnstile stub + direct contact block with IG/FB/WA) + /privacy stub page with noindex meta + robots.txt update + Footer slots wired identically across home + privacy. After 03-01 + 03-02 the home page reads as a complete editorial site, modulo the sticky-nav / hamburger interactivity landing in 03-03.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-17T17:32:14Z
- **Completed:** 2026-05-17T17:37:55Z
- **Tasks:** 3 (all auto, all completed)
- **Files created:** 4 (SocialIcons.astro + Testimonials.astro + Contact.astro + privacy.astro)
- **Files modified:** 2 (`public/robots.txt`, `src/pages/index.astro`)
- **Net-new npm packages:** 0
- **Commits:** 3 task commits + 1 summary commit (this file) = 4 total for plan

## Accomplishments

- **SocialIcons.astro shipped as the single source for 3 brand SVGs** (per D-12). The `paths: Record<'instagram'|'facebook'|'whatsapp', { title; d }>` lookup keys exactly map to the typed `brand` prop; class-overridable; `<title>` accessibility node; `aria-label` mirrors. Three consumers wired this plan (Contact aside + home Footer social slot + privacy Footer social slot) — six render sites in built HTML, one path-string source.
- **Testimonials.astro shipped** with `id="testimonials"`, Section cream tone, `mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12`. Three `<figure>` elements in source order: (1) VERIFIED Louise & Jonathan quote with `<!-- [VERIFIED: from existing klphotography.ie Wix site — do not remove as placeholder] -->` marker; (2)+(3) two `[OWNER-REVIEW]` placeholders preserving `[OWNER-CONFIRM:first-name]` + `[OWNER-CONFIRM:couple-names]` + `[OWNER-CONFIRM:venue]` tokens verbatim. Each figure opens with a `font-serif text-5xl text-bronze leading-none` decorative opening quote glyph + `font-serif italic text-lg` blockquote + `text-sm text-ink-soft not-italic` figcaption. Zero image imports (RESEARCH §1: no author photos).
- **Contact.astro shipped** with `id="contact"`, Section cream-deep tone, two-col grid at `lg:` (form `lg:col-span-2`, aside right). Form has `id="contact-form"`, `novalidate`, plus:
  - Off-screen honeypot `name="contact_company"` at `class="absolute -left-[9999px] h-0 w-0 overflow-hidden"` + `tabindex="-1"` + `autocomplete="off"` + `aria-hidden="true"`.
  - Five visible field groups: name (required, minlength=2 maxlength=100), email (required, inputmode=email), wedding_date (optional, type=date), venue (optional, maxlength=200), message (required, minlength=20 maxlength=2000, rows=6, textarea). All inputs `mt-2 block w-full bg-cream border border-rule rounded-none px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze`. Required-asterisk via `<span aria-hidden="true">&nbsp;*</span>`; optional via `<span class="text-ink-soft font-normal">(optional)</span>`.
  - Turnstile commented stub `{/* Phase 5: <div class="cf-turnstile" data-sitekey="YOUR-PUBLIC-SITE-KEY"></div> */}`.
  - Privacy-adjacent disclosure paragraph linking `/privacy` in bronze (GDPR-05 prep).
  - `<Button type="submit" variant="primary" size="lg" loading={false}>Send enquiry</Button>` — Phase 2 primitive wired with literal-false `loading`; Phase 5 will pass reactive boolean.
  - `<p id="cf-notice" class="hidden text-sm text-ink-soft" role="status" aria-live="polite"></p>` for AT-announced submit feedback.
  - Scoped `<script>` block: `preventDefault` → `checkValidity` gate (`reportValidity` if invalid) → `notice.classList.remove('hidden')` + textContent "Form not yet active — please use phone / email / WhatsApp below." (T-03-09 mitigation).
- **Contact direct-contact aside shipped** with `<p>Or reach me directly:</p>` + ul (tel + mailto in bronze + underline) + flex row of 3 SocialIcons links. tel = `tel:+353851665472` displayed as `+353 85 166 5472`; mailto = `mailto:klphotography.ie@gmail.com`; IG = `https://instagram.com/klphotography.ie` (verified); FB = `https://facebook.com/[OWNER-CONFIRM:facebook-handle]` (DELIBERATELY BROKEN per D-05/T-03-06); WhatsApp = `https://wa.me/353851665472` (no `+` per D-06).
- **`/privacy` route shipped as 4-line minified HTML page** (no scripts; pure server-render). BaseLayout `title="Privacy policy — KL Photography"` + description + `<meta slot="head" name="robots" content="noindex, nofollow">` injected before `<title>`. Body: Nav above, `<Section id="privacy" tone="cream">` with h1 + 4 stub paragraphs (Data we will collect / How we will use it / Your rights) + italic `[OWNER-REVIEW]` trailer, then slot-filled Footer below.
- **`public/robots.txt` updated** to 5 non-blank lines: `User-agent: *` / `Allow: /` / `Disallow: /styleguide` / `Disallow: /privacy` / blank line / `Sitemap: https://klphotography.ie/sitemap-index.xml`. Negative-grep verified the alternate `sitemap.xml` spelling is absent (Phase 2 lesson T-03-11).
- **`src/pages/index.astro` extended** to import Testimonials/Contact/SocialIcons, append `<Testimonials />` and `<Contact />` inside `<main>` after `<Pricing />` (removed the 03-01-left placeholder HTML comment), and replace the bare `<Footer />` with a slot-filled version using brand + 6 nav links (Home / About / Pricing / Testimonials / Contact / Privacy — NO Portfolio per D-03) + 3 social icons. `legal` slot left to Footer's default `&copy; {year} KL Photography. All rights reserved.` fallback.
- **All 6 home-page anchor IDs ship in built HTML:** `#hero`, `#portfolio`, `#about`, `#pricing`, `#testimonials`, `#contact`. 03-03's `scroll-margin-top` baseline on `Section.astro` will apply uniformly.

## Task Commits

| Task | Subject | Hash | Files |
|------|---------|------|-------|
| 1 | `feat(03-02): add SocialIcons component + Testimonials section` | `8a94cae` | `src/components/icons/SocialIcons.astro`, `src/components/sections/Testimonials.astro` |
| 2 | `feat(03-02): add Contact section with form UI + direct contact block` | `9e3e6c3` | `src/components/sections/Contact.astro` |
| 3 | `feat(03-02): ship /privacy stub + wire Footer slots + assemble Testimonials/Contact into index` | `cb93957` | `src/pages/privacy.astro`, `public/robots.txt`, `src/pages/index.astro` |

(Summary commit `docs(03-02): summary` follows separately per execute-plan protocol.)

## Files Created/Modified

**Created (4):**
- `src/components/icons/SocialIcons.astro` — 57 lines including frontmatter (brand union + 3-key path lookup + SVG render)
- `src/components/sections/Testimonials.astro` — 32 lines (Section + 3 figures with verified + 2 placeholder copy)
- `src/components/sections/Contact.astro` — 94 lines (Section + 2-col grid + form with 5 fields + honeypot + Turnstile stub + disclosure + Button + notice + script + direct-contact aside)
- `src/pages/privacy.astro` — 56 lines (BaseLayout + Nav + Section stub + slot-filled Footer)
- `.planning/phases/03-static-content-sections/03-02-SUMMARY.md` — this file

**Modified (2):**
- `public/robots.txt` — appended `Disallow: /privacy` line after `Disallow: /styleguide` (1 line added; Sitemap line preserved byte-identical to Phase 2)
- `src/pages/index.astro` — added 3 imports (Testimonials, Contact, SocialIcons); appended `<Testimonials />` + `<Contact />` inside `<main>` after `<Pricing />`; removed the 03-01 placeholder comment; replaced bare `<Footer />` with slot-filled version (brand + 6 links + 3 social icons). Net `+29 lines / -2 lines` for this file.

**Note on placeholder JPEGs:** Per RESEARCH §1, Testimonials ships WITHOUT author photos. The revised 03-01 plan staged only `hero.jpg` and `about-portrait.jpg`. No testimonial JPEGs are referenced, imported, or staged in this plan — no unused assets to flag.

## Decisions Made

See `key-decisions` in frontmatter. Substantive notes:

1. **Footer slot children byte-duplicated across two pages instead of extracted into a `<FooterContent />` partial.** The plan's `<output>` Decisions Made block explicitly mandates this — both copies use absolute `/#about`-style anchors so the markup is path-symmetric, and Phase 5's privacy.astro body swap will touch only the Section body. One less file, zero divergence risk because git diff would surface any drift.

2. **Absolute `href="/#about"` anchor format in both footers.** Tested mentally: from `/`, browser resolves `/#about` to current-page hash (scrolls); from `/privacy`, browser navigates to `/` then scrolls. Single markup, zero conditional. Plan's `must_haves.truths` explicitly requires `href="/#about"` in BOTH footers; verify gate enforces.

3. **Contact submit handler kept inline as scoped `<script>`** (Vite-hoisted into bundled module) rather than extracted to `src/scripts/contact.ts` — single consumer, ~12 lines, no shared utility. Phase 5 wiring is a script-body swap.

4. **Facebook URL literally `https://facebook.com/[OWNER-CONFIRM:facebook-handle]`** in BOTH Contact aside + both Footer copies (3 source occurrences → 3 built-HTML occurrences). The broken URL IS the T-03-06 mitigation — owner walkthrough catches it because clicking 404s loudly.

5. **`<p id="cf-notice">` lives INSIDE the form** so it's adjacent to the submit Button (visually + semantically close), and the `role="status" aria-live="polite"` pair gives AT-announced feedback within ~16ms of submit click (T-03-09 mitigation). Initial state `class="hidden"`; submit handler removes the class.

6. **Footer `legal` slot left to default fallback.** Footer.astro's default `&copy; {year} KL Photography. All rights reserved.` is exactly what the plan specifies — overriding would add 1 line to each footer call with zero functional change.

## Deviations from Plan

### 1. [Rule 3 — Verify-gate wording vs minified built HTML] Plan's `grep -c '<blockquote' dist/index.html` returns 1 instead of ≥3 (same root cause as 03-01 Deviation 1+2)

- **Found during:** Plan-level verification block after Task 3 completed.
- **Issue:** Plan's gates `[ "$(grep -c '<blockquote' dist/index.html)" -ge 3 ]` and `[ "$(grep -c '<svg' dist/index.html)" -ge 3 ]` both fail because Astro minifies the entire `<body>` onto a single line and `grep -c` counts matching LINES, not occurrences. `dist/index.html` is 12 lines total (12 = `<!doctype>` + head splits + body-on-one-line + closing); the body line matches once for each pattern even though it contains 3 / 6 actual occurrences. Identical structural mismatch to 03-01 SUMMARY Deviations 1+2.
- **Real-build evidence:**
  - `grep -oE '<blockquote' dist/index.html | wc -l` → **3** (Louise + 2 placeholders, all visible in browser DOM).
  - `grep -oE '<svg' dist/index.html | wc -l` → **6** (3 Contact-aside SocialIcons + 3 Footer SocialIcons).
  - `grep -oE '<figcaption' dist/index.html | wc -l` → **3**.
  - `dist/privacy/index.html` separately ships 3 footer SocialIcons (verified via `-oE | wc -l` → 3).
  - Preview HTTP test confirms all 4 sentinel anchor IDs render in `/`: `id="hero" / id="pricing" / id="testimonials" / id="contact"` (curl + grep -oE).
- **Fix:** No code change. Documented gate-wording deviation per 03-01 precedent and per the user's standing rule "Real-build evidence beats text-grep wording".
- **Files modified:** None.
- **Committed in:** N/A.
- **Forward-looking note:** Use `grep -oE PATTERN FILE | wc -l` (occurrence count) instead of `grep -c PATTERN FILE` (line count) when asserting against Astro's minified `dist/*.html`. 03-03 plan-writing should adopt this convention; consider pretty-printing the HTML in a CI step before grep-based assertions.

### Total deviations

**1 documented.** Gate-wording vs minified-HTML mismatch, NOT an implementation deviation. Same root cause as 03-01 Deviations 1+2. Zero changes to deliverable scope. Zero new npm dependencies. Plan substance (SocialIcons + Testimonials + Contact + privacy stub + robots.txt update + index.astro Footer wiring + absolute anchor format + D-05 broken FB + D-06 wa.me format + D-12 single-source SVG + T-03-08 three-way defense) shipped exactly as planned.

## Verify Gates

### Per-task verify gates

| Task | Gate | Result | Notes |
|------|------|--------|-------|
| 1 | Both files exist + brand union type + id=testimonials + ≥3 blockquote + ≥3 figcaption + Louise + VERIFIED comment + OWNER-CONFIRM:couple-names + OWNER-CONFIRM:first-name | PASS | All 9 source-side greps OK; blockquote and figcaption counts via `grep -c` against unminified source = 3 each |
| 1 | `npm run check` exit 0 | PASS | 16 files, 0 errors / 0 warnings |
| 2 | All form/honeypot/link/handler/notice/Phase-5-comment greps in Contact.astro | PASS | All 15 source-side greps OK |
| 2 | `npm run check` exit 0 | PASS | 17 files, 0 errors |
| 3 | Source-side: privacy noindex + slot=head + h1 Privacy policy + robots.txt Disallow lines + byte-identical Sitemap + negative grep for sitemap.xml + index imports + Pricing<Testimonials<Contact awk order + footer slots + both pages href="/#about" | PASS | All 14 source-side greps OK |
| 3 | `npm run check` + `npm run build` exit 0 | PASS | 18 files / 3 pages including `/privacy/index.html` |
| 3 | Built HTML: privacy/index.html exists + noindex + #testimonials + #contact + `grep -c '<blockquote' ≥3` + tel/wa.me/mailto/IG/FB/href="/privacy" + &copy; + `grep -c '<svg' ≥3` | **DEVIATION (Rule 3)** | All structural greps PASS. The two `-c` count gates (blockquote / svg) FAIL against minified HTML — see Deviation 1. Occurrence counts via `-oE | wc -l`: blockquote=3, svg=6. Semantic intent met. |

### Plan-level verification

| Check | Result | Notes |
|-------|--------|-------|
| `npm run check` exit 0 | PASS | 18 files, 0 errors / 0 warnings / 0 hints |
| `npm run build` exit 0 | PASS | 3 pages (index + styleguide + privacy); 19 optimized images (cache reuse from 03-01) |
| CONTENT-04 evidence: #testimonials + ≥3 blockquote/figcaption + Louise | PASS (with Deviation 1 note on `-c` counts) | Occurrence counts: 3 / 3. Louise quote literal in dist/index.html. |
| CONTENT-05 evidence: #contact + #contact-form + novalidate + tel/mailto/wa.me/IG/FB + OWNER-CONFIRM:facebook-handle visible + /privacy link | PASS | All 10 greps return content; FB broken-handle literal preserved in built HTML |
| CONTENT-07 evidence: &copy; + ≥3 svgs (per Footer + per Contact aside) + 6 footer nav links incl. /privacy NO Portfolio | PASS (with Deviation 1 note on `-c` count) | `-oE | wc -l` = 6 svgs in dist/index.html (3 footer + 3 aside); copyright entity present. |
| Honeypot present in built HTML: name="contact_company" | PASS | |
| `/privacy` resolves + noindex meta in HTML + h1 | PASS | dist/privacy/index.html exists; `<meta name="robots" content="noindex, nofollow"` literal present; `<h1>Privacy policy` literal present |
| robots.txt: Disallow /privacy + Disallow /styleguide + byte-identical sitemap-index.xml + alternate sitemap.xml absent | PASS | All 4 checks (3 positive + 1 negative) succeed |
| Both pages use absolute `href="/#about"` | PASS | grep -q OK in both src/pages/index.astro and src/pages/privacy.astro |
| `npm run preview` serves `/` HTTP 200 + `/privacy/` HTTP 200 + `/robots.txt` Disallow /privacy | PASS | / = 200 / 31204 bytes; /privacy/ = 200 / 14079 bytes; robots.txt body shows Disallow /privacy + sitemap-index.xml |

### Decision-traceability self-check

- **D-03** (NO Portfolio in Footer nav links): Footer links list contains Home / About / Pricing / Testimonials / Contact / Privacy in BOTH footers. NO `<li><a href="/#portfolio">` anywhere — verified by `grep -c '"/#portfolio"' src/pages/{index,privacy}.astro` = 0.
- **D-05** (Facebook URL deliberately broken with `[OWNER-CONFIRM:facebook-handle]` literal): Present 3× in source (Contact aside + index footer + privacy footer) → 3× in built dist/index.html + dist/privacy/index.html. Verify gate `grep -q "OWNER-CONFIRM:facebook-handle" dist/index.html` PASS.
- **D-06** (WhatsApp URL `wa.me/353851665472` — no `+`, no dashes): Used in Contact aside + both footers. `grep -q "wa.me/353851665472"` PASS; no occurrences of `wa.me/+353` or `wa.me/353-85` in source or built HTML.
- **D-09** (Privacy stub with noindex meta + footer chrome): privacy.astro renders `<meta slot="head" name="robots" content="noindex, nofollow">`; built dist/privacy/index.html shows `<meta name="robots" content="noindex, nofollow"`; full Nav + slot-filled Footer chrome match home page.
- **D-12** (Single source for brand SVG paths): SocialIcons.astro is the only file in the repo containing `<path d=` for IG/FB/WhatsApp brand glyphs. Verified — `grep -rl 'M7.0301.084c-1.2768' src/` returns SocialIcons.astro only; same for the FB + WA path-string heads. Three consumers (Contact aside + 2× Footer social slot) all `import SocialIcons from '@/components/icons/SocialIcons.astro'`.

### Source coverage (ROADMAP Phase 3 success criteria for this plan)

| Criterion | Implemented in |
|---|---|
| CONTENT-04 — Testimonials with 3 quotes | Testimonials.astro (3 figures) → rendered in index.astro |
| CONTENT-05 — Contact form + WhatsApp/phone/email + IG/FB | Contact.astro (form UI + direct contact aside via SocialIcons) → rendered in index.astro |
| CONTENT-07 — Footer with copyright + privacy link + social icons | Footer.astro consumed slot-filled in index.astro + privacy.astro with brand/6-links/3-social/default-legal |
| (Stub route prerequisite) | privacy.astro renders 200 with noindex + h1 + stub body + Nav/Footer chrome |
| (Crawler defense in depth) | robots.txt now disallows /privacy AND /styleguide; sitemap-index.xml line preserved byte-identical |

## Threat Surface Scan

All four `mitigate` dispositions in this plan's `<threat_model>` verified:

- **T-03-06 (Facebook handle ships before owner-confirm):** Source + built HTML preserve literal `[OWNER-CONFIRM:facebook-handle]` in the Facebook anchor's `href` (3 occurrences each in source + built HTML — Contact aside + 2 footers). Click 404s loudly. Verify gate `grep -q "OWNER-CONFIRM:facebook-handle" dist/index.html` PASS.
- **T-03-07 (Honeypot reveals technique):** Field name `contact_company` (generic; not `honeypot` / `bot_check`). Off-screen position `class="absolute -left-[9999px] h-0 w-0 overflow-hidden"` + `aria-hidden="true"` + `tabindex="-1"` + `autocomplete="off"`. Accepted disposition — primary enforcement is Phase 5 backend rejection of non-empty submissions. Defense-in-depth.
- **T-03-08 (Privacy stub mistaken for final policy):** Three-way defense in place: (1) `<meta name="robots" content="noindex, nofollow">` in HTML head; (2) `Disallow: /privacy` in robots.txt; (3) visible `[OWNER-REVIEW] This is a Phase 3 placeholder. Phase 5 ships the legally-reviewed final policy.` italic trailer in body. Phase 5 GDPR-01 removes the noindex meta + robots.txt Disallow line when real policy ships.
- **T-03-09 (Form submission feedback insufficient):** `<p id="cf-notice" role="status" aria-live="polite">` injected on every submit-after-validity event. Notice text directs to phone/email/WhatsApp alternatives. AT announces; sighted users see the text below the Send-enquiry button within ~16ms.
- **T-03-10 (Future Phase 5 forgets to remove notice text):** SUMMARY's Next-Phase-Readiness enumerates the explicit 5-step swap protocol for Contact.astro (replace handler, toggle loading, uncomment Turnstile div, add Turnstile JS to head, replace notice text). Forward-looking mitigation tracked.
- **T-03-11 (Sitemap line renamed during /privacy edit):** Both positive (`sitemap-index.xml` byte-identical) and negative (`sitemap.xml` alternate spelling absent) greps PASS. Phase 2 lesson observed.
- **T-03-SC (Package legitimacy):** Zero new npm packages installed. `package.json` unchanged. SVG paths copied as inline data only — no `simple-icons` dep, no `astro-icon` integration. Confirmed by `git diff HEAD~3 -- package.json package-lock.json | wc -l` = 0.

No new threat surface introduced beyond the plan's `<threat_model>`. No `threat_flag:` entries to add. The only outbound trust boundaries introduced by this plan (wa.me, instagram.com, facebook.com-broken) are all `<a href>` clicks opening in the same tab — no `target="_blank"` so no `rel="noopener noreferrer"` requirement.

## Known Stubs

These are intentional, plan-documented placeholders that must be resolved in later phases. The verifier should treat these as expected:

| Stub | File | Reason / Resolves In |
|------|------|---------------------|
| `[OWNER-CONFIRM:first-name]` in Testimonial 2 quote | `src/components/sections/Testimonials.astro:19` | Owner walkthrough — provides actual photographer first name (same `first-name` token also used in About per 03-01) |
| `[OWNER-CONFIRM:couple-names]` + `[OWNER-CONFIRM:venue]` in Testimonials 2+3 | `src/components/sections/Testimonials.astro:20,27` | Owner walkthrough — replaces with real couple + venue when real testimonials provided |
| `[OWNER-REVIEW]` markers on Testimonial 2+3 (HTML comment + author photos NOT shown) | `src/components/sections/Testimonials.astro:15,23` | Owner walkthrough — replaces placeholder figures with real testimonials |
| `[OWNER-CONFIRM:facebook-handle]` in Facebook URL | Contact.astro:82, index.astro:35, privacy.astro:44 | Owner walkthrough — owner provides real Facebook page slug. URL DELIBERATELY BROKEN per D-05 until then. |
| Contact form `<script>` no-op submit handler | `src/components/sections/Contact.astro:60-72` | Phase 5 — swaps `preventDefault`-then-show-notice for `fetch('/api/contact', { method: 'POST', body: new FormData(form) })` + success/error states |
| Turnstile commented stub | `src/components/sections/Contact.astro:49` | Phase 5 — uncomments `<div class="cf-turnstile" data-sitekey="...">` + adds Turnstile JS to head |
| `<Button loading={false}>` literal | `src/components/sections/Contact.astro:53` | Phase 5 — wires reactive boolean to fetch promise state |
| `<meta robots noindex, nofollow>` on privacy.astro | `src/pages/privacy.astro:14` | Phase 5 (or Phase 6 launch) — removes when real policy ships; robots.txt `Disallow: /privacy` line also removed at the same time |
| Privacy page body (h1 + 4 paragraphs stub copy) | `src/pages/privacy.astro:17-32` | Phase 5 GDPR-01 — replaces body with legally-reviewed final policy. Route + noindex (until launch) + Nav + Footer + BaseLayout title/description all stay byte-identical. |
| `[OWNER-REVIEW]` italic trailer in privacy.astro | `src/pages/privacy.astro:31` | Phase 5 GDPR-01 — removes when real policy ships |
| `Disallow: /privacy` in robots.txt | `public/robots.txt:4` | Phase 5 or launch — removes when real policy is indexable |

## Issues Encountered

**One verify-gate wording mismatch against Astro's minified built HTML** (Deviation 1, identical class to 03-01 Deviations 1+2). Not a real implementation failure — semantic intent (3 blockquotes, 6 SVGs, all visible in browser DOM) verified by occurrence-count grep (`grep -oE | wc -l`) and by HTTP preview.

**No environment / no build / no commit issues.** All 3 task commits land on `main` with conventional `feat(03-02):` subjects. All commits respect git hooks (no `--no-verify` used). Working tree clean throughout. Zero file deletions across all three task commits (verified `git diff --diff-filter=D --name-only HEAD~1 HEAD` = empty after each commit). No untracked files left after Task 3 commit (verified `git status --short | grep '^??'` returns empty).

**One environmental note:** `npm run preview` defaulted to port 4323 during the verification step because ports 4321 and 4322 were already bound by other dev servers in the local environment. Astro auto-fell-back; HTTP 200 confirmed against the actual bound port. No code impact.

## User Setup Required

None for this plan.

**Phase 5 will require** Cloudflare Pages environment variables (`TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`) for the real Contact form backend — that's a Phase 5 setup step, not this plan. **Owner walkthrough** will be requested at the end of Phase 3 to resolve all `[OWNER-CONFIRM:*]` tokens (first-name, years, couple-names ×2, venue ×2, facebook-handle) — a single batched session, not a per-plan blocker.

## Next Phase Readiness

### READY FOR 03-03 (sticky nav + smooth-scroll offset + hamburger)

- **All 6 section anchor IDs ship in built HTML:** `#hero`, `#portfolio`, `#about`, `#pricing`, `#testimonials`, `#contact`. The Nav primitive's 4 in-page anchor links (`#about`, `#pricing`, `#testimonials`, `#contact`) all resolve to real on-page targets — 03-03's IntersectionObserver sticky-state logic and hamburger toggle can be implemented in place without further section assembly.
- **03-03 Task 1 adds `scroll-margin-top` baseline to `Section.astro`** — that single one-line change applies uniformly to ALL 6 anchor sections because every section is rendered through the Section primitive (Hero / PortfolioStub / About / Pricing / Testimonials / Contact all `<Section id="...">`). Zero per-section edits required.
- **`<Nav />` is currently static** (Phase 2 baseline; rendered by both `src/pages/index.astro` and `src/pages/privacy.astro`). 03-03 extends Nav.astro in place to add `position: sticky top-0 z-50` + IntersectionObserver sentinel + `data-scrolled` attribute swap + mobile hamburger toggle. No change to consumer call-sites (`<Nav />` stays slot-less).
- **Both footers use identical absolute `/#about` anchor format** — 03-03's smooth-scroll offset applies to footer anchor clicks too (browser scroll + `scroll-margin-top` on target Section).

### BLOCKER FOR PHASE 5 (Contact Form Backend)

> **5-step swap protocol** for `src/components/sections/Contact.astro`:
> 1. Replace `<script>` body: change `if (notice) { notice.classList.remove(...); notice.textContent = 'Form not yet active...' }` block with `fetch('/api/contact', { method: 'POST', body: new FormData(form) })` + `.then(r => r.ok ? showSuccess() : showError())`.
> 2. Wire reactive loading state to `<Button loading={isSubmitting}>` (currently literal `loading={false}`). Use Astro Islands or convert to a `client:load` directive on a small wrapper.
> 3. Uncomment Turnstile div: `{/* Phase 5: <div class="cf-turnstile" data-sitekey="YOUR-PUBLIC-SITE-KEY"></div> */}` → `<div class="cf-turnstile" data-sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}></div>`.
> 4. Add Turnstile JS to head: in `src/pages/index.astro` BaseLayout, add `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer slot="head"></script>` (uses the same `slot="head"` mechanism — the slot accepts any head children, not just `<meta>`).
> 5. Replace the "Form not yet active" notice with success ("Thanks — I'll be in touch within two working days.") and error ("Something went wrong. Please use phone / email / WhatsApp below.") variants driven by the fetch promise.
>
> Field markup, labels, honeypot, IDs, classes, and direct-contact aside all stay unchanged.

### BLOCKER FOR PHASE 5 (GDPR-01 — Privacy Policy Body)

> Phase 5 replaces `src/pages/privacy.astro` body (the `<Section>` block contents only — `<h1>` + 4 paragraph stubs + `[OWNER-REVIEW]` italic trailer) with the real legally-reviewed policy text.
>
> Keep byte-identical:
> - Route URL `/privacy`
> - BaseLayout `title="Privacy policy — KL Photography"` + `description="How KL Photography handles personal data submitted via the contact form."`
> - `<meta slot="head" name="robots" content="noindex, nofollow">` (until launch — Phase 5 / 6 removes when policy is final)
> - `<Nav />` import + render
> - Slot-filled `<Footer>` block with brand + 6 links + 3 social icons
> - `<Section id="privacy" tone="cream">` wrapper
>
> When real policy is final + indexable: remove the `<meta slot="head"` noindex line AND the `Disallow: /privacy` line from `public/robots.txt` in the same commit so they stay in sync.

### Also affects PHASE 5 (`public/robots.txt`)

Phase 5 (or Phase 6 launch) edits `public/robots.txt` to remove the `Disallow: /privacy` line when the real privacy policy is ready to be indexed. The `Sitemap: https://klphotography.ie/sitemap-index.xml` line MUST remain byte-identical (Phase 2 lesson T-03-11). The `Disallow: /styleguide` line remains in place (styleguide is a permanent dev-only route per Phase 2 SUMMARY).

## Self-Check

Verified before SUMMARY commit:

- `src/components/icons/SocialIcons.astro` exists; contains `brand: 'instagram' | 'facebook' | 'whatsapp'` union and all three SVG `d` path-string heads (`M7.0301.084c-1.2768` for IG, `M9.101 23.691v-7.98` for FB, `M17.472 14.382c-.297-.149` for WA).
- `src/components/sections/Testimonials.astro` exists; contains `id="testimonials"`, 3 `<blockquote>`, 3 `<figcaption>`, `Louise` literal, `VERIFIED` comment, `OWNER-CONFIRM:first-name`, `OWNER-CONFIRM:couple-names`, `OWNER-CONFIRM:venue` tokens.
- `src/components/sections/Contact.astro` exists; contains `id="contact"`, `id="contact-form"`, `novalidate`, `contact_company` honeypot name, `tabindex="-1"`, `-left-[9999px]` off-screen positioning, `tel:+353851665472`, `mailto:klphotography.ie@gmail.com`, `wa.me/353851665472`, `instagram.com/klphotography.ie`, `OWNER-CONFIRM:facebook-handle` (deliberately broken FB URL), `href="/privacy"`, `checkValidity`, "Form not yet active" notice text, `Phase 5` Turnstile comment.
- `src/pages/privacy.astro` exists; contains `noindex`, `slot="head"`, `Privacy policy` h1, 4 stub-copy h2 sections, `[OWNER-REVIEW]` italic trailer, slot-filled Footer with brand/links/social.
- `public/robots.txt` contains `Disallow: /privacy` AND `Disallow: /styleguide` AND byte-identical `Sitemap: https://klphotography.ie/sitemap-index.xml`; alternate `sitemap.xml` spelling is absent (negative grep PASS).
- `src/pages/index.astro` imports `Testimonials`, `Contact`, `SocialIcons`; renders Testimonials + Contact inside `<main>` after Pricing (awk source-order check PASS: Pricing<Testimonials<Contact); replaces bare `<Footer />` with slot-filled version using brand + 6 links + 3 social icons; uses absolute `href="/#about"` (etc.) for in-page anchors.
- Commits `8a94cae`, `9e3e6c3`, `cb93957` exist on `main` (verified via `git log --oneline -6`).
- `npm run check` exit 0 (18 files); `npm run build` exit 0 (3 pages); `npm run preview` serves `/` HTTP 200 + `/privacy/` HTTP 200 + `/robots.txt` with correct Disallow lines.
- `dist/privacy/index.html` exists with `<meta name="robots" content="noindex, nofollow"` literal.
- `dist/index.html` contains: `id="testimonials"`, `id="contact"`, ≥3 blockquote occurrences (via `-oE`), ≥3 figcaption occurrences, `tel:+353851665472`, `wa.me/353851665472`, `mailto:klphotography`, `instagram.com/klphotography`, `facebook.com/`, `OWNER-CONFIRM:facebook-handle`, `href="/privacy"`, `&copy;`, 6 SVG occurrences (via `-oE`), `name="contact_company"` honeypot.
- Zero new npm packages installed (`package.json` unchanged across all 3 task commits).
- Zero file deletions across all 3 task commits.

## Self-Check: PASSED

---
*Phase: 03-static-content-sections*
*Completed: 2026-05-17*
