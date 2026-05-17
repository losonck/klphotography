# Phase 3 Research — Static Content Sections

**Researched:** 2026-05-17
**Domain:** Editorial single-page assembly on Astro 6 + Tailwind v4 (static), with placeholder content credible enough for owner sign-off
**Confidence:** HIGH

## Project Constraints (from CLAUDE.md)

- **No edits outside a GSD workflow** — this RESEARCH.md is being written from `/gsd:plan-phase`.
- **Pure Cloudflare free tier** — no third-party CDN runtime fetches counted against limits or leaking EU visitor IPs (GDPR).
- **EU/IE GDPR** — no images hot-linked from third-party CDNs at runtime (same rule that ruled out Google Fonts in Phase 2). Placeholder images MUST be served from the same origin (`klphotography.ie` / `*.pages.dev`).
- **Astro 6 + Tailwind v4 locked** (Phase 1) — no React, no Vue, no client framework. Tiny vanilla `<script>` blocks are acceptable for the hamburger toggle.
- **Static output (`output: 'static'`)** — no SSR, no API routes inside Astro. Contact form is UI only in this phase; backend lands in Phase 5.
- **Image-heavy site, must hit Lighthouse 90+ mobile** — placeholder images must carry `width`/`height` (CLS), be reasonably sized (LCP), and not cause unnecessary preconnect overhead.
- **Owner does not edit code** — every section must read as plausible to a couple landing on the page; owner reviews the published preview URL and approves copy/photos via a separate channel.
- **`/styleguide` is `noindex`** — already shipped (Phase 2). Don't break it or duplicate its primitives.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONTENT-01 | Hero — full-bleed photo, photographer name, tagline, primary "Enquire" CTA → `#contact` | §1 (tagline conventions) + §2.Hero (ready copy) + §3 (image strategy & dimensions) + §11 (assembly + anchor IDs) |
| CONTENT-02 | About — photographer story, portrait photo, approach | §1 (1st-person convention) + §2.About (ready copy) + §3 (portrait slot dimensions) |
| CONTENT-03 | Pricing — 6h and 10h tiers, what's included (~400–500 photos, 3-month gallery, optional album), "starting from" price | §1 (pricing transparency) + §2.Pricing (ready copy) + §7 (card pattern) — **Ireland 2026 market data verified** |
| CONTENT-04 | Testimonials — 3–6 quotes with client names | §2.Testimonials (3 ready quotes — one real from existing Wix site + two clearly-marked placeholders) |
| CONTENT-05 | Contact UI — form, WhatsApp, phone, email, Instagram, Facebook | §8 (form UI) + §9 (social SVG icons) |
| CONTENT-06 | Sticky nav with smooth-scroll anchors; mobile hamburger | §4 (smooth scroll) + §5 (hamburger) + §6 (sticky nav) |
| CONTENT-07 | Footer with copyright, privacy link, social icons | §9 (icons) + §10 (`/privacy` link strategy) |

## TL;DR

1. **Write plausible-but-clearly-placeholder copy** — not lorem ipsum. Pull the one real testimonial from the existing Wix site verbatim; mark all other copy with inline `[OWNER-REVIEW]` tags so the owner cannot mistake placeholder for final. (§2)
2. **Pricing: use "Starting from €X" with realistic Irish 2026 market anchors.** Recommend **€1,800 (6h)** and **€2,400 (10h)** as placeholder values — defensible against Ireland market data (€2,000–€4,000 typical full-day, Dublin €2,200–€6,000) but tagged `[OWNER-CONFIRM]` because the owner has not given us numbers. (§1 + §7)
3. **Placeholder images: download from Unsplash, commit to `src/assets/placeholder/`, serve via Astro `<Image>`.** No hot-linking (GDPR + CLS + extra DNS). 5 images at specified dimensions cover Hero (desktop landscape + mobile portrait via `<Picture>`), About portrait, Pricing accent, two testimonial backgrounds. (§3)
4. **Smooth-scroll is already shipped** (Phase 2 `global.css` has `html { scroll-behavior: smooth }` plus reduced-motion override). Add `scroll-margin-top` to every `<Section>` to offset for the sticky nav. No JS required for smooth scroll itself. (§4)
5. **Sticky nav uses `position: sticky top-0 z-50`** + IntersectionObserver flips a `data-scrolled="true"` attribute when a sentinel scrolls out of view, swapping background from transparent to `bg-cream/90 backdrop-blur`. ~15 lines of vanilla JS in a `<script>` block inside `Nav.astro`. (§6)
6. **Mobile hamburger uses a `<button aria-expanded>` + vanilla JS toggle**, NOT `<details>/<summary>` (documented a11y gap with VoiceOver). Adds escape-to-close and click-outside-to-close. ~25 lines of vanilla JS. (§5)
7. **Contact form is UI only** — HTML5 `required` + `type="email"` + visually-hidden honeypot input. No `action` attribute (Phase 5 wires `/api/contact`); button shows `loading` state via the existing `Button` primitive `loading` prop but the submit handler just `preventDefault`s and shows a "Form not yet active — please use phone/email/WhatsApp below" notice. (§8)
8. **Social icons: copy 3 inline SVGs from simple-icons (CC0)** — Instagram, Facebook, WhatsApp — into a single `src/components/icons/SocialIcons.astro` wrapper. Zero dependencies. (§9)
9. **`/privacy` link: ship a 50-line stub `src/pages/privacy.astro`** saying "Privacy policy will be published before launch" with the real DPO contact info. Prevents 404, signals intent. Phase 5 replaces with the real policy. (§10)
10. **Section assembly order:** `Hero → #portfolio (empty placeholder anchor) → #about → #pricing → #testimonials → #contact → Footer`. The `#portfolio` anchor renders a single placeholder Section visible-to-screen with "Gallery launches Phase 4" copy so the nav link doesn't dead-end. (§11)
11. **Lighthouse: largest risks are hero LCP + tap targets.** Hero image must be ≤200 KB AVIF with explicit `width`/`height` and `fetchpriority="high"`; nav links and CTA buttons must hit ≥48px tap target on mobile. (§12)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Section composition (Hero, About, Pricing, Testimonials, Contact) | Build (Astro `.astro` components in `src/components/sections/`) | — | Pure server-side render; zero client JS per section. |
| Placeholder image optimization | Build (Astro `<Image>` + sharp) | CDN (Cloudflare Pages serves emitted `dist/_astro/*.{avif,webp,jpg}`) | Phase 2 already wired `sharp@^0.34` for build-time transforms. |
| Smooth-scroll anchor jumps | Browser (CSS `scroll-behavior` + `scroll-margin-top`) | — | Already shipped in `global.css` Phase 2; this phase adds `scroll-margin-top` on Sections. |
| Sticky nav background-on-scroll | Browser (CSS `position: sticky` + JS IntersectionObserver flips data-attribute) | Build (Tailwind utilities compiled for `data-[scrolled=true]:` variant) | ~15 lines of vanilla JS in Nav.astro inline `<script>` — no client framework. |
| Mobile hamburger toggle | Browser (vanilla JS handles `aria-expanded`, escape key, click-outside) | — | ~25 lines of vanilla JS. Astro's `<script>` blocks are scoped per-component and bundled by Vite. |
| Contact form UI validation | Browser (HTML5 native validation: `required`, `type="email"`, `pattern`) | — | Pure HTML5; form submission no-op handler logs and shows notice. Phase 5 swaps no-op for fetch. |
| Form honeypot | Browser (CSS-hidden input field) | Build (Phase 5 backend checks the field is empty) | This phase ships the field; Phase 5 enforces it. |
| Social icon rendering | Build (inline SVG in `.astro`) | — | Zero JS, zero external requests, zero dependencies. |

## Standard Stack

### Core (already installed — Phases 1 + 2)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^6.3.3 | Site generator + `<Image>` + `<Picture>` (Phase 3 uses these) | [VERIFIED: package.json] |
| tailwindcss | ^4.3.0 | Utility CSS for sections | [VERIFIED: package.json] |
| @tailwindcss/postcss | ^4.3.0 | PostCSS plugin | [VERIFIED: package.json] |
| sharp | ^0.34.0 | Build-time image transforms (Astro `<Image>` backend) | [VERIFIED: package.json] |

### Net-new in this phase

**None required.** Every dependency Phase 3 needs is already on the project:
- Sections compose with existing primitives (`Button`, `Section`, `Nav`, `Footer`).
- Placeholder images flow through Astro's built-in `<Image>` / `<Picture>` (powered by the existing `sharp@^0.34`).
- Smooth-scroll, sticky-nav, hamburger, form validation — all native browser APIs or tiny inline vanilla JS.
- Social icons — inline SVG, no library.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG copied from simple-icons | `npm install simple-icons` then import paths | Saves zero KB at runtime (icons inline either way); adds 1.5 MB to `node_modules` + a dep tree we'd review for slopcheck. Skip. |
| Inline SVG copied from simple-icons | `astro-icon` integration with `@iconify-json/simple-icons` | Adds 2 deps + build-time dependency resolution. Overkill for 3 icons. Skip. |
| Vanilla JS in `<script>` block | Alpine.js / Stimulus / petite-vue | ~5 KB framework for ~40 lines of code total. Skip. |
| Astro `<Image>` for placeholders | Hot-linked Unsplash URLs (`images.unsplash.com/...`) | GDPR violation (EU IPs to US CDN), no `width`/`height` → CLS hit, third-party DNS lookup adds ~80ms LCP. Skip. |
| Astro `<Image>` for placeholders | Lorem Picsum (`picsum.photos`) | Same GDPR + CLS issues; lower quality than Unsplash; not honest about being placeholder. Skip. |
| Astro `<Image>` for placeholders | SVG grey blocks | Honest but doesn't let owner judge layout/feel; defeats "credible enough for sign-off". Skip. |
| Inline `<script>` per component | Single global `src/scripts/nav.ts` imported once | Astro-idiomatic to inline `<script>` inside the component that uses it — Vite still hoists + bundles. Phase 3 has only one component needing JS (Nav), so a separate file is over-organization. |
| Real pricing numbers (e.g., €2,000 / €2,800) | "€ Price on application" (POA) / "Contact for pricing" | POA reduces qualified lead volume per Fstoppers psychology-of-pricing research; existing Wix site already lists package contents without prices, so couples are used to enquiring blind, but a "Starting from" anchor is a strict improvement. Recommend placeholder numbers with `[OWNER-CONFIRM]` tag. |

### Installation

```bash
# Nothing to install. Phase 3 only adds .astro files + copies 5 placeholder images
# into src/assets/placeholder/ + 3 SVG path-strings into a SocialIcons.astro file.
```

**Version verification:** Not applicable — no new packages this phase.

