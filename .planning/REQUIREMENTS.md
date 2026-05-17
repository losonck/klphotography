# Requirements: klphotography.ie

**Defined:** 2026-05-17
**Core Value:** Generate qualified wedding enquiries — every design and engineering decision serves the path from "couple lands on homepage" to "couple sends booking enquiry."

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: GitHub repository created (private or public), main branch
- [x] **INFRA-02**: Astro 5 project scaffolded with TypeScript and Tailwind v4
- [x] **INFRA-03**: Cloudflare Pages project connected to GitHub repo; push to main triggers production build
- [x] **INFRA-04**: Preview deployments for PRs / non-main branches enabled
- [x] **INFRA-05**: Production build emits `dist/` with `output: 'static'`, no SSR adapter
- [x] **INFRA-06**: `README.md` documents local dev (`npm run dev`), build, and gallery-update workflow

### Domain & DNS

- [x] **DNS-01**: klphotography.ie domain identified at its current IEDR-accredited registrar
- [x] **DNS-02**: Full pre-cutover snapshot of existing DNS zone captured (A/CNAME/MX/TXT/SPF/DKIM)
- [ ] **DNS-03**: Cloudflare zone created for klphotography.ie; all non-A records (MX/TXT/SPF/DKIM/etc.) recreated to preserve email delivery
- [ ] **DNS-04**: Nameservers at IEDR registrar updated to Cloudflare's pair
- [ ] **DNS-05**: Cloudflare zone serves apex `klphotography.ie` and `www` from Cloudflare Pages
- [ ] **DNS-06**: HTTPS enforced (Cloudflare automatic) and HSTS enabled
- [ ] **DNS-07**: Email round-trip verified post-cutover (send + receive to klphotography.ie@gmail.com unaffected; if custom domain mailbox exists, that too)

### Design System

- [x] **DESIGN-01**: Color tokens defined (cream/charcoal/muted-accent editorial palette) in Tailwind config
- [x] **DESIGN-02**: Type scale defined (serif headline family + sans-serif body family) with viewport-relative sizing for hero/section headers
- [x] **DESIGN-03**: Component primitives: Button, Nav, Section, Footer
- [x] **DESIGN-04**: Mobile-first responsive breakpoints set (≤640 / ≥1024 / ≥1280)
- [x] **DESIGN-05**: `prefers-reduced-motion` respected for any animation
- [x] **DESIGN-06**: Lighthouse Accessibility ≥95 on representative pages

### Content Sections (single-page IA)

- [x] **CONTENT-01**: Hero section — full-bleed photo, photographer name, tagline, primary "Enquire" CTA anchoring to #contact
- [x] **CONTENT-02**: About section — photographer story, portrait photo, approach
- [x] **CONTENT-03**: Pricing section — 6-hour and 10-hour coverage tiers, what's included (≈400–500 edited photos, 3-month online gallery, optional album), starting-from price displayed
- [x] **CONTENT-04**: Testimonials section — 3–6 quotes with client names (sourced from existing Wix site or fresh)
- [x] **CONTENT-05**: Contact section — contact form, WhatsApp link, phone (+353 85 166 5472), email (klphotography.ie@gmail.com), Instagram and Facebook links
- [x] **CONTENT-06**: Sticky top nav with smooth-scroll anchors to each section; collapses to hamburger on mobile
- [x] **CONTENT-07**: Footer with copyright, privacy link, social icons

### Portfolio Gallery

- [ ] **GALLERY-01**: Justified-grid layout (Flickr-style even rows, varied widths) for ~50 curated photos
- [ ] **GALLERY-02**: Astro `<Picture>` pipeline generates AVIF + WebP + JPEG at multiple widths; correct `srcset` and `sizes`
- [ ] **GALLERY-03**: Below-fold gallery thumbnails use `loading="lazy"` and `decoding="async"`; above-fold thumbnails are eager
- [ ] **GALLERY-04**: Click on a thumbnail opens a lightbox (keyboard arrows + mobile swipe + ESC to close)
- [ ] **GALLERY-05**: Every image has descriptive `alt` text stored in gallery metadata; CI fails build if any image is missing alt
- [ ] **GALLERY-06**: Gallery metadata lives in `src/content/gallery/*.json` (or content collection) — caption, alt, sort order, optional EXIF
- [ ] **GALLERY-07**: Photographer-supplied originals stored in `src/assets/portfolio/` (committed to repo or LFS if total > ~200 MB)

