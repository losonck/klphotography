# Phase 6 — Deferred Items

Issues discovered during 06-01 execution that are OUT OF SCOPE for the plan (pre-existing or unrelated to plan files).

## 1. `/privacy` missing `<main>` landmark — a11y score 98 (not 100)

- **Discovered:** 06-01 Task 3, Lighthouse accessibility audit on `/privacy`
- **Audit ID:** `landmark-one-main`
- **Failure:** `Document does not have a main landmark`
- **Source:** `src/pages/privacy.astro` (Phase 3/5 file — see commits `cb93957`, `c90a044`, `5d187c7`)
- **Cause:** Privacy page wraps content in `<Section>` directly under `<BaseLayout>` without a wrapping `<main>` element. `index.astro` uses `<main>` correctly; privacy.astro does not.
- **Impact:** Lighthouse a11y mobile + desktop both 98 on `/privacy` (single audit failure). Desktop and mobile on `/` remain 100.
- **Why deferred:** Out of scope of 06-01 (this plan targets SEO + sitemap + Schema.org + OG card + favicons + Lighthouse perf — not pre-existing landmark a11y on privacy page). Not in PLAN.md's `<files_modified>` for behavioural change. PERF-02 / PERF-04 gates in this plan target desktop `/` perf and CLS, both of which pass cleanly.
- **Suggested resolution:** A separate small chore task to wrap privacy.astro's `<Section>` in `<main>`. Trivial fix but distinct from 06-01's launch-readiness goal.
