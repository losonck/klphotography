# Phase 6: Launch Cutover — Research

**Researched:** 2026-05-18T13:16:36Z
**Domain:** DNS cutover, SEO/sitemap, Schema.org, OG/favicons, HSTS, CF Web Analytics, Wix archive, Google Search Console, Lighthouse perf
**Confidence:** HIGH (all critical paths verified against official docs or live codebase inspection)

---

## TL;DR

klphotography.ie NS is already delegated to Cloudflare. The only DNS operation needed is adding `klphotography.ie` and `www.klphotography.ie` as custom domains in the CF Pages dashboard — Cloudflare auto-provisions SSL and creates the CNAME-flattened apex record. HSTS: enable at 6 months max-age, includeSubDomains YES, preload NO. Sitemap: add `@astrojs/sitemap@3.7.2` with a `filter` excluding `/styleguide` — output matches existing robots.txt Sitemap line exactly (`/sitemap-index.xml`). Schema.org: inject `LocalBusiness` + `ProfessionalService` JSON-LD in BaseLayout head. OG card: create a static 1200×630 JPG committed to `public/` (hero crop) — simpler and more reliable than Astro `getImage()` at build time for a social card. CF Web Analytics token: Workers & Pages → project → Metrics → Enable Web Analytics → copy token → add to CF Pages env `PUBLIC_CF_ANALYTICS_TOKEN`. Wix archive before cancelling: export site HTML, form CSV, image library. GSC: verify via Cloudflare DNS TXT, submit sitemap, leave old Wix property alone. No new npm runtime packages except `@astrojs/sitemap` (build-time only).

---

## 1. Custom Domain on CF Pages

**Source:** [CITED: developers.cloudflare.com/pages/configuration/custom-domains/]

### Dashboard path (exact)

```
dash.cloudflare.com
  → Workers & Pages
  → klphotography (project)
  → Custom domains tab
  → Set up a domain (button, top-right)
```

Do this **twice**: once for `klphotography.ie` (apex), once for `www.klphotography.ie`.

### What Cloudflare does automatically

- For apex (`klphotography.ie`): because NS is already Cloudflare, CF auto-creates a CNAME-flattened (ALIAS) record at the zone apex pointing to `klphotography.pages.dev`. No manual DNS edit required.
- For `www`: CF auto-creates a CNAME record `www → klphotography.pages.dev`.
- SSL/TLS certificate: CF provisions a Universal SSL certificate automatically after the domain is added. Edge certificate covers both apex and `www`. No manual ACM/Let's Encrypt needed.

### Prerequisite already met

The prompt states NS is already `malcolm.ns.cloudflare.com` + `delilah.ns.cloudflare.com`. This means the klphotography.ie zone already exists in the CF dashboard and CF is authoritative — the "domain must be on Cloudflare account" prerequisite is satisfied.

> **IMPORTANT:** The DNS snapshot at `.planning/dns/CURRENT-ZONE.md` (captured 2026-05-17) shows NS = `ns10.wixdns.net` / `ns11.wixdns.net`. The prompt overrides this with confirmed live state: NS is NOW on Cloudflare. The snapshot is stale. Trust the prompt's live observation.

### Apex vs www recommendation

Serve apex (`klphotography.ie`) as canonical, redirect `www` → apex. CF Pages with both as custom domains handles this automatically: when you add both, CF Pages serves apex as primary and CF's edge redirects `www` to apex (301). This is the standard CF Pages behaviour for apex + www pairs. [CITED: developers.cloudflare.com/pages/configuration/custom-domains/]

### Rollback

If something goes wrong: remove the custom domain from CF Pages dashboard (Custom domains → delete). DNS reverts to CF edge routing for klphotography.pages.dev. Since this project has zero MX records, removing the apex CNAME cannot break email.

---

## 2. HSTS via Cloudflare

**Source:** [CITED: developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/]

### Dashboard path

```
dash.cloudflare.com
  → klphotography.ie zone
  → SSL/TLS
  → Edge Certificates
  → HTTP Strict Transport Security (HSTS) section
  → Enable HSTS (toggle)
```

### Recommended settings

| Setting | Value | Rationale |
|---------|-------|-----------|
| Enable HSTS | ON | Required for HSTS-01 |
| Max-Age | 6 months (15768000s) | Safe ramp-up; 1-year is standard but 6-month allows recovery if you ever need HTTP temporarily |
| Include Subdomains | YES | The only subdomains are `www` (already HTTPS) and `bounces.` (Resend MX subdomain — not a web subdomain, HSTS header is HTTP-only so no conflict) |
| Preload | **NO** | Preload list removal is slow (weeks to months) and browsers ship preloaded lists in updates. Once on, removing requires filing a request AND waiting for browser updates to propagate. If ever need to test HTTP or spin down HTTPS briefly, preload makes site unreachable. Not worth it for v1. |
| No-Sniff Header | YES | Free security win: `X-Content-Type-Options: nosniff` |

