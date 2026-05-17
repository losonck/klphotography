<!-- GSD:project-start source:PROJECT.md -->
## Project

**klphotography.ie — Cloudflare Migration**

Marketing website for KL Photography, a Dublin-based wedding photographer serving Ireland nationwide. The current site lives on Wix; this project rebuilds it as a static site hosted on Cloudflare Pages with a fresh, research-driven design. Audience: couples planning weddings in Ireland searching for a photographer.

**Core Value:** Generate qualified wedding enquiries — every design and engineering decision serves the path from "couple lands on homepage" to "couple sends booking enquiry."

### Constraints

- **Budget**: Pure Cloudflare free tier — Pages (unlimited static), Workers (100k req/day free), Turnstile (free), Web Analytics (free). External services must also be free tier: Resend (3,000 emails/mo free). Domain renewal at .ie registrar (~€15–25/yr) is the only recurring cost.
- **Tech stack**: Static site generator targeting Cloudflare Pages. No server runtime beyond Workers. No database for v1.
- **Domain**: .ie cannot move to Cloudflare Registrar — domain stays at IEDR-accredited registrar; only nameservers delegate to Cloudflare.
- **Compliance**: EU GDPR — privacy policy mandatory because contact form collects name/email. Cookie banner avoided by using cookieless analytics and a form-only data flow.
- **Performance**: Wedding photography → image-heavy. Must hit Lighthouse 90+ on mobile and serve photos in modern formats (AVIF/WebP) with proper `srcset`.
- **Editorial workflow**: Content edits go through Claude / dev (owner does not edit code). Every gallery refresh = a PR/commit.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommendation: Astro 5.x + Cloudflare Pages
### Why Astro
- Zero JavaScript by default — landing page ships 0 KB of framework code, photos are the only payload
- Best-in-class built-in image component (`<Image>` and `<Picture>`) auto-generates AVIF/WebP, sets width/height (prevents CLS), supports `srcset` responsive variants out of the box
- Content collections give type-safe gallery metadata (a `gallery/*.json` per image with caption, alt text, EXIF, etc.) — clean separation of content from code
- File-based routing — `src/pages/index.astro`, `src/pages/about.astro` map directly to URLs
- First-party Cloudflare adapter; deploy is `npm create cloudflare@latest -- --framework=astro` or just push to GitHub and let CF Pages auto-detect
- 60% of Astro sites score "Good" on Core Web Vitals vs 38% for WordPress/Gatsby — the dominant signal that matters for SEO and conversion
- Cloudflare acquired Astro in 2025 — first-class support for Pages/Workers/R2 going forward
### Versions (verify at install time)
- `astro@^5` (current stable)
- `@astrojs/cloudflare@^12` (adapter — only needed if doing SSR; pure static does not need it)
- `sharp@^0.33` (used by Astro for build-time image transforms — install as dependency, not devDependency, since Cloudflare Pages build runs in CI)
### Static-only build target
### What NOT to use
- **Next.js** — Astro is leaner for content-led sites; Next ships React runtime by default which is overkill for ~6 pages of HTML
- **Hugo / Eleventy** — viable but lose Astro's image component and TS-first DX
- **Wix exporter / Squarespace alt** — defeats the purpose (low-cost, fully-owned site)
- **Gatsby** — declining ecosystem, slower build, weaker CWV scores
- **Pages SSR adapter** — no need; everything static. Only add if a future feature demands runtime rendering
### Styling
- **Tailwind CSS v4** via `@astrojs/tailwind` — works seamlessly with Astro components
- **Custom CSS** for the gallery + typography (editorial photographer sites have distinctive type — Tailwind covers utility, custom CSS covers brand)
### Confidence
- Astro on CF Pages for portfolio: **High** (textbook fit, official guide)
- Tailwind v4 + Astro: **High** (first-party integration)
- Image pipeline via Astro `<Picture>`: **High** (battle-tested, AVIF/WebP/responsive built in)
- `output: 'static'`: **High** (no runtime features needed for v1)
## Sources
- [Astro · Cloudflare Pages docs](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Astro in 2026: Performance, Features and the Cloudflare Acquisition](https://sitepins.com/blog/astro-sitepins-2026)
- [Images - Astro Docs](https://docs.astro.build/en/guides/images/)
- [Best Static Site Generators 2026](https://thesoftwarescout.com/best-static-site-generators-2026-astro-next-js-hugo-more/)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
