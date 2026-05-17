# Pitfalls Research — Wedding Photographer Sites + Wix Migration

## Critical (will silently kill enquiries if missed)

### P1. LCP killed by oversized hero image
- **Symptom**: Hero photo is the LCP element on ~70% of photo sites. A 5 MB JPEG hero → 4–8s LCP on mobile 4G → Google flags as "Poor" → SEO drop + bounce rate spike.
- **Prevention**: Hero ≤200 KB AVIF, served at responsive widths via `<Picture>`. Add `<link rel="preload" as="image" fetchpriority="high">`. Never `loading="lazy"` the hero. Test on real device, not just localhost.
- **Phase**: Phase 4 (image pipeline) and Phase 7 (launch CWV audit).

### P2. Lazy-loading the wrong images
- **Symptom**: Devs reflexively add `loading="lazy"` everywhere including above the fold. Slows down LCP because browser delays the hero download.
- **Prevention**: Only `loading="lazy"` images BELOW the initial viewport. Hero + first row of gallery = eager.

### P3. DNS cutover breaks email
- **Symptom**: Owner switches nameservers to Cloudflare without first copying existing MX records. Gmail / Google Workspace / Wix mail stops delivering — couples emailing klphotography.ie@klphotography.ie get bounces.
- **Prevention**: Before flipping nameservers, dump current zone (`dig klphotography.ie ANY`, check MX/TXT/SPF/DKIM). Recreate all non-A records in Cloudflare BEFORE pointing nameservers. Verify email round-trip after cutover.
- **Phase**: Phase 7 (launch cutover) — explicit pre-flight checklist.

### P4. Resend "from" domain not verified
- **Symptom**: Pages Function tries to send enquiry email from `noreply@klphotography.ie` but Resend rejects because DKIM/SPF not set up.
- **Prevention**: Add Resend's DKIM CNAMEs and SPF TXT in Cloudflare DNS, wait for Resend dashboard to show "Verified" (5–60 minutes), then deploy. Until then, send from Resend's `onboarding@resend.dev` shared domain as fallback.

### P5. Turnstile secret leaked in client bundle
- **Symptom**: Dev accidentally references `TURNSTILE_SECRET_KEY` from client-side Astro code → secret in `dist/` → secret on public CDN.
- **Prevention**: Secret ONLY in Pages Function env vars. Client only ever sees `PUBLIC_TURNSTILE_SITE_KEY` (Astro `PUBLIC_*` convention). Lint/grep `dist/` for `TURNSTILE_SECRET` before launch.

## Important (degrades quality, recoverable)

### P6. .ie cannot move to Cloudflare Registrar
- **Symptom**: Owner reads "transfer to Cloudflare" docs, tries the .ie domain, fails, gets stuck.
- **Prevention**: Already captured in PROJECT.md. Keep registration at current IEDR-accredited registrar. Only delegate nameservers.

### P7. Image originals bloat git history
- **Symptom**: Repo grows multi-GB because every photo iteration is committed. CF Pages build slows down. Clone takes forever.
- **Prevention**: If total originals > ~200 MB, use Git LFS for `src/assets/portfolio/*.jpg`. Or store originals in R2 and pull during build. For ~50 curated images this is likely unnecessary; just keep them well-compressed JPEGs (quality ~85, ~1–2 MB each = ~50–100 MB total, fine for git).

### P8. CLS from images without dimensions
- **Symptom**: Gallery thumbnails pop in as they load, pushing text around. CLS score tanks.
- **Prevention**: Always use Astro `<Image>` / `<Picture>` (auto-sets width/height) or hand-write `width`/`height` attributes. Container reserves space.

### P9. Hard-coded image paths in markdown break in build
- **Symptom**: Photographer adds a photo to a section by referencing `/portfolio/new.jpg` directly → bypasses Astro's image pipeline → ships an unoptimized full-size JPEG.
- **Prevention**: Document the gallery-update workflow clearly in README. All photos go through `src/assets/` and `<Image>` component, never `public/` for portfolio photos.

### P10. Wix exit lock-in on content
- **Symptom**: Owner thinks they can later need a Wix asset that wasn't copied over.
- **Prevention**: Before canceling Wix, archive a full HTML export and a CSV of every form submission ever received. Keep for 1 year. Already mitigated by "Photos local — no scrape" but capture testimonial text and contact-form history.

## Lesser (polish issues)

### P11. Missing alt text → accessibility lawsuit risk in EU
- **Prevention**: Every `<Image>` requires `alt` attribute. Gallery JSON metadata schema must include `alt` as required field. CI lint to fail build if missing.

### P12. Privacy policy too generic
- **Symptom**: Cookie-cutter privacy policy that mentions cookies and trackers the site doesn't use — confuses and undermines GDPR posture.
- **Prevention**: Write it to match actual data flow: name/email submitted via contact form → forwarded to Gmail via Resend → stored in Gmail. No cookies (Cloudflare Web Analytics is cookieless). Cite Data Protection Commission (DPC) Ireland references.

### P13. Photographer cannot test contact form without spamming themselves
- **Prevention**: Add `STAGE=dev` env var pattern — in dev/preview deployments, form goes to a test inbox or just logs. Only production deploy emails the real address.

### P14. No fallback when Resend free tier exceeded
- **Symptom**: Spike in spam consumes the 3,000 emails/mo free quota; legitimate enquiries silently fail.
- **Prevention**: Turnstile makes this unlikely. As insurance: monitor Resend dashboard; if quota nears, paid tier is $20/mo for 50k emails. Pages Function returns 503 + logs to CF Logs if Resend rejects.

## Sources

- [How to Optimize Website Images: The Complete 2026 Guide](https://requestmetrics.com/web-performance/high-performance-images/)
- [LCP Image Optimization for Enhanced SEO](https://www.quattr.com/core-web-vitals/lcp-image-optimization)
- [Fix your website's Largest Contentful Paint by optimizing image loading | MDN](https://developer.mozilla.org/en-US/blog/fix-image-lcp/)
- [How to optimize photography website images for SEO in 2026](https://jestfocus.com/how-to-optimize-photography-website-images-for-seo-in-2026/)
