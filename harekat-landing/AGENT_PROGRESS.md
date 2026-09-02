# Agent Progress — Harekat Landing Reconstruction

## Current Status

Phase: Implementation Complete

Completed:
- Read handbook.md — understood API endpoints, auth flow, data models
- Read CSS-GUIDE.md — understood design tokens, color system, typography, spacing
- Analyzed all existing components, layouts, pages, and utils
- Reverse-engineered coding style and conventions
- Studied reference website (faculty.framer.website) — full structural breakdown
- Created AGENT_PROGRESS.md
- Created Git checkpoint (first-design)
- Redesigned TopBarLayout — dark, sticky, Faculty-style nav with mobile hamburger
- Redesigned Hero — tag + large display H1 + subtitle + CTA + marquee
- Added Manifesto section — tag + H2 + body text
- Added Founder Card — rotated 2deg, quote + name + role
- Redesigned Courses — tag + H2 + 2-col grid
- Added Teachers/Mentors — tag + H2 + subtitle + 4-col grid
- Added Who It's For — tag + H2 + 4 content cards
- Added How It Works — tag + H2 + 4 numbered steps
- Added Testimonials — tag + H2 + 3-col quote grid
- Added FAQ — tag + H2 + accordion items
- Added Contact — tag + H2 + email + location
- Added Footer — logo + nav links + social + copyright
- Fixed responsive behavior (mobile menu, responsive grids)
- Fixed lint errors
- Fixed missing asset imports (placeholder URLs)
- Build passes, lint passes

Currently working on:
- None — implementation complete

Next:
- Connect to real API data (handbook.md endpoints)
- Add real images when available
- Add loading/empty states for API data
- Add page routing for /about-us, /contact-us, /auth

---

## Project Understanding

### Architecture
- React 19 + Vite 8 + Tailwind CSS 4
- SPA with react-router-dom v7 (BrowserRouter)
- Single page: Landing.jsx (route: /)
- RTL layout (lang="fa" dir="rtl")

### Folder Structure
```
src/
  main.jsx          — Entry point (BrowserRouter wrapping)
  App.jsx           — Routes definition
  index.css         — Global styles, design tokens, utilities
  pages/Landing.jsx — Main landing page (all sections)
  layouts/
    MainLayout.jsx   — Background + centered container (max-w 1440px)
    TopBarLayout.jsx — Fixed dark nav with mobile hamburger
    MarqueeLayout.jsx — Infinite scrolling marquee
  components/
    ui/
      Background.jsx — Full-page dark background wrapper
      Box.jsx        — Flex container primitive
      Buttons.jsx    — PrimaryButton, SecondaryButton, ArrowButton
      Chip.jsx       — Small tag/badge (now accepts className)
      Headings.jsx   — H1, H2, H3, P typography components
      Img.jsx        — Image with hover effects
      SectionTag.jsx — Section eyebrow/label (new)
    contents/
      Cards.jsx      — ContentCard, ImageCard, AccordionCard, CourseCard
      TeacherCard.jsx — Teacher/mentor card (new)
      StepCard.jsx    — How-it-works step card (new)
      TestimonialCard.jsx — Testimonial quote card (new)
  utils/cn.js        — clsx + twMerge utility
```

### Component System
- **Background**: Full-page dark bg wrapper (bg-ink-950)
- **Box**: Generic flex container (flex-col, items-center, justify-center)
- **Buttons**: PrimaryButton (brand orange), SecondaryButton (dark), ArrowButton (white with arrow icon)
- **Chip**: Small bordered tag with text-sm font-semibold
- **Headings**: H1 (text-2xl extrabold), H2 (text-xl extrabold), H3 (clamp-based), P (clamp-based)
- **Img**: Image with overflow-hidden, rounded-lg, hover rotation, ArrowUpRight overlay
- **SectionTag**: Section eyebrow/label using .eyebrow utility class
- **TeacherCard**: Photo + name + role
- **StepCard**: Large number + title + description
- **TestimonialCard**: Quote + name + role
- **CourseCard**: Image + title + chips + teacher, dark bg, hover scale
- **AccordionCard**: Expandable content with Plus icon toggle
- **MarqueeLayout**: Infinite horizontal scroll with pause-on-hover

### Design Language
- **Background**: Near-black #10100f (dark-first, matching Faculty)
- **Brand**: Warm orange #f47c20 (primary)
- **Typography**: Vazirmatn (Persian font), extrabold headings
- **Cards**: Dark bg (ink-900), border border-ink-50/10, rounded-xl/2xl
- **Spacing**: py-24 between sections, gap-6 for content
- **Container**: max-w-[var(--container-8xl)] = 1440px, px-[clamp(1.5rem,5vw,7.5rem)]
- **Animations**: motion library, fade-up, stagger children
- **Section pattern**: SectionTag → H2 → optional P → content

