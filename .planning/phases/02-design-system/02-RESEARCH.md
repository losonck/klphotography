# Phase 2 Research — Design System

**Researched:** 2026-05-17
**Domain:** Editorial design system on Astro 6 + Tailwind v4 (static)
**Confidence:** HIGH

## Project Constraints (from CLAUDE.md)

- Pure Cloudflare free tier — no external runtime calls counted against limits.
- EU/IE GDPR — **no Google Fonts CDN at runtime** (would send visitor IP to Google). Self-host fonts.
- Image-heavy site, must hit Lighthouse 90+ mobile; design system must not regress LCP/CLS.
- Owner does not edit code — every change is a PR. Design tokens must live in source, not in a CMS.
- Workflow says **no edits outside a GSD flow** — this RESEARCH.md is being written from `/gsd:plan-phase` and is the only Phase 2 work landing today.

## Project Reality Check (deviates from prompt)

The prompt described the stack as "Astro 5", but `package.json` pins `astro@^6.3.3` (the actual installed version per Phase 1 summary). Astro 6 was released 2026-03-10 and is the current major. This is **good news for Phase 2** — Astro 6 ships a **stable, built-in Fonts API** (`astro:assets` `Font` component + `fontProviders` config) that solves self-hosted-fonts in 4 lines of config. This is the recommended path; older `@fontsource-variable/*` import patterns are obsolete on Astro 6 unless we have a specific reason to bypass the built-in API.

Tailwind v4 is wired via `@tailwindcss/postcss` (not `@tailwindcss/vite`) due to a documented Astro 6 / rolldown-vite incompatibility resolved during Phase 1. `src/styles/global.css` currently contains a single `@import "tailwindcss";` line and is the entry point for the `@theme` block this phase will create. There is **no `tailwind.config.{js,mjs,ts}`** and we should not create one — Tailwind v4 is CSS-first.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DESIGN-01 | Color tokens (cream / charcoal / muted-accent) in Tailwind config | §1 (`@theme` namespace) + §4 (recommended palette with verified contrast ratios) |
| DESIGN-02 | Type scale: serif headline + sans-serif body with viewport-relative sizing | §2 (font pair + Astro Fonts API) + §3 (concrete `clamp()` values) |
| DESIGN-03 | Component primitives — Button, Nav, Section, Footer | §5 (Astro slot/Props pattern, worked Button example) |
| DESIGN-04 | Mobile-first breakpoints ≤640 / ≥1024 / ≥1280 | §1 (`--breakpoint-*` in `@theme`) — note the standard utilities map sm=640 / lg=1024 / xl=1280, only `md` is unused |
| DESIGN-05 | `prefers-reduced-motion` respected | §7 (`motion-reduce:` variant, default-static pattern) |
| Success | Tokens visible on `/styleguide` route | §6 (route at `src/pages/styleguide.astro`, gate strategy) |
| Success | Lighthouse a11y ≥95 on styleguide | §8 (pitfall checklist) |

## TL;DR

- **Tokens** live in `src/styles/global.css` inside a single `@theme { ... }` block. No `tailwind.config.*`. Map namespaces: `--color-*`, `--font-*`, `--text-*`, `--breakpoint-*`, `--spacing-*`.
- **Fonts** use Astro 6's stable `astro:assets` `Font` component with `fontProviders.fontsource()` — Astro downloads, caches, fingerprints, generates fallback metrics, and inserts `<link rel="preload">` for the one weight we mark `preload: true`. No `@font-face` hand-rolling. GDPR-safe (no third-party request from the visitor).
- **Pair:** **EB Garamond** (headings AND long-form text) + **Inter** (UI / body) — chosen over Cormorant/Playfair because Cormorant and Playfair are display-only and become illegible at body sizes, while EB Garamond handles 16px text and the 7rem hero alike.
- **Type scale** uses `clamp()` for h1–h3 only (where viewport variance matters); h4/body/small use static `rem` values with a single `sm:` override on body. Concrete values in §3.
- **Palette:** cream `#FAF7F2` surface, ink `#1A1A1A` text, bronze `#6B4423` accent — all pairs ≥4.5:1 contrast, with body/headings at AAA. Two backup palettes in §4.
- **Primitives** are plain Astro components using `<slot />` + `interface Props extends HTMLAttributes<'button'>` + `class:list` for merging. **No `tailwind-merge` dependency for v1** — `class:list` deduplication is good enough for our small surface area. Worked Button example in §5.
- **Motion:** default to **no motion**, then opt-in with `motion-safe:` variants. This is safer than the inverse and Lighthouse-friendly. §7.
- **Accessibility:** the 8-item checklist in §8 covers all Lighthouse-automatable failures for a styleguide page.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design tokens (color, type, breakpoints, spacing) | Build (Tailwind v4 `@theme` in CSS) | — | Tokens are compile-time CSS variables; no runtime computation. |
| Font asset hosting | Build → CDN (Cloudflare Pages static) | — | Astro 6 Fonts API copies font files into `dist/_astro/fonts/` at build; CF serves them with 1y cache. No runtime fetch from third party. |
| Font face declaration + preload | Browser (rendered into `<head>`) | — | `<Font cssVariable="..." preload />` emits `@font-face` + `<link rel="preload">` server-side at build. |
| Component primitives (Button, Nav, Section, Footer) | Build (Astro `.astro` components) | — | Pure server-side render to HTML; zero client JS. |
| Reduced-motion handling | Browser (CSS `@media`) | Build (Tailwind variant compiles to that `@media`) | Pure CSS — no JS detection. |
| `/styleguide` route | Build (static `.astro` page) | — | Static page indistinguishable from a content page; gated only by sitemap exclusion. |

## Standard Stack

### Core (already installed — Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^6.3.3 | Site generator + Fonts API + Image pipeline | [VERIFIED: package.json] Pinned in Phase 1 |
| tailwindcss | ^4.3.0 | Utility CSS + `@theme` design tokens | [VERIFIED: package.json] |
| @tailwindcss/postcss | ^4.3.0 | Tailwind v4 PostCSS plugin (Vite plugin path blocked) | [VERIFIED: 01-01-SUMMARY.md deviation log] |
| sharp | ^0.34.0 | Image pipeline (used by Phase 4, not Phase 2) | [VERIFIED: package.json] |