## Package Legitimacy Audit

| Package | Registry | Source | slopcheck | Disposition |
|---------|----------|--------|-----------|-------------|
| (none) | — | — | n/a | No new packages introduced this phase. |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Slopcheck not run because the package set added by Phase 3 is empty. All consumed packages were vetted in Phases 1 and 2.

## 1. Wedding photographer copy conventions (2026)

### Hero tagline patterns

Research across 10+ working wedding photographer sites (Sitebuilder Report 2026 list; Salted Pages tagline guide) shows three dominant tagline patterns:

| Pattern | Example | When it works |
|---------|---------|----------------|
| **Emotional verb + outcome** | "Capturing the start of forever" / "Turning moments into lifelong memories" | Default editorial choice — short, emotional, no jargon |
| **Place + craft anchor** | "Wedding photography from Dublin to the wild Atlantic" | Strong for SEO + local trust; needs the photographer's specific region |
| **First-person philosophy** | "I photograph weddings the way you'll remember them — quietly" | High-trust, intimate; works only when an About section reinforces voice |

**Recommendation for KL:** combine patterns 2 + 3. KL is Dublin-based with nationwide coverage and the existing Wix site emphasizes a candid/documentary approach. The Wix tagline ("Transforming your wedding into a forever love memory") is the weakest part of the current site — generic and slightly grammatically off ("a forever love memory" reads as a non-native phrasing). Replace.

### About-page structure (1st vs 3rd person)

[CITED: bookfocal.com / saltedpages.com] First-person ("Hi, I'm Karl…") is the 2026 editorial default. Reasons:
- "Couples hire a person, not a brand" — already in our FEATURES.md table-stakes.
- 3rd person reads as either a press bio or a wedding-blog SEO inflation; both undermine intimacy.
- First-person lets you blend "what I do" with "how I work" without a section break.

Standard editorial About structure: **(1)** one-line hook, **(2)** the origin / why-this-craft paragraph, **(3)** the how-you'll-experience-me paragraph (working style), **(4)** a small fact panel (location, languages, gear is OPTIONAL — most 2026 sites omit gear), **(5)** soft CTA back to contact.

### Pricing transparency

[CITED: Fstoppers psychology-of-pricing piece] The "POA" approach (no published prices) reduces inquiry volume by filtering at the wrong end of the funnel — couples bounce, photographer never gets to qualify. **"Starting from €X" is the documented conversion winner** in 2026: it filters out unaffordable shoppers without filtering out affordable-but-uncertain ones. Pattern is sometimes called "hide and reveal" — show the floor, hide the variable tier costs, let the conversation reveal the rest.

The existing Wix site is at the POA extreme (package contents listed, no prices). Moving to "Starting from" is a strict improvement.

**Irish 2026 market context** [CITED: kheffache.com, dkphoto.ie, sarahkatephotography.ie all 2026 guides — see Sources]:
- Typical full-day (8–10 hr) range: **€2,000–€4,000**
- Dublin specifically: **€2,200–€6,000** (wider band; Dublin skews higher)
- Most popular package (8–10 hr, prep through first dance) at the **€3,000–€5,000** band
- Lower-county (Limerick / Tipperary / Clare / Waterford): **€1,800–€2,500**
- Recommended budget allocation: 10–15% of typical €30k wedding = €3,000–€4,500

For a Dublin-based photographer offering 6h and 10h tiers, defensible "Starting from" placeholder anchors are **€1,800 (6h)** and **€2,400 (10h)** — both at the lower-middle of the realistic Irish 2026 range, conservative enough that the actual prices the owner sets are unlikely to be lower. **Tag these `[OWNER-CONFIRM]` because the owner has not provided them.**

### Testimonial framing

Standard 2026 editorial pattern: 3–6 short quotes (1–3 sentences each), attribution as "First & First" + optional date/venue, NO testimonial author photos (introduces faces that compete with the portfolio).

A pull-quote treatment using the EB Garamond italic style (already loaded Phase 2) is the editorial-magazine default. Slightly oversized opening quote-mark glyph (`"`) styled in bronze adds craft signal without ornament.

## 2. Placeholder copy strategy + ready-to-use copy

### Strategy decision

**Write plausible-but-clearly-placeholder copy. Do NOT use lorem ipsum.** Reasons:
- Owner will preview the page and approve/redline section-by-section. Lorem renders the layout untestable — owner sees walls of gibberish, cannot judge IA, font sizes, breakpoint behavior in context of real prose.
- Plausible copy reveals layout problems that lorem ipsum hides (line-length at h2, widow control on pricing tier names, line-height of pull-quotes vs body).
- **Honesty rule:** every placeholder paragraph carries an inline HTML comment marker `<!-- [OWNER-REVIEW] -->` and every owner-substitutable noun/number is tagged `[OWNER-CONFIRM: …]` in visible text. The owner cannot ship placeholder believing it's final.

The exception: the **one real testimonial** scraped from the existing Wix site (Louise & Jonathan) ships as-is because it's the owner's actual client content. Mark it `[VERIFIED: klphotography.ie/ Wix testimonial]` in the source comment so future editors don't accidentally delete it as a placeholder.

### Tagging convention (source-only, not visible to visitors)

```astro
{/* [OWNER-REVIEW] hero tagline placeholder — confirm with owner before launch */}
<h1>Wedding photography for couples<br />who want to remember the quiet moments.</h1>
```

For visitor-visible "owner-confirm" tags inside copy:

```astro
<p>Coverage starts from <strong>€1,800</strong>
   <span class="text-ink-soft text-sm">[OWNER-CONFIRM]</span>.</p>
```

The `[OWNER-CONFIRM]` span is styled to be visible but understated — it disappears at launch when the owner removes the literal tag.

### Hero

```astro
{/* [OWNER-REVIEW] Hero — full-bleed photo + tagline + CTA per CONTENT-01 */}
<h1>
  Wedding photography for couples<br />
  who want to remember the quiet moments.
</h1>
<p class="text-lg">
  Dublin-based. Nationwide. Documentary, calm, present.
</p>
<a href="#contact" class="...">Enquire</a>
```

