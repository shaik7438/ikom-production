# IKOM Productions — website

Static site, no build step. Upload the folder contents to any host (Netlify, Vercel, cPanel, S3).

## Structure
- `index.html` — all page content (real HTML text, so search engines read every list and paragraph)
- `assets/css/style.css` — "show night" look: Big Shoulders Display + Instrument Sans (self-hosted in
  `assets/fonts`), house-dark with cobalt and tungsten-amber lighting gels
- `assets/js/main.js` — all interaction: canvas lighting rig in the hero and finale (beams follow the
  pointer, click/tap strobes), cursor follow-light, scroll-speed LED ticker, split-flap title scramble,
  lighting-desk service keys, draggable curved film reel, hover photo previews, follow-spot concert wall
  with house-lights toggle, corporate filters + 3D tilt, flip-board client logos, tilting backstage pass,
  lightbox with keyboard arrows. GSAP ScrollTrigger + Lenis from CDN.
- `assets/img`, `assets/logos` — images extracted from the company profile deck, WebP, SEO file names

## Before going live
1. Replace `https://www.ikomproductions.com` (placeholder domain) in `index.html`, `robots.txt`, `sitemap.xml`.
2. Add real contact details (phone, email, address) — the deck has none. Add `telephone`/`email`/`streetAddress`
   to the JSON-LD block when you do; that unlocks the Google local business panel.
3. Optional: self-host the GSAP/Lenis CDN scripts too.

## SEO included
Title/description, canonical, Open Graph + Twitter card (`assets/img/og-image.jpg`), JSON-LD
(Organization + LocalBusiness, founder Person, WebSite), one H1, ordered H2 sections, descriptive alt text on
every image, width/height on images (no layout shift), lazy loading, robots.txt, image sitemap, web manifest.

## Accessibility / fallbacks
Without JS every section is plain readable HTML. With "reduce motion" on, beams render one still frame
and all scroll animation is skipped. Skip link, keyboard focus, mobile menu with Escape to close.
