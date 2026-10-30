# DESIGN.md — Nisham · Creative Head portfolio

**Site:** static HTML/CSS/JS, hosted on Vercel. Tokens live in `assets/css/tokens.css`.
**Audience:** clients who might hire Nisham for brand, creative direction and growth work
**Feeling:** bold and modern. Big type, hard edges, one hot colour, lots of black. Confident, not loud.

Dark is the default theme. Light mode exists for case-study pages that need long reading or bright photography.

---

## 1. Colour

One neutral scale, one primary, no accent. The orange carries every action. The one deliberate exception is the × separators in the hero marquee, which use it as a signature detail.

| Token | Dark (default) | Light | Role |
|---|---|---|---|
| `color/bg` | `#0E0D0B` | `#F4F1EA` | Page background |
| `color/surface` | `#171613` | `#FFFFFF` | Cards, form fields, nav on scroll |
| `color/surface-2` | `#24221E` | `#E9E4DA` | Hover surfaces, tags, code |
| `color/border` | `#33302B` | `#D6D0C4` | Dividers, card outlines, input borders |
| `color/text` | `#F4F1EA` | `#0E0D0B` | Headings and body text |
| `color/text-muted` | `#9C968C` | `#5E5950` | Captions, meta, secondary copy |
| `color/primary` | `#FF4D00` | `#B84C15` | Primary buttons, links, focus ring, active nav |
| `color/primary-hover` | `#FF7033` | `#9A3F11` | Hover state of anything primary |
| `color/on-primary` | `#0E0D0B` | `#FFFFFF` | Text on a primary button |
| `color/success` | `#3DBE7A` | `#1E7A4A` | Form sent, confirmations |
| `color/warning` | `#F2B233` | `#8A5A00` | Soft warnings |
| `color/error` | `#FF6B81` | `#C0213D` | Form errors |

Why orange: it reads warm and Kerala-rooted (chilli, laterite, terracotta) without leaning on regional clichés, and it stands apart from the blue/purple most portfolios default to.

**Measured contrast** (WCAG, against `color/bg` unless noted)
Dark — text 17.2 · muted 6.6 · muted on surface-2 5.4 · primary 5.8 · on-primary on primary 5.8 · on-primary on hover 7.1 · success 8.2 · warning 10.4 · error 7.1
Light — text 17.2 · muted 6.2 · primary 4.6 · white on primary 5.1 · success 4.7 · warning 5.3 · error 5.3
All pass AA for body text. Keep light-mode `color/primary` for links and buttons only, never for small muted text.

---

## 2. Typography

| Role | Family | Weights |
|---|---|---|
| Display / headings | **Clash Display** (Fontshare, free for commercial use) | 400, 500 |
| Body / UI | **Inter Tight** (Google Fonts) | 400, 500 |

Headings are tight and big; body is plain and readable. No third font, no italic display.

| Token | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `type/display` | 160 / 104 / 64px | 0.9 | -0.03em | Hero name / statement, one per page |
| `type/h1` | 80 / 60 / 44px | 1.0 | -0.02em | Page titles |
| `type/h2` | 52 / 42 / 32px | 1.05 | -0.015em | Section titles |
| `type/h3` | 28px | 1.15 | -0.01em | Case-study card titles |
| `type/h4` | 22px | 1.25 | 0 | Small headings, nav wordmark |
| `type/body-lg` | 20px | 1.5 | 0 | Intros, case-study lead paragraph |
| `type/body` | 17px | 1.6 | 0 | Default body |
| `type/small` | 14px | 1.45 | 0.01em | Meta, captions, tags (tags uppercase +0.08em) |

Sizes written as three values are desktop / tablet (≤991px) / mobile (≤767px), switched by media queries in `tokens.css`.

Body lines stay between 60 and 75 characters: `size/measure` = 68ch.

---

## 3. Spacing and layout

8-based scale, used everywhere:

`space/1` 4 · `space/2` 8 · `space/3` 16 · `space/4` 24 · `space/5` 32 · `space/6` 48 · `space/7` 64 · `space/8` 96 · `space/9` 128 · `space/10` 160

- **Section spacing:** `space/9` (128px) top and bottom on desktop, `space/7` (64px) on mobile.
- **Content width:** `size/container` 1280px, side gutter `space/5` desktop / `space/3` mobile.
- **Text measure:** `size/measure` 68ch.
- **Grid:** 12 columns, 24px gap. Work grid alternates 7/5 and 5/7 spans rather than equal thirds.
- Left-align by default. Centre only the final contact CTA.

---

## 4. Shape and depth

- **Radius:** `radius/none` 0 for images, cards and sections (hard edges are part of the look). `radius/pill` 999px for buttons and tags only. Nothing in between.
- **Shadows:** none. Depth comes from `color/surface` steps and 1px `color/border` lines.
- **Motion:** 250ms ease-out for hovers; image zoom on card hover max 1.04. Respect reduced-motion.

---

## 5. Components

**Buttons** (pill, 16px/28px padding, Inter Tight 500, 16px)
- *Primary* — `color/primary` fill, `color/on-primary` text. Hover → `color/primary-hover`. One per screen: "Start a project" / "Let's talk".
- *Secondary* — transparent, 1px `color/text` border, `color/text` label. Hover → fill `color/text`, label `color/bg`.
- *Quiet* — text only with → arrow, `color/text`; arrow nudges 4px on hover.
- *Focus (all)* — 2px `color/primary` outline, 3px offset.
- *Disabled (all)* — 40% opacity, no hover, `cursor: not-allowed`.

**Links** — inline links underline at 1px with 4px offset in `color/primary`; hover thickens to 2px.

**Inputs** — `color/surface` fill, 1px `color/border` bottom line only, 56px tall, label above in `type/small` muted. Focus → bottom line `color/primary`. Error → bottom line and message in `color/error`.

**Case-study card** — full-bleed image (4:3 or 16:10, radius 0), then index number in muted (`01`), title in `type/h3`, discipline tags as pills on `color/surface-2`. Whole card is the link; hover zooms the image and turns the title `color/primary`.

**Tags** — pill, `color/surface-2` fill, `type/small` uppercase, 6px/12px padding.

**Navigation** — wordmark "Nisham" left (Clash Display 500, `type/h4`); right side: Work · About · Contact, then a primary "Let's talk" button. Transparent over the hero, `color/surface` once scrolled. Mobile: full-screen menu on `color/bg` with links at `type/h2`.

**Footer** — huge closing line at `type/display` ("Let's make something worth talking about."), primary button, email, then a single row of socials and © in `type/small` muted, separated by a `color/border` line.

---

## 6. Imagery and icons

- **Photos:** real work only: brand shoots, packaging, social campaigns, kitchen and food photography from client projects. Full-bleed, no rounded corners, no overlays except a 40% `color/bg` scrim when type sits on an image.
- **Portrait:** one strong, high-contrast portrait on About; black-and-white is fine against the dark theme.
- **Icons:** Phosphor, Regular weight, 20px or 24px, `currentColor`. Used sparingly: arrows, socials, email.
- **No:** stock photos, emoji as icons, gradients, glassmorphism, gradient text, three identical feature cards.

---

## 7. Page map

`/` Home · `/work` Work · `/about` About · `/contact` Contact · `404.html`
