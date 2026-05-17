# Architecture Research — klphotography.ie

## High-Level Topology

```
┌────────────────────────────────────────────────────────────┐
│  Couple's browser                                          │
└──┬─────────────────────────────────────────────────────────┘
   │ HTTPS klphotography.ie
   ▼
┌────────────────────────────────────────────────────────────┐
│  Cloudflare edge (free tier)                               │
│  ├─ DNS (nameservers delegated from .ie registrar)         │
│  ├─ Pages: serves static HTML/CSS/JS/images from dist/     │
│  ├─ Web Analytics: cookieless beacon                       │
│  └─ Pages Function: /api/contact   ──► Turnstile + Resend  │
└────────────────────────────────────────────────────────────┘
   │ build trigger
   ▼
┌────────────────────────────────────────────────────────────┐
│  GitHub: owner/klphotography                               │
│  Push to main ──► CF Pages CI: npm ci && astro build       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Domain registration: stays at IEDR-accredited registrar   │
│  (Blacknight / Letshost / etc.) — only NS records change   │
└────────────────────────────────────────────────────────────┘
```

## Components

### 1. Astro static build

- Source: `src/pages/index.astro` + section components in `src/components/`
- Photos: `src/assets/portfolio/*.jpg` (originals stored in repo OR Git LFS if >100MB total)
- Gallery metadata: `src/content/gallery/*.json` (alt text, caption, order)
- Build: `astro build` → `dist/` (HTML, optimized AVIF/WebP variants, CSS, minimal JS for lightbox)
- Output mode: `static` (no SSR adapter)

### 2. Pages Function — contact form

Cloudflare Pages Functions auto-route any file under `functions/` to a URL. `functions/api/contact.ts` handles POST `/api/contact`.

Request flow:
```
Browser form submit (FormData + Turnstile token)
    │
    ▼
POST /api/contact  (same origin, no CORS)
    │
    ▼ verify Turnstile token via siteverify API
    │    (challenges.cloudflare.com/turnstile/v0/siteverify)
    │    fail → 403
    │
    ▼ build email payload
    │
    ▼ Resend API: POST /emails  (api.resend.com)
    │    to: klphotography.ie@gmail.com
    │    reply-to: <couple's email>
    │    subject: New enquiry — <couple names>
    │
    ▼ 200 OK → client shows success state
```

Secrets (set in CF Pages dashboard → Settings → Environment variables, encrypted):
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL` (klphotography.ie@gmail.com)
- `CONTACT_FROM_EMAIL` (must be a verified domain in Resend — use `noreply@klphotography.ie`)

Public env (in `astro.config` / inline):
- `PUBLIC_TURNSTILE_SITE_KEY`

### 3. Image pipeline

- Photographer drops originals into `src/assets/portfolio/`
- Astro `<Picture src={...}>` at build time generates 3–5 widths × 2 formats (AVIF + WebP) + JPEG fallback
- Hero image: NOT lazy-loaded, `fetchpriority="high"`, preloaded via `<link rel="preload" as="image">`
- Gallery thumbnails: `loading="lazy"` and `decoding="async"`
- Target: hero ≤200 KB AVIF, gallery thumbs ≤80 KB AVIF
- Originals stay in repo (or LFS) — only `dist/` ships to CF

### 4. DNS

- .ie registration stays at existing IEDR registrar
- Owner sets nameservers to Cloudflare's pair (assigned per zone, e.g. `ada.ns.cloudflare.com` / `walt.ns.cloudflare.com`)
- Cloudflare zone gets:
  - `A` apex → CF Pages target (or `CNAME` flattening at apex)
  - `CNAME www` → apex
  - `MX` records pointing at owner's existing email (Gmail? Google Workspace?) — must NOT break inbox
  - `TXT` records (SPF/DKIM) for Resend sending from `klphotography.ie`

### 5. Data flow / persistence

- **No database for v1.** No user accounts, no booking storage, no analytics aggregation. Form submissions go straight to email.
- Future: KV store for rate-limiting if spam becomes an issue.

## Build / Deploy Order

Suggested phase build order (informs roadmap):

1. **Foundation** — Astro scaffold, Tailwind, Cloudflare Pages connection, GitHub repo, base layout, domain pointed at CF
2. **Design system** — typography, color tokens, component primitives (button, nav, section, footer)
3. **Static content sections** — Hero, About, Pricing, Testimonials, Contact (UI only, form not wired)
4. **Image pipeline + Portfolio gallery** — Astro Image components, justified grid, lightbox
5. **Contact form backend** — Pages Function, Turnstile, Resend wiring + test enquiry round-trip
6. **GDPR + analytics** — privacy policy page, Cloudflare Web Analytics beacon
7. **Launch cutover** — final DNS swap from Wix → CF, Wix subscription cancellation

## Confidence

- Astro static + Pages: **High** (CF docs)
- Pages Functions for contact form: **High** (officially supported, `functions/api/contact.ts` convention)
- Turnstile + Resend pairing: **High** (commonly documented pattern)
- Resend from a custom .ie domain: **Medium** — requires DKIM/SPF in CF DNS, takes ~1 hour to verify on Resend dashboard
- DNS migration with zero downtime: **Medium** — needs careful pre-flight of MX/TXT to avoid breaking Gmail / existing email

## Sources

- [Astro · Cloudflare Pages docs](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Building secure websites: Cloudflare Pages and Turnstile Plugin](https://blog.cloudflare.com/guide-to-cloudflare-pages-and-turnstile-plugin/)
- [Get started · Cloudflare Turnstile docs](https://developers.cloudflare.com/turnstile/get-started/)
