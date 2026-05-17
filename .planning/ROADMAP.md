# Roadmap: klphotography.ie

## Overview

Migrate KL Photography's wedding photography site from Wix to a hand-built Astro static site on Cloudflare Pages free tier. Six phases take the project from empty repo to a launched klphotography.ie cutover: foundation + DNS pre-flight, design system, static content sections, portfolio gallery with image pipeline, contact-form backend + GDPR, then a one-shot launch cutover that swaps DNS and decommissions Wix. Each phase is independently testable; the site is only publicly served on the domain at the end of Phase 6.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & DNS Pre-flight** - Astro + Tailwind scaffold, GitHub repo, Cloudflare Pages connected, current DNS snapshotted
- [ ] **Phase 2: Design System** - Editorial palette, type scale, component primitives, responsive breakpoints
- [ ] **Phase 3: Static Content Sections** - Hero, About, Pricing, Testimonials, Contact UI, nav, footer
- [ ] **Phase 4: Portfolio Gallery & Image Pipeline** - Justified grid, lightbox, Astro Picture, AVIF/WebP, hero LCP optimization
- [ ] **Phase 5: Contact Form Backend & GDPR** - Pages Function + Turnstile + Resend, privacy policy, cookieless analytics
- [ ] **Phase 6: Launch Cutover** - SEO meta + sitemap + schema, performance audit, DNS swap, Wix decommission

## Phase Details

### Phase 1: Foundation & DNS Pre-flight
**Goal**: Empty repo → buildable Astro site auto-deploying to a Cloudflare Pages preview URL, with a complete snapshot of the current .ie DNS zone for safe cutover later.
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, DNS-01, DNS-02
**Success Criteria** (what must be TRUE):
  1. Pushing to `main` on GitHub produces a successful Cloudflare Pages deploy that returns a working `*.pages.dev` URL
  2. `npm run dev` boots an Astro site locally with Tailwind v4 working
  3. README documents the dev → preview → production flow and the gallery-update workflow
  4. A documented snapshot of the current klphotography.ie DNS zone (A / CNAME / MX / TXT / SPF / DKIM) exists in the repo or planning notes
**Plans**: 2 plans

Plans:
- [ ] 01-01: Scaffold Astro + Tailwind, configure static output, wire repo to CF Pages
- [ ] 01-02: Capture current DNS zone snapshot and identify the IEDR-accredited registrar holding klphotography.ie

### Phase 2: Design System
**Goal**: Establish the editorial visual language and shared primitives so subsequent content phases can be built fast and consistently.
**Depends on**: Phase 1
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05
**Success Criteria** (what must be TRUE):
  1. Design tokens (color, type scale, spacing) are defined in Tailwind config and visible on a styleguide route
  2. Button, Nav, Section, Footer primitives render and pass responsive breakpoint checks
  3. Any animation on the styleguide respects `prefers-reduced-motion`
  4. A representative styleguide page scores Lighthouse Accessibility ≥95
**Plans**: 2 plans

Plans:
- [ ] 02-01: Define palette, typography, spacing tokens in Tailwind config; pick and self-host fonts
- [ ] 02-02: Build Button, Nav, Section, Footer primitives plus a `/styleguide` showcase route

### Phase 3: Static Content Sections
**Goal**: Build all single-page sections (Hero through Footer) with placeholder copy and image, no backend wiring, no real gallery yet — but the page reads as a complete site.
**Depends on**: Phase 2
**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-05, CONTENT-06, CONTENT-07
**Success Criteria** (what must be TRUE):
  1. Single-page `/` route renders Hero → About → Pricing → Testimonials → Contact → Footer in order
  2. Sticky nav scrolls smoothly to each section anchor on desktop and collapses to hamburger on mobile
  3. Contact section displays form UI (not yet wired), WhatsApp link, phone, email, Instagram, Facebook
  4. Pricing section shows 6-hour and 10-hour tiers with what's included and a starting-from price
**Plans**: 3 plans

Plans:
- [ ] 03-01: Build Hero + About + Pricing sections with placeholder copy
- [ ] 03-02: Build Testimonials + Contact (UI only) + Footer
- [ ] 03-03: Implement sticky nav with smooth-scroll anchors and mobile hamburger

