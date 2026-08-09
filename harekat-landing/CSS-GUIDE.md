# CSS Style Guide — `index.css`

> Tailwind CSS + custom design tokens. This guide explains every color, token, layout primitive, and utility defined in `src/index.css` and how/when to use them.

---

## 1. Quick start

```css
@import "node_modules/tailwindcss/dist/lib.d.mts";
```

All custom tokens live inside the `@theme` block and `:root` / `.dark` media blocks. They are consumed via CSS `var(--...)` and Tailwind’s `theme()` function, or directly as Tailwind classes (see [Extending Tailwind](#extending-tailwind-config)).

---

## 2. Color system

### 2.1 Brand — Warm Creative Orange

Used for primary accents, links, CTA buttons, and highlights throughout the site.

| Token               | Value     | Usage                                   |
|---------------------|-----------|-----------------------------------------|
| `--color-brand-50`  | `#fff8ed` | Subtle backgrounds, tinted cards          |
| `--color-brand-100` | `#ffefd3` | Soft fills, hover states                |
| `--color-brand-200` | `#ffdda8` | Selected states, badges                 |
| `--color-brand-300` | `#ffc273` | Medium emphasis, progress indicators    |
| `--color-brand-400` | `#ffa33f` | Buttons, icons, active states           |
| `--color-brand-500` | `#f47c20` | **Primary brand** — main CTA, links     |
| `--color-brand-600` | `#df5b13` | Hover states, stronger emphasis         |
| `--color-brand-700` | `#b94410` | Active pressed state                    |
| `--color-brand-800` | `#943816` | High contrast text                      |
| `--color-brand-900` | `#783016` | Footers, deep backgrounds               |
| `--color-brand-950` | `#401507` | Deepest brand tone                      |

---

### 2.2 Neutral Ink

Grayscale used for all typography, borders, and neutral UI surfaces.

| Token             | Value     | Usage                                   |
|-------------------|-----------|-----------------------------------------|
| `--color-ink-50`  | `#f7f7f5` | Page backgrounds, subtle cards         |
| `--color-ink-100` | `#ededeb` | Elevated surfaces                       |
| `--color-ink-200` | `#deded9` | Borders, dividers, input backgrounds    |
| `--color-ink-300` | `#c8c8c1` | Disabled controls, subtle outlines      |
| `--color-ink-400` | `#9b9b92` | Placeholder text, icon-muted            |
| `--color-ink-500` | `#72726a` | Secondary text, captions, meta info     |
| `--color-ink-600` | `#55554f` | Body copy, subtitles                    |
| `--color-ink-700` | `#3d3d39` | Headings, prominent text              |
| `--color-ink-800` | `#292927` | Page headings, strong text              |
| `--color-ink-900` | `#1b1b19` | Dark mode headings                     |
| `--color-ink-950` | `#10100f` | Dark mode background                   |

---

### 2.3 Creative Blue

Accent blue used for interactive elements that should not be confused with primary actions (e.g., secondary links, info sections, decorative UI).

| Token               | Value     | Usage                                   |
|---------------------|-----------|-----------------------------------------|
| `--color-electric-50`  | `#eefaff` | Light blue-tinted backgrounds         |
| `--color-electric-100` | `#d9f4ff` | Soft fills, hover states              |
| `--color-electric-200` | `#b9eaff` | Badges, tags                           |
| `--color-electric-300` | `#87dcff` | Icons, decorative accents             |
| `--color-electric-400` | `#4cc9ff` | Active icons, highlights              |
| `--color-electric-500` | `#18adf0` | **Primary blue** — links, secondary CTA |
| `--color-electric-600` | `#078dca` | Hover states                            |
| `--color-electric-700` | `#0871a4` | Pressed state                           |
| `--color-electric-800` | `#0b5d86` | Dark mode text                          |
| `--color-electric-900` | `#104e6f` | Deep blue text                          |
| `--color-electric-950` | `#0a3149` | Brand blue, footer text                 |

---

### 2.4 Creative Violet

Accent violet used sparingly for promotional badges, special tags, and decorative gradients.

| Token             | Value     | Usage                                    |
|-------------------|-----------|------------------------------------------|
| `--color-violet-50`  | `#f8f5ff` | Light violet backgrounds, tints        |
| `--color-violet-100` | `#eee8ff` | Hover states, soft fills               |
| `--color-violet-200` | `#ddd1ff` | Badge backgrounds                        |
| `--color-violet-300` | `#c5aeff` | Medium emphasis                          |
| `--color-violet-400` | `#a47cff` | Active tags                              |
| `--color-violet-500` | `#8757f5` | **Primary violet** — promo, special     |
| `--color-violet-600` | `#7540df` | Hover/pressed                              |
| `--color-violet-700` | `#6130bd` | Strong violet text                       |
| `--color-violet-800` | `#51299a` | Darker violet UI                        |
| `--color-violet-900` | `#43247d` | Deep text / background                   |
| `--color-violet-950` | `#291550` | Deepest violet                           |

---

### 2.5 Semantic state colors

Status colors used across forms, alerts, badges, and progress states.

| Token                 | Value     | Usage                          |
|-----------------------|-----------|--------------------------------|
| `--color-success-500` | `#16a36a` | Success messages, positive     |
| `--color-success-600` | `#118453` | Success hover / pressed        |
| `--color-warning-500` | `#d99400` | Warnings, alerts               |
| `--color-warning-600` | `#b67600` | Warning hover / pressed        |
| `--color-danger-500`  | `#e5484d` | Errors, destructive actions    |
| `--color-danger-600`  | `#c9363d` | Error hover / pressed          |
| `--color-info-500`    | `#1689d6` | Info messages, links           |
| `--color-info-600`    | `#0e6eb2` | Info hover / pressed           |

---

### 2.6 Semantic theme tokens (light / dark)

These are the **runtime** tokens that switch with the `dark` class or `prefers-color-scheme: dark`. Prefer these over hardcoded colors in components.

| Token                  | Light value        | Dark value          | Where to use                          |
|------------------------|--------------------|---------------------|---------------------------------------|
| `--background`         | `#f7f5f0`          | `#10100f`           | Page / app background                 |
| `--foreground`         | `#171715`          | `#f5f3ed`           | Default body text                     |
| `--surface`            | `#ffffff`          | `#171716`           | Cards, panels, surfaces               |
| `--surface-raised`     | `#ffffff`          | `#1e1e1c`           | Elevated cards / sticky headers       |
| `--surface-muted`      | `#efede7`          | `#252522`           | Secondary surfaces, muted backgrounds    |
| `--surface-inverse`    | `#171715`          | `#f5f3ed`           | Inverse text on dark/light surfaces   |
| `--card`               | `#ffffff`          | `#191918`           | Card backgrounds                      |
| `--card-foreground`    | `#171715`          | `#f5f3ed`           | Text color inside cards               |
| `--popover`            | `#ffffff`          | `#1b1b1a`           | Popovers, tooltips, modals            |
| `--popover-foreground` | `#171715`          | `#f5f3ed`           | Text inside popovers                  |
| `--primary`            | `#f47c20` (brand-500) | `#ffa33f` (brand-400) | Primary buttons, links, accents  |
| `--primary-foreground` | `#ffffff`          | `#241007`            | Text/icon on `--primary`              |
| `--secondary`          | `#eceae4`          | `#282824`            | Secondary surfaces, muted UI         |
| `--secondary-foreground`| `#252522`         | `#f5f3ed`            | Text on `--secondary`                |
| `--muted`              | `#eceae4`          | `#282824`            | Muted backgrounds                     |
| `--muted-foreground`   | `#6b6b63`          | `#aaa9a0`            | Muted / secondary text               |
| `--text-muted`         | `#6b6b63`          | `#aaa9a0`            | Explicit muted text color (alias of muted-foreground) |
| `--accent`             | `#eaf7ff`          | `#102c3c`            | Accent backgrounds (e.g. selection)   |
| `--accent-foreground`  | `#0b5d86`          | `#87dcff`            | Text on `--accent`                    |
| `--border`             | `#deddd7`          | `#343430`            | All borders and dividers              |
| `--input`              | `#d7d6cf`          | `#3a3a35`            | Form input backgrounds                |
| `--ring`               | `#f47c20` (brand)  | `#ffa33f` (brand)    | Focus rings                           |
| `--link`               | `#0b71a8`          | `#87dcff`            | Hyperlinks                            |
| `--selection`          | `#ffdda8` (brand-200) | `#783016` (brand-800) | Text selection highlight          |
| `--hero-grid`          | `rgb(23 23 21 / 0.07)` | `rgb(255 255 255 / 0.055)` | Creative grid overlay |
| `--hero-glow`          | `rgb(244 124 32 / 0.16)` | `rgb(255 163 63 / 0.13)` | Radial hero glow overlay |

### 2.7 Theme aliases (`@theme`)

These shorthand aliases are declared inside the `@theme` block as **light-mode defaults**. The runtime `:root` (light) and `@media (prefers-color-scheme: dark)` / `.dark` overrides take precedence at runtime so colors switch correctly in dark mode.

| Token                       | Light value       | Dark value      | Purpose                                       |
|-----------------------------|--------------------|-----------------|-----------------------------------------------|
| `--primary`                 | `#f47c20` (brand-500) | `#ffa33f` (brand-400) | Primary brand color for CTAs, links        |
| `--primary-foreground`      | `#ffffff`          | `#241007`        | Text/icon on top of `--primary`              |
| `--secondary`               | `#eceae4`          | `#282824`        | Secondary surfaces / muted UI                |
| `--secondary-foreground`    | `#252522`          | `#f5f3ed`        | Text on top of `--secondary`                 |
| `--muted`                   | `#eceae4`          | `#282824`        | Muted backgrounds                            |
| `--text-muted`              | `#6b6b63`          | `#aaa9a0`        | Muted secondary text (alias of `--muted-foreground`) |

> **Why define them in `@theme`?** It keeps the canonical light defaults next to the palette, and exposes them through Tailwind's `theme('primary')` API so you can use them in the Tailwind config or via arbitrary values without hardcoding hex codes.

```css
/* @theme light defaults */
--primary: var(--color-brand-500);
--primary-foreground: #ffffff;
--secondary: #eceae4;
--secondary-foreground: #252522;
--muted: #eceae4;
--text-muted: #6b6b63;

/* :root light → same values (overrides @theme at runtime) */
--primary: #f47c20;  /* = var(--color-brand-500) */
--text-muted: #6b6b63;

/* dark :root / .dark → theme-switching values */
--primary: #ffa33f;
--text-muted: #aaa9a0;
```

---

## 3. Layout & spacing tokens

| Token                       | Value                         | Usage                          |
|-----------------------------|-------------------------------|--------------------------------|
| `--container-7xl`           | `80rem` (1280px)              | Max-width container            |
| `--container-8xl`           | `90rem` (1440px)              | Wide container                 |
| `--spacing-page`            | `clamp(1rem, 3vw, 3rem)`      | Page padding (responsive)      |
| `--spacing-section`         | `clamp(4rem, 9vw, 9rem)`      | Section vertical padding       |

### How they are used

```css
.container {
    max-width: var(--container-8xl);
    padding-inline: var(--spacing-page);
}

<section class="section-spacing"> … </section>
```

```html
<!-- Or via Tailwind -->
<div class="max-w-[var(--container-8xl)] px-[clamp(1rem,_3vw,_3rem)]">
  <section class="py-[clamp(4rem,_9vw,_9rem)]">
    …
  </section>
</div>
```

---

## 4. Border radius

| Token             | Value     | Typical use                         |
|-------------------|-----------|-------------------------------------|
| `--radius-xs`     | `0.25rem` | Tags, tight chips                   |
| `--radius-sm`     | `0.5rem`  | Small buttons, inputs              |
| `--radius-md`     | `0.75rem` | Cards, default buttons             |
| `--radius-lg`     | `1rem`    | Elevated cards, modals              |
| `--radius-xl`     | `1.5rem`  | Hero sections, banners              |
| `--radius-2xl`    | `2rem`    | Large rounded panels                |
| `--radius-3xl`    | `2.5rem`  | Full-rounded decorative elements  |

---

## 5. Shadows

| Token          | Value                              | Usage                              |
|----------------|------------------------------------|------------------------------------|
| `--shadow-xs`  | `0 1px 2px rgba(0,0,0,0.04)`       | Minimal depth                      |
| `--shadow-sm`  | `0 2px 8px rgba(0,0,0,0.06)`       | Small elevations, tooltips         |
| `--shadow-md`  | `0 8px 24px rgba(0,0,0,0.08)`      | Cards, dropdowns                   |
| `--shadow-lg`  | `0 16px 48px rgba(0,0,0,0.12)`     | Floating panels, modals            |
| `--shadow-xl`  | `0 24px 80px rgba(0,0,0,0.16)`     | Hero elements, hero images         |

Dark-mode variants are applied automatically through the `prefers-color-scheme: dark` media query; the shadow opacity stays the same but sits on darker surfaces for more contrast.

---

## 6. Typography & motion

### 6.1 Fonts

| Token           | Font stack                                                | Use case                          |
|-----------------|-----------------------------------------------------------|-----------------------------------|
| `--font-sans`   | `Vazirmatn, IRANSansX, Inter, ui-sans-serif`              | Body copy, UI                     |
| `--font-display`| `Vazirmatn, Inter, ui-sans-serif`                         | Headings, hero titles             |
| `--font-mono`   | `JetBrains Mono, Fira Code, ui-monospace`                 | Code blocks, inline code          |

### 6.2 Motion (easing + keyframes)

| Token                  | Value                              | What it does                         |
|------------------------|------------------------------------|--------------------------------------|
| `--ease-standard`      | `cubic-bezier(0.2, 0, 0, 1)`       | Standard easing                      |
| `--ease-snappy`        | `cubic-bezier(0.2, 0.8, 0.2, 1)`   | Snappy pop-in                        |
| `--ease-spring`        | `cubic-bezier(0.34, 1.56, 0.64, 1)`| Overshoot / spring effect            |
| `--animate-fade-up`    | `fade-up 0.6s var(--ease-standard)`| Fade + slide-up entrance            |
| `--animate-fade-in`    | `fade-in 0.45s var(--ease-standard)`| Fade entrance                       |
| `--animate-scale-in`   | `scale-in 0.5s var(--ease-snappy)` | Scale + fade entrance               |
| `--animate-marquee`    | `marquee 22s linear infinite`      | Continuous horizontal scroll        |

#### Respecting reduced motion

An automatic `@media (prefers-reduced-motion: reduce)` block disables animations/transitions:

```css
@media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

---

## 7. Reusable utility classes

Defined inside `@layer utilities`.

| Class              | CSS properties                                          | When to use                                  |
|--------------------|----------------------------------------------------------|----------------------------------------------|
| `.text-balance`    | `text-wrap: balance;`                                   | Prevent awkward line breaks in headings      |
| `.text-pretty`     | `text-wrap: pretty;`                                    | Balanced wrapping for paragraphs              |
| `.page-container`  | `width: min(100% - 2rem, 80rem); margin-inline: auto;`  | Default page wrapper                          |
| `.section-spacing` | `padding-block: var(--spacing-section);`                | Vertical rhythm for `<section>` blocks       |
| `.display-text`    | Display font, weight 800, negative tracking, tight leading | Hero titles and large display headings |
| `.eyebrow`         | `color: var(--primary)`, uppercase, size `0.75rem`, weight 800, tracking `0.12em` | Section eyebrows / badges  |
| `.hairline`        | `height: 1px; background: var(--border);`               | 1px dividers instead of `<hr>`              |
| `.creative-grid`   | Subtle 48×48px grid background using `--hero-grid`        | Background for hero/code/demo sections        |
| `.creative-glow`   | Radial gradient glow using `--hero-glow`                  | Hero section decorative background            |

---

## 8. Base styles

Inside `@layer base`:

- `*::before` / `*::after` border-color reset to `--border`
- `html { min-width: 320px; scroll-behavior: smooth; background: var(--background); }`
- `body` sets `--foreground`, `--font-sans`, font-smoothing, `kern`/`liga` features
- `::selection` uses `--selection` color
- `button`, `input`, `textarea`, `select` reset font
- `:focus-visible` outline uses `--ring`
- `img`, `video`, `svg` are responsive (`display:block; max-width:100%`)
- Reduced-motion override inside `html` and `*`

---

## 9. Dark mode strategy

Two triggers enable dark mode — they set the same CSS variables:

| Trigger                | How it works                                  |
|------------------------|------------------------------------------------|
| **System preference**  | `@media (prefers-color-scheme: dark)`          |
| **Manual class**       | Add `class="dark"` to `<html>`                  |

```html
<!-- Manual toggle -->
<html class="dark">
```

```js
// Toggling from JS
document.documentElement.classList.toggle("dark", shouldBeDark);
```

You only need to reference the semantic tokens (`--background`, `--foreground`, `--surface`, etc.) in your components — they automatically adapt.

---

## 10. Extending the Tailwind config

You can reference the custom CSS variables in your Tailwind config:

```js
// tailwind.config.js
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "hsl(var(--color-brand-500))", // etc.
        ink: {
          50:  "hsl(var(--color-ink-50))",
          100: "hsl(var(--color-ink-100))",
          // …
        },
        electric: colors.electric,
        violet: colors.violet,
      },
    },
  },
};
```

Or consume them directly via arbitrary values:

```html
<div class="bg-[var(--surface-raised)] text-[var(--foreground)]">
  This surface adapts to light/dark mode.
