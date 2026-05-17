# Features Research — Wedding Photography Sites (2026)

## Recommended Information Architecture

**Single-page scroll with anchored nav** — current 2026 standard for solo wedding photographers with curated portfolios. Section order:

1. **Hero** — full-bleed photo, photographer name + tagline, single CTA ("Enquire")
2. **Portfolio** — the curated gallery (centerpiece)
3. **About** — photographer story, approach, why-choose
4. **Pricing** — packages + what's included
5. **Testimonials** — social proof
6. **Contact** — form + WhatsApp + phone + email
7. **Footer** — social, copyright, privacy policy link

Sticky top nav with smooth-scroll anchors. Single `/` URL for SEO simplicity. Keep `/privacy` as a separate route for legal clarity.

**Rationale for single-page over multi-page:**
- Owner has <50 photos and 1 wedding photographer story to tell — multi-page artificially fragments thin content
- Couples on mobile scroll-research; tap-back-tap-back across 5 pages causes drop-off
- Single page concentrates SEO authority on `/`
- Easier to maintain (one route, one source of truth for ordering)

## Table Stakes (users expect — missing = lose enquiry)

- **Hero with a stunning photo** — first frame must do 80% of the persuasion
- **Visible pricing range** — "Coverage from €X" — qualified-lead filter, prevents tire-kickers and improves conversion of serious enquiries
- **Mobile-perfect** — 60%+ of wedding photographer traffic is mobile; <3s load on 4G
- **Working contact form + WhatsApp link** — friction kills enquiries
- **Phone number visible** — older parents-of-couple call directly
- **Real photos at scale** — minimum 30 portfolio shots; couples need to see breadth/consistency
- **About with face** — couples hire a person, not a brand. Photo of the photographer required
- **Testimonials with names** — anonymous quotes are penalized as fake
- **Instagram link** — couples sanity-check on Instagram before enquiring

## Differentiators (2026 leading-edge)

- **Oversized editorial typography** — viewport-relative serif headings (clamp(2.5rem, 8vw, 7rem)), Vogue-style
- **Muted/film palette** — cream, sage, terracotta, charcoal; avoid pure white-on-black
- **Cinematic full-bleed hero** with slow Ken-Burns zoom (subtle, prefers-reduced-motion respected)
- **Per-wedding case study pages** (deferred — owner declined for v1, but flag for v2)
- **Pricing transparency** — show actual starting price, not "POA"
- **Process / what-to-expect section** — booking → engagement → wedding day → delivery timeline

## Gallery Layout Recommendation

**Justified grid (Flickr-style)** for the portfolio, with **lightbox** on click.

- Even rows, varied widths preserving aspect ratios — handles mix of portrait + landscape gracefully (weddings = both)
- More photo-density than masonry; couples want to see lots of work fast
- Lightbox swipe-through on mobile, arrow-key on desktop
- Lazy-load below the fold (NOT above the fold — see PITFALLS.md)

Reject:
- Carousel — hides 90% of the work behind interaction; current Wix uses this, it's why redesign is needed
- Full-bleed scroll-slideshow — beautiful but slow to digest 30+ photos
- Masonry — Pinterest-y, dates the site; justified grid feels more editorial

## Anti-Features (do NOT build)

- Music auto-play
- Cookie banner (using cookieless analytics so we skip this entirely)
- Splash page / intro animation
- Live chat widget — wedding enquiries are async, chat is friction
- Newsletter signup — irrelevant for one-off wedding service
- Login / client area — out of scope, gallery delivery is via external Pixieset
- Date-picker calendar showing availability — implies guarantees you cannot reliably keep
- Auto-translated language switcher (English only confirmed)

## Sources

- [Wedding Photography Websites: 25+ Beautiful Examples 2026](https://www.sitebuilderreport.com/inspiration/wedding-photography-websites)
- [17 Excellent Wedding Photography Websites 2026 - Colorlib](https://colorlib.com/wp/wedding-photography-websites/)
- [Wedding Photography Website Design That Converts Inquiries in 2026](https://onewebcare.com/blog/wedding-photography-website-design/)
