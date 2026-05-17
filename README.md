# klphotography.ie

Static marketing site for KL Photography (Dublin wedding photographer) on Cloudflare Pages. Built with Astro 5+, Tailwind CSS v4, TypeScript.

## Prerequisites

- Node.js 22 LTS (see `.nvmrc`) — Cloudflare Pages builds with Node 22
- npm 10+
- git

## Local development

```sh
npm install            # install dependencies
npm run dev            # http://localhost:4321
npm run build          # emits to ./dist
npm run preview        # serves ./dist locally
npm run check          # astro check (TypeScript + content collections)
```

## Project structure

| Path                    | What lives here                                            |
|-------------------------|------------------------------------------------------------|
| `src/pages/`            | File-based routes (each `.astro` file → URL)               |
| `src/layouts/`          | Shared HTML scaffolds (e.g. `BaseLayout.astro`)            |
| `src/components/`       | Reusable section + UI components (added Phase 2)           |
| `src/styles/global.css` | Tailwind v4 entrypoint + `@theme` design tokens            |
| `src/assets/portfolio/` | Owner-supplied photo originals (added Phase 4)             |
| `src/content/gallery/`  | Gallery image metadata (added Phase 4)                     |
| `functions/api/`        | Cloudflare Pages Functions (added Phase 5 — contact form)  |
| `public/`               | Static files served as-is (`favicon.svg`, `robots.txt`, …) |
| `.planning/`            | GSD planning artifacts — see below                         |

## Deployment

Push to `main` triggers a Cloudflare Pages build. PR pushes get a preview URL on `*.pages.dev`. Build config lives in the Pages dashboard, not in this repo:

- **Framework preset:** Astro
- **Build command:** `npm run build`
- **Build output:** `dist`
- **Node version:** 22 (env var `NODE_VERSION=22`)

Manual deploy (rarely needed):

```sh
npx wrangler pages deploy dist --project-name=klphotography
```

## Gallery update workflow

> Full workflow lands in Phase 4 (Portfolio Gallery). Sketch:
>
> 1. Drop new photos into `src/assets/portfolio/`
> 2. Add a metadata entry under `src/content/gallery/<slug>.json` (caption, alt text, order)
> 3. Open a PR → preview deploy → merge to ship

Originals stay in this repo (or Git LFS if total exceeds ~200 MB). Astro's `<Picture>` component handles AVIF/WebP/JPEG variants and `srcset` at build time.

## Secrets and environment variables

Secrets NEVER live in this repo. They live in the Cloudflare Pages dashboard → Settings → Environment variables (Production AND Preview):

| Variable                     | Phase | What it is                                       |
|------------------------------|-------|--------------------------------------------------|
| `RESEND_API_KEY`             | 5     | Resend API key for the contact-form Function     |
| `TURNSTILE_SECRET_KEY`       | 5     | Cloudflare Turnstile secret (server verify)      |
| `CONTACT_TO_EMAIL`           | 5     | Where enquiries are delivered                    |
| `CONTACT_FROM_EMAIL`         | 5     | Verified sender on klphotography.ie (Resend)     |
| `PUBLIC_TURNSTILE_SITE_KEY`  | 5     | Turnstile public site key (safe to ship)         |

`.env*` files are gitignored. There is no `.env.example` yet — added when Phase 5 wires the form.

## Where decisions live

- `.planning/PROJECT.md` — project context, core value, constraints
- `.planning/ROADMAP.md` — phase plan
- `.planning/REQUIREMENTS.md` — versioned requirements with REQ-IDs
- `.planning/research/` — STACK / FEATURES / ARCHITECTURE / PITFALLS / SUMMARY
- `.planning/phases/XX-name/` — per-phase plans, context, summaries
- `.planning/dns/` — DNS pre-flight snapshot + registrar identity (Phase 1)

## License

All photographs © KL Photography. Code license TBD.