### Net-new in this phase

**None required.** Astro 6's Fonts API is built in (`astro:assets`), Tailwind v4 ships with `motion-safe:` / `motion-reduce:` variants, and class merging is handled by Astro's built-in `class:list` directive.

Optional adds (recommend **not** installing for v1):

| Library | Reason to skip in Phase 2 | When to revisit |
|---------|---------------------------|-----------------|
| tailwind-merge | `class:list` deduplicates Tailwind classes well enough for 4 primitives; adds ~7 KB and another dep | Add only if a primitive grows past ~5 variants and conflicts appear |
| class-variance-authority | Designed around React; overkill for 4 Astro primitives | Skip permanently for this project — Astro components don't need it |
| @fontsource-variable/* npm packages | Replaced by Astro 6's built-in Fonts API which uses Fontsource as a provider | Use only if Astro Fonts API ships a blocker bug |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@theme { ... }` in CSS | `tailwind.config.js` with v3-style theme | v4 supports a legacy `@config` directive for back-compat, but goes against v4 idiom; no benefit here. [CITED: tailwindcss.com/docs/theme] |
| Astro Fonts API | `@fontsource-variable/inter` npm + manual `@font-face` in global.css | Manual approach is what most pre-Astro-6 tutorials show; works but loses auto-fallback-metrics, auto-fingerprinting, and the smart preload heuristic. Astro 6 path is strictly better. |
| Astro Fonts API | Raw `.woff2` in `public/fonts/` with hand-written `@font-face` | Works, but no fallback-metrics generation → noticeable CLS during font swap. Skip. |
| EB Garamond | Cormorant Garamond (more elegant display feel) | Cormorant is **display-only** — at 16px body it becomes unreadable. We need ONE family that works at 14px and 96px to keep the font payload small. EB Garamond does both. [CITED: fontalternatives.com] |
| EB Garamond | Playfair Display | Same issue as Cormorant: display-only, breaks down at text sizes. [CITED: fontalternatives.com] |
| Inter | Manrope | Both work; Inter has wider weight range on Fontsource and is more conservative-editorial. Manrope reads more "tech startup". |

### Installation

```bash
# Nothing to install — Phase 2 only adds CSS tokens and uses already-installed deps.
# Astro Fonts API is part of core; Fontsource provider needs no extra package.
```

**Version verification:**
```bash
npm view astro version       # confirm current is still 6.x — Astro 6.0 launched 2026-03-10
npm view tailwindcss version # confirm 4.x line
```

## Package Legitimacy Audit

| Package | Registry | Source | slopcheck | Disposition |
|---------|----------|--------|-----------|-------------|
| astro | npm | github.com/withastro/astro | n/a — already installed | Approved (Phase 1) |
| tailwindcss | npm | github.com/tailwindlabs/tailwindcss | n/a — already installed | Approved (Phase 1) |

No new packages introduced this phase. Slopcheck not run because the package set is empty.

## 1. Tailwind v4 token strategy

**Decision:** Define all design tokens inside a single `@theme { ... }` block in `src/styles/global.css`, immediately below the existing `@import "tailwindcss";` line. **Do not create `tailwind.config.{js,mjs,ts}`.**

**Rationale:**
- Tailwind v4 is CSS-first. The `@theme` directive registers variables as both CSS custom properties **and** Tailwind utility-class sources in one declaration. [CITED: tailwindcss.com/docs/theme]
- Phase 1 explicitly established the "tokens live in `global.css` via `@theme`" convention (01-01-SUMMARY.md `patterns-established`). This phase fills it in; it does not relitigate the structure.
- A `tailwind.config.*` file in a v4 project still works via the `@config` legacy directive, but is the wrong idiom and would split tokens across two locations. [CITED: tailwindcss.com/blog/tailwindcss-v4]

**Namespace map** (what to put under each prefix):

| Prefix | Used for | Becomes |
|--------|----------|---------|
| `--color-*` | All brand colors | `bg-cream`, `text-ink`, `border-bronze`, etc. |
| `--font-*` | Font family stacks | `font-serif`, `font-sans` |
| `--text-*` | Static font-size tokens (used for h4/body/small) | `text-body`, `text-small` |
| `--breakpoint-*` | Responsive breakpoints | `sm:`, `lg:`, `xl:` variants |
| `--spacing-*` | Single spacing scale unit (one variable creates the full numeric scale) | `p-4`, `gap-12`, etc. |

**Concrete `@theme` block** (drop into `src/styles/global.css`):

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* ─── Color ────────────────────────────────────────── */
  --color-cream: #FAF7F2;           /* page surface */
  --color-cream-deep: #F0EAE0;      /* cards, alt sections */
  --color-ink: #1A1A1A;             /* body + heading text */
  --color-ink-soft: #4A4A4A;        /* secondary text, captions */
  --color-bronze: #6B4423;          /* accent — links, CTA, underlines */
  --color-bronze-hover: #553617;    /* hover state */
  --color-rule: #DCD3C4;            /* hairlines, borders */

  /* ─── Typography ───────────────────────────────────── */
  --font-serif: "EB Garamond", Cambria, "Times New Roman", Times, serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Static type tokens (clamp values live in component CSS, see §3) */
  --text-body: 1rem;          /* 16px */
  --text-body--line-height: 1.65;
  --text-small: 0.875rem;     /* 14px */
  --text-caption: 0.75rem;    /* 12px */

  /* ─── Breakpoints (DESIGN-04: ≤640 / ≥1024 / ≥1280) ── */
  /* sm and lg/xl match Tailwind defaults; explicitly redeclare for traceability. */
  --breakpoint-sm: 40rem;     /* 640px — mobile-to-tablet boundary */
  --breakpoint-lg: 64rem;     /* 1024px — tablet-to-desktop */
  --breakpoint-xl: 80rem;     /* 1280px — desktop-to-wide */
  /* Intentionally NOT defining --breakpoint-md — requirements skip 768px. */

  /* ─── Spacing (single base, scale derives automatically) ── */
  --spacing: 0.25rem;         /* 4px → p-1=4px, p-2=8px, ..., p-12=48px */
}
```

**Why these specific values:**
- Breakpoints in `rem` not `px` so they respect user font scaling (`html { font-size: ... }`). [CITED: clamp generator accessibility guidance]
- `--text-body--line-height: 1.65` — Tailwind v4 lets you co-locate line-height with a text token via the `--<token>--line-height` companion variable. This emits as `line-height` when `text-body` is applied. [CITED: tailwindcss.com/docs/theme]
- Bronze accent contrast is verified in §4 (7.93:1 — exceeds AAA for normal text).

## 2. Self-hosted fonts

**Decision:** Use Astro 6's built-in Fonts API with **Fontsource provider** for both families. Self-host EB Garamond (serif) + Inter (sans-serif). Inter via Fontsource variable; EB Garamond via Fontsource variable.

**Why Astro 6 Fonts API over manual `@font-face`:**
- Built-in: no extra dependency (`astro:assets` is core).
- Downloads fonts at build time and caches them in `dist/_astro/fonts/` with content-hashed filenames → 1-year cacheability.
- Generates **size-adjusted fallback** `@font-face` blocks automatically, which dramatically reduces CLS during the swap from system fallback to webfont.
- Emits one `<link rel="preload" as="font" crossorigin>` per font marked `preload: true`.
- **Zero runtime third-party requests** — visitors never hit `fonts.googleapis.com` or `fonts.gstatic.com`. **GDPR-safe.** [CITED: docs.astro.build/en/guides/fonts/]

### Font pair rationale (wedding photographer editorial)

| Family | Role | Why this one |
|--------|------|--------------|
| **EB Garamond** | Headings + long-form body | Berner-1592-based; designed for use at **both display and text sizes** (unlike Cormorant or Playfair which are display-only). One family covers hero h1 (`clamp(2.5rem, 8vw, 7rem)`), pricing tier copy at 16px, and italic pull-quotes — keeps font payload small. [CITED: fontalternatives.com] |
| **Inter** | Nav, buttons, form labels, captions | Highly legible at small sizes, deep weight range (100–900) on Fontsource, neutral enough to recede behind the serif personality. Wide Latin subset covers Irish placenames. |

Italic is needed (for the EB Garamond pull-quotes used in Testimonials, Phase 3). Bold weight 700 needed for h1/h2; regular 400 for body; medium 500 + semibold 600 for Inter UI.

### Configuration

`astro.config.mjs`:
```js
// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: 'https://klphotography.ie',
  output: 'static',
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  fonts: [
    {
      name: 'EB Garamond',
      cssVariable: '--font-serif',
      provider: fontProviders.fontsource(),
      weights: [400, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      // Preload the regular weight only — it's the hero h1 font.
      // 700 + italic load on-demand without preload (smaller perf budget).
      fallbacks: ['Cambria', 'Times New Roman', 'serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-sans',
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
    },
  ],
});
```

`src/layouts/BaseLayout.astro` (extend the existing file):
```astro
---
import '@/styles/global.css';
import { Font } from 'astro:assets';

