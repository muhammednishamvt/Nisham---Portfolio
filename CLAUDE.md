# CLAUDE.md — Nisham portfolio

Personal portfolio for Nisham, Creative Head (brand, creative direction, growth), based in Kochi, Kerala. Audience: clients who might hire him. Feeling: bold, modern, minimal, dark-first, with micro-animations throughout.

Plain static site: HTML, CSS and vanilla JS. Smooth scroll uses Lenis 1.1.13 (MIT) from jsDelivr, pinned with an integrity hash; the site works without it. No framework, no build step, no package manager. Hosted on Vercel (team "Southery", project `nisham-portfolio`).

## Read first

- `DESIGN.md`: the design system (colour roles, type scale, spacing, shape, components, imagery rules). Every visual decision follows it.
- `assets/css/tokens.css`: the same decisions as CSS custom properties. Use token names, never raw hex, px font sizes or ad-hoc spacing.

## Structure

```
index.html            Home: greeting curtain, hero + name marquee, intro, recent work, services
work/index.html       Work: filter chips, list/grid toggle, hover preview follower
about/index.html      About: statement, bio + portrait, approach 01–03, quick facts
contact/index.html    Contact: numbered form + contact details
404.html              Not-found page
assets/css/tokens.css     Design tokens (colour, type, spacing, radius); responsive type steps
assets/css/site.css       Layout and component styles (p-* classes)
assets/css/motion.css     Hover, reveal, curtain, menu, cursor states; reduced-motion overrides
assets/js/site.js         All behaviour (see "Motion system")
favicon.svg
vercel.json           cleanUrls, no trailing slash; CSS/JS revalidate on every load, images cache for a day
```

Each page repeats the same shared blocks: the chrome (cursor, curtain, nav, menu button, slide-in menu) at the top of `<body>` and the footer at the bottom. **When you change the nav, menu or footer, change it in all five HTML files.** Grep for `class="p-chrome"` / `class="p-footer"`.

## Conventions

- Class prefix `p-` for everything. Component classes are flat (`p-work-row`, `p-work-title`), not BEM.
- Behaviour hooks are `data-*` attributes, not classes:
  - `data-reveal` fades and lifts in on scroll; `data-split` is a word-by-word heading reveal; `data-clip` is an image clip-reveal.
  - `data-magnetic` makes an element lean toward the cursor; `data-roll` gives text that rolls up on hover. Use it only on links whose content is plain text.
  - `data-parallax="0.1"` sets parallax strength on an image's inner layer; `data-marquee` marks the scrolling name strip.
  - `data-preview-index="n"` is a work row that shows slide n in the hover preview (`.p-preview-slide` order must match).
  - `data-cat` / `data-filter` / `data-view` / `data-view-panel` drive the Work page filters and list/grid toggle.
  - `data-clock` shows the live Kochi time (IST).
- Buttons: `p-btn-circle` (primary, orange, the one main action per screen) and `p-btn-pill` (secondary, outline). Both contain `<span class="p-fill">` / `<span class="p-fill-light">` + `<span class="p-btn-label">` for the hover wipe.
- Orange (`--color-primary`) is only for actions, links, focus and the cursor. Never decorative.
- Hard edges (radius 0) on images, cards and sections; pills only on buttons, chips and tags. No shadows, no gradients.
- Copy is British/Indian English ("organisation", "colour").

## Motion system (`assets/js/site.js`)

One IIFE that exits early on pages without `.p-page`. In order, it handles:
1. Marking the current nav link with `aria-current="page"`.
2. Wrapping `[data-roll]` text for the roll effect, with a duplicate hidden from screen readers.
3. Splitting `[data-split]` headings into words, keeping an `.p-sr` copy of the full sentence for screen readers.
4. An IntersectionObserver that adds `.is-in` to reveal elements.
5. The curtain. It plays the multilingual greeting on the first Home visit per session and shows the page name otherwise. It lifts by adding `html.p-loaded`, and a 4s fallback in `<head>` guarantees it lifts even if JS fails.
6. Page-leave transition: same-origin link clicks drop the curtain, then navigate.
7. The menu: open/close, focus trap, Escape closes, `inert` when closed, scrim click closes.
8. Magnetic hover, only for fine pointers with motion allowed.
9. One `requestAnimationFrame` loop for Lenis, the cursor, the preview follower, the marquee (direction follows scroll) and parallax.
10. Work filters and the list/grid toggle.
11. The contact form, which opens the visitor's mail app (see below).
12. The Kochi clock.