### Contact Form Backend

- [ ] **FORM-01**: Cloudflare Pages Function at `functions/api/contact.ts` handles POST /api/contact
- [ ] **FORM-02**: Form fields: name (required), email (required, validated), wedding date (optional), venue (optional), message (required), Turnstile token (required)
- [ ] **FORM-03**: Server validates Turnstile token via `siteverify` API; rejects with 403 on failure
- [ ] **FORM-04**: Server sends email via Resend API to klphotography.ie@gmail.com with reply-to set to the couple's email
- [ ] **FORM-05**: Subject line includes couple's name and wedding date when provided
- [ ] **FORM-06**: Secrets (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) stored only in Cloudflare Pages environment variables, never in repo
- [ ] **FORM-07**: Public Turnstile site key surfaced as `PUBLIC_TURNSTILE_SITE_KEY` (Astro convention)
- [ ] **FORM-08**: Resend sending domain (klphotography.ie) verified via SPF + DKIM TXT records in Cloudflare DNS
- [ ] **FORM-09**: Client shows clear success state on 200 and clear error state on non-200
- [ ] **FORM-10**: Form gracefully degrades — if JS disabled, the form still posts (Pages Function accepts a no-token request only in dev; production requires token)
- [ ] **FORM-11**: Test enquiry round-trip verified end-to-end before launch (form → Function → Resend → Gmail inbox)

### GDPR & Analytics

- [ ] **GDPR-01**: `/privacy` page describing actual data flow (contact form → Resend → Gmail), data retention, lawful basis, DPC Ireland contact info
- [ ] **GDPR-02**: No cookies set by the site or any embedded script
- [ ] **GDPR-03**: Cloudflare Web Analytics beacon installed (cookieless); no cookie banner required
- [ ] **GDPR-04**: No third-party scripts (no GA, no Facebook pixel, no live chat) for v1
- [ ] **GDPR-05**: Privacy policy link visible in footer and adjacent to the contact form submit button

### Performance & SEO

- [ ] **PERF-01**: Hero image preloaded (`<link rel="preload" as="image" fetchpriority="high">`), eager-loaded, AVIF ≤200 KB at common viewport widths
- [ ] **PERF-02**: Mobile Lighthouse Performance ≥90 on home page (real device or throttled emulation)
- [ ] **PERF-03**: LCP ≤2.5s on simulated mobile 4G
- [ ] **PERF-04**: CLS ≤0.1 (all images carry width/height)
- [ ] **PERF-05**: `sitemap.xml` generated by Astro and submitted to Google Search Console
- [ ] **PERF-06**: `robots.txt` allows crawlers, references sitemap
- [ ] **PERF-07**: Open Graph + Twitter Card meta tags on home page (image preview when shared)
- [ ] **PERF-08**: Schema.org `LocalBusiness` + `Photograph` structured data injected
- [ ] **PERF-09**: Page title and meta description tuned for "wedding photographer Dublin Ireland" intent

### Launch Cutover

- [ ] **LAUNCH-01**: Pre-launch checklist completed (DNS snapshot, email verified, Resend verified, Turnstile keys live)
- [ ] **LAUNCH-02**: DNS nameservers switched at IEDR registrar; propagation monitored
- [ ] **LAUNCH-03**: Wix site archived (HTML export, contact-form submission history downloaded) BEFORE Wix subscription is cancelled
- [ ] **LAUNCH-04**: New site live at klphotography.ie verified from independent network
- [ ] **LAUNCH-05**: First production test enquiry sent and received
- [ ] **LAUNCH-06**: Wix subscription cancelled
- [ ] **LAUNCH-07**: Google Search Console updated with new property + sitemap; old Wix property removed

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Case Studies

- **CASE-01**: Per-wedding gallery pages with story copy, hero photo, supporting gallery, vendor credits

### Booking Tools

- **BOOK-01**: Online consultation booking via Cal.com or similar (embedded, no Worker)

### Internationalization

- **I18N-01**: Bilingual EN / GA (Irish)

### SEO Enrichment

- **SEO-01**: Wedding venue landing pages (e.g. `/dublin-castle-wedding-photographer`) for long-tail SEO
- **SEO-02**: Blog / journal for evergreen wedding-planning content

### Performance Tooling