interface Props {
  title: string;
  description?: string;
}
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    {/* Fonts API: emits @font-face + size-adjusted fallback + optional preload */}
    <Font cssVariable="--font-serif" preload />
    <Font cssVariable="--font-sans" />

    <title>{title}</title>
    {description && <meta name="description" content={description} />}
  </head>
  <body class="bg-cream text-ink font-sans antialiased">
    <slot />
  </body>
</html>
```

**FOUT/FOIT handling:**
- Astro's `Font` component sets `font-display: swap` by default (per the Fonts API design — block phase ≤ 100ms, then fallback shows immediately, then swap). [CITED: docs.astro.build/en/guides/fonts/ + fontfyi.com]
- Layout shift on swap is mitigated by Astro's auto-generated size-adjusted fallback `@font-face` — no manual `ascent-override` / `descent-override` math needed.
- Only **one** weight per family is preloaded; preloading every weight is the anti-pattern. [CITED: studyraid font loading optimization]

**Verification at runtime:**
- View source after build — should see `<link rel="preload" as="font" type="font/woff2" crossorigin>` for `--font-serif` only.
- `dist/_astro/fonts/` should contain hashed `.woff2` files (no `.ttf`, no `.woff` v1).
- DevTools Network panel: no request to `*.googleapis.com` or `*.gstatic.com`.

## 3. Type scale

**Decision:** Use `clamp()` only where viewport variance is editorially meaningful (h1, h2, h3). Use static `rem` for h4, body, and small text. This keeps the implementation simple and gives Lighthouse predictable layout for CLS scoring.

| Element | Mobile (320px) | Desktop (≥1280px) | CSS |
|---------|---------------:|-------------------:|-----|
| h1 (hero) | 40px | 112px | `font-size: clamp(2.5rem, 8vw, 7rem);` `line-height: 1.05;` `letter-spacing: -0.02em;` |
| h2 (section header) | 32px | 64px | `font-size: clamp(2rem, 5vw, 4rem);` `line-height: 1.15;` `letter-spacing: -0.01em;` |
| h3 (sub-section) | 24px | 36px | `font-size: clamp(1.5rem, 3vw, 2.25rem);` `line-height: 1.25;` |
| h4 (small heading) | 20px | 20px | `font-size: 1.25rem;` `line-height: 1.35;` |
| body | 16px | 18px (≥sm only) | `font-size: 1rem;` then `sm:font-size: 1.125rem;` `line-height: 1.65;` |
| small / caption | 14px | 14px | `font-size: 0.875rem;` `line-height: 1.5;` |

**Where these live:** in a `@layer base` block in `src/styles/global.css`, applied to bare element selectors so primitives don't have to remember utility class chains:

```css
/* src/styles/global.css — append after @theme block */