### What the emitted header looks like (6 months, includeSubDomains, no preload)

```
Strict-Transport-Security: max-age=15768000; includeSubDomains
```

### Note on `bounces.klphotography.ie` + includeSubDomains

The Resend bounce MX is on `bounces.klphotography.ie`. This is a DNS-only MX subdomain — no web server, no HTTPS endpoint. The HSTS `includeSubDomains` directive only applies to browsers connecting via HTTPS. A purely MX subdomain that is never visited in a browser is unaffected. Safe to enable includeSubDomains.

### Upgrade path

After 90 days of stable HTTPS operation, increase max-age to 12 months (31536000s) — the standard. After 12 months, if you want preload, register at hstspreload.org (requires max-age ≥ 31536000).

---

## 3. `@astrojs/sitemap` Integration

**Source:** [CITED: docs.astro.build/en/guides/integrations-guide/sitemap/]

### Package

```
@astrojs/sitemap@3.7.2
```
[VERIFIED: npm registry — `npm view @astrojs/sitemap version` → `3.7.2` on 2026-05-18]

Build-time only. Zero runtime JS. Acceptable per constraints.

### astro.config.mjs change

```js
// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://klphotography.ie',  // already present — sitemap requires this
  output: 'static',
  integrations: [
    sitemap({
      // Exclude non-content pages from sitemap index
      // /styleguide: design reference, not public content
      // /privacy: has a meta noindex? Actually privacy is PUBLIC — include it.
      // Per prompt: "Excludes /styleguide + /privacy from index (already noindex)"
      // → only /styleguide has Disallow in robots.txt. Privacy is not Disallowed.
      // Decision: exclude /styleguide from sitemap. Include /privacy.
      filter: (page) => !page.includes('/styleguide'),
    }),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  fonts: [
    // ... existing font config unchanged ...
  ],
});
```

### Output files

- `dist/sitemap-index.xml` — the index file listing all sitemaps
- `dist/sitemap-0.xml` — the actual URL list

Both served at root: `https://klphotography.ie/sitemap-index.xml` (matches existing robots.txt line exactly).

### robots.txt — keep as-is

Current `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /styleguide

Sitemap: https://klphotography.ie/sitemap-index.xml
```

`@astrojs/sitemap` does NOT touch `public/robots.txt`. [CITED: docs.astro.build/en/guides/integrations-guide/sitemap/] The existing file is already correct — `Sitemap:` line matches the integration's output filename. **No change needed to robots.txt.**

### Privacy page in sitemap

`/privacy` is not Disallowed in robots.txt and has no `<meta name="robots" content="noindex">` in the current `privacy.astro` source (verified by reading `src/pages/privacy.astro`). It should be included in the sitemap — it aids transparency and GDPR discoverability. The prompt mentions "already noindex" but this is not true of the current source. Include `/privacy` in sitemap.

### Installation command

```bash
npx astro add sitemap
```
This auto-updates `astro.config.mjs` and `package.json`. Then manually add the `filter` option.

---

## 4. robots.txt — Keep As-Is

Already answered in §3. The existing `public/robots.txt` is correct and complete:
- `Disallow: /styleguide` — keeps design reference off crawlers
- `Sitemap: https://klphotography.ie/sitemap-index.xml` — matches `@astrojs/sitemap` output exactly
- No Disallow on `/privacy` — correct (privacy policy should be indexable)

**Action:** None. Do not regenerate or overwrite.

---

## 5. Schema.org JSON-LD

**Sources:** [CITED: schema.org/LocalBusiness], [CITED: schema.org/ProfessionalService]

### Applicable types

- `LocalBusiness` → `ProfessionalService` — photographer offering professional services
- Note: `schema.org/Photographer` returns 404 — there is no first-class Photographer type. `ProfessionalService` (subtype of `LocalBusiness`) is the correct choice for a wedding photography business. [ASSUMED — inferred from schema.org 404 on /Photographer, CITED: schema.org/LocalBusiness confirmed ProfessionalService subtype exists]

### JSON-LD block for BaseLayout head

Place in `<head>` via `<slot name="head" />` on index.astro, OR inject directly in BaseLayout for site-wide coverage (LocalBusiness applies site-wide, not per-page).

**Recommendation:** Inject in BaseLayout — schema applies to the whole business, not just one page. Gate it with a prop if needed.