- **PERF-V2-01**: Visual regression testing in CI (Playwright + percy / chromatic)
- **PERF-V2-02**: Synthetic CWV monitoring via Cloudflare RUM dashboards

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| CMS / admin UI | Owner workflow is "I edit, you push" — no admin UI value, simpler stack |
| Cloudflare Registrar for .ie | Cloudflare Registrar does not support .ie TLD; domain stays at IEDR-accredited registrar |
| 301 redirect map from Wix URLs | Clean slate explicitly chosen; no SEO URL preservation |
| Client gallery delivery system | Existing "3-month online gallery" handled by external Pixieset / similar |
| Google Analytics | Cloudflare Web Analytics chosen for cookieless / no-banner compliance |
| Cookie consent banner | Site sets no cookies; Web Analytics is cookieless; no banner needed |
| Online payments / deposit collection | Out of v1 scope; payment handled offline by photographer |
| Live chat widget | Wedding enquiries are async; chat is friction and adds third-party scripts |
| Newsletter signup | One-off wedding service — no recurring content cadence |
| Date-picker showing live availability | Implies booking guarantees the owner cannot reliably keep |
| Music auto-play / splash intro | Anti-pattern, dates the site |

## Traceability

Filled in during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 1 | Complete |
| DNS-01 | Phase 1 | Complete |
| DNS-02 | Phase 1 | Complete |
| DNS-03 | Phase 6 | Pending |
| DNS-04 | Phase 6 | Pending |
| DNS-05 | Phase 6 | Pending |
| DNS-06 | Phase 6 | Pending |
| DNS-07 | Phase 6 | Pending |
| DESIGN-01 | Phase 2 | Complete |
| DESIGN-02 | Phase 2 | Complete |
| DESIGN-03 | Phase 2 | Complete |
| DESIGN-04 | Phase 2 | Complete |
| DESIGN-05 | Phase 2 | Complete |
| DESIGN-06 | Phase 5 | Complete |
| CONTENT-01 | Phase 3 | Complete |
| CONTENT-02 | Phase 3 | Complete |
| CONTENT-03 | Phase 3 | Complete |
| CONTENT-04 | Phase 3 | Complete |
| CONTENT-05 | Phase 3 | Complete |
| CONTENT-06 | Phase 3 | Complete |
| CONTENT-07 | Phase 3 | Complete |
| GALLERY-01 | Phase 4 | Pending |
| GALLERY-02 | Phase 4 | Pending |
| GALLERY-03 | Phase 4 | Pending |
| GALLERY-04 | Phase 4 | Pending |
| GALLERY-05 | Phase 4 | Pending |
| GALLERY-06 | Phase 4 | Pending |
| GALLERY-07 | Phase 4 | Pending |
| FORM-01 | Phase 5 | Pending |
| FORM-02 | Phase 5 | Pending |
| FORM-03 | Phase 5 | Pending |
| FORM-04 | Phase 5 | Pending |
| FORM-05 | Phase 5 | Pending |
| FORM-06 | Phase 5 | Pending |
| FORM-07 | Phase 5 | Pending |
| FORM-08 | Phase 5 | Pending |
| FORM-09 | Phase 5 | Pending |
| FORM-10 | Phase 5 | Pending |
| FORM-11 | Phase 5 | Pending |
| GDPR-01 | Phase 5 | Pending |
| GDPR-02 | Phase 5 | Pending |
| GDPR-03 | Phase 5 | Pending |
| GDPR-04 | Phase 5 | Pending |
| GDPR-05 | Phase 5 | Pending |
| PERF-01 | Phase 4 | Pending |
| PERF-02 | Phase 6 | Pending |
| PERF-03 | Phase 6 | Pending |
| PERF-04 | Phase 6 | Pending |
| PERF-05 | Phase 6 | Pending |
| PERF-06 | Phase 6 | Pending |
| PERF-07 | Phase 6 | Pending |
| PERF-08 | Phase 6 | Pending |
| PERF-09 | Phase 6 | Pending |
| LAUNCH-01 | Phase 6 | Pending |
| LAUNCH-02 | Phase 6 | Pending |
| LAUNCH-03 | Phase 6 | Pending |
| LAUNCH-04 | Phase 6 | Pending |
| LAUNCH-05 | Phase 6 | Pending |
| LAUNCH-06 | Phase 6 | Pending |
| LAUNCH-07 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 62 total
- Mapped to phases: 62
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after initial definition*
