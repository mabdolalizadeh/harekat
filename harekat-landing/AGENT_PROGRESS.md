# Agent Progress — Harekat Landing Reconstruction

## Current Status

Phase: Implementation

Completed:
- Read handbook.md — understood API endpoints, auth flow, data models
- Read CSS-GUIDE.md — understood design tokens, color system, typography, spacing
- Analyzed all existing components, layouts, pages, and utils
- Reverse-engineered coding style and conventions
- Studied reference website (faculty.framer.website) — full structural breakdown
- Created AGENT_PROGRESS.md
- Created Git checkpoint (first-design)

Currently working on:
- Redesigning TopBarLayout to match Faculty nav pattern

Next:
- Redesign Hero section
- Add Manifesto section
- Redesign Courses section
- Add Teachers/Mentors section
- Add remaining sections (Who It's For, How It Works, Testimonials, FAQ, Contact, Footer)
- Polish responsive behavior

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
  pages/Landing.jsx — Main landing page
  layouts/
    MainLayout.jsx   — Background + centered container
    TopBarLayout.jsx — Fixed navigation bar
    MarqueeLayout.jsx — Infinite scrolling marquee
  components/
    ui/
      Background.jsx — Full-page background wrapper
      Box.jsx        — Flex container primitive
      Buttons.jsx    — PrimaryButton, SecondaryButton, ArrowButton
      Chip.jsx       — Small tag/badge
      Headings.jsx   — H1, H2, H3, P typography components
      Img.jsx        — Image with hover effects
    contents/
      Cards.jsx      — ContentCard, ImageCard, AccordionCard, CourseCard
  utils/cn.js        — clsx + twMerge utility
```

### Component System
- **Background**: Full-page dark background wrapper
- **Box**: Generic flex container (flex-col, items-center, justify-center)
- **Buttons**: PrimaryButton (brand orange), SecondaryButton (dark), ArrowButton (white with arrow icon)
- **Chip**: Small bordered tag with text-sm font-semibold
- **Headings**: H1 (text-2xl extrabold), H2 (text-xl extrabold), H3 (clamp-based), P (clamp-based)
- **Img**: Image with overflow-hidden, rounded-lg, hover rotation, ArrowUpRight overlay
- **CourseCard**: Image + title + chips + teacher, dark bg, hover scale
- **AccordionCard**: Expandable content with Plus icon toggle
- **MarqueeLayout**: Infinite horizontal scroll with pause-on-hover

### Design Language
- **Background**: Warm cream #f7f5f0 (light) / #10100f (dark)
- **Brand**: Warm orange #f47c20 (primary)
- **Typography**: Vazirmatn (Persian font), extrabold headings
- **Cards**: Dark bg (ink-800), rounded-lg, hover scale 1.02
- **Spacing**: section-spacing = clamp(4rem, 9vw, 9rem)
- **Container**: max-w-[var(--container-8xl)] = 1440px
- **Animations**: motion library (framer-motion successor), fade-up, stagger children

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
- Orange brand accent on dark/cream surfaces
- Persian/RTL layout
- Editorial feel with bold typography
- Image-forward cards with hover interactions
- Marquee for visual rhythm

### Reference Website (Faculty) Key Patterns
- **Dark-first**: Near-black (#0d0d0d) backgrounds, warm off-white (#fefff5) text
- **Tag + Heading + Subtitle**: Every section follows this pattern
- **Typography**: Display font (Apfel Grotezk) for ALL text — distinctive
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
- [ ] Redesign TopBarLayout
- [ ] Redesign Hero section
- [ ] Add Manifesto section
- [ ] Redesign Courses section
- [ ] Add Teachers/Mentors section
- [ ] Add Who It's For section
- [ ] Add How It Works section
- [ ] Add Testimonials section
- [ ] Add FAQ section
- [ ] Add Contact section
- [ ] Add Footer
- [ ] Polish responsive

---

## Current Task

Creating Git checkpoint before beginning implementation.

---

## Next Steps

1. Create Git checkpoint with `first-design` tag
2. Redesign TopBarLayout → dark, sticky, Faculty-style nav
3. Redesign Hero → tag + large H1 + subtitle + CTA, centered
4. Add Manifesto section → tag + H2 + body
5. Add Founder/About card
6. Redesign Courses → tag + H2 + 2-col grid cards
7. Add Teachers → tag + H2 + subtitle + 4-col grid
8. Add Who It's For → tag + H2 + 4 cards
9. Add How It Works → tag + H2 + 4 steps
10. Add Testimonials → tag + H2 + quote grid
11. Add FAQ → accordion
12. Add Contact → tag + H2 + details
13. Add Footer → links + logo + social
14. Responsive polish
15. Lint and final check

---

## Decisions

- Reusing existing component system (Box, Chip, Headings, Buttons, Img, CourseCard, AccordionCard)
- Keeping Vazirmatn font (project identity) but matching Faculty's display-weight patterns
- Adapting Faculty's dark-first approach while preserving brand orange
- Faculty uses 2-col grid for programs — will adapt courses to similar layout
- Will create new reusable components following existing architecture: SectionHeader, TeacherCard, StepCard, TestimonialCard, ContactSection, Footer
- Will keep RTL/Persian layout intact

---

## Known Issues

- No footer exists yet
- No teachers section
- No testimonials
- No FAQ
- No contact section
- TopBarLayout is functional but needs redesign to match Faculty pattern
- Hero needs larger typography and Faculty-style composition
- Course cards need layout adjustment to match Faculty program cards
- No dark-first hero (current hero is on light background)
- Mobile nav needs hamburger menu

---

## Git Checkpoints

- `first-design` — Original project state before AI implementation (pending creation)