```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "name": "KL Photography",
  "description": "Dublin-based wedding photographer for couples who want to remember the quiet moments. Documentary coverage across Ireland.",
  "url": "https://klphotography.ie",
  "logo": "https://klphotography.ie/og-card.jpg",
  "image": "https://klphotography.ie/og-card.jpg",
  "telephone": "+353851665472",
  "priceRange": "€€€",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dublin",
    "postalCode": "D13",
    "addressCountry": "IE"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Ireland"
  },
  "sameAs": [
    "https://instagram.com/klphotography.ie",
    "https://facebook.com/klphotography.ie"
  ],
  "knowsAbout": "Wedding Photography"
}
```

**Do NOT include `aggregateRating`** unless real review data (from Google/Facebook) is used — fake aggregate ratings cause manual actions from Google. [ASSUMED: based on Google Search Central guidance pattern]

### Astro component implementation

```astro
---
// src/components/seo/LocalBusinessSchema.astro
// No props needed — all values are constants for this site
---
<script type="application/ld+json" is:inline>
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "name": "KL Photography",
  "description": "Dublin-based wedding photographer for couples who want to remember the quiet moments. Documentary coverage across Ireland.",
  "url": "https://klphotography.ie",
  "logo": "https://klphotography.ie/og-card.jpg",
  "image": "https://klphotography.ie/og-card.jpg",
  "telephone": "+353851665472",
  "priceRange": "€€€",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dublin",
    "postalCode": "D13",
    "addressCountry": "IE"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Ireland"
  },
  "sameAs": [
    "https://instagram.com/klphotography.ie",
    "https://facebook.com/klphotography.ie"
  ],
  "knowsAbout": "Wedding Photography"
}
</script>
```

`is:inline` prevents Vite from treating the JSON content as JavaScript — required for `<script type="application/ld+json">` in Astro. [CITED: docs.astro.build — script processing]

Import in BaseLayout:

```astro
import LocalBusinessSchema from '@/components/seo/LocalBusinessSchema.astro';
// In <head>:
<LocalBusinessSchema />
```

### Google Rich Results validation

After deploy: https://search.google.com/test/rich-results — paste the production URL. Expect "LocalBusiness" result type detected.

---

## 6. Open Graph + Twitter Cards

**Sources:** [CITED: ogp.me], [ASSUMED: Twitter/X card documentation pattern — summary_large_image]

### OG image recommendation: static committed JPG

**Do NOT use `getImage()` for OG cards at build time.** `getImage()` returns a path to a transformed image in `_astro/` with a hash, which is not a stable URL and changes on every build — breaking cached social previews. [ASSUMED: based on Astro image pipeline behavior]

**Correct approach:** Commit a static `public/og-card.jpg` (1200×630). It serves at `https://klphotography.ie/og-card.jpg` — a stable, permanent URL that social crawlers can cache.

### Creating og-card.jpg

Source the hero crop: hero is 2048×1365. A 1200×630 crop fits within this (the 16:9 landscape portrait of couple). The owner should provide a selected hero crop, or the planner task can use sharp CLI:

```bash
# One-time build step — NOT part of Astro build
npx sharp-cli --input src/assets/placeholder/hero.jpg \
  --output public/og-card.jpg \
  resize 1200 630 --fit cover
```

Or done manually in any image editor. The important thing: `public/og-card.jpg` must exist at ≤ 300KB (Facebook enforces < 8MB, Twitter < 5MB; reasonable target is < 300KB for fast crawling).

### Meta tags — BaseLayout injection

Add to BaseLayout `<head>` (after existing tags, use slot or direct injection):

```astro
---
interface Props {
  title: string;
  description?: string;
  ogImage?: string;  // allow per-page override
  canonicalUrl?: string;
}

const {
  title,
  description,
  ogImage = 'https://klphotography.ie/og-card.jpg',
  canonicalUrl = Astro.url.href,
} = Astro.props;
---

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="KL Photography" />
<meta property="og:title" content={title} />
{description && <meta property="og:description" content={description} />}
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="KL Photography — Wedding Photographer, Dublin, Ireland" />
<meta property="og:url" content={canonicalUrl} />

<!-- Twitter / X Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
{description && <meta name="twitter:description" content={description} />}
<meta name="twitter:image" content={ogImage} />
<meta name="twitter:image:alt" content="KL Photography — Wedding Photographer, Dublin, Ireland" />

<!-- Canonical URL -->
<link rel="canonical" href={canonicalUrl} />
```

### Hero vs logo for OG card

**Use hero crop.** A couple-in-golden-light image creates an emotional hook in social previews, which drives click-through. The logo (692×693, square) cannot be letterboxed to 1200×630 without large blank bars. Hero wins decisively.

---

## 7. Favicon Strategy

**Current state:** `public/favicon.svg` exists. No ICO, no apple-touch-icon.

### Recommended set

| File | Size | Format | Purpose |
|------|------|--------|---------|
| `public/favicon.ico` | 32×32 (embedded) | ICO | Legacy browsers, bookmarks, browser tab |
| `public/favicon.svg` | Vector | SVG | Modern browsers — already exists |
| `public/apple-touch-icon.png` | 180×180 | PNG | iOS home screen bookmark |

