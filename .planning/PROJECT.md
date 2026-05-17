# klphotography.ie — Cloudflare Migration

## What This Is

Marketing website for KL Photography, a Dublin-based wedding photographer serving Ireland nationwide. The current site lives on Wix; this project rebuilds it as a static site hosted on Cloudflare Pages with a fresh, research-driven design. Audience: couples planning weddings in Ireland searching for a photographer.

## Core Value

Generate qualified wedding enquiries — every design and engineering decision serves the path from "couple lands on homepage" to "couple sends booking enquiry."

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Static site deployed on Cloudflare Pages, served via klphotography.ie
- [ ] Curated portfolio gallery (~50 hand-picked images, owner-supplied locally — no Wix scrape)
- [ ] About section telling the photographer's story
- [ ] Packages page covering 6h / 10h coverage tiers, ~400–500 edited photos, 3-month online gallery, optional album
- [ ] Contact form → Cloudflare Worker → Resend (free tier) → owner's Gmail, with Cloudflare Turnstile spam protection
- [ ] Direct contact links: phone (+353 85 166 5472), WhatsApp, email
- [ ] Social links: Instagram (@klphotography.ie), Facebook
- [ ] Cloudflare Web Analytics (cookieless, no banner required)
- [ ] Privacy policy page (GDPR — required because of contact form data collection)
- [ ] Responsive (mobile-first; ≥60% of wedding traffic is mobile)
- [ ] Image optimization pipeline (responsive `<img srcset>`, AVIF/WebP, lazy loading)
- [ ] GitHub repo → Cloudflare Pages auto-deploy on push to main
- [ ] DNS managed through Cloudflare (nameservers pointed at CF)

### Out of Scope

- Cloudflare Registrar for the .ie domain — Cloudflare Registrar does not support .ie TLD; keep registration at IEDR-accredited registrar (e.g. Blacknight, Letshost) and only delegate DNS to Cloudflare
- CMS / admin UI — owner workflow is "I edit, you push"; content updates happen via Git commits, not a web editor
- Multilingual (Gaeilge) — English only for v1
- 301 redirect map from old Wix URLs — clean slate, no SEO URL preservation
- Booking calendar / online payments — enquiry flow stops at email contact form; consultation booking handled offline
- Blog / journal — current Wix site has none, not requested
- Google Analytics — Cloudflare Web Analytics chosen for cookieless / no-banner compliance
- Client gallery delivery system — current "online gallery for 3 months" is delivered via Pixieset / similar external tool, not built here
- Per-wedding case-study pages — main curated gallery only for v1 (can be added later if SEO demands)

## Context

**Current site (klphotography.ie on Wix):**
- Pages: Home, Gallery, About, Packages & Contact, More
- Branding: minimal, neutral palette, sans-serif, modern/storytelling tone
- Contact: form + email (klphotography.ie@gmail.com) + WhatsApp + phone
- Gallery: carousel of wedding moments (prep / ceremony / reception)
- Testimonials present, no blog
- No multi-language

**Motivation:** Wix subscription cost. Cloudflare Pages free tier removes hosting cost entirely.

**Photo asset state:** Owner has all photos locally; no scraping from Wix required. Curation will be done as part of the build.

**Design direction:** Owner has deferred IA, gallery layout, and aesthetic to research-driven recommendations based on popular 2026 wedding photography sites. Research phase will surface a recommendation.

## Constraints

- **Budget**: Pure Cloudflare free tier — Pages (unlimited static), Workers (100k req/day free), Turnstile (free), Web Analytics (free). External services must also be free tier: Resend (3,000 emails/mo free). Domain renewal at .ie registrar (~€15–25/yr) is the only recurring cost.
- **Tech stack**: Static site generator targeting Cloudflare Pages. No server runtime beyond Workers. No database for v1.
- **Domain**: .ie cannot move to Cloudflare Registrar — domain stays at IEDR-accredited registrar; only nameservers delegate to Cloudflare.
- **Compliance**: EU GDPR — privacy policy mandatory because contact form collects name/email. Cookie banner avoided by using cookieless analytics and a form-only data flow.
- **Performance**: Wedding photography → image-heavy. Must hit Lighthouse 90+ on mobile and serve photos in modern formats (AVIF/WebP) with proper `srcset`.
- **Editorial workflow**: Content edits go through Claude / dev (owner does not edit code). Every gallery refresh = a PR/commit.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Host on Cloudflare Pages (not Vercel/Netlify) | Free tier most generous, owner already wants CF for DNS/Workers/Turnstile | — Pending |
| Keep .ie domain at existing registrar, only DNS at CF | Cloudflare Registrar does not support .ie | ✓ Good (forced by TLD policy) |
| Static site, no CMS | Owner workflow is "I edit, you push" — no admin UI value, simpler stack | — Pending |
| Contact form via Worker + Resend + Turnstile | Free tier path with real spam protection; Mailto-only loses leads on mobile | — Pending |
| Cloudflare Web Analytics (cookieless) | Avoids GDPR cookie banner entirely | — Pending |
| Curated ~50 photos, no per-wedding galleries | Owner wants tight portfolio; per-wedding pages can come later if needed | — Pending |
| Static site generator + framework | TBD — research phase will choose (Astro vs SvelteKit static vs Eleventy) | — Pending |
| IA / gallery layout / aesthetic | Deferred to research findings on popular 2026 wedding photographer sites | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-17 after initialization*