### Phase 4: Portfolio Gallery & Image Pipeline
**Goal**: Replace placeholder Hero/About images with optimized originals and ship the curated portfolio grid + lightbox, hitting the hero LCP and CLS targets.
**Depends on**: Phase 3
**Requirements**: GALLERY-01, GALLERY-02, GALLERY-03, GALLERY-04, GALLERY-05, GALLERY-06, GALLERY-07, PERF-01
**Success Criteria** (what must be TRUE):
  1. The portfolio renders ~50 owner-supplied photos in a justified grid; clicking opens an accessible lightbox with keyboard + swipe navigation
  2. Every image carries a non-empty `alt` attribute sourced from gallery metadata; CI fails when an image is missing alt
  3. Hero image is preloaded, eager-loaded, ≤200 KB AVIF; below-fold thumbnails lazy-load
  4. Home page achieves CLS ≤0.1 in a Lighthouse mobile run
**Plans**: 3 plans

Plans:
- [ ] 04-01: Import owner's photos into `src/assets/portfolio/`, define gallery metadata schema, lint for alt text
- [ ] 04-02: Build justified-grid gallery component using Astro `<Picture>` with AVIF/WebP/responsive srcset
- [ ] 04-03: Implement accessible lightbox + hero LCP optimization (preload, eager, AVIF budget)

### Phase 5: Contact Form Backend & GDPR
**Goal**: Wire the form UI to a working backend that delivers enquiries to the owner's Gmail, with spam protection, a real privacy policy, and cookieless analytics.
**Depends on**: Phase 3 (form UI exists), Phase 4 not strictly required
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, FORM-09, FORM-10, FORM-11, GDPR-01, GDPR-02, GDPR-03, GDPR-04, GDPR-05, DESIGN-06
**Success Criteria** (what must be TRUE):
  1. Submitting the form from the CF Pages preview URL delivers an email to klphotography.ie@gmail.com within seconds, with reply-to set to the couple's email
  2. Submissions without a valid Turnstile token are rejected with 403
  3. `/privacy` describes actual data flow (form → Resend → Gmail), is linked from footer and adjacent to the submit button
  4. Cloudflare Web Analytics beacon fires; site sets zero cookies and no third-party scripts other than Turnstile + analytics beacon
  5. No secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) appear anywhere in the built `dist/` directory
**Plans**: 3 plans

Plans:
- [ ] 05-01: Build `functions/api/contact.ts` with Turnstile verification + Resend send; wire client form to it
- [ ] 05-02: Verify klphotography.ie sending domain in Resend via SPF/DKIM TXT records in Cloudflare DNS
- [ ] 05-03: Write `/privacy` page, install Cloudflare Web Analytics beacon, audit `dist/` for secret leaks, scan accessibility

### Phase 6: Launch Cutover
**Goal**: Add launch-grade SEO metadata, hit performance targets, swap DNS at the registrar, archive and cancel Wix.
**Depends on**: Phases 1–5
**Requirements**: DNS-03, DNS-04, DNS-05, DNS-06, DNS-07, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-07, PERF-08, PERF-09, LAUNCH-01, LAUNCH-02, LAUNCH-03, LAUNCH-04, LAUNCH-05, LAUNCH-06, LAUNCH-07
**Success Criteria** (what must be TRUE):
  1. https://klphotography.ie resolves to the new Cloudflare-hosted site from an independent network, with HTTPS and HSTS enabled
  2. A test enquiry submitted from the live domain is received in the owner's Gmail
  3. Mobile Lighthouse scores: Performance ≥90, LCP ≤2.5s, CLS ≤0.1
  4. Email to and from klphotography.ie@gmail.com (or any custom-domain mailbox in use) continues to work after DNS cutover
  5. Wix site is archived (HTML export + contact-form history saved) and the Wix subscription is cancelled
  6. Sitemap.xml is published, Google Search Console reflects the new property, old Wix property removed
**Plans**: 3 plans

Plans:
- [ ] 06-01: Add SEO meta (title/description/OG/Twitter), JSON-LD LocalBusiness + Photograph, sitemap.xml, robots.txt
- [ ] 06-02: Mobile Lighthouse pass — fix any LCP/CLS/Performance regressions to hit targets
- [ ] 06-03: Execute cutover — recreate non-A records in CF zone, swap nameservers, verify email + form, archive + cancel Wix, register sitemap in Search Console

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & DNS Pre-flight | 0/2 | Not started | - |
| 2. Design System | 0/2 | Not started | - |
| 3. Static Content Sections | 0/3 | Not started | - |
| 4. Portfolio Gallery & Image Pipeline | 0/3 | Not started | - |
| 5. Contact Form Backend & GDPR | 0/3 | Not started | - |
| 6. Launch Cutover | 0/3 | Not started | - |
