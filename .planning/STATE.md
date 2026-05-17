# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-17)

**Core value:** Generate qualified wedding enquiries — every design and engineering decision serves the path from "couple lands on homepage" to "couple sends booking enquiry."
**Current focus:** Phase 1 — Foundation & DNS Pre-flight

## Current Position

Phase: 2 of 6 (Design System) — IN PROGRESS
Plan: 2 of 2 in current phase (02-01 complete; 02-02 next)
Status: 02-01 shipped — design tokens + self-hosted fonts wired; ready for Plan 02-02 (primitives + /styleguide)
Last activity: 2026-05-17 — 02-01 design system tokens + EB Garamond/Inter via Astro Fonts API landed (3 commits, ~6 min)

Progress: [██░░░░░░░░] 19% (3/16 plans across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 2 (Design System) | 1 | ~6min | ~6min |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: Astro 5 static on Cloudflare Pages free tier
- Init: .ie domain registration stays at IEDR registrar; only DNS at Cloudflare
- Init: No CMS — content edits via Git
- Init: Single-page IA with editorial / film aesthetic (research-driven)
- Init: Horizontal-layers project structure (single launch cutover at Phase 6)
- Phase 1: Astro 6.3.3 (latest stable), Tailwind v4 via @tailwindcss/postcss (not Vite plugin — withastro/astro#16542)
- Phase 1: Repo = github.com/losonck/klphotography (private); CF Pages = klphotography.pages.dev
- Phase 1: Registrar = maxer.ie, renewal 2027-11-12 (~€19.50/yr); stay there, not worth transferring
- Phase 1: DNS cutover risk DOWNGRADED — no MX/SPF/DKIM/DMARC on klphotography.ie; email is gmail.com
- Phase 2 (02-01): Design tokens in `src/styles/global.css` `@theme` (cream/ink/bronze palette per D-05, exact hex from RESEARCH.md §4); no `tailwind.config.*` (CSS-first v4 idiom carried forward from Phase 1)
- Phase 2 (02-01): Self-hosted EB Garamond + Inter via Astro 6 Fonts API + `fontProviders.fontsource()` — zero runtime requests to fonts.googleapis.com / gstatic.com (GDPR-safe by construction)
- Phase 2 (02-01): Omit `--breakpoint-*` overrides from `@theme` — Tailwind v4 defaults (sm=40rem/lg=64rem/xl=80rem) already match DESIGN-04 exactly; redeclaring a subset risks deactivating `md:` (RESEARCH.md A8 mitigation)
- Phase 2 (02-01): Only EB Garamond gets `preload` on `<Font />`; Inter loads on-demand. Astro 6 preload is family-wide, not per-weight — 4 preload links emitted (1 per EB Garamond weight×style); accepted, documented in 02-01-SUMMARY.md as deviation

### Pending Todos

None yet.

### Blockers/Concerns

- Photographer's full name and bio copy not yet captured (needed by Phase 3)
- Photo selection from local archive not yet captured (needed by Phase 4)
- Resend account does not yet exist (needed by Phase 5)
- ~~IEDR registrar identity for klphotography.ie not yet confirmed~~ RESOLVED Phase 1: maxer.ie

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-05-17
Stopped at: 02-01 complete — design tokens (@theme), type scale (@layer base), reduced-motion blanket, and EB Garamond + Inter via Astro 6 Fonts API; ready for 02-02 (primitives + /styleguide)
Resume file: None