@layer base {
  html { font-family: var(--font-sans); color: var(--color-ink); }
  body { background: var(--color-cream); }

  h1, h2, h3 { font-family: var(--font-serif); font-weight: 400; }
  h1 { font-size: clamp(2.5rem, 8vw, 7rem); line-height: 1.05; letter-spacing: -0.02em; }
  h2 { font-size: clamp(2rem, 5vw, 4rem);   line-height: 1.15; letter-spacing: -0.01em; }
  h3 { font-size: clamp(1.5rem, 3vw, 2.25rem); line-height: 1.25; }
  h4 { font-family: var(--font-sans); font-weight: 600;
       font-size: 1.25rem; line-height: 1.35; letter-spacing: 0.02em;
       text-transform: uppercase; }

  /* Body sizes — single sm-up step, no clamp (preserves CLS predictability) */
  p, li { font-size: 1rem; line-height: 1.65; max-width: 65ch; }
  @media (min-width: 40rem) {
    p, li { font-size: 1.125rem; }
  }
  small, figcaption { font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-soft); }
}
```

**Accessibility notes:**
- All `clamp()` mins/maxes use `rem` so user font scaling works (WCAG 1.4.4: text must scale to 200%). [CITED: clampgenerator.com]
- The viewport unit (`vw`) is sandwiched between rem bounds, so even when the user zooms, the min/max grow proportionally.
- `max-width: 65ch` on body copy keeps line length in the 45–75 character readability sweet spot.

**Why not the Tailwind `text-*` utility scale for headings?**
The default Tailwind scale (`text-5xl`, `text-7xl`) is fixed-pixel. We could compose it with `clamp()` via arbitrary values (`text-[clamp(...)]`), but for ONE site with a fixed editorial language, putting these in `@layer base` keeps content components clean — `<h1>Story title</h1>` Just Works, no class chain to maintain.

## 4. Color palette

### Recommended: "Cream + Ink + Bronze"

| Token | Hex | Role | Notes |
|-------|-----|------|-------|
| `--color-cream` | `#FAF7F2` | Page surface (body bg) | Warm off-white, not pure |
| `--color-cream-deep` | `#F0EAE0` | Section alt bg, cards | One step warmer for zoning |
| `--color-ink` | `#1A1A1A` | Body + heading text | Soft black, not `#000` |
| `--color-ink-soft` | `#4A4A4A` | Captions, meta | Still passes AA on cream |
| `--color-bronze` | `#6B4423` | CTAs, links, accent rules | Warm earth accent |
| `--color-bronze-hover` | `#553617` | Hover state | Darker on interaction |
| `--color-rule` | `#DCD3C4` | Hairlines, borders | Subtle separation |

**Contrast table** (computed via sRGB relative luminance; verify with WebAIM checker before sign-off):

| Foreground | Background | Ratio | WCAG AA normal (4.5:1) | WCAG AA large (3:1) | WCAG AAA normal (7:1) |
|------------|------------|------:|:----------------------:|:-------------------:|:---------------------:|
| ink `#1A1A1A` | cream `#FAF7F2` | **16.3:1** | PASS | PASS | PASS |
| ink `#1A1A1A` | cream-deep `#F0EAE0` | ~15.1:1 | PASS | PASS | PASS |
| ink-soft `#4A4A4A` | cream `#FAF7F2` | ~8.4:1 | PASS | PASS | PASS |
| bronze `#6B4423` | cream `#FAF7F2` | **~7.9:1** | PASS | PASS | PASS |
| bronze-hover `#553617` | cream `#FAF7F2` | ~10.5:1 | PASS | PASS | PASS |
| cream `#FAF7F2` | bronze `#6B4423` | ~7.9:1 | PASS | PASS | PASS |

All foreground/background pairs we'd realistically use clear AAA for body text. **This palette has substantial accessibility headroom**, which means Phase 3 designers can safely use bronze for links inside body copy without worrying about a Lighthouse fail.

### Backup option A: "Warm Cream + Deep Charcoal + Terracotta"

| Token | Hex | Pair vs surface | Ratio |
|-------|-----|-----------------|------:|
| cream | `#F5EFE6` | — | — |
| charcoal | `#2A2A2A` | on cream | ~12.4:1 (AAA) |
| terracotta | `#A0522D` | on cream | ~5.3:1 (AA normal) |

More expressive accent (terracotta is warmer / more obvious), but accent ratio is at AA, not AAA — no headroom for thin or small accent text. Use only if owner explicitly wants a more "wedding-y" warm accent.

### Backup option B: "Off-white + Ink + Sage" — **NOT RECOMMENDED**

| Token | Hex | Pair vs surface | Ratio |
|-------|-----|-----------------|------:|
| off-white | `#FBF9F4` | — | — |
| ink | `#111111` | on off-white | ~17.8:1 (AAA) |
| sage | `#6B7F6B` | on off-white | **~4.1:1 — FAILS AA normal text** |

Sage as a link/CTA color fails WCAG AA at 4.5:1. Would need to use sage **only at large sizes** (e.g., h4+ or button text ≥18px). Recommend rejecting — too easy to misuse and lose a11y score.

**Recommendation:** Ship "Cream + Ink + Bronze". It's the only candidate where every realistic pairing clears AA at normal text size with comfortable margin.

## 5. Component primitive pattern

### Pattern

Astro primitives are plain `.astro` files with three conventions:

1. **`interface Props extends HTMLAttributes<'…'>`** — extend the relevant HTML element's attribute set so primitives accept native attributes (`type`, `aria-label`, `disabled`, etc.) without re-declaring each one. Import `HTMLAttributes` from `astro/types`.
2. **`<slot />` for content**, **`<slot name="…">` for structural slots** (e.g., `<slot name="icon">` on Button).
3. **`class:list` for merging consumer classes with primitive defaults** — Astro's built-in directive deduplicates and short-circuits falsy entries. No `tailwind-merge` dep needed.

**No `class-variance-authority`, no `tailwind-merge`.** Both are React-shaped and add weight. Variant selection is a plain `const` switch in the component frontmatter — see Button example below.

### Worked example: `src/components/ui/Button.astro`