</div>
```

---

## 11. Usage cheat-sheet

| Need                          | Token to use                                 |
|-------------------------------|---------------------------------------------|
| Primary CTA button            | `bg-[var(--primary)] text-[var(--primary-foreground)]` |
| Secondary button              | `bg-[var(--secondary)] text-[var(--secondary-foreground)]` |
| Card surface                  | `bg-[var(--card)] text-[var(--card-foreground)]` |
| Border / divider              | `border border-[var(--border)]`             |
| Focus ring (keyboard nav)     | `ring-[var(--ring)]`                        |
| Hyperlink                     | `text-[var(--link)]`                        |
| Hero background glow          | Apply `.creative-glow` class                |
| Section background grid       | Apply `.creative-grid` class                |
| Section spacing               | Apply `.section-spacing` class              |
| Eyebrow label (uppercase)     | Apply `.eyebrow` class                      |
| Display heading               | Apply `.display-text` class                 |
| Success / warning / error alert | `--color-success-500` · `--color-warning-500` · `--color-danger-500` |
| Muted / secondary text        | `text-[var(--text-muted)]`                 |
| Success / warning / error alert | `--color-success-500` · `--color-warning-500` · `--color-danger-500` |
| Page max width                | `max-w-[var(--container-8xl)]`              |
| Page padding (responsive)     | `px-[var(--spacing-page)]`                |

---

## 12. File map

| File | Purpose |
|------|---------|
| `src/index.css` | Global stylesheet containing design tokens, dark-mode overrides, base styles, utilities, and keyframes |

All tokens are **single-source of truth** — adjust a value here and every component that references the variable updates automatically.