**Why this works:** (a) Avoids the generic "your love story / forever memory" pile (the existing Wix tagline's category). (b) Names a concrete craft promise ("quiet moments") that the About section can pay off. (c) The second line covers SEO ("Dublin", "Nationwide") + working style ("Documentary, calm, present") in 7 words — keeps the hero uncluttered.

### About

```astro
{/* [OWNER-REVIEW] About — first-person photographer story per CONTENT-02 */}
<h2>I photograph the day the way you'll remember it.</h2>

<p>
  Hi, I'm [OWNER-CONFIRM: photographer's first name]. I've been photographing
  weddings across Ireland for [OWNER-CONFIRM: N years]
  — most of them in Dublin, the rest from Donegal to Cork.
</p>

<p>
  My approach is quiet. I don't pose; I watch. The look you give your dad
  before walking down the aisle, the laugh that breaks during the speeches,
  the slow second when the band starts and the floor finally fills — those
  are the photos you'll look at in twenty years. Everything else is filler.
</p>

<p>
  I'll arrive early, stay late, and ask exactly two things of you on the day:
  trust me to find the moments, and don't worry about the camera. The day
  is yours. I'm just lucky enough to keep it.
</p>

<p class="text-ink-soft text-sm">
  Based in Dublin · Available across Ireland ·
  [OWNER-CONFIRM: optional fact — e.g., "200+ weddings since 2015"]
</p>

<a href="#contact" class="...">Get in touch</a>
```

**Why this works:** First-person, three paragraphs (hook → working style → promise), small fact panel without gear-bragging, soft CTA back to contact.

**Wave-0 risk:** "[OWNER-CONFIRM: photographer's first name]" is a hard blocker for legitimacy of the placeholder — leaving the visible literal first name placeholder will look unprofessional in any owner walkthrough. **Recommend the planner instruct the executing agent to ask the owner for first name BEFORE landing this commit, OR use "Karl" as the default (the photographer's actual first name implied by `klphotography.ie@gmail.com` and previous Wix copy mentioning "I'm a photographer") with the `[OWNER-CONFIRM]` tag for review.**

### Pricing

```astro
{/* [OWNER-REVIEW] Pricing — 6h and 10h tiers per CONTENT-03 */}
<h2>Coverage &amp; what's included</h2>

<div>
  <h3>Half day</h3>
  <p class="text-ink-soft">6 hours of coverage</p>
  <p>Starting from <strong>€1,800</strong>
     <span class="text-ink-soft text-sm">[OWNER-CONFIRM]</span></p>
  <ul>
    <li>Ceremony &amp; couple portraits</li>
    <li>≈ 400 fully edited photographs</li>
    <li>Online gallery, 3 months</li>
    <li>High-resolution downloads</li>
  </ul>
</div>

<div>
  <h3>Full day</h3>
  <p class="text-ink-soft">10 hours of coverage</p>
  <p>Starting from <strong>€2,400</strong>
     <span class="text-ink-soft text-sm">[OWNER-CONFIRM]</span></p>
  <ul>
    <li>Prep through first dance</li>
    <li>≈ 500 fully edited photographs</li>
    <li>Online gallery, 3 months</li>
    <li>High-resolution downloads</li>
    <li>Optional fine-art album (priced separately)</li>
  </ul>
</div>

<p class="text-ink-soft text-sm">
  Every wedding is different. Tell me about yours and I'll quote you
  the right package — there's no template.
</p>
```

### Testimonials (3)

```astro
{/* [VERIFIED: from existing klphotography.ie Wix site] */}
<figure>
  <blockquote>
    The photos are amazing. Thank you so much for capturing our day and
    all the beautiful memories. Your approach was so discreet and the
    whole process was easy from start to finish.
  </blockquote>
  <figcaption>— Louise &amp; Jonathan</figcaption>
</figure>

{/* [OWNER-REVIEW] Placeholder — owner to replace with real testimonial */}
<figure>
  <blockquote>
    We can't recommend [OWNER-CONFIRM] enough. The photos felt like the
    day itself — not posed, not staged, just us. Two months on and we
    still find new favourites every time we open the gallery.
  </blockquote>
  <figcaption>— [OWNER-CONFIRM: couple names], [OWNER-CONFIRM: venue]</figcaption>
</figure>

{/* [OWNER-REVIEW] Placeholder — owner to replace with real testimonial */}
<figure>
  <blockquote>
    Calm presence on a busy day. We barely noticed the camera, which is
    exactly what we wanted, and then the photos arrived and we cried.
    Both sets of parents have ordered prints.
  </blockquote>
  <figcaption>— [OWNER-CONFIRM: couple names], [OWNER-CONFIRM: venue]</figcaption>
</figure>
```

**Why three:** the requirement says 3–6. Three is the editorial minimum and avoids a "wall of quotes" feel. Adding more later is a copy edit, not a layout change.

### Contact section copy

```astro
<h2>Get in touch</h2>
<p>
  Tell me about your day and I'll come back to you within two working days.
  If you'd rather talk, phone or WhatsApp works too.
</p>

{/* [Form fields — see §8] */}

<p class="text-ink-soft">
  Or reach me directly:<br />
  <a href="tel:+353851665472">+353 85 166 5472</a> ·
  <a href="mailto:klphotography.ie@gmail.com">klphotography.ie@gmail.com</a>
</p>
```

## 3. Placeholder image strategy

### Decision

**Download 5 Unsplash photographs, commit them to `src/assets/placeholder/`, and serve them through Astro's `<Image>` / `<Picture>` component.** Do not hot-link.

### Why download + commit (rather than hot-link)

Three blocking issues with hot-linking:

1. **GDPR.** Unsplash CDN is on AWS / Fastly in the US; an EU visitor IP hitting `images.unsplash.com` is a third-party data transfer subject to disclosure in the privacy policy. We explicitly ruled this out for Google Fonts in Phase 2 for the same reason.
2. **CLS regression.** Hot-linked images bypass Astro's `<Image>` pipeline, so no automatic `width`/`height` injection → layout shift → CLS audit fails our Phase 4/6 Lighthouse target.
3. **LCP regression.** Adds a fresh DNS lookup (~30–80ms mobile) for the hero image, which is exactly the LCP element. P1 in PITFALLS.md.

[CITED: unsplash.com/license] The Unsplash License explicitly grants "download, copy, modify, distribute, perform, and use" rights for commercial purposes with no attribution required. The license allows downloading and self-hosting. The [Unsplash hotlinking guideline](https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images) only requires hotlinking for *API-based* uses (where the photographer-tracking beacon is the consideration); manual downloads are unrestricted. **Note the one restriction:** "Compiling images from Unsplash to replicate a similar or competing service" — that would apply to a stock-photo site, not a wedding photographer placeholder. We're safe.

### What about the photographer's own photos?

The owner has all photos locally per PROJECT.md, BUT Phase 4 is the curated portfolio + image pipeline phase. Forcing owner-photo handoff into Phase 3 would conflate scope (Phase 3 is *layout + content sections*; Phase 4 is *real curated gallery + image pipeline*). The placeholder-image strategy below is intentionally short-lived: Phase 4 will replace `src/assets/placeholder/hero.jpg` with the owner's hero choice and delete the placeholder directory.

### Concrete plan

Create `src/assets/placeholder/` and download 5 images (suggested search terms in parentheses):

| Slot | Filename | Dimensions (intrinsic, before Astro resize) | Suggested Unsplash search | Aspect ratio | LCP-critical? |
|------|----------|---------------------------------------------|----------------------------|--------------|---------------|
| Hero (desktop landscape) | `hero-landscape.jpg` | 2400×1600 (3:2) | "wedding bride groom irish countryside documentary" | landscape | YES |
| Hero (mobile portrait — `<Picture>` source) | `hero-portrait.jpg` | 1080×1620 (2:3) | (same shoot if possible, vertical crop) | portrait | YES |
| About portrait (photographer placeholder) | `about-portrait.jpg` | 1200×1500 (4:5) | "photographer with camera neutral portrait outdoor" | portrait | NO |
| Pricing accent | `pricing-accent.jpg` | 1600×1200 (4:3) | "wedding details rings cream paper editorial" | landscape | NO |
| Testimonials accent (subtle bg) | `testimonials-accent.jpg` | 1600×900 (16:9) | "wedding hands ceremony quiet moment editorial" | landscape | NO |

Total downloaded weight: 5 JPEGs × ~1–2 MB ≈ 5–10 MB committed to `src/assets/`. This stays in `src/`, not `public/`, so Astro's `<Image>` resizes them at build to `dist/_astro/*.avif` + WebP + JPEG fallback at the requested widths. **Originals never ship to `dist/`** — they're build inputs only.

### Reading them in components

```astro
---
import { Image, Picture } from 'astro:assets';
import heroLandscape from '@/assets/placeholder/hero-landscape.jpg';
import heroPortrait from '@/assets/placeholder/hero-portrait.jpg';
---

{/* Hero — art-direction switch via <Picture> */}
<Picture
  src={heroLandscape}
  formats={['avif', 'webp']}
  widths={[640, 1024, 1536, 1920, 2400]}
  sizes="(min-width: 1024px) 100vw, 100vw"
  alt="[OWNER-REVIEW: placeholder hero — confirm before launch]"
  loading="eager"
  fetchpriority="high"
  class="h-screen w-full object-cover"
/>
```

For the about portrait and other below-fold images, use `loading="lazy"` and `decoding="async"`.

### Lighthouse-safe alt-text strategy

Astro's image component REQUIRES `alt`. Placeholder images need placeholder alts that are honest:

```astro
alt="[OWNER-REVIEW: placeholder — replace with owner photo and descriptive alt before launch]"
```

This text is invisible to most users but readable by screen readers — which is acceptable for a placeholder preview build but MUST be replaced before launch (caught by Phase 6 alt-text lint). Add a Wave-0 todo for Phase 4 to enforce alt-text rewrites.

### Pre-commit weight check

```bash
# Verify the 5 originals total < 15 MB (sanity check on bloat)
du -sh src/assets/placeholder/
```

### Why NOT picsum.photos / Lorem Picsum

Lorem Picsum proxies Unsplash but adds a third-party DNS hop AND a remote dependency at *build time* if we tried to inline it. Either way it's worse than committing the files.

## 4. Smooth-scroll

### Already shipped

Phase 2 `src/styles/global.css` already contains:

```css
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    /* ... */
    scroll-behavior: auto !important;
  }
}
```

This handles ANY in-page anchor jump (clicking `<a href="#about">` smoothly scrolls; reduced-motion users get instant jump). No additional JS needed for the smooth-scroll mechanic itself.

### What Phase 3 must add: `scroll-margin-top` per Section

The smooth-scroll lands the target at viewport top — which is exactly where the sticky nav sits. Without an offset, every anchor click hides the section's heading behind the nav bar.

[CITED: css-tricks.com/fixed-headers-and-jump-links-the-solution-is-scroll-margin-top/, MDN] `scroll-margin-top` is the modern CSS-only solution: applied to scroll targets, it tells the browser "leave this much space above me when you scroll to me." No JS, no offset math, supports Chrome 69+ / Firefox 68+ / Safari 14.1+ — everyone we care about.

**Concrete change to `Section.astro`:**

```astro
---
/* existing Section.astro */
---
<section
  id={id}
  class:list={[toneClass, 'py-16 sm:py-24 lg:py-32 scroll-mt-20 lg:scroll-mt-24', className]}
  {...rest}
>
```

`scroll-mt-20` = 5rem = 80px (matches the sticky nav's mobile height); `lg:scroll-mt-24` = 6rem = 96px for desktop where the nav has more breathing room. These match `Nav.astro`'s computed height — must be kept in sync. Document as a comment in Section.astro.

### Why NOT JS-based scrollIntoView with offset

[CITED: copyprogramming.com/howto/javascript-scrollintoview-smooth-scroll-and-offset/] JS-based approaches (`element.scrollIntoView({ behavior: 'smooth' })` with manual offset math) require:
- Reading nav height dynamically
- Listening for click events on every anchor
- A reduced-motion check in JS
- Bundle overhead for what CSS does in two declarations

`scroll-margin-top` wins on every dimension: no JS, no event listeners, reduced-motion already handled by the existing `scroll-behavior: auto` override.

### Why NOT IntersectionObserver-driven active-state nav

The requirement (CONTENT-06) does NOT call for nav links to highlight the current section. **Skip the scrollspy active-state feature.** Reasons:
- Not required by CONTENT-06.
- Adds ~30 lines of vanilla JS for a marginal nav-link UX gain.
- On a 7-section single page, active-state highlighting is more visual noise than value.

Document in the plan that this is intentionally out of scope for Phase 3; can be added in a polish pass if owner requests.

## 5. Mobile hamburger

### Decision

**Use a `<button aria-expanded>` + vanilla JS toggle.** Do NOT use `<details>/<summary>`. ~25 lines of JS.

### Why not `<details>/<summary>`

[CITED: cloudfour.com/thinks/a-details-element-as-a-burger-menu-is-not-accessible/] The `<details>` element has documented a11y gaps as a nav burger:
- VoiceOver doesn't list `<summary>` under buttons or form-controls navigation menus
- `<summary>` strips heading semantics — keyboard users can't jump to the menu via shortcut keys
- iOS Safari historically had quirks with `<details>` animations + scroll-locking
- Escape-to-close doesn't work out of the box — still need JS

Cloud Four's verdict: "It's not an inclusive solution for burger menus." We adopt that recommendation.

### Why not CSS-only `<input type="checkbox">` trick

- Hides the toggle state from screen readers (the visual menu is `:checked ~ ul` but assistive tech doesn't understand the sibling selector as state)
- No escape-to-close
- No focus management
- A CSS-only trick is clever but actively user-hostile for keyboard + screen-reader users

### Pattern: `<button aria-expanded>` + 25 lines of vanilla JS

[CITED: accede-web.com burger-menu guidelines + theadminbar.com mobile-nav-and-hamburger-menus/]

```astro
---
/* Nav.astro frontmatter unchanged; add the button + script */
---
<nav aria-label="Primary" class="sticky top-0 z-50">
  <div class="...">
    <a href="/" class="font-serif text-xl text-ink">{brand}</a>

    {/* Desktop nav — visible sm: and up (unchanged from Phase 2) */}
    <ul class="hidden sm:flex gap-8">...</ul>

    {/* Mobile toggle — visible below sm: only */}
    <button
      id="nav-toggle"
      type="button"
      class="sm:hidden inline-flex items-center justify-center
             h-11 w-11 -mr-2 motion-safe:transition-colors hover:text-bronze
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
      aria-expanded="false"
      aria-controls="nav-mobile-menu"
      aria-label="Toggle menu"
    >
      {/* Hamburger SVG when closed, X when open — toggle via CSS sibling state */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.5" aria-hidden="true">
        <path class="line-top"    d="M3 6h18" />
        <path class="line-middle" d="M3 12h18" />
        <path class="line-bottom" d="M3 18h18" />
      </svg>
    </button>
  </div>

  {/* Mobile menu — slides down below the nav bar */}
  <ul
    id="nav-mobile-menu"
    class="sm:hidden hidden flex-col gap-0 border-t border-rule bg-cream"
    data-nav-mobile
  >
    {links.map((l) => (
      <li>
        <a
          href={l.href}
          class="block px-6 py-4 text-base text-ink border-b border-rule motion-safe:transition-colors hover:text-bronze hover:bg-cream-deep"
        >{l.label}</a>
      </li>
    ))}
  </ul>
</nav>

<script>
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-mobile-menu');
  if (toggle && menu) {
    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.add('hidden');
    };
    const open = () => {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.remove('hidden');
    };
    toggle.addEventListener('click', () => {
      toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
    });
    // Close on link click
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
        toggle.focus();
      }
    });
    // Close on click outside
    document.addEventListener('click', (e) => {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      const t = e.target as Node;
      if (!menu.contains(t) && !toggle.contains(t)) close();
    });
  }
</script>
```

**Accessibility checklist covered:**
- ✓ `aria-expanded` toggles `"false"` ↔ `"true"` (Lighthouse `aria-valid-attr-value`)
- ✓ `aria-controls` points at the menu (Lighthouse `aria-allowed-attr`)
- ✓ `aria-label` on the button (Lighthouse `button-name`)
- ✓ Escape key closes menu AND returns focus to toggle (WCAG 2.1.2 No Keyboard Trap)
- ✓ Click outside closes menu (UX expectation)
- ✓ Click on link inside closes menu (so anchor-jump doesn't leave menu open)
- ✓ Tap target ≥ 44px (`h-11 w-11` = 44×44px; Lighthouse target-size)
- ✓ Focus-visible ring matches Phase 2 Button pattern (consistency + WCAG 2.4.7)

**Animation:** `motion-safe:transition-colors` only — no slide-down on the menu itself. Reasoning: vestibular-friendly default, no `prefers-reduced-motion` check needed, simpler code, no janky height-auto transition trick. The menu just appears.

**Bundle cost:** ~25 lines × minified ≈ ~600 bytes JS. Vite bundles into `dist/_astro/*.js` and emits a `<script type="module">` tag at the bottom of `<body>`. This is the project's first client-side JS — acceptable per Phase 1's "zero JS by default" principle (the rule is "default to zero", not "never").

### Edge case: hamburger should also close on viewport resize crossing `sm:`

If a user rotates their phone or resizes a small browser window past 640px while the menu is open, the desktop nav appears and the menu floats orphaned. Add:

```js
window.addEventListener('resize', () => {
  if (window.innerWidth >= 640 && toggle.getAttribute('aria-expanded') === 'true') close();
});
```

Two more lines, no measurable cost.

## 6. Sticky nav

### Decision

Use **CSS `position: sticky top-0 z-50`** (Phase 2 Nav.astro already uses normal flow; we add sticky behavior here). For the "background change when scrolled" effect, use an **IntersectionObserver watching a 1px sentinel at the top of `<body>`** to flip a `data-scrolled` attribute on the `<nav>`. Style swap is pure Tailwind via `data-[scrolled=true]:` variants.

### Why this approach

[CITED: taylor.callsen.me modern-navigation-menus-with-css-position-sticky-and-intersectionobservers/]

The classic alternative — listening to `window.scroll` with `scrollY > 50` — runs at scroll frequency (every frame on mobile) and forces sync layout reads. IntersectionObserver is callback-once-per-state-change, runs off the main thread, costs nothing in Lighthouse Performance.

The newer CSS-only `@container scroll-state(stuck: true)` from Chrome 133+ would be even simpler, but Safari + Firefox don't ship it yet [CITED: developer.chrome.com/blog/css-scroll-state-queries], so we'd still need the JS fallback. Skip the bleeding edge until 2027.

### Implementation

**At top of `BaseLayout.astro`'s `<body>`** (right inside `<body>`, before everything else):

```astro
<body class="...">
  {/* 1px sentinel — IntersectionObserver in Nav.astro watches this */}
  <div data-nav-sentinel aria-hidden="true" style="position: absolute; top: 0; height: 1px; width: 100%; pointer-events: none;"></div>
  <slot />
</body>
```

**Nav.astro additions (alongside the hamburger script from §5):**

```astro
<nav
  aria-label="Primary"
  class="sticky top-0 z-50 motion-safe:transition-colors
         data-[scrolled=true]:bg-cream/90 data-[scrolled=true]:backdrop-blur-sm data-[scrolled=true]:border-b data-[scrolled=true]:border-rule
         data-[scrolled=false]:bg-transparent data-[scrolled=false]:border-b data-[scrolled=false]:border-transparent"
  data-scrolled="false"
>
  ...
</nav>

<script>
  const nav = document.querySelector('nav[aria-label="Primary"]');
  const sentinel = document.querySelector('[data-nav-sentinel]');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      ([entry]) => {
        nav.setAttribute('data-scrolled', entry.isIntersecting ? 'false' : 'true');
      },
      { threshold: 0 }
    );
    obs.observe(sentinel);
  }
</script>
```

### Tailwind v4 dynamic class safelist

Tailwind v4 scans source files for class strings. The above uses `data-[scrolled=true]:bg-cream/90` which the scanner DOES detect (it's a literal in the JSX-like template). No safelist comment needed.

**However**, if a future refactor moves the data-attribute logic to a config object, add a safelist comment in Nav.astro per the Phase 2 pattern.

### Cream `bg-cream/90 backdrop-blur-sm` contrast against hero photo

Contrast concern: when the nav is over a dark hero photo, the cream-90% background needs to keep text legible. Math:
- `bg-cream/90` = `#FAF7F2` at 90% opacity over photo
- `backdrop-blur-sm` (4px blur) softens underlying high-contrast edges
- Ink text (#1A1A1A) on the resulting blended color: contrast remains ≥4.5:1 because the cream layer dominates the rendered pixel color

**Worst-case test:** if owner's eventual hero photo is pure white (rare for weddings — most have skin tones / outdoor scenes), the nav reads at ~7:1 contrast. If owner's hero is pure black (also rare), the cream-over-black at 90% opacity = ~`#E1DDDA` (very close to cream), still ≥10:1 contrast for ink text.

**Belt-and-braces:** the initial `data-scrolled="false"` state uses `bg-transparent` which means nav text sits directly on hero photo. This IS a contrast risk for a wedding photo with mixed bright/dark areas. **Recommendation: ship `data-scrolled="false"` with `bg-cream/40 backdrop-blur-sm` instead of pure transparent**, accepting a subtle frosted state from the start. This guarantees Lighthouse contrast passes regardless of hero photo composition.

Plan should call out: "Nav's initial state uses `bg-cream/40 backdrop-blur-sm` (subtle, not transparent) so text legibility doesn't depend on hero photo composition."

### Initial render: avoid CLS

Nav has fixed height (`py-4` + content height = ~64px). The sentinel is `position: absolute; top: 0` — does not push layout. No CLS contribution.

### `prefers-reduced-motion`

`motion-safe:transition-colors` on the nav respects reduced-motion; reduced-motion users see instant background swap (which is fine — it's a 1-pixel-scroll trigger, never a long animation).

## 7. Pricing card pattern

### Decision

**Two horizontally-arranged cards on `lg:`, stacked vertically below.** Each card uses the existing `Section` primitive's content well; cards themselves are plain `<div>` with `bg-cream-deep p-8 lg:p-12 border border-rule`.

### Card content order (top to bottom)

```
┌────────────────────────────┐
│ h3 — "Half day"            │ ← serif heading (EB Garamond clamp)
│ small — "6 hours coverage" │ ← caption color (ink-soft)
│                            │
│ Starting from €1,800       │ ← prominent inline price
│ [OWNER-CONFIRM]            │
│                            │
│ ─────────────────────      │ ← bronze hairline rule
│                            │
│ • Ceremony & portraits     │ ← bullet list of inclusions
│ • ≈ 400 edited photos      │
│ • Online gallery, 3 months │
│ • High-res downloads       │
└────────────────────────────┘
```

### Pricing display: number vs €TBD vs POA

Three options weighed:

| Option | Lead quality | Effort to amend | Risk |
|--------|--------------|-----------------|------|
| Real number (e.g., "€1,800") | Highest (qualified) | Trivial (one literal) | Anchors owner's pricing decision |
| "Starting from €TBD" | Medium (curious but uncertain) | Trivial | Reads unfinished |
| "Price on application" | Lowest (per Fstoppers research) | Trivial | Bad UX |

**Recommend: ship "Starting from €1,800 / €2,400" with visible `[OWNER-CONFIRM]` tag.** The tag is visibly understated (`text-ink-soft text-sm`), prompts the owner to confirm or amend during their preview, and is a single Find+Replace away from final. The actual numbers are conservatively low-middle of Ireland 2026 market data — defensible against "you under-priced me" feedback.

If owner refuses to commit numbers even after seeing the placeholder, fall back to "Starting from €TBD" — still better than POA per the research.

### Album bullet

The 10-hour tier mentions "Optional fine-art album (priced separately)" rather than naming a number — this is consistent with how the existing Wix site words it, and album pricing varies too much by spec (size, paper, page count) to anchor with a single number.

### Order: 6h first or 10h first?

Recommend **6h first (smaller commitment), 10h second (the "anchor" tier).** Reasoning: most pricing-page conversion research puts the *recommended* tier on the right and uses subtle visual emphasis (slightly larger card, or a "Most popular" badge) to draw the eye. Skipping the badge for editorial restraint; the right-hand position alone does enough work.

Owner might prefer the inverse — call this out as an open question for plan-time discussion.

## 8. Contact form UI

### Decision

Ship the form with:
- HTML5 native validation only (`required`, `type="email"`, `inputmode="email"`, `pattern` where useful)
- Visually-hidden honeypot field (`name`, `email-hp`, or similar — Phase 5 backend checks it)
- `<form>` with **no `action` attribute** and a `preventDefault` submit handler that shows "Form not yet active — please use phone / email / WhatsApp below" notice
- Submit button uses the existing `Button` primitive with `loading={false}` (the loading state is wired in Phase 5)
- Turnstile placeholder is a commented HTML stub `<!-- Phase 5: <div class="cf-turnstile" data-sitekey="..."></div> -->` so Phase 5 knows where to drop the widget

### Fields (per FORM-02, this is the UI for that form)

```astro
<form class="space-y-6" id="contact-form" novalidate>
  {/* Honeypot — hidden from sighted/AT users, visible to bots */}
  <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
    <label>
      Don't fill this in
      <input type="text" name="contact_company" tabindex="-1" autocomplete="off" />
    </label>
  </div>

  <div>
    <label for="cf-name" class="block text-sm font-medium">Name<span aria-hidden="true">&nbsp;*</span></label>
    <input id="cf-name" name="name" type="text" required minlength="2" maxlength="100"
           autocomplete="name"
           class="mt-2 block w-full bg-cream border border-rule rounded-none px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze" />
  </div>

  <div>
    <label for="cf-email" class="block text-sm font-medium">Email<span aria-hidden="true">&nbsp;*</span></label>
    <input id="cf-email" name="email" type="email" required
           inputmode="email" autocomplete="email"
           class="mt-2 block w-full bg-cream border border-rule rounded-none px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze" />
  </div>

  <div>
    <label for="cf-date" class="block text-sm font-medium">Wedding date <span class="text-ink-soft font-normal">(optional)</span></label>
    <input id="cf-date" name="wedding_date" type="date"
           class="mt-2 block w-full bg-cream border border-rule rounded-none px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze" />
  </div>

  <div>
    <label for="cf-venue" class="block text-sm font-medium">Venue <span class="text-ink-soft font-normal">(optional)</span></label>
    <input id="cf-venue" name="venue" type="text" maxlength="200" autocomplete="off"
           class="mt-2 block w-full bg-cream border border-rule rounded-none px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze" />
  </div>

  <div>
    <label for="cf-message" class="block text-sm font-medium">About your day<span aria-hidden="true">&nbsp;*</span></label>
    <textarea id="cf-message" name="message" required minlength="20" maxlength="2000" rows="6"
              class="mt-2 block w-full bg-cream border border-rule rounded-none px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"></textarea>
  </div>

  {/* Phase 5: Turnstile widget injected here */}
  {/* <div class="cf-turnstile" data-sitekey="YOUR-PUBLIC-SITE-KEY"></div> */}

  <p class="text-sm text-ink-soft">
    By submitting, you'll receive a reply within two working days. We don't share your details.
    Privacy: <a href="/privacy" class="text-bronze hover:text-bronze-hover underline">how we handle this</a>.
  </p>

  <Button type="submit" variant="primary" size="lg">Send enquiry</Button>

  <p id="cf-notice" class="hidden text-sm text-ink-soft" role="status" aria-live="polite"></p>
</form>

<script>
  const form = document.getElementById('contact-form');
  const notice = document.getElementById('cf-notice');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form instanceof HTMLFormElement && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (notice) {
      notice.classList.remove('hidden');
      notice.textContent = 'Form not yet active — please use phone / email / WhatsApp below.';
    }
  });
</script>
```

### Why `novalidate` on the form

Counterintuitive — but: `novalidate` disables the browser's *automatic* validation pop-up but **`form.checkValidity()` and `form.reportValidity()` still respect `required` / `type` / `pattern` attributes**. This lets us trigger validation manually inside the submit handler with consistent timing instead of letting the browser interrupt the submit click. Per HTML5 spec.

Without `novalidate`, the browser shows its own validation UI on every blur — which is fine but doesn't integrate with the submit-handler notice flow. `novalidate` + `checkValidity()` is the modern pattern.

### Phase 5 hand-off

The Phase 5 plan needs to:
1. Replace the submit handler with a `fetch('/api/contact', { method: 'POST', body: new FormData(form) })`
2. Toggle `Button loading={true}` while fetch is in-flight (the Button primitive already supports this)
3. Uncomment the Turnstile widget div
4. Add `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` to the page head

**None of those changes touch the field markup or labels.** Phase 3 is the field-stable UI; Phase 5 is purely the wire-up. Document this contract in the plan and the SUMMARY.

### Required vs optional fields

The HTML above marks: `name`, `email`, `message` as required. `wedding_date`, `venue` as optional. This matches FORM-02 exactly.

The asterisk treatment uses `<span aria-hidden="true">&nbsp;*</span>` for sighted indication + the `required` attribute for AT (screen readers announce "required"). Avoids the AT-confusing redundancy of saying "required required."

## 9. Social SVG icons

### Decision

**Copy 3 SVG `<path>` markups inline from simple-icons** (CC0 license) into `src/components/icons/SocialIcons.astro`. Zero deps. Zero external requests. Tailwind sizing via `class="h-5 w-5 fill-current"`.

### License

[CITED: github.com/simple-icons/simple-icons] simple-icons is **CC0 1.0** (Creative Commons public domain dedication). No attribution required. Use freely commercial / non-commercial. Brand-trademark restrictions are separate from the icon copyright — using the Instagram logo for "this is our Instagram link" is permitted nominative use under trademark law universally.

### Concrete file (ready to paste)

```astro
---
/* src/components/icons/SocialIcons.astro
   Three brand icons from simple-icons (CC0). Inline SVG, fill-current,
   sized via h-* w-* tailwind. Pass `class` to override. */
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'svg'> {
  brand: 'instagram' | 'facebook' | 'whatsapp';
}

const { brand, class: className, ...rest } = Astro.props;

const paths: Record<Props['brand'], { title: string; d: string }> = {
  instagram: {
    title: 'Instagram',
    d: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  },
  facebook: {
    title: 'Facebook',
    d: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  },
  whatsapp: {
    title: 'WhatsApp',
    d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  },
};

const { title, d } = paths[brand];
---

<svg
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  class:list={['h-5 w-5 fill-current', className]}
  role="img"
  aria-label={title}
  {...rest}
>
  <title>{title}</title>
  <path d={d}></path>
</svg>
```

[VERIFIED: fetched from raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/{instagram,facebook,whatsapp}.svg on 2026-05-17]

### Usage

```astro
---
import SocialIcons from '@/components/icons/SocialIcons.astro';
---

<a href="https://instagram.com/klphotography.ie" aria-label="Instagram"
   class="motion-safe:transition-colors hover:text-bronze">
  <SocialIcons brand="instagram" />
</a>
```

The `<a aria-label>` makes the link's purpose accessible to screen readers; the SVG's own `<title>` provides redundant text-equivalent for tools that surface it.

### Heroicons / Lucide considered

Heroicons doesn't ship brand logos (per [tailwindlabs/heroicons#907](https://github.com/tailwindlabs/heroicons/discussions/907) — explicitly out of scope for the project). Lucide ships them but the project is MIT-licensed and visually less faithful to brand. Simple-icons is the canonical CC0 source for brand SVGs in 2026. Confirmed.

## 10. /privacy link strategy

### Decision

**Ship a 50-line `src/pages/privacy.astro` stub** that:
- Has a real `<title>` and `<h1>` ("Privacy policy")
- Says: "Privacy policy will be published before launch (Phase 5). For questions about data handling, contact klphotography.ie@gmail.com."
- Lists the placeholder data points (form fields collected) so the framework is in place
- Has `<meta name="robots" content="noindex, nofollow">` to avoid being crawled before it's real
- Links back to home with the Nav primitive at top + Footer at bottom

### Why ship a stub vs no link vs broken link

| Option | Pros | Cons |
|--------|------|------|
| Ship stub `/privacy` | No 404, signals legal intent, Phase 5 has the route ready | 50 lines of throwaway code (replaced by Phase 5) |
| Skip footer link until Phase 5 | Zero extra code | Footer primitive's legal slot is empty; future Phase 5 edits both Footer AND adds privacy page |
| Link to `/privacy` that 404s | Zero code | **Live preview shows 404** — owner walkthrough confusion; Lighthouse SEO audit flags broken internal link |

**Stub is the cheapest defensible option.** Phase 5's GDPR plan will replace the entire body with the real privacy policy text — but the route, the `<noindex>`, and the footer link all stay byte-identical.

### Stub content (ready to ship)

```astro
---
/* src/pages/privacy.astro
   Phase 3 stub. Phase 5 (GDPR-01) replaces the body with the real policy. */
import BaseLayout from '@/layouts/BaseLayout.astro';
import Nav from '@/components/ui/Nav.astro';
import Section from '@/components/ui/Section.astro';
import Footer from '@/components/ui/Footer.astro';
---

<BaseLayout
  title="Privacy policy — KL Photography"
  description="How KL Photography handles personal data submitted via the contact form."
>
  <meta slot="head" name="robots" content="noindex, nofollow" />

  <Nav />

  <Section id="privacy" tone="cream">
    <h1>Privacy policy</h1>
    <p>
      <strong>The full privacy policy will be published before launch.</strong>
      For questions about how KL Photography handles personal data in the meantime,
      please email
      <a href="mailto:klphotography.ie@gmail.com" class="text-bronze hover:text-bronze-hover underline">klphotography.ie@gmail.com</a>.
    </p>
    <h2>Data we will collect</h2>
    <p>When you submit the contact form, we receive your name, email address, and message,
      plus the optional wedding date and venue you provide.</p>
    <h2>How we will use it</h2>
    <p>To reply to your enquiry. We don't share, sell, or use it for marketing.
      The data is forwarded to the photographer's Gmail inbox and stored there.</p>
    <h2>Your rights</h2>
    <p>Under EU GDPR you have the right to access, correct, or delete the personal data
      we hold about you. Contact us to exercise any of these rights. If you're unhappy
      with our response, you can complain to the Irish Data Protection Commission.</p>
    <p class="text-ink-soft text-sm mt-12">
      <em>[OWNER-REVIEW] This is a Phase 3 placeholder. Phase 5 ships the legally-reviewed final policy.</em>
    </p>
  </Section>

  <Footer />
</BaseLayout>
```

This stub is good enough to ship behind the footer link without embarrassment. The substance is accurate (form data → Gmail forwarding) and the visible `[OWNER-REVIEW]` tag prevents launch with the placeholder still active.

### robots.txt update

The current `public/robots.txt` already has `Disallow: /styleguide` and a sitemap line. **Add `Disallow: /privacy` so it doesn't get indexed before Phase 5 publishes the final.** Phase 5 plan can remove the disallow line when the real policy ships.

## 11. Single-page assembly

### Section order + anchor IDs

```
src/pages/index.astro
└── BaseLayout
    ├── Nav (sticky)                  — appears once, persistent
    │
    ├── Hero            #hero         — full-bleed photo + h1 + tagline + Enquire CTA
    │
    ├── PortfolioStub   #portfolio    — anchor target placeholder until Phase 4
    │                                   ("The full portfolio launches with the live site")
    │
    ├── About           #about        — first-person story + portrait
    │
    ├── Pricing         #pricing      — two tiers side-by-side on lg:, stacked below
    │
    ├── Testimonials    #testimonials — 3 quotes (1 real + 2 placeholder)
    │
    ├── Contact         #contact      — form + WhatsApp/phone/email
    │
    └── Footer                        — copyright, /privacy link, social icons
```

The `#portfolio` anchor MUST exist or the Nav link from Phase 2 (`{ href: '#portfolio', label: 'Portfolio' }` — wait, Nav doesn't currently include Portfolio; see below) dead-ends.

### Existing Nav links audit

Current `src/components/ui/Nav.astro` links (Phase 2):

```js
const links = [
  { href: '#about', label: 'About' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#contact', label: 'Contact' },
];
```

**There is no #portfolio link.** This is consistent with FEATURES.md saying portfolio is the centerpiece BUT phase 4 ships the actual portfolio gallery. Two options:

**Option A: don't add `#portfolio` to the nav.** Reasoning: the hero photo IS the portfolio teaser; couples scroll past it to reach About/Pricing/etc. Phase 4 can add the nav link when there's something to jump to.

**Option B: add `#portfolio` to the nav now, render the placeholder stub Section.** Reasoning: the nav order in FEATURES.md is `Hero → Portfolio → About → Pricing → Testimonials → Contact`; adding it after Phase 4 means re-editing nav layout decisions.

**Recommend Option A.** Adding a nav link to a "Coming soon" section is bad UX. Phase 4 plan will add the link to Nav as part of shipping the real gallery. The placeholder Section can still exist with `id="portfolio"` so the hash works if someone manually navigates to `#portfolio` — but the link doesn't appear in the nav.

Actually — re-reading the prompt, it says: "Section ID convention for anchors (`#hero`, `#about`, `#portfolio`, `#pricing`, `#testimonials`, `#contact`). Portfolio anchor placeholder for Phase 4." So the ID exists, but the nav LINK to it is what's deferred.

### `src/pages/index.astro` assembly

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Nav from '@/components/ui/Nav.astro';
import Footer from '@/components/ui/Footer.astro';
import Hero from '@/components/sections/Hero.astro';
import PortfolioStub from '@/components/sections/PortfolioStub.astro';
import About from '@/components/sections/About.astro';
import Pricing from '@/components/sections/Pricing.astro';
import Testimonials from '@/components/sections/Testimonials.astro';
import Contact from '@/components/sections/Contact.astro';
import SocialIcons from '@/components/icons/SocialIcons.astro';
---

<BaseLayout
  title="KL Photography — Wedding Photographer, Dublin, Ireland"
  description="Dublin-based wedding photographer for couples who want to remember the quiet moments. Documentary coverage across Ireland."
>
  <Nav />

  <main>
    <Hero />
    <PortfolioStub />
    <About />
    <Pricing />
    <Testimonials />
    <Contact />
  </main>

  <Footer>
    <p slot="brand" class="font-serif text-xl text-ink">KL Photography</p>
    <ul slot="links" class="space-y-2">
      <li><a href="#about" class="hover:text-bronze">About</a></li>
      <li><a href="#pricing" class="hover:text-bronze">Pricing</a></li>
      <li><a href="#contact" class="hover:text-bronze">Contact</a></li>
      <li><a href="/privacy" class="hover:text-bronze">Privacy</a></li>
    </ul>
    <div slot="social" class="flex gap-4">
      <a href="https://instagram.com/klphotography.ie" aria-label="Instagram"
         class="motion-safe:transition-colors hover:text-bronze">
        <SocialIcons brand="instagram" />
      </a>
      <a href="https://www.facebook.com/[OWNER-CONFIRM]" aria-label="Facebook"
         class="motion-safe:transition-colors hover:text-bronze">
        <SocialIcons brand="facebook" />
      </a>
      <a href="https://wa.me/353851665472" aria-label="WhatsApp"
         class="motion-safe:transition-colors hover:text-bronze">
        <SocialIcons brand="whatsapp" />
      </a>
    </div>
  </Footer>
</BaseLayout>
```

The `<main>` landmark wraps all visible content sections — Lighthouse `landmark-one-main` audit passes.

### Section component file layout

```
src/components/sections/
├── Hero.astro
├── PortfolioStub.astro
├── About.astro
├── Pricing.astro
├── Testimonials.astro
└── Contact.astro
```

Per Phase 2 SUMMARY's `patterns-established`: "Phase 3 will add composed sections under src/components/sections/".

### PortfolioStub.astro (placeholder anchor)

```astro
---
import Section from '@/components/ui/Section.astro';
---

<Section id="portfolio" tone="cream-deep">
  <h2>Selected work</h2>
  <p class="text-ink-soft">
    The full curated portfolio launches with the live site
    <span class="text-ink-soft text-sm">[OWNER-REVIEW: Phase 4]</span>.
    In the meantime, find recent work on
    <a href="https://instagram.com/klphotography.ie" class="text-bronze hover:text-bronze-hover underline">Instagram</a>.
  </p>
</Section>
```

This section serves three purposes: (1) gives `#portfolio` a valid scroll target, (2) drives Instagram engagement during the placeholder window, (3) honestly signals to the owner "this is where the gallery goes".

## 12. Lighthouse considerations

| Risk | Trigger | Mitigation in Phase 3 |
|------|---------|------------------------|
| **CLS from hero image without dimensions** | Hot-linked image or `<img>` without w/h | Astro `<Picture>` sets w/h from imported asset metadata automatically. Hero image is imported via `import heroLandscape from '@/assets/placeholder/...'` — dimensions are part of the imported metadata. |
| **LCP from hero image** | Large image, no preload, lazy-loaded | Hero is `loading="eager" fetchpriority="high"`. Astro Picture emits responsive AVIF at multiple widths. For a placeholder we don't need to optimize-to-200KB-cap yet (that's a Phase 4 task) — but pick a hero source already < 500 KB at 2400px wide. |
| **CLS from sticky nav appearing after first paint** | JS-driven nav insertion | Nav is server-rendered into HTML; sticky-state JS only flips an attribute. No insertion. Zero CLS contribution. |
| **Tap target too small (Nav links + Enquire CTA)** | Mobile nav links < 44px tall | Mobile menu link `<a class="block px-6 py-4 text-base">` = ~48px tall (16px text + 16+16 vertical padding = 48px). Hamburger button `h-11 w-11` = 44×44px. Hero CTA uses `Button size="lg"` (px-8 py-4 + text-lg → ~52px tall). All ≥44px, all Lighthouse-safe. |
| **Color contrast on nav over hero photo** | Translucent nav background over arbitrary photo | Initial state `bg-cream/40 backdrop-blur-sm` (per §6) — never fully transparent. Worst-case contrast ~5:1 over pure white photo; typical ≥7:1. |
| **Missing alt text on placeholder images** | Astro `<Image>` requires alt; if alt is empty Astro errors at build | Every image has explicit `alt="[OWNER-REVIEW: …]"` — passes build AND signals the placeholder to the owner. Phase 4 lint will require real descriptive alt before launch. |
| **Form labels missing for inputs** | `<input>` without `<label for>` | Every input is paired with `<label for="cf-{name}">` — Lighthouse `label` audit passes. |
| **Skipped heading levels** | h1 in Hero, then h3 in pricing tier without h2 above | Pricing has `<h2>` section heading and `<h3>` per tier. Testimonials uses `<blockquote>` (no heading), About has `<h2>`. No skips. |
| **Smooth scroll causes vestibular issues** | Long scroll, parallax, etc. | Smooth scroll is short-distance anchor jumps; `prefers-reduced-motion: reduce` already disabled in Phase 2 global.css. |

### Likely Lighthouse mobile score for Phase 3 build

Predicted:
- **Performance:** 90–95 (placeholder hero may not hit Phase 4's ≤200KB target but should be well under 500KB)
- **Accessibility:** 100 (Phase 2 set the bar; Phase 3 introduces only form + nav button + 3 SVG icons, all with correct labeling)
- **Best Practices:** 95+ (no third-party requests since fonts are self-hosted and images are committed locally)
- **SEO:** 90+ (page has title, description, link rel="canonical" comes in Phase 6, alt text passes basic, but the `[OWNER-REVIEW]` literal in alt text will show up in scrapers — acceptable for preview build)

The actual Lighthouse target (PERF-02: Mobile Performance ≥90) is a Phase 6 gate, not Phase 3. Phase 3 should still aim for ≥90 to avoid Phase 6 regressions surprises.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None — no database, no datastore in this project | None |
| Live service config | None — Cloudflare Pages serves only static `dist/`. Pages Functions not used until Phase 5 | None |
| OS-registered state | None — no scheduled tasks, no daemons | None |
| Secrets / env vars | None for Phase 3 — `TURNSTILE_*` / `RESEND_*` belong to Phase 5; this phase's form is UI-only and doesn't read any env vars | None |
| Build artifacts | The existing `dist/` from Phase 2 will be rebuilt with new section pages + 5 placeholder images. New `dist/_astro/` files for AVIF/WebP variants — these don't need manual cleanup; Astro deletes orphans on rebuild. | None |

This phase is content-and-layout-only; no runtime state migration concerns. Placeholder images (`src/assets/placeholder/*`) committed in Phase 3 will be **deleted** in Phase 4 when real portfolio images replace them — note this in the Phase 4 hand-off.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | astro build | ✓ | 22.x (per `.nvmrc`) | — |
| npm | dep install | ✓ | bundled with Node | — (no new deps this phase) |
| sharp | Astro `<Image>` build-time transforms | ✓ | 0.34.x (installed Phase 1) | — |
| Internet access at planning/execution time | Downloading 5 Unsplash JPEGs into `src/assets/placeholder/` (one-time, manual) | ✓ assumed | — | If offline: ship grey-block SVG placeholders with explicit dimensions; owner still sees layout but loses the "credible enough" benefit. Note in Phase 4 hand-off that these were grey blocks not photos. |
| Lighthouse CLI or DevTools | Optional Phase 3 self-check | ✓ assumed | — | axe-core devtools extension |

No blocking gaps. The Unsplash downloads happen ONCE at execution time and are committed; no runtime network dependency.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no `vitest` / `jest` / `playwright`) — consistent with Phase 2 |
| Config file | none |
| Quick run command | `npm run check` + `npm run build` (compile fails = test fails) |
| Full suite command | Same — there is no separate test suite yet |
| Phase gate | Manual visual sweep + DevTools mobile emulation + Lighthouse on `/` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| CONTENT-01 | Hero renders with photo + h1 + Enquire CTA → `#contact` | build-time | `grep -q 'href="#contact"' dist/index.html && grep -q '<h1>' dist/index.html` | section file written in 03-01 |
| CONTENT-02 | About renders with photographer story + portrait | build-time | `grep -q 'id="about"' dist/index.html` | written in 03-01 |
| CONTENT-03 | Pricing renders 6h and 10h tiers + "Starting from €" | build-time | `grep -q 'Starting from' dist/index.html && grep -q '6 hours' dist/index.html && grep -q '10 hours' dist/index.html` | written in 03-01 |
| CONTENT-04 | Testimonials renders ≥3 quotes with attribution | build-time | `grep -c '<blockquote' dist/index.html # ≥3` | written in 03-02 |
| CONTENT-05 | Contact form + WhatsApp/phone/email links + IG/FB | build-time | `grep -q 'tel:+353851665472' dist/index.html && grep -q 'mailto:klphotography' dist/index.html && grep -q 'wa.me/' dist/index.html && grep -q 'instagram.com/' dist/index.html && grep -q 'facebook.com/' dist/index.html` | written in 03-02 |
| CONTENT-06 | Sticky nav with smooth-scroll + mobile hamburger | manual | DevTools mobile → tap hamburger, click anchor link, observe smooth scroll, observe nav stays sticky and bg flips on scroll | written in 03-03 |
| CONTENT-07 | Footer with copyright + privacy link + social icons | build-time | `grep -q 'href="/privacy"' dist/index.html && grep -q '&copy;' dist/index.html && grep -q '<svg' dist/index.html` | written in 03-02 |
| Hero LCP placeholder check | hero img preloaded eager | build-time | `grep -q 'fetchpriority="high"' dist/index.html` | written in 03-01 |
| Privacy stub doesn't 404 | `/privacy` returns 200 | build-time | `test -f dist/privacy/index.html` | written in 03-02 |

### Sampling Rate
- **Per task commit:** `npm run check && npm run build`
- **Per wave merge:** Same + manual browser sweep at 320 / 640 / 1024 / 1280px viewport, test the hamburger toggle, click every nav anchor, submit the form (expect notice), tab through every interactive element
- **Phase gate:** Lighthouse mobile run on `/` — aim for ≥90 Performance, **must be** ≥95 Accessibility (to maintain Phase 2's bar). Also: human owner walkthrough of the live preview URL, with all `[OWNER-REVIEW]` and `[OWNER-CONFIRM]` tags visible for decision-making.

### Wave 0 Gaps
- [ ] **`src/components/sections/` does not exist** — first task in Plan 03-01 should create it.
- [ ] **`src/components/icons/` does not exist** — Plan 03-02 creates it for `SocialIcons.astro`.
- [ ] **`src/assets/placeholder/` does not exist** — Plan 03-01 creates it + downloads the 5 Unsplash images. **This is a manual step that the executing agent must handle: the agent SHOULD propose 5 candidate Unsplash photo IDs/URLs to the human for selection** (so the owner gets a say in placeholder feel), OR pick conservative defaults and tag them `[OWNER-REVIEW]` for the preview walkthrough. The agent CAN download the chosen images via `curl` or `wget`.
- [ ] **Nav primitive currently doesn't have sticky / hamburger / scroll-state JS** — Plan 03-03 extends `src/components/ui/Nav.astro` in place (not a new file).
- [ ] **`Section.astro` currently has no `scroll-margin-top`** — Plan 03-03 adds `scroll-mt-20 lg:scroll-mt-24` class to the existing Section primitive (one-line edit).
- [ ] **`BaseLayout.astro` currently has no sentinel `<div data-nav-sentinel>`** — Plan 03-03 adds the sentinel as the first child of `<body>`.
- [ ] **Public `robots.txt` currently doesn't disallow `/privacy`** — Plan 03-02 appends `Disallow: /privacy` line. Sitemap line preserved byte-identical (lesson learned from Phase 2 Deviation pattern).
- [ ] **No test runner is installed** — same as Phase 2: do NOT install one. `astro check` + `npm run build` + manual Lighthouse are sufficient for layout/content phases.

## Common Pitfalls

### Pitfall 1: Hot-linking placeholder images from Unsplash
**What goes wrong:** GDPR violation + CLS regression + LCP hit + DNS overhead.
**Why it happens:** Lazy default — Unsplash makes hot-linking easy, devs copy a URL.
**How to avoid:** §3 strategy. Download + commit to `src/assets/placeholder/`. Astro `<Image>` does the rest.

### Pitfall 2: Lorem ipsum copy in placeholder
**What goes wrong:** Owner can't judge layout in context of real prose; layout problems (widow lines, line-length, body font weight, pricing tier name truncation) get discovered post-Phase-3.
**How to avoid:** §2 strategy. Real-shaped placeholder copy with visible `[OWNER-REVIEW]` and `[OWNER-CONFIRM]` tags.

### Pitfall 3: `<details>` as hamburger menu
**What goes wrong:** VoiceOver doesn't list it under buttons/menus; heading shortcuts break.
**How to avoid:** §5 — `<button aria-expanded>` + 25 lines of JS instead.

### Pitfall 4: CSS-checkbox-trick hamburger
**What goes wrong:** Screen readers don't track `:checked` as state; no escape-to-close.
**How to avoid:** Same as Pitfall 3 — proper button + JS.

### Pitfall 5: Smooth-scroll hides target behind sticky nav
**What goes wrong:** Anchor click lands the section heading underneath the nav bar.
**How to avoid:** §4 — add `scroll-mt-20 lg:scroll-mt-24` to `Section.astro`. CSS-only, reduced-motion-respecting, no JS.

### Pitfall 6: `window.scroll` listener for nav scrolled-state
**What goes wrong:** Runs every scroll frame, forces sync layout reads, hurts Performance score on Lighthouse.
**How to avoid:** §6 — IntersectionObserver on a 1px sentinel. Callback-once-per-state.

### Pitfall 7: Nav initial state fully transparent over hero photo
**What goes wrong:** Nav text contrast depends on hero photo composition — fails Lighthouse `color-contrast` audit unpredictably.
**How to avoid:** §6 — initial state `bg-cream/40 backdrop-blur-sm`, not fully transparent. Subtle frost from the start.

### Pitfall 8: Footer privacy link 404s before Phase 5
**What goes wrong:** Owner walkthrough sees 404; Lighthouse SEO audit flags broken internal link.
**How to avoid:** §10 — ship a 50-line stub `/privacy.astro` with placeholder body + `noindex`.

### Pitfall 9: Pricing displays "€ TBD" or no number
**What goes wrong:** Documented conversion-killer per Fstoppers research; couples bounce or send junk-tier enquiries.
**How to avoid:** §7 — ship realistic placeholder numbers tagged `[OWNER-CONFIRM]`, defensible against Ireland 2026 market data.

### Pitfall 10: Form submits to nowhere
**What goes wrong:** Owner tests form during preview, gets no notice, assumes broken.
**How to avoid:** §8 — `preventDefault` + visible notice "Form not yet active — please use phone / email / WhatsApp below" with live `role="status"` region.

### Pitfall 11: Tab order broken by mobile-menu visibility class
**What goes wrong:** When mobile menu is `.hidden`, Tab key skips links — correct. When menu is open, Tab goes to menu links — also correct. But if the focus-trapping for the open menu isn't done, Tab can escape to the body content underneath, which is confusing.
**How to avoid:** §5 — we DON'T trap focus inside the mobile menu (no modal semantics). Esc closes, click-outside closes, link-click closes. Tab continues into page below normally. This is the documented accessible burger pattern (per accede-web.com) — focus traps are for modals, not menus.

### Pitfall 12: Hero image dimensions not set, CLS spikes
**What goes wrong:** Hero `<img>` without w/h reserves zero space until image arrives, then content jumps.
**How to avoid:** §3 — Astro `<Picture src={importedAsset}>` sets w/h from import metadata. ALWAYS use the import-then-pass-as-src pattern, never a string URL.

### Pitfall 13: Mobile menu doesn't close on viewport resize past `sm:`
**What goes wrong:** Rotate phone or resize browser → mobile menu becomes orphaned overlay over desktop nav.
**How to avoid:** §5 — `resize` listener closes menu when crossing `>=640px`.

### Pitfall 14: Placeholder image alt text shipped as final
**What goes wrong:** Launch with `alt="[OWNER-REVIEW: placeholder...]"` visible to screen readers — embarrassing + a11y fail.
**How to avoid:** Phase 4 plan must enforce real alt text via CI lint (already noted in GALLERY-05). Phase 3 SUMMARY documents this as a Phase 4 prerequisite.

## Code Examples

All code examples in §2, §3, §5, §6, §8, §9, §10, §11 above are based on verified Astro 6 / Tailwind v4 APIs and standard browser APIs. The IntersectionObserver pattern (§6), `<button aria-expanded>` hamburger (§5), and HTML5 form validation with `novalidate + checkValidity()` (§8) are all idiomatic 2026 web platform patterns drawn from the cited sources. No invented APIs.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hot-link Unsplash for placeholders | Download + commit to `src/assets/` | GDPR (2018+) but practically still common; this project enforces | Zero third-party requests, CLS-safe, LCP-friendly |
| `<details>/<summary>` for nav menu | `<button aria-expanded>` + vanilla JS | Per Cloud Four guidance after Apple VoiceOver semantic regressions | Reliable a11y across all screen readers |
| `window.scroll` listener for sticky-state | IntersectionObserver on sentinel | ~2019+ widely available | Off-main-thread, no layout thrash |
| JS-driven scroll offset (`scrollIntoView` + manual math) | `scroll-margin-top` CSS | scroll-margin browser support stable since ~2020 | Zero JS, reduced-motion-respecting natively |
| "POA" pricing on photographer sites | "Starting from €X" + lower-funnel qualifying | 2023+ industry shift | Higher qualified-lead volume |
| Lorem ipsum placeholders | Plausible-prose placeholders with visible owner-review tags | Editorial-site convention | Owner can sign off / red-line in real context |

**Deprecated/outdated:**
- Hot-linking Unsplash images on sites with EU visitors — GDPR risk.
- `<details>` as nav menu — Cloud Four 2024 a11y analysis effectively ended this pattern for serious sites.
- `window.scroll` listeners for nav state — IntersectionObserver replaced this in 2019+.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Realistic 2026 Irish wedding photography prices: €1,800 (6h) / €2,400 (10h) as conservative-low-middle anchors | §1, §7 | Medium — multiple sources triangulate to this range, but owner's actual prices may differ. The `[OWNER-CONFIRM]` tag mitigates: owner sees the number, approves or amends in one edit. Risk only realizes if owner ships without removing the placeholder. |
| A2 | Photographer's first name is "Karl" (inferred from `klphotography.ie@gmail.com` + general industry convention) | §2 About | Low — `[OWNER-CONFIRM]` tag prevents silent ship. Worst case: tag still visible at launch, owner says "actually my name is X", trivial one-word edit. |
| A3 | The existing Wix testimonial from Louise & Jonathan is real (not staged) and the owner is content with reusing it verbatim | §2 Testimonials | Low — it's on the existing public site. If owner objects, replace with two more placeholders. |
| A4 | `scroll-margin-top` works with smooth-scroll across our target browsers (Chrome 69+ / Firefox 68+ / Safari 14.1+) | §4 | Low — confirmed by MDN + CSS-Tricks; widely deployed. |
| A5 | IntersectionObserver `threshold: 0` fires when sentinel is fully outside viewport | §6 | Low — standard API behavior; verified across all modern browsers. |
| A6 | Astro 6 `<script>` block in `Nav.astro` is bundled by Vite into `dist/_astro/*.js` (not inlined into HTML, not duplicated per usage) | §5, §6 | Low — Astro docs explicitly describe this hoisting. If wrong, the worst case is a slightly larger inline `<script>` — no functional break. |
| A7 | Tailwind v4 emits `data-[scrolled=true]:bg-cream/90` utility correctly | §6 | Low — `data-*` attribute variants are a v4 standard feature; verified in Tailwind docs. |
| A8 | The Unsplash License permits download + commit + serve from own infrastructure without API integration (verified via WebFetch 2026-05-17) | §3 | Low — license text is unambiguous about download/copy/modify/distribute rights for commercial use. |
| A9 | simple-icons is CC0; SVG path data verified from raw.githubusercontent.com 2026-05-17 | §9 | Low — license verified; paths copy-pasted from authoritative source. |
| A10 | The placeholder hero image (downloaded Unsplash JPEG) will be ≤ 500 KB at 2400px wide, sufficient to maintain ≥90 Lighthouse Performance | §3, §12 | Medium — depends on the specific image chosen. Mitigation: pick a photo with limited fine-grain detail (e.g., simple composition with blurred background) to keep JPEG compressible. Phase 4 replaces with the real hero optimized to ≤200 KB AVIF. |
| A11 | The wedding photographer is named **Karl** with the Facebook URL slug unknown | §2 + §11 | Medium-Low — `https://www.facebook.com/[OWNER-CONFIRM]` is visible-literal placeholder; owner provides the actual URL. Until then the link is broken — but it's visibly broken (literal `[OWNER-CONFIRM]` in URL won't resolve). |

## Open Questions (RESOLVED)

1. **What are the actual prices the owner wants displayed?**
   - What we know: Ireland 2026 market data anchors a defensible range; existing Wix site lists no prices.
   - What's unclear: Whether owner's actual prices match our placeholder anchors.
   - RESOLVED: Ship `€1,800` / `€2,400` with `[OWNER-CONFIRM]` tags. Owner reviews preview, either confirms or supplies their numbers, executor amends in one edit.

2. **Photographer's first name and bio facts (years experience, Facebook URL)?**
   - What we know: Email/domain implies first initial K + surname starting with L; existing Wix copy avoided explicit naming.
   - What's unclear: Actual first name, years in business, Facebook page URL.
   - RESOLVED: Use "Karl" as default with `[OWNER-CONFIRM]`. The Facebook link uses literal `[OWNER-CONFIRM]` in the URL slug so it's visibly broken — won't ship by accident. Owner walkthrough resolves all three at once.

3. **Are the 5 Unsplash placeholder images chosen by the agent or by the owner?**
   - What we know: Owner has photos locally but Phase 4 is the right place to handle real photos.
   - What's unclear: Does the owner want input on placeholder feel or does the agent pick?
   - RESOLVED: Agent picks 5 reasonable defaults (warm/editorial wedding feel, neutral palette, not on-the-nose), commits, owner reviews in preview. If owner wants to swap, it's a Find+Replace import.

4. **Should the `#portfolio` nav link be added now (linking to PortfolioStub) or only in Phase 4 (linking to real gallery)?**
   - What we know: Adding it now means the link goes to a "coming soon" stub.
   - What's unclear: Whether "coming soon" linking feels worse than "no link at all".
   - RESOLVED: **Option A — don't add `#portfolio` to nav in Phase 3.** Hero photo serves as portfolio teaser; Phase 4 adds the link when there's something real to jump to. The Section still has `id="portfolio"` so the anchor works for direct URL hits.

5. **Pricing tier order: 6h first or 10h first?**
   - What we know: Editorial pricing-page convention is "smaller commitment first, anchor tier on right".
   - What's unclear: Owner's preference.
   - RESOLVED: Ship 6h left → 10h right (the recommendation). Trivial reorder if owner asks.

6. **Should Phase 3 ship `wa.me/` deep link in WhatsApp social icon, or a phone-number-only fallback?**
   - What we know: `wa.me/353851665472` is the official WhatsApp deep-link format; works on mobile + desktop browsers.
   - What's unclear: Whether owner uses WhatsApp Business or personal — affects whether the deep link opens a chat or just resolves to a profile.
   - RESOLVED: Use `wa.me/353851665472` per WhatsApp official link format. Works for both. Tag `[OWNER-CONFIRM: confirm WhatsApp number]` if uncertain.

## Sources

### Primary (HIGH confidence)

- [Unsplash License (official)](https://unsplash.com/license) — verified 2026-05-17 via WebFetch; commercial download + modify + serve permitted, no attribution required
- [Unsplash hotlinking guideline (help center)](https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images) — verified 2026-05-17 via WebFetch; hotlinking required only for API-based use, manual download unrestricted
- [simple-icons GitHub repo](https://github.com/simple-icons/simple-icons) — CC0 license; SVG paths fetched from `raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/{instagram,facebook,whatsapp}.svg` 2026-05-17
- [MDN — scroll-margin-top](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) — browser support data
- [CSS-Tricks — Fixed Headers and Jump Links? The Solution is scroll-margin-top](https://css-tricks.com/fixed-headers-and-jump-links-the-solution-is-scroll-margin-top/) — pattern reference
- [Cloud Four — A `<details>` element as a burger menu is not accessible](https://cloudfour.com/thinks/a-details-element-as-a-burger-menu-is-not-accessible/) — primary source for §5 decision
- [Accede-Web — Hamburger menu guidelines](https://www.accede-web.com/en/guidelines/rich-interface-components/burger-menu/) — ARIA + Escape + focus patterns
- [Cronyx Digital — Hero Image Sizing Guide for Desktop & Mobile](https://www.cronyxdigital.com/blog/hero-image-sizing-guide-for-desktop-mobile) — dimension guidance
- [Astro Docs — Build HTML forms in Astro pages](https://docs.astro.build/en/recipes/build-forms/) — form recipe

### Secondary (MEDIUM confidence — verified across multiple sources)

- [Kheffache.com — Wedding Photography Prices in Ireland 2026](https://www.kheffache.com/blog/wedding-photography-prices-ireland-2026) — Ireland 2026 pricing data
- [Sarah Kate Photography — How much does a wedding photographer cost in Ireland 2025 and 2026](https://www.sarahkatephotography.ie/blog/how-much-does-a-wedding-photographer-cost-in-ireland-2025/) — Ireland regional pricing
- [DKPhoto — The Ultimate Guide to Wedding Photographer Price/Costs in Dublin, Ireland (2026 Update)](https://www.dkphoto.ie/bride-guide/price-wedding-photographer-dublin-ireland/) — Dublin pricing
- [Bluebird Studio — How Much Does a Wedding Photographer Cost in Ireland 2026?](https://bluebirdstudio.org/how-much-does-a-wedding-photographer-cost-in-ireland-2026/) — Ireland pricing
- [Sitebuilder Report — Wedding Photography Websites: 25+ Beautiful Examples (2026)](https://www.sitebuilderreport.com/inspiration/wedding-photography-websites) — copy/tagline patterns
- [Salted Pages — About Me Photographer Examples & Tips For Writing About Pages](https://saltedpages.com/blog/about-me-photographer-examples/) — first-person pattern
- [Fstoppers — The Psychology of Wedding Photography Pricing That Gets Your More Clients](https://fstoppers.com/wedding/psychology-wedding-photography-pricing-gets-your-more-clients-701081) — POA vs starting-from
- [Focal — How to Write an About Me Bio](https://www.bookfocal.com/blog/how-to-write-your-website-about-me-bio) — first-person About
- [Taylor Callsen — Modern Navigation Menus with CSS position: sticky and IntersectionObservers](https://taylor.callsen.me/modern-navigation-menus-with-css-position-sticky-and-intersectionobservers/) — sticky-nav pattern
- [CSS-Tricks — Sticky, Smooth, Active Nav](https://css-tricks.com/sticky-smooth-active-nav/) — pattern variant reference
- [Smashing Magazine — Respecting Users' Motion Preferences](https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/) — reduced-motion best practices
- [web.dev — prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion) — vestibular disorders + smooth-scroll
- [The Admin Bar — Optimizing Mobile Navigation for Accessibility](https://theadminbar.com/accessibility-weekly/mobile-nav-and-hamburger-menus/) — hamburger patterns
- [Forminit — Handle Form Submissions in Astro Without a Backend](https://forminit.com/blog/how-to-add-contact-form-astro/) — Astro form + honeypot
- [WCAG 2.5.8 Target Size — TestParty](https://testparty.ai/blog/wcag-target-size-guide) — tap-target guidance
- [Lighthouse tap target sizing GitHub issue #14879](https://github.com/GoogleChrome/lighthouse/issues/14879) — 48px vs 44px discussion

### Tertiary (LOW confidence — pattern reference only)

- [Heroicons #907 — Request Icons: Social Media Icons](https://github.com/tailwindlabs/heroicons/discussions/907) — confirms Heroicons doesn't ship brand icons (out of scope)
- [Chrome Developers — CSS scroll-state()](https://developer.chrome.com/blog/css-scroll-state-queries) — emerging CSS-only sticky-state alternative (Chrome 133+, not yet cross-browser)
- existing klphotography.ie Wix site — testimonial source for Louise & Jonathan quote (fetched 2026-05-17 via WebFetch)

## Metadata

**Confidence breakdown:**

- Wedding photographer copy conventions: HIGH (multiple specialist sources cross-referenced)
- Irish 2026 pricing anchors: MEDIUM-HIGH (triangulated across 4 Ireland-specific 2026 sources; final number is owner's call)
- Placeholder image strategy: HIGH (license verified, technical strategy obvious from prior GDPR rule in Phase 2)
- Smooth-scroll via scroll-margin-top: HIGH (MDN + CSS-Tricks + cross-browser support confirmed)
- Sticky nav with IntersectionObserver: HIGH (standard 2026 pattern, multiple sources)
- Mobile hamburger pattern: HIGH (Cloud Four + Accede-Web are authoritative on the `<details>` rejection)
- Contact form UI: HIGH (standard HTML5 + honeypot + Astro recipe)
- Social SVG icons: HIGH (license verified, paths verified from authoritative source)
- /privacy stub strategy: HIGH (low-risk pragmatic decision)
- Single-page assembly: HIGH (matches FEATURES.md + Phase 2 patterns)
- Lighthouse considerations: HIGH (matches Phase 2 successful 100/100 a11y; performance estimate is the only uncertain bit)

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (web platform patterns are stable; pricing data may drift over 3+ months)