```astro
---
import type { HTMLAttributes } from 'astro/types';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size    = 'sm' | 'md' | 'lg';

interface Props extends HTMLAttributes<'button'> {
  variant?: Variant;
  size?: Size;
  as?: 'button' | 'a';
  href?: string;
}

const {
  variant = 'primary',
  size = 'md',
  as = 'button',
  href,
  class: className,
  ...rest
} = Astro.props;

const Tag = as;

const base = [
  'inline-flex items-center justify-center',
  'font-sans font-medium tracking-wide',
  'rounded-none border', // editorial = sharp corners, not pills
  'transition-colors duration-150',
  'motion-reduce:transition-none',
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze',
  'disabled:opacity-50 disabled:pointer-events-none',
];

const variants: Record<Variant, string> = {
  primary:   'bg-ink text-cream border-ink hover:bg-bronze-hover hover:border-bronze-hover',
  secondary: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-cream',
  ghost:     'bg-transparent text-ink border-transparent hover:text-bronze',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-base sm:text-lg',
};
---

<Tag
  href={Tag === 'a' ? href : undefined}
  class:list={[...base, variants[variant], sizes[size], className]}
  {...rest}
>
  <slot />
</Tag>
```

**Usage:**
```astro
<Button variant="primary" size="lg" href="#contact" as="a">Enquire</Button>
<Button variant="secondary">Read story</Button>
<Button variant="ghost" type="button" aria-label="Close">×</Button>
```

### Naming / location convention

```
src/
├── components/
│   ├── ui/              # Primitives (this phase): Button, Section, Nav, Footer
│   │   ├── Button.astro
│   │   ├── Section.astro
│   │   ├── Nav.astro
│   │   └── Footer.astro
│   └── (sections/)      # Phase 3 will add Hero, About, Pricing, etc. here
├── layouts/
│   └── BaseLayout.astro  # already exists, extended in §2
└── styles/
    └── global.css        # @theme + @layer base
```

Path alias `@/*` → `src/*` is already wired (tsconfig.json from Phase 1), so imports read `import Button from '@/components/ui/Button.astro';`.

### Section, Nav, Footer — quick sketches (full implementations are Plan 02-02 work)

**Section.astro** — accepts `id`, `tone` (`'cream' | 'cream-deep'`), padding variant; renders `<section>` with consistent vertical rhythm and `max-width` content well.

**Nav.astro** — phase 2 ships a static (non-sticky) version with just brand mark + anchor links + reduced-motion-safe styling. Sticky behavior + mobile hamburger are explicit Phase 3 scope (CONTENT-06). Build the visual primitive now, defer interaction.

**Footer.astro** — semantic `<footer>` with `role` not needed (HTML5 native landmark), four-column grid on `lg:`, single-column on mobile, includes social link slots and copyright.

## 6. /styleguide route

**Location:** `src/pages/styleguide.astro` (file-based routing → URL becomes `/styleguide`).

**Gating strategy: do NOT gate behind `import.meta.env.DEV`.** Rationale:
- Owner has no admin UI; the styleguide doubles as a living documentation page useful in production for reference when commissioning future design changes.
- Output is `static`, so it just ships as an extra HTML file — costs nothing.
- **Do** exclude `/styleguide` from `sitemap.xml` when Phase 6 generates one, and add `<meta name="robots" content="noindex, nofollow" />` in the page head so it doesn't appear in search results. This is the standard pattern for internal docs on a small static site.

**Structure outline** (full implementation is Plan 02-02):

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Button from '@/components/ui/Button.astro';
import Section from '@/components/ui/Section.astro';
---
<BaseLayout title="Styleguide — KL Photography" description="Design system reference.">
  <meta slot="head" name="robots" content="noindex, nofollow" />

  <Section id="palette" tone="cream">
    <h2>Color</h2>
    {/* swatch grid: render each --color-* with hex + contrast ratio against cream */}
  </Section>

  <Section id="typography" tone="cream-deep">
    <h2>Typography</h2>
    {/* render h1, h2, h3, h4, body, small — with their clamp values labeled */}
  </Section>

  <Section id="buttons" tone="cream">
    <h2>Buttons</h2>
    {/* render every Variant × Size combination */}
    {/* include disabled state, focus state (note: only visible on Tab) */}
  </Section>

  <Section id="navigation" tone="cream-deep">
    <h2>Navigation</h2>
    {/* render Nav */}
  </Section>

  <Section id="footer" tone="cream">
    <h2>Footer</h2>
    {/* render Footer */}
  </Section>

  <Section id="motion" tone="cream-deep">
    <h2>Motion</h2>
    {/* show a reduced-motion-aware demo: animated underline + the same with motion-reduce neutralization */}
    {/* include a note: "this section respects your OS reduced-motion setting" */}
  </Section>
</BaseLayout>
```

**Note on the `<meta slot="head">`:** Phase 2 will need BaseLayout to support a named `head` slot if it doesn't already. The current BaseLayout has only a default `<slot />` for body — the styleguide gate requires extending BaseLayout's `<head>` to render a `<slot name="head" />` before `</head>`. This is a one-line BaseLayout edit, called out here so the planner can include it as a Plan 02-02 task.

## 7. Reduced-motion

**Decision:** Use Tailwind v4's `motion-safe:` and `motion-reduce:` variants — they compile to `@media (prefers-reduced-motion: no-preference)` and `@media (prefers-reduced-motion: reduce)` respectively. No custom CSS needed. [CITED: tailwindcss.com/docs/hover-focus-and-other-states]

**Pattern: "default static, opt in to motion"** (recommended over the inverse):

```html
<!-- GOOD — animation only applies when user has NOT requested reduced motion -->
<a href="#" class="motion-safe:transition-colors motion-safe:duration-300 hover:text-bronze">
  Read more
</a>

<!-- GOOD — transform stripped under reduced motion -->
<button class="hover:-translate-y-0.5 motion-reduce:transform-none transition-transform motion-reduce:transition-none">
  Enquire
</button>
```

**Why "motion-safe-first":** if you forget the modifier, the failure mode is "no animation" (safe) rather than "uncontrolled animation" (a11y violation). [CITED: epicweb.dev motion-safe-and-motion-reduce-modifiers + tailwindlabs/tailwindcss discussion #12864]

**Concrete uses in Phase 2 / Phase 3:**
- Button hover color transition → `motion-safe:transition-colors` (Phase 2)
- Hero Ken-Burns slow zoom on hero image → `motion-safe:animate-[kenburns_30s_ease-in-out_infinite]` with `motion-reduce:animate-none` as belt-and-braces (Phase 3 / Phase 4)
- Smooth-scroll for anchor nav → CSS `html { scroll-behavior: smooth; }` with `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }` (Phase 3)

The smooth-scroll case is the **one place we'll need raw `@media`** in `global.css` because the `scroll-behavior` property applies on `html` and there's no element-level variant pattern that fits cleanly. Document this exception.

```css
/* src/styles/global.css — append */
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