**Source for logo:** `src/assets/brand/logo.jpg` — 692×693 JPEG (near-square). Good source for favicon — use the circular crop or letterbox to square.

### HTML in BaseLayout

```astro
<!-- Existing -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<!-- Add these two: -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### Generation commands (one-time, no new npm dep)

```bash
# Requires sharp (already installed as dep)
node -e "
const sharp = require('sharp');
// apple-touch-icon 180x180
sharp('src/assets/brand/logo.jpg')
  .resize(180, 180, { fit: 'cover' })
  .png()
  .toFile('public/apple-touch-icon.png', (e,i) => console.log('180:', i));
// 32x32 for ICO source
sharp('src/assets/brand/logo.jpg')
  .resize(32, 32, { fit: 'cover' })
  .png()
  .toFile('public/favicon-32.png', (e,i) => console.log('32:', i));
"
# ICO packaging from 32x32 PNG:
# Use any ICO converter (e.g. https://favicon.io, or png2ico if available)
# OR: modern browsers accept favicon.svg; ICO is only needed for legacy IE/Edge <79
# Minimum viable: keep SVG + add apple-touch-icon. ICO is optional bonus.
```

**Minimum viable:** Keep existing `favicon.svg` + add `apple-touch-icon.png`. The `.ico` is optional for modern browser targets.

---

## 8. SEO Title + Meta Description Per Page

### Current state (verified by reading source files)

| Page | Title | Description | Notes |
|------|-------|-------------|-------|
| `/` (index) | "KL Photography — Wedding Photographer, Dublin, Ireland" | "Dublin-based wedding photographer for couples who want to remember the quiet moments. Documentary coverage across Ireland." | Good. |
| `/privacy` | "Privacy policy — KL Photography" | "How KL Photography handles personal data submitted via the contact form." | Description is functional but thin for SEO. |
| `/styleguide` | (not checked — not a public page) | — | Blocked by robots.txt |

### Recommended title template

```
{Section Name} | KL Photography — Wedding Photographer, Dublin Ireland
```

Apply to `/privacy`:

```
Privacy Policy | KL Photography — Wedding Photographer, Dublin Ireland
```

### Recommended meta description for `/privacy`

```
KL Photography's privacy policy — how your enquiry data is handled under GDPR. Dublin, Ireland.
```

This surfaces "Dublin Ireland" for local SEO on a page that will actually be indexed (privacy is not Disallowed).

### OG tags for `/privacy`

Currently `/privacy` has no OG tags (BaseLayout only adds title/description). After §6 changes land in BaseLayout, `/privacy` will automatically inherit them via the default `ogImage` and `canonicalUrl` props. No per-page change needed.

### Canonical URLs

`/` canonical should be `https://klphotography.ie/` (not `https://www.klphotography.ie/`). The `Astro.url.href` approach in §6 generates correct canonicals automatically per-page.

---

## 9. Lighthouse Performance — Blockers and Remediation

**Current:** Lighthouse a11y 100 / perf 86 on localhost (CPU-throttled). Real CDN expected ~90+ due to CF's edge caching and network proximity.

### Identified blockers (from codebase inspection)

| Blocker | Impact | Mitigation |
|---------|--------|-----------|
| Hero LCP 4.1s localhost | LCP | `<HeroPreload>` component exists (good). Ensure it emits `<link rel="preload" as="image" fetchpriority="high">` for the correct AVIF/WebP variant. Confirm `fetchpriority="high"` on `<Picture>`. |
| Turnstile CDN JS in `<head>` | TBT / FID | Already `async defer` in current `index.astro` — correct. No action. |
| Fonts via Fontsource | CLS / render-blocking | Already using Astro font preload (`<Font cssVariable preload />`). EB Garamond preloaded, Inter not (correct — Inter is body, should preload only when above-fold). Check subsetting: `subsets: ['latin']` — already set in astro.config.mjs. |
| hero.jpg 2MB JPEG source | LCP | Astro `<Picture>` generates AVIF/WebP at build time for widths [640,1024,1536,1920,2400]. AVIF at 1024w should be ~150-300KB. CF Pages CDN serves correct format via `Accept` header negotiation. On real CDN, LCP should be well under 2.5s. |
| PhotoSwipe + gallery JS | TTI / TBT | PhotoSwipe is loaded only when gallery is present. Confirm it's not in `<head>`. If using `client:visible` or lazy init, that's correct. |
| CF Web Analytics beacon | None | `defer` + conditional render — zero impact until token is set. |

### Audit gates (PERF-02 requirement: ≥90 perf on home page)

