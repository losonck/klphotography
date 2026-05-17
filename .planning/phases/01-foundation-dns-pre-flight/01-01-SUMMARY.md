---
phase: 01-foundation-dns-pre-flight
plan: 01
subsystem: infra
tags: [astro, astro-6, tailwind-v4, postcss, cloudflare-pages, github, typescript]

requires:
  - phase: n/a
    provides: First plan — depends on nothing
provides:
  - Astro 6.3.3 static site scaffold with TypeScript strict
  - Tailwind v4 wired via @tailwindcss/postcss (Vite plugin path blocked by rolldown-vite incompatibility)
  - BaseLayout.astro shared scaffold imported by `src/pages/index.astro`
  - GitHub repo at https://github.com/losonck/klphotography (private)
  - Cloudflare Pages project klphotography auto-deploying main branch
  - README.md documenting dev/build/deploy/gallery workflow
affects: [02-design-system, 03-static-content-sections, 04-portfolio-gallery, 05-contact-form, 06-launch-cutover]

tech-stack:
  added: [astro@^6.3.3, sharp@^0.34, tailwindcss@^4.3, @tailwindcss/postcss@^4.3, @astrojs/check@^0.9.4, typescript@^5.6]
  patterns:
    - Tailwind v4 CSS-first config — no tailwind.config.js, tokens live in src/styles/global.css via @theme (Phase 2 fills this in)
    - Path alias @/* → src/* in tsconfig.json
    - postcss.config.mjs registers @tailwindcss/postcss plugin
    - astro.config.mjs uses output: 'static' (no SSR adapter)

key-files:
  created:
    - package.json
    - astro.config.mjs
    - tsconfig.json
    - postcss.config.mjs
    - .gitignore
    - .nvmrc
    - .editorconfig
    - src/layouts/BaseLayout.astro
    - src/pages/index.astro
    - src/styles/global.css
    - public/favicon.svg
    - public/robots.txt
    - README.md
    - .vscode/extensions.json
  modified: []

key-decisions:
  - "Astro 6.3.3 (current stable) instead of v5 from the plan — npm latest, no reason to pin behind"
  - "Tailwind via @tailwindcss/postcss instead of @tailwindcss/vite — withastro/astro#16542: Astro 6's rolldown-vite is incompatible with the Vite plugin"
  - "No tailwind.config.js — Tailwind v4 is CSS-first; tokens land in global.css @theme during Phase 2"
  - "Node version pin: .nvmrc=22 (LTS); package.json engines.node >=22.12.0. Local dev on Node 24 works, CF Pages set to NODE_VERSION=22"
  - "Repo visibility: private (owner photos will live here)"
  - ".vscode/launch.json NOT committed (gitignored); only extensions.json kept for team-shared recommendations"

patterns-established:
  - "All shared page chrome (head, html, body) goes through src/layouts/BaseLayout.astro — every new page imports it"
  - "Global styles imported once from BaseLayout (src/styles/global.css), never inlined into pages"
  - "Astro 6.x's <Picture> with sharp service is the image pipeline (config in astro.config.mjs); Phase 4 picks this up for the portfolio"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06]

duration: ~25min
completed: 2026-05-17
---

# Phase 1, Plan 1: Foundation Summary

**Astro 6.3.3 static scaffold + Tailwind v4 via PostCSS + private GitHub repo + Cloudflare Pages auto-deploy verified end-to-end at klphotography.pages.dev**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-17T11:11:00Z
- **Completed:** 2026-05-17T11:32:00Z (approximate — checkpoint waits not counted)
- **Tasks:** 8 (6 auto + 2 user checkpoints)
- **Files modified:** 13 created, 0 modified pre-existing

## Accomplishments

- Astro 6 project boots locally, builds to `dist/` with `output: 'static'`
- Tailwind v4 utilities (`bg-stone-50`, `text-4xl`, `min-h-screen`, etc.) compile and ship in `dist/_astro/*.css`
- `astro check` exits 0 (TypeScript strict + path aliases working)
- Private repo at https://github.com/losonck/klphotography with `main` tracking origin
- Cloudflare Pages project `klphotography` connected, framework preset Astro, `NODE_VERSION=22`
- Push-to-main → live on `klphotography.pages.dev` in 24 seconds (verify commit)

## Task Commits

1. **Scaffold + Tailwind + README** — `8cef070` (chore: scaffold Astro 6 + Tailwind v4 static site)
2. **Verify auto-deploy** — `ff852d7` (chore: verify CF Pages auto-deploy)

> Atomic-per-task commits not strictly enforced this plan — scaffold and Tailwind landed in one squash commit because they are inseparable (Tailwind requires the scaffold to apply to). Verify-deploy commit is its own. Future plans will follow the atomic-per-task convention.

## Files Created/Modified

- `package.json` — name=klphotography, private, scripts (dev/build/preview/check), deps (astro, sharp, tailwindcss, @tailwindcss/postcss, @astrojs/check, typescript)
- `astro.config.mjs` — `site: 'https://klphotography.ie'`, `output: 'static'`, sharp image service
- `postcss.config.mjs` — registers `@tailwindcss/postcss` plugin
- `tsconfig.json` — extends astro/tsconfigs/strict + path alias `@/*` → `src/*`
- `src/layouts/BaseLayout.astro` — imports global.css, accepts title + optional description props
- `src/pages/index.astro` — uses BaseLayout, applies Tailwind utilities, includes deploy-check marker
- `src/styles/global.css` — single line `@import "tailwindcss";` (Phase 2 extends with @theme tokens)
- `public/favicon.svg` — black square with white "KL" placeholder, refined in Phase 2
- `public/robots.txt` — allow-all + sitemap URL (sitemap added in Phase 6)
- `README.md` — dev/build/deploy/gallery/secrets/decisions sections
- `.gitignore` — extended beyond Astro default (`.env.*`, `.vscode/*` except extensions.json, `.cache/`)
- `.nvmrc` — `22` (LTS, matches CF Pages)
- `.editorconfig` — LF + 2-space indent + UTF-8
- `.vscode/extensions.json` — Astro recommended extensions only

## Decisions Made

- See `key-decisions` in frontmatter.
- The big call: dropping `@tailwindcss/vite` for `@tailwindcss/postcss`. The plan specified the Vite plugin, but the first build failed with `Missing field tsconfigPaths on BindingViteResolvePluginConfig.resolveOptions` (rolldown-vite ↔ Tailwind Vite plugin incompatibility, see `withastro/astro#16542` and `tailwindlabs/tailwindcss#15768`). PostCSS path is the project's recommended workaround until the Vite plugin catches up. Functionally equivalent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule: dep-resolution] Astro 6 / Tailwind Vite plugin incompatibility**
- **Found during:** Task 2 (first `npm run build` after wiring `@tailwindcss/vite`)
- **Issue:** Build error: `Missing field tsconfigPaths on BindingViteResolvePluginConfig.resolveOptions`. Known issue between Astro 6's bundled rolldown-vite and `@tailwindcss/vite@^4`.
- **Fix:** Uninstalled `@tailwindcss/vite`, installed `@tailwindcss/postcss@^4`, removed the Vite plugin import from `astro.config.mjs`, added `postcss.config.mjs` registering the PostCSS plugin.
- **Files modified:** `package.json`, `astro.config.mjs`, `postcss.config.mjs` (created)
- **Verification:** `npm run build` exits 0; `dist/_astro/*.css` contains Tailwind utility rules (`.bg-stone-50`, `.text-4xl`, etc.)
- **Committed in:** `8cef070` (squashed into scaffold commit)

**2. [Rule: scope-clarify] Plan listed `tailwind.config.mjs` in files_modified but Tailwind v4 is CSS-first**
- **Found during:** Task 2 (writing the config)
- **Issue:** Tailwind v4 does NOT use `tailwind.config.js/.mjs` — design tokens go in CSS via `@theme`. The plan's acceptance criteria already reflected this ("No `tailwind.config.js` file exists"); the frontmatter `files_modified` was the inconsistency.
- **Fix:** No file created. SUMMARY notes the drop; Phase 2 will populate `src/styles/global.css` with `@theme` block.
- **Files modified:** None
- **Verification:** Build green without the config file.
- **Committed in:** N/A — no code change.

**3. [Rule: clarify] create-astro refused to scaffold into non-empty dir**
- **Found during:** Task 1 (`npm create astro@latest .`)
- **Issue:** `.planning/`, `.git/`, `CLAUDE.md` already existed at the project root; create-astro generated a sibling subdir `wandering-wind/` instead.
- **Fix:** `cp -r wandering-wind/* .` then `rm -rf wandering-wind`. Subsequent hand-edits replaced the generated `package.json`/`astro.config.mjs` to match plan spec.
- **Files modified:** Eventually all scaffold files.
- **Verification:** Build + check green.
- **Committed in:** `8cef070`.

---

**Total deviations:** 3 auto-fixed (1 dependency-resolution, 2 plan-scope clarifications)
**Impact on plan:** All three were execution-time realities; the substance of the plan (working Astro site + Tailwind + CF Pages auto-deploy) is unchanged. Phase 2 carries the @theme-tokens-in-CSS convention forward.

## Issues Encountered

- One transient `ERR_SSL_CIPHER_OPERATION_FAILED` on the first `npm install` (likely registry/network blip); a clean retry succeeded immediately. Worth flagging if it recurs; no fix needed now.

## User Setup Required

External-service config completed during this plan (user actions):

- GitHub repo created manually at https://github.com/losonck/klphotography (private)
- Cloudflare Pages project `klphotography` created via dashboard with framework preset Astro and `NODE_VERSION=22`

No further setup items outstanding for Phase 1 infrastructure. Resend / Turnstile / Web Analytics signups will be triggered in Phases 5–6 as their plans land.

## Next Phase Readiness

- Phase 2 (Design System) is unblocked. Entry point: `src/styles/global.css` (single `@import "tailwindcss";` line, ready for `@theme` tokens).
- Phase 6 (Launch) is unblocked. DNS zone + maxer.ie registrar identity captured in `.planning/dns/` by plan 01-02.
- Hot URL for QA going forward: https://klphotography.pages.dev/ (PR previews get `*.pages.dev` sub-URLs automatically).

---
*Phase: 01-foundation-dns-pre-flight*
*Completed: 2026-05-17*