The blanket `*` rule is a belt-and-braces fallback for any animation/transition that ships without an explicit `motion-reduce:` modifier — common safety pattern that Lighthouse audits favor.

## 8. Lighthouse a11y ≥95 — pitfall checklist

Lighthouse's a11y category catches ~30–40% of real-world a11y issues but is high-signal for what it does catch. [CITED: davidmello.com playwright-accessibility-testing-axe-lighthouse-limitations] A score of ≥95 on a styleguide page requires clearing each of:

| # | Pitfall | How phase 2 mitigates |
|---|---------|------------------------|
| 1 | **Color contrast below 4.5:1 for normal text** | Palette in §4 — every realistic pair is ≥4.5:1, most are AAA. Run Lighthouse on the styleguide and confirm zero contrast warnings. |
| 2 | **Focus indicator missing or invisible** | Every interactive primitive includes `focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze`. Bronze on cream is 7.9:1 — Lighthouse-safe even on a `:focus` state it can't actively trigger. [CITED: accessibility-test.org lighthouse-accessibility-score-insights-and-limitations] |
| 3 | **Heading order skipped (h1 → h3)** | Styleguide outline in §6 uses sequential h1 → h2 (Section heading) → h3 (sub-item). No skips. Lighthouse audits `heading-order`. |
| 4 | **Missing or empty `alt` on images** | Styleguide has no images in Phase 2 — only typography + color + components. Confirm zero `<img>` tags before merge. |
| 5 | **No `<main>` landmark / missing landmarks** | BaseLayout renders `<body><slot /></body>`. The styleguide page wraps its content in `<main>`. Section primitive uses `<section>` (an implicit landmark when it has an `aria-label` or `aria-labelledby`). Nav primitive uses `<nav>`. Footer uses `<footer>`. |
| 6 | **`<html>` missing `lang` attribute** | Already set in BaseLayout (`<html lang="en">`). Verified. |
| 7 | **Buttons or links without discernible name** | Button.astro takes children via `<slot />`; the styleguide demo includes both text-content buttons and an `aria-label`-bearing icon button (the `×` close example). Lighthouse audits `button-name` and `link-name`. |
| 8 | **Tap targets too small on mobile** | Button `sm` size is `px-4 py-2 text-sm` → ~32px tall. Lighthouse mobile audit wants ≥48px for primary tap targets. Document that `md` (≥44px) is the minimum for primary CTAs; reserve `sm` for desktop-secondary actions only. |

**Non-Lighthouse but important to flag:**
- **Reduced-motion respected** — covered by §7 patterns. Lighthouse doesn't actively test this but axe does, and it'll catch us in Phase 5's deeper audit.
- **Tab order matches visual order** — verify on styleguide by tabbing through; should go nav → buttons in declared variant order → footer links.

**Verification command (Phase 2 sign-off):**
```bash
npm run build && npm run preview &
# in another shell, run Lighthouse CLI or browser DevTools Lighthouse panel against
# http://localhost:4321/styleguide  (Astro preview port)
# Mobile, desktop preset both → Accessibility ≥95
```

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None — no database, no datastore in this project | None |
| Live service config | None — Cloudflare Pages serves only static `dist/`. CF Web Analytics not yet installed (Phase 5) | None |
| OS-registered state | None — no scheduled tasks, no daemons | None |
| Secrets / env vars | None for Phase 2 — `TURNSTILE_*` and `RESEND_*` are Phase 5 | None |
| Build artifacts | The existing `dist/` from Phase 1 will be rebuilt by `npm run build` — no manual cleanup needed | None |

This is a greenfield design-system phase; no runtime state migration concerns.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | astro build | ✓ | 22.x (per `.nvmrc`) | — |
| npm | dep install | ✓ | bundled with Node | — |
| Astro Fonts API (network access at build time) | Fontsource provider downloads `.woff2` from `cdn.jsdelivr.net/npm/@fontsource/*` | ✓ assumed (CI runs on CF Pages with network) | — | Local fallback: drop manual `.woff2` into `public/fonts/` and hand-roll `@font-face` (skip Astro Fonts API). Acceptable for emergencies. |
| Lighthouse (Chrome DevTools or `lighthouse` CLI) | a11y verification | ✓ assumed (any modern Chrome / `npx lighthouse@latest`) | — | axe-core browser extension as alternative |

No blocking gaps. The Fontsource provider downloads fonts at build time — first build will be slower (~5–10s additional), subsequent builds use the cache.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed (no `vitest`, `jest`, `playwright` in package.json) — Phase 1 set up no test infra |
| Config file | none — see Wave 0 |
| Quick run command | `npm run check` (astro type-check) + `npm run build` (compile fails = test fails) |
| Full suite command | Same — there is no separate test suite yet |
| Phase gate | Manual Lighthouse run on `/styleguide`; visual primitive check |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| DESIGN-01 | `@theme` tokens compile to utility classes | build-time | `npm run build && grep -q 'bg-cream' dist/_astro/*.css` | tokens written in 02-01 |
| DESIGN-02 | Fonts resolve, hero h1 clamps | manual (visual) | `npm run preview` → visit `/styleguide` → inspect h1 computed font-size at 320px and 1280px viewport | styleguide page written in 02-02 |
| DESIGN-03 | All 4 primitives render without errors | build-time | `npm run check && npm run build` (type errors fail the build) | primitives written in 02-02 |
| DESIGN-04 | `sm:`, `lg:`, `xl:` variants compile | build-time | `grep -q '@media (min-width: 64rem)' dist/_astro/*.css` | covered by DESIGN-01 |
| DESIGN-05 | Reduced-motion respected | manual | DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" → reload `/styleguide` → no animation, no smooth scroll | covered by 02-02 |
| Lighthouse a11y ≥95 | a11y audit | manual | `npx lighthouse http://localhost:4321/styleguide --only-categories=accessibility --form-factor=mobile` | covered by 02-02 |