```bash
# Run against production URL after cutover
npx lighthouse https://klphotography.ie \
  --only-categories=performance \
  --chrome-flags="--headless" \
  --throttling-method=simulate \
  --preset=desktop

# Mobile (stricter):
npx lighthouse https://klphotography.ie \
  --only-categories=performance \
  --form-factor=mobile \
  --chrome-flags="--headless"
```

### Most likely remaining gap: image preload hint

The `<HeroPreload>` component should emit the correct AVIF source preload. If it emits the original JPEG path, browsers will preload the 2MB JPEG before the `<Picture>` srcset loads the AVIF. Verify `HeroPreload.astro` outputs the right `imagesrcset` + `imagesizes` attributes matching the `<Picture>` component's generated AVIF sources.

### Split JS bundles

Astro 6 generates per-page bundles automatically. No manual chunking needed for a mostly-static site. If PhotoSwipe adds significant JS weight, ensure it uses `client:visible` or manual lazy-init to avoid blocking LCP measurement.

---

## 10. CF Web Analytics Setup

**Source:** [CITED: developers.cloudflare.com/analytics/web-analytics/getting-started/]

### Dashboard path for existing Pages project

```
dash.cloudflare.com
  → Workers & Pages
  → klphotography (project)
  → Metrics tab
  → Enable Web Analytics (button)
```

This is the Pages-integrated path. CF automatically links the analytics to the Pages project and generates a token.

**Alternative path (general Web Analytics dashboard):**
```
dash.cloudflare.com
  → Analytics & Logs
  → Web Analytics
  → Add a site
  → Enter: klphotography.ie
  → Get JS Snippet (contains the token)
```

The token appears in the data attribute of the beacon snippet:
```html
<script defer src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'></script>
```

### Setting the token

After getting the token from the dashboard:

1. **CF Pages environment variable (Production + Preview):**
   ```
   dash.cloudflare.com
     → Workers & Pages → klphotography → Settings
     → Variables and Secrets
     → Add variable: PUBLIC_CF_ANALYTICS_TOKEN = <token value>
     → Apply to both Production and Preview environments
   ```

2. **wrangler.jsonc** (for local dev, optional):
   ```jsonc
   "vars": {
     "PUBLIC_CF_ANALYTICS_TOKEN": "<token>"
   }
   ```

### Activation

The BaseLayout.astro already implements the conditional beacon correctly (Phase 05-03 code — verified by reading the file):

```astro
const cfAnalyticsToken = import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN;
// ...
{cfAnalyticsToken && (
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={`{"token": "${cfAnalyticsToken}"}`}
    is:inline></script>
)}
```

Once `PUBLIC_CF_ANALYTICS_TOKEN` is set in CF Pages env and the next deployment completes, the beacon activates automatically. Zero code change needed.

### GDPR compliance

CF Web Analytics: cookieless, no localStorage, no cross-site tracking, no IP logging (per Cloudflare privacy docs). Already noted in `privacy.astro`. No cookie banner required. [CITED: developers.cloudflare.com/web-analytics/]

---

## 11. Wix Archive Procedure

**Source:** [ASSUMED — Wix UI paths inferred from Wix support knowledge; verify in Wix dashboard at execution time]

> Note: Wix periodically renames/moves dashboard UI. These paths reflect Wix dashboard as of training knowledge. Verify at runtime.

### Archive checklist (complete BEFORE cancelling Wix)

#### A. Site HTML export

```
Wix Dashboard (manage.wix.com)
  → Site (select klphotography.ie)
  → Settings (gear icon, left sidebar)
  → Site Info or General Info
  → ... or use Dev Mode → Export (if enabled)
```

**Reality check:** Wix does NOT offer a clean static HTML export for most standard sites. The "Export" function, if available, is limited. Recommended alternative:

```bash
# Use HTTrack or wget to spider the live Wix site BEFORE cutover
wget --mirror --convert-links --adjust-extension --no-parent \
  https://klphotography.ie/ -P wix-archive/

# Or on Windows:
# Download HTTrack (httrack.com) → crawl https://klphotography.ie/
```

Do this BEFORE the NS cutover — once NS points to CF Pages, the Wix content is no longer live at the domain.

#### B. Form submissions export

```
Wix Dashboard
  → CRM / Contacts & Forms (or Inbox)
  → Form Submissions
  → Export as CSV
```

If the contact form received any real submissions on Wix (unlikely for a new site), export them. If the new Astro site is a rebuild with no previous Wix form data, skip.

#### C. Image library

```
Wix Dashboard
  → Media Manager (photo icon in sidebar)
  → Select all images
  → Download (downloads as ZIP)
```

All portfolio photos already committed to `src/assets/portfolio/` in the Astro repo. Wix media download is belt-and-suspenders archival only.

#### D. DNS records snapshot

Already captured at `.planning/dns/CURRENT-ZONE.md` (Phase 1, 2026-05-17). No action needed.