### Coding Style
- Uses `cn()` for all className merging
- Props destructuring with defaults
- motion.div for animations
- useState for hover states
- lucide-react for icons
- Named exports for multi-component files, default exports for single components
- Compact JSX, minimal comments
- Tailwind classes, no CSS modules

---

## Design Understanding

### Existing Project Identity
- Warm, creative, educational atmosphere
- Orange brand accent on dark surfaces
- Persian/RTL layout
- Editorial feel with bold typography
- Image-forward cards with hover interactions
- Marquee for visual rhythm

### Reference Website (Faculty) Key Patterns
- **Dark-first**: Near-black (#0d0d0d) backgrounds, warm off-white (#fefff5) text
- **Tag + Heading + Subtitle**: Every section follows this pattern
- **Typography**: Display font for ALL text
- **Section spacing**: 100-120px between sections
- **Grid layouts**: 2-col for programs, 4-col for team/features
- **Rounded corners**: 20px on cards/images, 10px on buttons
- **Max-width**: 1600px
- **Center-aligned**: Most text is centered
- **Spring animations**: damping 30, stiffness 235
- **Sections**: Nav → Hero → Manifesto → Founder Card → Programs → Mentors → Who It's For → CTA → Student Work → How It Works → Testimonials → FAQ → Contact → Footer

---

## Reference Website Analysis

### Page Structure (Top to Bottom)
1. **Nav** — Sticky, dark bg, logo left, links center, CTA right
2. **Hero** — Tag + large H1 + subtitle + CTA button
3. **Manifesto** — Tag + H2 + body text
4. **Founder Card** — Rotated 2deg, quote + name + role
5. **Programs** — Tag + H2 + 2-col grid of program cards (image + title + desc)
6. **Mentors** — Tag + H2 + subtitle + 4-col grid of team members (photo + name + role)
7. **Who It's For** — Tag + H2 + 4 content cards
8. **CTA** — Tag + H2 + button
9. **Student Work** — Tag + H2 + masonry image gallery with captions
10. **How It Works** — Tag + H2 + 4 numbered steps
11. **Testimonials** — Tag + H2 + grid of quote cards
12. **FAQ** — H2 + accordion items
13. **Contact** — Tag + H2 + email + location
14. **Footer** — Logo + nav links + social + legal

### Key Layout Patterns
- Max-width: 1600px
- Desktop padding: 120px sides
- Section gap: 100-120px
- Hero top padding: 180px
- 2-col grid (programs), 4-col grid (mentors, features)
- Grid gap: 20px
- Border: 1px solid rgba(254,255,245,0.2)

---

## Completed Work

- [x] Read handbook.md
- [x] Analyzed API architecture
- [x] Analyzed existing component system
- [x] Analyzed existing coding style
- [x] Analyzed existing visual language
- [x] Analyzed reference website (faculty.framer.website)
- [x] Created AGENT_PROGRESS.md
- [x] Create Git checkpoint (first-design)
- [x] Redesign TopBarLayout
- [x] Redesign Hero section
- [x] Add Manifesto section
- [x] Add Founder Card
- [x] Redesign Courses section (2-col grid)
- [x] Add Teachers/Mentors section (4-col grid)
- [x] Add Who It's For section (4 cards)
- [x] Add How It Works section (4 steps)
- [x] Add Testimonials section (3-col grid)
- [x] Add FAQ section (accordion)
- [x] Add Contact section
- [x] Add Footer
- [x] Fix responsive behavior (mobile menu, responsive grids)
- [x] Fix lint errors
- [x] Fix missing asset imports
- [x] Verify build passes

---

## Current Task

All implementation tasks complete. Build and lint pass.

---

## Next Steps

1. Connect to real API data from handbook.md endpoints
2. Add real images when available (replace placeholder URLs)
3. Add loading/empty/error states for API-driven content
4. Add page routing for /about-us, /contact-us, /auth
5. Add mobile hamburger menu refinement
6. Consider adding scroll-to-section smooth behavior
7. Consider adding dark/light mode toggle

---

## Decisions

- Reused existing component system (Box, Chip, Headings, Buttons, Img, CourseCard, AccordionCard)
- Kept Vazirmatn font (project identity) while matching Faculty's display-weight patterns
- Adapted Faculty's dark-first approach while preserving brand orange
- Used Faculty's 2-col grid for programs (adapted to courses)
- Created new reusable components following existing architecture: SectionTag, TeacherCard, StepCard, TestimonialCard
- Used placeholder URLs for images since local assets were never committed to git
- Copied logo.png from project root to src/assets/ for proper imports

---

## Known Issues

- Images are placeholder URLs (Unsplash) — should be replaced with real assets
- No actual API integration yet — all data is static/hardcoded
- No loading states for async data
- No error boundaries
- Mobile menu needs refinement for touch interactions
- No scroll-to-section behavior for anchor links
- No dark/light mode toggle (currently dark-only)

---

## Git Checkpoints

- `first-design` — Original project state before AI implementation
