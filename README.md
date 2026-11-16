# IKOM Productions — website

Static, single-page site for IKOM Productions, a Bangalore event and production house (est. April 2015).
No build step: every file in this folder is served as-is.

Live: https://ikom-production.vercel.app — every push to `main` redeploys automatically on Vercel.

## Structure
- `index.html` — all page content as real HTML text (good for SEO), plus meta/Open Graph tags and
  JSON-LD structured data (Organization, LocalBusiness, Person, WebSite).
- `assets/css/style.css` — black-and-gold "awards night" theme: Playfair Display headings and Jost body
  text (both self-hosted in `assets/fonts`), metallic gold headings, gold hairline frames.
- `assets/js/main.js` — all interaction: art-deco gold sunburst, rings and drifting gold dust in the hero,
  gold shine across the logo, stage lights in the finale, scroll animations, service cards, film reel,
  artist slider, concert wall, corporate filters, flip-board client logos, director pass, lightbox, and
  the contact form. GSAP + ScrollTrigger and Lenis load from CDN.
- `assets/img`, `assets/logos` — WebP photos and client logos with descriptive, SEO-friendly file names.
- `robots.txt`, `sitemap.xml` (with image entries), `site.webmanifest`, `vercel.json` (caching and
  security headers).

## Page sections
Hero · Company profile · We specialize in · Movie promotions · Brand launch / Artist management slider ·
Concerts & stand-up · RCB x TGS · Corporate · World Yoga Day & Yoga Ratna Awards · Clients ·
About the director · Contact · Finale · Footer.

## Still to do before launch
1. Replace the placeholder domain `https://www.ikomproductions.com` in `index.html`, `robots.txt` and
   `sitemap.xml` with the real domain.
2. Replace the placeholder enquiry email `info@ikomproductions.com` in the Contact section
   (`data-email` on `#contact` and the `mailto:` link).
3. Confirm the Instagram and Facebook links in the footer (currently `/ikomproductions/` on both).
4. Optional: send form enquiries straight to an inbox (e.g. Formspree) instead of opening the
   visitor's email app.

## Run locally
Open `index.html` in a browser, or serve the folder: `npx serve .`