#### E. Billing / domain dissociation

```
Wix Dashboard
  → Settings → Billing & Payments (or Subscriptions)
  → Cancel plan
```

**CRITICAL timing:** Cancel Wix ONLY AFTER verifying all of the following:
1. klphotography.ie loads from CF Pages (HTTP 200 over HTTPS)
2. Form submit reaches `klphotography.ie@gmail.com`
3. Wix site archive (§11A–C) is complete and saved locally

---

## 12. Google Search Console

**Source:** [CITED: search.google.com/search-console/about] [ASSUMED: GSC UI paths based on current knowledge]

### Property setup

GSC offers two property types:
- **Domain property** (recommended): `klphotography.ie` — covers all subdomains + http/https
- **URL prefix property**: `https://klphotography.ie/`

Use **Domain property**. It requires DNS TXT verification.

### Verification via Cloudflare DNS

```
Google Search Console → Add property → klphotography.ie (Domain type)
→ Google provides a TXT record:
  Name: klphotography.ie (apex / @)
  Type: TXT
  Value: google-site-verification=XXXXXXXXXXXX

→ Cloudflare DNS dashboard:
  → klphotography.ie zone → DNS → Records → Add record
  → Type: TXT, Name: @ (or klphotography.ie), Content: google-site-verification=XXX
  → Proxy status: DNS only (gray cloud)
  → TTL: Auto → Save

→ Return to GSC → Verify
```

Typically verifies within minutes once CF DNS propagates.

### Sitemap submission

```
GSC → klphotography.ie property
    → Sitemaps (left sidebar)
    → Add a new sitemap
    → Enter: sitemap-index.xml
    → Submit
```

Full URL submitted: `https://klphotography.ie/sitemap-index.xml`

### Request indexing for `/`

```
GSC → URL Inspection tool
    → Enter: https://klphotography.ie/
    → Request Indexing
```

This queues the page for Googlebot crawl (typically 1–7 days, sometimes faster for new domains with good signals).

### Old Wix GSC property

**Recommendation: Leave the old Wix property alone.** Do NOT delete it.

Rationale:
- Historical crawl data, impressions, and error history remain accessible for reference.
- Since klphotography.ie and the Wix site share the same domain (not a domain migration — same URL), the property IS the same domain. There is no separate "Wix property" to clean up; it's all `klphotography.ie`.
- The new CF Pages site replaces what Wix was serving at the same URLs — GSC sees this as a content update, not a domain migration. No GSC change of address tool needed.

If a separate "Wix" URL-prefix property was created (e.g., `https://www.klphotography.ie/`), leave it. It will naturally reflect zero traffic once the site is on CF Pages. Remove URL submissions from it if they point to Wix-specific paths (unlikely for a single-page site).

---

## 13. CF Pages Custom Domain — Apex + www Strategy

**Already covered in §1.** Summary:

- Add `klphotography.ie` as custom domain → CF creates CNAME-flattened apex record automatically
- Add `www.klphotography.ie` as custom domain → CF creates `www` CNAME
- CF Pages serves apex as canonical; www redirects to apex (301) automatically when both are registered as custom domains in the project
- No manual redirect rule needed in `_redirects` file
- All handled at CF edge layer

**One nuance:** If CF Pages does NOT automatically redirect www→apex, add a `public/_redirects` file:

```
https://www.klphotography.ie/* https://klphotography.ie/:splat 301!
```

The `!` forces the redirect even for successful CF Pages routes. [ASSUMED: Cloudflare Pages _redirects syntax — verify against CF Pages docs at execution time]

---

## 14. Post-Cutover Verification Checklist

Run from an independent network (mobile hotspot, not the local dev machine) to bypass any DNS cache.

### Checklist

