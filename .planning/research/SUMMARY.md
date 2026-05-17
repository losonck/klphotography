# Research Summary — klphotography.ie

Synthesis of STACK / FEATURES / ARCHITECTURE / PITFALLS for the Wix → Cloudflare migration.

## TL;DR

Build a **single-page Astro 5 static site** on **Cloudflare Pages free tier**, with a **justified-grid portfolio gallery**, **editorial typography**, **Pages Function contact form** secured by **Turnstile** and delivered via **Resend** to the owner's Gmail. **Cloudflare Web Analytics** (cookieless) avoids a cookie banner. **.ie domain registration stays at the existing IEDR registrar**; only DNS delegates to Cloudflare.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Astro 5 | Zero-JS default, best image pipeline, content collections, CF-acquired |
| Hosting | Cloudflare Pages | Free tier, global edge, auto-deploy from GitHub |
| Render mode | `static` | No SSR/auth/DB needed for v1 |
| Styling | Tailwind v4 + custom CSS | Utility for layout, custom for brand type |
| Image opt | Astro `<Picture>` → AVIF/WebP/JPEG, multi-width `srcset` | Built-in, no external service |
| Form backend | Pages Function (`functions/api/contact.ts`) | Same origin, no CORS, free |
| Spam | Cloudflare Turnstile | Free, no user-facing puzzles |
| Email delivery | Resend (free 3k/mo) | Simple API, DKIM via CF DNS |
| Analytics | Cloudflare Web Analytics | Cookieless = no GDPR banner |
| Repo | GitHub | CF Pages auto-deploys on push to main |
| Domain registration | IEDR-accredited registrar (status quo) | Cloudflare Registrar does not support .ie |

## Information Architecture (recommended)

Single-page scroll with sticky anchor nav:

```
[Hero — full-bleed photo + name + CTA]
   ↓
[Portfolio — justified grid + lightbox]
   ↓
[About — photographer story + portrait]
   ↓
[Pricing — 6h / 10h packages + what's included]
   ↓
[Testimonials — named quotes]
   ↓
[Contact — form + WhatsApp + phone + email + socials]
   ↓
[Footer — privacy link, copyright]
```

Separate routes: `/privacy` (legal), 404 page.

## Visual Direction (recommended starting point)

**Editorial / film aesthetic:**
- Palette: warm cream background, charcoal text, single muted accent (sage or terracotta)
- Headlines: large serif (e.g. Cormorant Garamond, Fraunces) — viewport-relative sizing for editorial scale
- Body: clean sans-serif (e.g. Inter, Plus Jakarta Sans) for readability
- Hero: full-bleed, slow Ken-Burns (with `prefers-reduced-motion` opt-out)
- Generous whitespace; photos do the talking

Skill `frontend-design` should be invoked during the design-system phase to refine concrete tokens and mocks before committing to a direction.

## Critical Pitfalls to Design Around (from PITFALLS.md)

1. **Hero LCP** — preload + eager + AVIF ≤200 KB; do not lazy-load
2. **DNS cutover** — copy existing MX/TXT/DKIM before flipping nameservers (do not break email)
3. **Resend DKIM** — verify domain before launching the form; otherwise enquiries silently bounce
4. **Turnstile secret hygiene** — secret in Pages env only, never in client bundle
5. **Accessibility** — every image needs `alt`; CI lint to enforce

## Build Order (informs roadmap)

1. Foundation (Astro scaffold, GitHub, CF Pages, base layout, DNS pre-flight)
2. Design system (typography, color, primitives)
3. Static content sections (Hero, About, Pricing, Testimonials, Contact UI)
4. Portfolio gallery (image pipeline + justified grid + lightbox)
5. Contact backend (Function + Turnstile + Resend, verified domain)
6. GDPR + analytics (privacy page, Web Analytics beacon)
7. Launch cutover (DNS swap, Wix decommission, CWV audit, sitemap, schema.org)

## Open Decisions for Roadmap / Phase Planning

- Photographer's full name + bio copy (currently only "KL")
- Photo selection (which ~50 from local archive)
- Final aesthetic direction (editorial-film is recommended; owner to confirm during design-system phase)
- Testimonial sourcing (copy from current Wix site? gather fresh?)
- Pricing in concrete numbers (current site says "6 or 10 hours" but no €; show starting price?)
