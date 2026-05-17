# Stack Research — klphotography.ie

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

Owner has no admin UI, no auth, no per-user content. Render mode: **static (`output: 'static'`)**. No Cloudflare adapter needed. Build emits plain HTML/CSS/JS to `dist/`. Cloudflare Pages serves it from the edge.

Contact form is the only dynamic piece — handled via `functions/api/contact.ts` (Pages Functions), separate from Astro build.

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