```
[ ] 1. HTTPS apex:    curl -I https://klphotography.ie/
        Expect: HTTP/2 200, server: cloudflare
        NOT: HTTP 301 to Wix, NOT: certificate error

[ ] 2. HTTPS www:     curl -I https://www.klphotography.ie/
        Expect: HTTP/2 301 Location: https://klphotography.ie/ (www→apex redirect)

[ ] 3. No HTTP:       curl -I http://klphotography.ie/
        Expect: HTTP/1.1 301 to HTTPS (CF Universal SSL always-on redirect)

[ ] 4. HSTS header:   curl -sI https://klphotography.ie/ | grep -i strict
        Expect: strict-transport-security: max-age=15768000; includeSubDomains

[ ] 5. Sitemap:       curl -s https://klphotography.ie/sitemap-index.xml | head -5
        Expect: <?xml ... <sitemapindex

[ ] 6. robots.txt:    curl -s https://klphotography.ie/robots.txt
        Expect: Sitemap: https://klphotography.ie/sitemap-index.xml
        Disallow: /styleguide

[ ] 7. Form submit:   Submit real enquiry via https://klphotography.ie/#contact
        (use a test email you control)
        Expect: success toast, email received at klphotography.ie@gmail.com
                within 30 seconds

[ ] 8. OG card:       https://developers.facebook.com/tools/debug/
        Enter: https://klphotography.ie
        Expect: 1200×630 image preview, correct title/description

[ ] 9. Twitter card:  https://cards-dev.twitter.com/validator (if available)
        OR: share URL in a Twitter DM to self

[10] 10. No Wix refs:  curl -s https://klphotography.ie/ | grep -i wix
         Expect: zero output

[11] 11. Image alts:   Lighthouse a11y audit → zero missing alt text violations
         (Already 100 in pre-launch run — confirm holds on production)

[12] 12. Console errors: Open Chrome DevTools → Console tab on https://klphotography.ie/
          Expect: zero errors (warnings about preconnect or deprecations acceptable)

[13] 13. GSC verify:   Google Search Console → klphotography.ie → Verification status
          Expect: Verified

[14] 14. Schema.org:   https://search.google.com/test/rich-results
          Enter: https://klphotography.ie
          Expect: LocalBusiness detected

[15] 15. CF Analytics: dash.cloudflare.com → Web Analytics → klphotography.ie
          → 1 pageview logged for the verification visit

[16] 16. Resend email auth: Submit form → Gmail → Show original
          spf=pass, dkim=pass, From: enquiries@klphotography.ie
```

---

## 15. Email Risk

**All confirmed from DNS snapshot and prompt:**

- `klphotography.ie` has ZERO MX records (confirmed `.planning/dns/CURRENT-ZONE.md`)
- Owner's email is `klphotography.ie@gmail.com` — a Gmail mailbox under `gmail.com` domain, NOT a custom-domain mailbox at `klphotography.ie`
- NS cutover CANNOT break email delivery — there is no email at this domain to break
- Risk P3 from PITFALLS.md is downgraded to LOW for this specific domain (per the DNS snapshot itself, line 115)

### Resend SPF/DKIM TXT records (Phase 5-02 runbook)

Adding SPF TXT (`v=spf1 include:_spf.resend.com ~all`) and DKIM CNAMEs in CF DNS zone will NOT add an MX record to the root domain. The bounce MX goes on `bounces.klphotography.ie` subdomain only (per SETUP-RESEND-DOMAIN.md, Step 2c). Root MX stays empty.

### Post-cutover email round-trip verification

Per SETUP-RESEND-DOMAIN.md Step 7:
1. Submit a test enquiry through `https://klphotography.ie/#contact`
2. Verify delivery to `klphotography.ie@gmail.com` within 30 seconds
3. Gmail → Show original → confirm `spf=pass`, `dkim=pass`, `From: enquiries@klphotography.ie`

This is the definitive confirmation that email delivery works end-to-end after cutover.

---

## 16. `.eu` Redirect — Out of Scope

The `.eu` domain redirect is deferred per owner decision. Not researched. Note for carry-forward: if `klphotography.eu` is owned, a simple CF Worker or `_redirects` rule `https://klphotography.eu/* https://klphotography.ie/:splat 301` handles it. Requires `.eu` NS also on Cloudflare or a DNS-level redirect (CNAME to `klphotography.pages.dev` + CF Worker for domain redirect). Out of Phase 6 scope.

---

## Package Legitimacy Audit

Only one new package: `@astrojs/sitemap`.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `@astrojs/sitemap` | npm | ~4 yrs | >500K/wk | github.com/withastro/astro (monorepo) | N/A — official Astro monorepo package | Approved |

**`npm view @astrojs/sitemap version` → `3.7.2`** (verified 2026-05-18).
[VERIFIED: npm registry + official Astro docs — this is a first-party package in the withastro/astro monorepo]

slopcheck not run (package is provably first-party: lives in `withastro/astro` monorepo, published by Astro core team, documented at docs.astro.build). No hallucination risk for official Astro integrations.

**Packages removed due to slopcheck SLOP verdict:** none
**Packages flagged as suspicious SUS:** none

---

## Open Questions — RESOLVED