Rules: always respect `prefers-reduced-motion` (JS checks the `RM` flag; CSS has a reduce block in `motion.css`). Touch devices get no cursor, preview follower or magnetic effect (`html.p-fine` gates them). Keep keyboard parity: every hover effect has a `:focus-visible` twin.

## Contact form

There's no backend. On submit, `site.js` validates the form, then opens a `mailto:` to the address in `data-mailto` on `#contact-form`, with the fields as the body, and shows `.p-form-done`. To collect submissions properly, point the form at a form service (e.g. Formspree or Basin): set `action` and `method="post"`, then remove the `submit` handler in `site.js` or change it to `fetch()`.

## Real content so far

- Contact: muhammednishamvt@gmail.com and +91 87926 39660 (footer on every page, contact page, `data-mailto`).
- Socials: X (https://x.com/Nisham_vt) and Reddit (https://www.reddit.com/user/Nishamvt/), opening in a new tab. Instagram is coming later; add it to the `.p-socials` lists (menu, footer, contact) on all five pages when it exists. No LinkedIn or Behance for now.
- Home: hero line, intro paragraph and the three service descriptions are real copy.
- Home hero: split layout. Left: arrow, round avatar (`.p-avatar`) and "Creative Head / Brand & Growth". Right: portrait photo with top and bottom scrims (`.p-hero-media::after`) so the nav and marquee stay legible over the light snow. The marquee reads "Discover × Develop × Design × Direct × Deploy" (each word is a `.p-marquee-item`, the × is a muted `.p-marquee-sep`; the set appears twice so the loop is seamless). Base speed is set in `site.js` (`mqx += dir * (1.1 + vel * 0.25)`), and scrolling still pushes it faster and flips its direction.
- Photos: `assets/img/portrait-900.webp` / `portrait-1600.webp` (3:4, used in the home hero and About portrait via `srcset`) and `avatar-256.webp` / `avatar-512.webp` (square, shown as a circle). All are cut from one source photo upscaled 4x with EDSR (OpenCV dnn_superres), with light sharpening. The source is only 736px wide, so a higher-resolution original would look better on large retina screens. Replace the files, keeping the same names and aspect ratios.

## Placeholders still to replace (all marked)

- Project names "Project One…Six", services and years `20XX`, `href="#"` project links, and the grey numbered image blocks (`.p-card-inner`, `.p-preview-slide`). Nisham will supply the projects.

- About page: all lorem ipsum (statement, bio, "How I work" steps) and the "OPEN TO / Lorem ipsum" fact. Nisham will write the About copy himself.
- Work page heading ("Selected work, lorem ipsum…").
- When adding images, put them inside the existing inner layers (`.p-hero-media-inner`, `.p-portrait-inner`, `.p-card-inner`, `.p-preview-slide`) as `<img>` with `object-fit: cover; width: 100%; height: 100%`, so the reveal, parallax and zoom keep working. Always write real alt text.

Never invent testimonials, client logos, metrics or awards. Ask Nisham for them or leave a marked placeholder.

## Local preview

```
python3 -m http.server 8000
```
Open http://localhost:8000. Clean URLs like `/work` resolve via folder `index.html`; on Vercel `cleanUrls` handles it.

## Deploy

The project is `nisham-portfolio` on the Vercel team "Southery", a static deploy with no build command and output at the repo root.
- With the Vercel CLI: `vercel deploy --prod` from this folder.
- Or connect a Git repo to the project in the Vercel dashboard and push.

## Before shipping a change

- Bump the `?v=` value on the CSS/JS links in all five HTML files whenever CSS or JS changes, so browsers never pair new HTML with an old stylesheet.

- Check phone (390px), tablet (820px) and desktop (1440px): no horizontal scroll, nothing clipped.
- Tab through every page: visible orange focus ring, menu focus trap, Escape closes the menu.
- Turn on reduced motion: content is visible immediately, no curtain wait.
- Text contrast stays at least 4.5:1 (all token pairs in DESIGN.md are already measured).