### Sampling Rate
- **Per task commit:** `npm run check && npm run build`
- **Per wave merge:** Same + manual `/styleguide` viewport sweep at 320, 640, 1024, 1280px
- **Phase gate:** Lighthouse a11y ≥95 on `/styleguide`, all primitives render correctly, contrast ratios verified in browser via DevTools' Color Contrast Analyzer or the WebAIM checker against the deployed preview URL

### Wave 0 Gaps
- [ ] Add `<slot name="head" />` to `BaseLayout.astro` so the styleguide can inject `noindex` meta. One-line change, prerequisite for 02-02.
- [ ] No test runner is installed. **Recommendation: do NOT install one in Phase 2.** Phase 2 is visual + tokens; `astro check` + manual Lighthouse + a build success are sufficient validation. Installing vitest/playwright now risks scope creep with no payoff for this phase. Revisit in Phase 4 (image pipeline has more invariants to check) or Phase 5 (form has real logic).

## Common Pitfalls

### Pitfall 1: Defining tokens in `tailwind.config.*` instead of `@theme`
**What goes wrong:** v3-style config requires the legacy `@config` directive and splits the source of truth.
**Why it happens:** Most Tailwind tutorials still show v3 patterns.
**How to avoid:** Phase 1 already committed to CSS-first; this RESEARCH.md reinforces it. Planner: do **not** create `tailwind.config.*` in any Phase 2 task.

### Pitfall 2: Preloading every font weight
**What goes wrong:** Browser races to download files before page render, blocking LCP.
**How to avoid:** `preload` only on EB Garamond 400 (the hero h1 font). Inter and the 700-weight Garamond load on-demand. [CITED: studyraid font loading optimization]

### Pitfall 3: Cormorant or Playfair as the only serif
**What goes wrong:** Both fonts are display-only and become unreadable at body sizes. If we adopt one for headings and then need a different family for body, font payload doubles.
**How to avoid:** Pick EB Garamond — designed for both display and text. [CITED: fontalternatives.com]

### Pitfall 4: Sage / olive / muted-green as the accent color
**What goes wrong:** Most muted greens land near 4:1 contrast on cream — failing AA for normal text. Lighthouse contrast audit will dock the score.
**How to avoid:** Use bronze `#6B4423` (7.9:1) or another deep warm tone. If owner insists on a green accent, restrict it to large display text (h2+) only and document the constraint.

### Pitfall 5: Hover animation without reduced-motion fallback
**What goes wrong:** axe + manual a11y review flag uncontrolled transitions; vestibular-disorder users get nauseated.
**How to avoid:** Default-static pattern in §7. Plus the blanket `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms ... } }` as belt-and-braces.

### Pitfall 6: `tailwind-merge` cargo-culted from React tutorials
**What goes wrong:** Adds ~7 KB and a dep tree for zero benefit on a 4-primitive surface.
**How to avoid:** Astro's `class:list` handles every conflict we'd realistically hit. Only add `tailwind-merge` if a primitive grows past 5 variants AND we see conflict bugs.

### Pitfall 7: Styleguide page gets indexed by Google
**What goes wrong:** `/styleguide` shows up in search results; couples land on it instead of the homepage.
**How to avoid:** `<meta name="robots" content="noindex, nofollow">` in the page head AND exclude from `sitemap.xml` when Phase 6 generates one. Document in 02-02 plan.

### Pitfall 8: BaseLayout doesn't support named `head` slots
**What goes wrong:** Styleguide can't inject `<meta robots>` because current BaseLayout's `<slot />` is only in `<body>`.
**How to avoid:** Add `<slot name="head" />` inside `<head>` of BaseLayout as the first task in Plan 02-02 (one-line change).

## Code Examples

(All examples in §1, §2, §3, §5, §7 above are based on verified Astro 6 / Tailwind v4 APIs from official docs. No invented APIs.)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `theme.extend` | CSS `@theme { --color-*: ... }` block | Tailwind v4 (Jan 2025) | Tokens and styles co-located; legacy `@config` still works for migration |
| `@fontsource-variable/inter` npm import in entry CSS | `fontProviders.fontsource()` in `astro.config.mjs` + `<Font cssVariable="..." />` | Astro 6 (Mar 2026) | Auto-fallback metrics, hashed asset URLs, opt-in preload |
| Google Fonts CDN `<link>` | Self-hosted via Astro Fonts API | GDPR + Astro 6 | No third-party request → no IP leak → no cookie banner needed |
| `class-variance-authority` for variants | Plain object lookup + `class:list` | Astro convention | Zero deps, zero KB |

**Deprecated/outdated:**
- `@astrojs/tailwind` integration — used the now-obsolete v3-style config and is incompatible with v4. Phase 1 correctly avoided it.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | EB Garamond exists on Fontsource with `weights: [400, 700], styles: ['normal', 'italic']` | §2 | Low — Fontsource has near-complete Google Fonts coverage; verify with `npm view @fontsource/eb-garamond` if uncertain. Fallback: use `fontProviders.google()` (Astro still downloads at build, still GDPR-safe). |
| A2 | Inter on Fontsource supports weights 400/500/600 | §2 | Low — Inter is one of the most common Fontsource entries |
| A3 | Astro 6 Fonts API `font-display` defaults to `swap` | §2 | Low — confirmed by Astro docs and matches Fontsource convention |
| A4 | `dist/_astro/fonts/` is the actual output path | §2 | Low — confirmed in Astro 6 fonts API docs; planner should verify in first build |
| A5 | Contrast ratios in §4 are computed correctly (manual sRGB → linear → Y) | §4 | Medium — verify each pair with [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/) before final sign-off. Approach is standard but a typo could shift one pair from AA-pass to AA-fail. |
| A6 | `class:list` in Astro deduplicates conflicting Tailwind utilities | §5 | Medium — `class:list` deduplicates **exact-match strings**, not semantic Tailwind conflicts (e.g., it would NOT drop `bg-red` if `bg-cream` was specified later in a different array slot). For our 4 primitives this won't bite. If it does, revisit with `tailwind-merge`. |
| A7 | Astro 6's `<Font />` component is in the stable `astro:assets` module (not behind an experimental flag) | §2 | Low — WebFetch of docs.astro.build/en/guides/fonts/ shows it as a standard guide page, not an experimental flag page. Verify at install with `import { Font } from 'astro:assets'` not throwing. |
| A8 | `--breakpoint-md` can be omitted from `@theme` without breaking the `md:` variant globally | §1 | Low — Tailwind v4 only generates variants for declared breakpoints (or defaults); omitting `--breakpoint-md` in our override could deactivate `md:`. **Planner: verify** — if `md:` is needed anywhere, either keep it OR don't redeclare the others. Safest path: redeclare all three of sm/lg/xl explicitly AND leave Tailwind defaults for md untouched (which means just don't redeclare sm/lg/xl either, since their values match defaults). Document this in the plan. |