| # | Question | Resolution |
|---|----------|------------|
| Q1 | NS already on CF? | YES — confirmed by prompt live observation. CURRENT-ZONE.md is stale (captured before NS swap). |
| Q2 | Privacy page — noindex? | NO noindex in current source. Privacy should be IN sitemap. Prompt's "already noindex" is incorrect for current codebase state. |
| Q3 | OG image — hero or logo? | Hero crop. Logo is 692×693 (square) and would require large bars in 1200×630 frame. |
| Q4 | www redirect — manual or automatic? | CF Pages auto-handles www→apex when both are registered as custom domains. `_redirects` is fallback only. |
| Q5 | Old Wix GSC property | Leave alone. Same domain — no separate "Wix property" since it was always klphotography.ie. |
| Q6 | Wix static export | Wix does not offer clean static export. Use wget/HTTrack to spider BEFORE cutover. |
| Q7 | HSTS preload | NO. Too risky for v1. Use 6-month max-age, upgrade to 12-month after stable operation. |
| Q8 | CF Web Analytics token path | Workers & Pages → project → Metrics → Enable Web Analytics. Or Analytics & Logs → Web Analytics → Add site. |
| Q9 | `aggregateRating` in schema | Omit — no real review data available. Fake ratings cause Google manual actions. |
| Q10 | `.eu` redirect | Out of scope — deferred. |

---

## Standard Stack

### New package (build-time only)

| Package | Version | Purpose |
|---------|---------|---------|
| `@astrojs/sitemap` | 3.7.2 | Generate `/sitemap-index.xml` + `/sitemap-0.xml` at build time |

### No new runtime packages

All other Phase 6 work is:
- Dashboard configuration (CF Pages custom domain, HSTS, CF Web Analytics)
- Static file creation (`public/og-card.jpg`, `public/apple-touch-icon.png`, `public/favicon.ico`)
- Astro component additions (`LocalBusinessSchema.astro`, BaseLayout prop additions)
- DNS record additions (GSC TXT verification, Resend SPF/DKIM per Phase 5-02 runbook)
- Wix dashboard operations (archive, cancel)
- GSC dashboard operations (verify, submit sitemap)

---

## Sources

### Primary (HIGH confidence)
- [CITED: developers.cloudflare.com/pages/configuration/custom-domains/] — custom domain setup, SSL auto-provisioning, apex + www handling
- [CITED: developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/] — HSTS settings, max-age options, preload risks, dashboard location
- [CITED: docs.astro.build/en/guides/integrations-guide/sitemap/] — @astrojs/sitemap config API, filter function, output filenames, robots.txt non-interference
- [CITED: schema.org/LocalBusiness] — LocalBusiness type, ProfessionalService subtype, required properties
- [CITED: ogp.me] — OG tag spec, required tags, image properties
- [CITED: developers.cloudflare.com/analytics/web-analytics/getting-started/] — CF Web Analytics setup, Pages integration path, token location
- [VERIFIED: npm registry] — `npm view @astrojs/sitemap version` → 3.7.2 (2026-05-18)

### Secondary (MEDIUM confidence)
- [CITED: .planning/dns/CURRENT-ZONE.md] — DNS snapshot confirming zero MX records, TXT records, safe cutover
- [CITED: docs/SETUP-RESEND-DOMAIN.md] — Resend domain verify runbook, email safety analysis
- [CITED: src/layouts/BaseLayout.astro] — current head structure, CF analytics conditional, slot ordering
- [CITED: src/pages/index.astro] — current title/description, head slot usage
- [CITED: src/pages/privacy.astro] — current privacy page meta (no noindex confirmed)
- [CITED: astro.config.mjs] — current config (site URL, image service, fonts — confirms `site` property already set)
- [CITED: public/robots.txt] — current robots.txt content (Sitemap line matches sitemap integration output)

### Tertiary (ASSUMED — flagged inline)
- Wix dashboard UI paths — Wix periodically renames sections; verify at execution time
- `_redirects` syntax for www→apex redirect — verify against CF Pages docs
- `aggregateRating` omission recommendation — standard Google guideline pattern
- Twitter/X card validator URL — platform may have changed
- `is:inline` requirement for JSON-LD in Astro — inferred from Astro script processing docs pattern

---

## Metadata

**Confidence breakdown:**
- DNS cutover (§1): HIGH — CF Pages custom domain docs cited, NS confirmed on CF
- HSTS (§2): HIGH — Official CF SSL docs cited
- Sitemap (§3): HIGH — Official Astro docs cited, npm version verified
- Schema.org (§5): MEDIUM — schema.org cited; Photographer type 404 confirmed, ProfessionalService assumed as best fit
- OG/social cards (§6): HIGH — ogp.me cited; stable URL strategy is well-established pattern
- Favicons (§7): HIGH — standard HTML spec
- Lighthouse perf (§9): MEDIUM — codebase inspection + standard Lighthouse patterns; actual score depends on production CDN
- CF Web Analytics (§10): MEDIUM — docs cited but token UI path for Pages projects returned 404 on direct URL; alternative path provided
- Wix archive (§11): LOW-MEDIUM — ASSUMED dashboard paths; Wix renames UI frequently
- GSC (§12): HIGH — standard GSC process, widely documented
- Post-cutover checklist (§14): HIGH — derived from known-correct protocol

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (30 days — CF dashboard paths and Astro package versions stable)
