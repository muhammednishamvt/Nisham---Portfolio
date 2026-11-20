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
assets/js/fx.js           Second motion layer: contour field, scramble text, scroll skew, tilt, progress line
favicon.ico / favicon.png / apple-touch-icon.png   Site icon (orange N mark on black, from Nisham's LOGO.png)
vercel.json           cleanUrls, no trailing slash; CSS/JS revalidate on every load, images cache for a day
```

Each page repeats the same shared blocks: the chrome (cursor, curtain, nav, menu button, slide-in menu) at the top of `<body>` and the footer at the bottom. **When you change the nav, menu or footer, change it in all five HTML files.** Grep for `class="p-chrome"` / `class="p-footer"`.

## Conventions

- Class prefix `p-` for everything. Component classes are flat (`p-work-row`, `p-work-title`), not BEM.
- Behaviour hooks are `data-*` attributes, not classes:
  - `data-reveal` fades and lifts in on scroll; `data-split` is a word-by-word heading reveal; `data-clip` is an image clip-reveal.
  - `data-magnetic` makes an element lean toward the cursor; `data-roll` gives text that rolls up on hover. Use it only on links whose content is plain text.
  - `data-parallax="0.1"` sets parallax strength on an image's inner layer; `data-marquee` marks the scrolling name strip.
  - `data-preview-index="n"` shows slide n of a hover preview (`.p-preview-slide` order must match). Add `data-preview-for="name"` to target a `.p-preview` with `data-preview="name"` (default is the work preview), and `data-cursor="Label"` to change the cursor circle text (default "View"). Home has two previews: the work list (landscape) and `data-preview="me"` (vertical 3:4 portrait card, triggered by hovering the blurred hero photo, cursor "Hello"). Previews stay inside the viewport and below the nav. Add `data-preview-touch` to a trigger to make it work on touch screens too: touching shows the card just above the finger, it follows the finger (scrolling still works), and it hides 0.9s after release. The hero photo has it; the portrait card is 300×400 on desktop, 220×293 on tablet (≤991px) and 168×224 on phone (≤767px).
  - `data-cat` / `data-filter` / `data-view` / `data-view-panel` drive the Work page filters and list/grid toggle.
  - `data-clock` shows the live Kochi time (IST).
  - `data-field="1"` turns a section into a live WebGL contour field (topographic lines in `--color-border` / `--color-text-muted` that drift slowly; lines near the pointer or finger warm to `--color-primary`). The value is line strength: the home hero uses 1, the footer 0.55. On phones (≤767px) the hero hides its field and stays solid `--color-bg` under the photo; the footer keeps it. Colours are read from the tokens at runtime. Without WebGL the section just shows `--color-bg`; with reduced motion it draws one still frame.
  - `data-scramble` decodes text from random glyphs when it scrolls into view (eyebrows, meta labels, service and field numbers). Use it only on elements with plain text and no children. Put `data-scramble-host` on a parent to replay it on hover (the service blocks do this).
  - `data-skew` leans a container with scroll speed (max 3°): work list, work grid, services.
  - `data-tilt` tilts a card's `.p-card-media` toward the pointer (work grid cards).
- Buttons: `p-btn-circle` (primary, orange, the one main action per screen) and `p-btn-pill` (secondary, outline). Both contain `<span class="p-fill">` / `<span class="p-fill-light">` + `<span class="p-btn-label">` for the hover wipe.
- Orange (`--color-primary`, #FF4D00) is only for actions, links, focus and the cursor. The one deliberate exception is the asterisk separators in the hero marquee (`assets/img/sign.webp`, Nisham's own mark, in its own orange).
- The desktop cursor is Nisham's bitcoin coin (`assets/img/cursor-btc.webp`, cut to a circle from his BTC.png): 24px at rest, 44px over links and buttons, and a solid orange 96px circle with its label ("View" / "Hello") over previews. On mouse/trackpad screens (`html.p-fine`) every native cursor is hidden (`cursor: none` on everything in `motion.css`), so the coin is the only pointer; it still follows the mouse, without easing, when reduced motion is on. Touch screens keep their normal behaviour. It replaces every system cursor (arrow, hand, text beam) through `html.p-nocursor`, which `fx.js` sets for mouse/trackpad only and not under reduced motion (the custom cursor doesn't move then, so the system cursor stays). It replaces every system cursor: `fx.js` adds `html.p-nocursor` (fine pointers, motion allowed) and `motion.css` sets `cursor: none` on everything. With reduced motion, or without JS, the normal system cursors come back, because the custom one would not follow the mouse.
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

`assets/js/fx.js` loads after it (its own IIFE, same `RM` / fine-pointer rules) and runs the contour fields, scramble, skew, tilt and the `.p-progress` reading line (first child of `.p-chrome`, `--color-text` at 50%). `motion.css` also adds a site-wide film grain (`body::after`, 5% opacity, still under reduced motion), the hover outline on marquee words and the service hover (rule draws in, title nudges).

Rules: always respect `prefers-reduced-motion` (JS checks the `RM` flag; CSS has a reduce block in `motion.css`). Touch devices get no custom cursor, preview follower or magnetic effect (`html.p-fine` gates them). Keep keyboard parity: every hover effect has a `:focus-visible` twin.

## Contact form

There's no backend. On submit, `site.js` validates the form, then opens a `mailto:` to the address in `data-mailto` on `#contact-form`, with the fields as the body, and shows `.p-form-done`. To collect submissions properly, point the form at a form service (e.g. Formspree or Basin): set `action` and `method="post"`, then remove the `submit` handler in `site.js` or change it to `fetch()`.

## Real content so far

- Contact: muhammednishamvt@gmail.com and +91 87926 39660 (footer on every page, contact page, `data-mailto`).
- Socials: X (https://x.com/Nisham_vt) and Reddit (https://www.reddit.com/user/Nishamvt/), opening in a new tab. Instagram is coming later; add it to the `.p-socials` lists (menu, footer, contact) on all five pages when it exists. No LinkedIn or Behance for now.
- Home: hero line, intro paragraph and the three service descriptions are real copy.
- Home hero: split layout. Left: arrow, round avatar (`.p-avatar`) and "Creative Head / Brand & Growth". Right: portrait photo, lightly blurred (7px, `.p-hero-media .p-cover-img`), with top and bottom scrims (`.p-hero-media::after`) so the nav and marquee stay legible over the light snow. The marquee reads "Discover ✱ Design ✱ Direct ✱ Deploy" (each word is a `.p-marquee-item`; the separator is a `.p-marquee-sep` holding the asterisk image; the set appears twice so the loop is seamless). Base speed is set in `site.js` (`mqx += dir * (1.1 + vel * 0.25)`), and scrolling still pushes it faster and flips its direction.
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
