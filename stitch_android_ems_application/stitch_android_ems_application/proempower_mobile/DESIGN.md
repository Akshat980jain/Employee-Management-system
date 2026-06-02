---
name: ProEmpower Mobile
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 1rem
  gutter-card: 0.75rem
  padding-card: 1.25rem
  stack-gap: 1rem
  inline-gap: 0.5rem
---

## Brand & Style
The brand personality focuses on **efficiency, reliability, and modern professionalism**. Designed specifically for HR administrators and employees on the go, the UI prioritizes clarity and high-signal data visualization.

The design system adopts a **Corporate / Modern** style, characterized by a structured layout, a clean white canvas, and purposeful use of deep purple to guide the user's attention. It utilizes "Soft UI" principles—subtle shadows and gentle rounding—to ensure the interface feels approachable yet authoritative. The emotional response is one of organized calm, transforming complex organizational data into an easy-to-digest mobile experience.

## Colors
This design system uses a high-contrast palette optimized for legibility and professional aesthetic.

- **Primary (#6366f1):** A vibrant Deep Purple used for brand identity, primary actions, and active navigation states.
- **Secondary / Surface (#f8fafc):** A very light cool-grey used for backgrounds to allow white cards to pop.
- **Success / Status (#10b981):** Used for "Operational," "Connected," or "Present" indicators.
- **Danger / Error (#ef4444):** Reserved for "Clock Out" actions or "Not Checked In" alerts.
- **Neutral (#64748b):** Used for secondary text, icons, and non-essential metadata.
- **White (#ffffff):** The primary surface color for all content cards and containers.

## Typography
The system uses **Inter** exclusively to maintain a systematic, utilitarian feel. 

- **Headlines:** Bold weights are used for page titles and section headers to establish a clear hierarchy.
- **Body:** Standard weights are used for data descriptions and list items, prioritizing readability.
- **Labels:** Uppercase or semi-bold small text is used for status badges (e.g., "PRESENT") and secondary metadata to differentiate them from interactive text.
- **Mobile Considerations:** Font sizes are capped at 24px for headlines to ensure they do not wrap aggressively on smaller devices.

## Layout & Spacing
The layout follows a **fluid grid** model optimized for narrow viewports. 

- **Containment:** Content is housed in cards that span the full width of the screen (minus margins). 
- **Rhythm:** A consistent 4px/8px base unit is used. 16px (1rem) is the standard margin for the screen edges.
- **Visual Grouping:** Related items (like stat cards) can be arranged in a 2-column grid, while complex lists (employees, system health) always use a single-column vertical stack.
- **Safe Areas:** Ensure bottom navigation and top headers account for hardware notches and gesture areas.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Ambient Shadows**.

- **Background:** The lowest layer is the secondary background color (#f8fafc).
- **Surface:** Cards sit on the background with a pure white (#ffffff) fill.
- **Shadows:** Each card utilizes a very soft, diffused shadow (Y: 2, Blur: 8, Opacity: 0.05, Color: #000) to create a subtle lift without appearing heavy.
- **Interactive Depth:** On press, cards should slightly "sink" (reduce shadow and scale) to provide tactile feedback.

## Shapes
The shape language is consistently **Rounded** to reflect a modern, user-friendly corporate environment.

- **Cards & Inputs:** Use a 12px (`rounded-lg`) corner radius.
- **Buttons & Badges:** Use an 8px (`rounded-md`) radius or a full pill-shape for status indicators to distinguish them from structural elements.
- **Avatars:** Circular or heavily rounded (12px+) to humanize the employee data.

## Components
Consistent implementation of these components ensures a unified user experience:

- **Buttons:** Primary buttons use the Deep Purple fill with white text. Secondary buttons use a light purple tint or outline. Danger actions (Clock Out) use a solid red fill.
- **Cards:** White background, 12px rounded corners, and subtle shadow. Used for stats, list containers, and "Quick Actions."
- **Status Indicators (Chips):** Small, semi-bold text inside a tinted background (e.g., Light Green background for "Operational" with Dark Green text).
- **Input Fields:** 12px rounded corners with a 1px light grey border. Focus state changes border color to Deep Purple.
- **Navigation:** A bottom navigation bar with modern outline icons: 
    - *Dashboard:* Grid/Layout icon.
    - *Employees:* Users icon.
    - *Attendance:* Clock/Calendar icon.
    - *Payroll:* Wallet/Dollar icon.
    - *Settings:* Gear icon.
- **System Health List:** Simple horizontal rows within a card, using a dot indicator next to the status text (e.g., "Database [Connected •]").