**Mitigation for A8:** The requirements explicitly say `≤640 / ≥1024 / ≥1280` — that's the standard `sm` / `lg` / `xl` from Tailwind defaults. We don't actually need to redeclare them in `@theme` because they already match. **Recommend dropping the `--breakpoint-*` overrides entirely** unless the owner later asks for non-standard breakpoints. The current §1 example shows them for documentation clarity; a simpler `@theme` block without breakpoint overrides is equally valid and avoids the A8 risk.

## Open Questions

1. **Should body copy step up to 18px (`1.125rem`) at `sm:` (≥640px) or stay at 16px throughout?**
   - What we know: 18px improves long-form readability on tablet/desktop and is the editorial-magazine convention.
   - What's unclear: Owner may prefer the smaller, denser 16px aesthetic.
   - Recommendation: Ship 16px → 18px (matches §3 table). Easy to revert if owner pushes back during discuss-phase.

2. **Is "EB Garamond + Inter" the right pairing, or does the owner have a specific font preference from the existing Wix site?**
   - What we know: The roadmap leaves font choice to Claude's discretion.
   - What's unclear: Owner-side aesthetic preference.
   - Recommendation: Ship the recommended pair. If owner wants something different, swap is a 4-line change in `astro.config.mjs` — trivial cost.

3. **Should the styleguide page be deleted before launch?**
   - What we know: This RESEARCH recommends keeping it indefinitely behind `noindex`.
   - What's unclear: Owner preference; some teams delete styleguides after the visual language is stable.
   - Recommendation: Keep, noindex, link from a single discreet footer "design system" link or omit from public links entirely. Defer final decision to Phase 6 launch checklist.

4. **Do we need any motion at all on the styleguide?**
   - What we know: DESIGN-05 says animation MUST respect `prefers-reduced-motion`, but doesn't require any animation exist.
   - What's unclear: Should the styleguide demo motion behavior (proving it works) or just ship without motion (simpler)?
   - Recommendation: Include ONE small demo (animated underline on a link, with the reduce-motion neutralization documented inline) so the pattern is testable. Don't add more.

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4.0 — official launch post](https://tailwindcss.com/blog/tailwindcss-v4) — `@theme` directive, CSS-first config
- [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme) — namespace map, override patterns
- [Tailwind CSS Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states) — motion-safe / motion-reduce variants
- [Using custom fonts — Astro Docs](https://docs.astro.build/en/guides/fonts/) — built-in Fonts API, providers, `<Font />` component
- [Astro 6.0 launch announcement](https://astro.build/blog/astro-6/) — Fonts API ships in 6.0
- [Components, Props, and Slots in Astro](https://www.luisllamas.es/en/astro-components-props-slots/) — primitive patterns

### Secondary (MEDIUM confidence)
- [Modern Fluid Typography Using CSS Clamp — Smashing Magazine](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/) — clamp() rationale, accessibility
- [CSS-Tricks — clamp() based on viewport](https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/) — linear scaling math
- [Font Display Strategies — fontfyi](https://fontfyi.com/blog/font-display-strategies/) — swap vs fallback vs optional
- [Fixing Layout Shifts Caused by Web Fonts — DebugBear](https://www.debugbear.com/blog/web-font-layout-shift) — size-adjusted fallback rationale
- [Cormorant Garamond vs Playfair Display comparison](https://fontalternatives.com/compare/cormorant-garamond-vs-playfair-display/) — display-only constraints
- [EB Garamond vs Playfair Display comparison](https://fontalternatives.com/compare/eb-garamond-vs-playfair-display/) — EB Garamond is text-capable
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — verify the §4 ratios before sign-off
- [WCAG 2.1 AA color contrast — DebugBear / Lighthouse audits](https://www.debugbear.com/blog/lighthouse-accessibility) — Lighthouse audit list
- [Lighthouse Accessibility Score Insights — accessibility-test.org](https://accessibility-test.org/blog/testing-tools/lighthouse-accessibility-score-insights-and-limitations/) — focus indicator pitfall
- [Motion Safe and Motion Reduce Modifiers — Epic Web Dev](https://www.epicweb.dev/tips/motion-safe-and-motion-reduce-modifiers) — pattern rationale

### Tertiary (LOW confidence)
- [How to Manage and Preload Local Fonts with Tailwind in Astro — Brazy](https://brazy.one/blog/how-to-manage-and-preload-local-fonts-with-tailwind-in-astro/) — pre-Astro-6 manual-`@font-face` pattern (we are NOT recommending this, but useful as the fallback A1 references)
- [Tailwind v4 Design Tokens Migration Guide — OneMinuteBranding](https://www.oneminutebranding.com/blog/tailwind-v4-design-tokens) — corroborates `@theme` namespace map

## Metadata

**Confidence breakdown:**
- Tailwind v4 token strategy: HIGH — official docs verify every claim, Phase 1 established the convention
- Astro 6 Fonts API: HIGH — official Astro docs verified; one verification-at-install reminder noted (A7)
- Font pair recommendation: MEDIUM-HIGH — based on font specimen comparisons; owner aesthetic might override
- Color palette + contrast: MEDIUM — math is standard but values should be cross-checked with WebAIM contrast checker before sign-off (A5)
- Primitive pattern: HIGH — idiomatic Astro, no novel constructs
- /styleguide gating: HIGH — standard noindex pattern
- Reduced-motion: HIGH — Tailwind variants are well-documented and stable
- Lighthouse a11y checklist: HIGH — matches Lighthouse's documented audit list

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (Astro is fast-moving; Tailwind v4 has stabilized but Astro 6 is recent enough that minor API tweaks remain plausible)
