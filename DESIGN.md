---
name: Roots
description: A quiet community workspace with warm neutrals and subtle green accents.
colors:
  canvas: "#ffffff"
  sidebar: "#f8f9f6"
  ink: "#242824"
  muted: "#687069"
  line: "#e6e9e3"
  green: "#315744"
  green-soft: "#edf3ec"
  green-hover: "#254733"
  warm: "#f7f4eb"
  warm-ink: "#7c632e"
  hover: "#f3f5f1"
  control-border: "#dce1d8"
  nav-ink: "#5b655d"
  nav-hover: "#edf0e9"
  nav-active: "#e9eee4"
  nav-active-ink: "#294935"
  feature: "#f2f5ee"
  inset: "#f6f7f3"
typography:
  display:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.22
    letterSpacing: "-0.035em"
  headline:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  title:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  record-copy:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
  control:
    fontFamily: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  status: "5px"
  control: "7px"
  navigation: "8px"
  inset: "10px"
  panel: "12px"
  dialog: "16px"
spacing:
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.canvas}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    rounded: "0px"
    padding: "7px 0"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 11px"
  navigation-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.nav-active-ink}"
    rounded: "{rounded.navigation}"
    padding: "11px 13px"
  status-green:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  status-warm:
    backgroundColor: "{colors.warm}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.status}"
    padding: "4px 7px"
  feature:
    backgroundColor: "{colors.feature}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "25px 28px"
---

# Design System: Roots

## Overview

Preserve Roots' warm green identity with the user-confirmed subtle accents and ChatGPT-like sans typography. Both Workspace and Dashboard share a compact navigation rail, clear headings, open content areas, and divided records. No new visual metaphor is assigned.

This document captures the implemented static prototype in `dist/styles.css`, `dist/app.js`, and `dist/views.js`. Frontmatter values are normative desktop primitives; component exceptions and responsive changes are described below. The sidecar contains observed extensions and component previews.

**Key Characteristics:**

- White content canvas and a pale warm sidebar.
- Green for primary actions, active states, and useful emphasis.
- Flat lists with quiet dividers and compact supporting text.
- A shared system across both Roots interfaces.

## Colors

### Primary

The `green` accent identifies primary actions, focus outlines, selected filters, and amounts in the calculator. `green-soft` supports status tags and row-action hover states. The darker `green-hover` is reserved for filled-button hover.

### Neutral

`canvas` carries the content, `sidebar` separates persistent navigation, and `line` divides records and sections. `ink` is the main text color; `muted` carries supporting copy, placeholders, and footer text. `hover` supplies the standard neutral control hover.

The warm status pair communicates conditional or proposed items. Navigation has its own quiet hover and selected tones. Feature and inset backgrounds group selected content without turning every record into a card.

## Typography

One system sans stack serves headings, body text, and controls. There are no external font requests or separate display face. Page headings use the display role, section headings use headline, and smaller headings use title. Record descriptions use the more compact record-copy role; page introductions are slightly larger (14px).

Metadata is generally compact (11.5–12px), with status and footer text smaller (10px). Amounts use tabular numerals. Page-heading letter spacing is tight; body text remains normally spaced. Benefit descriptions cap their measure at 65 characters; record descriptions cap at 560px.

## Layout

The desktop shell has a fixed navigation rail (236px) and a fluid main column. The top bar is 76px tall. Page content centers within 1230px with desktop padding of 48px 44px 25px. The optional context column is 250px wide, separated by a 38px gap and a vertical rule.

- At 1450px and above, page top padding grows to 58px and the context column to 270px with a 48px gap.
- At 1120px and below, the rail narrows to 212px; page side padding becomes 30px and the context column becomes 215px.
- At 950px and below, the context panel stacks under the main content with a top rule. The top bar becomes 65px and page headings become 29px.
- At 700px and below, navigation becomes a 248px drawer, page side padding becomes 21px, and page headings become 28px. Record actions wrap below their descriptions, featured content stacks, and the footer becomes vertical.

The current overview uses an inline metric summary followed by one featured opportunity. The requested top metric-card grid is absent. Trail is outside the implemented routes.

## Elevation & Depth

Content is predominantly flat: whitespace, thin rules, and pale backgrounds establish grouping. Shadows appear on the active interface switch, toast, and modal dialog. Their exact values live in the sidecar; there is no general raised-card treatment. The modal and mobile drawer use translucent backdrops to separate foreground controls.

Navigation and button color transitions use 150ms ease. The drawer transform and toast opacity/transform use 180ms ease. The reduced-motion query removes transitions and animations throughout the interface.

## Shapes

Controls and navigation use gently rounded rectangles; status tags are tighter and grouped panels are softer. Dialogs have the largest fixed corner radius. Avatars are circular, record icons are rounded squares, and icons use simple outline SVGs. Borders are thin (1px); selected filter underlines and focus outlines are thicker (2px).

## Components

### Buttons

Filled green buttons identify primary actions. Secondary buttons use white with a quiet border; text actions use green without a surrounding border. Standard buttons have a minimum height of 37px, rising to 39px on mobile. Within record rows, the primary class is intentionally rendered as a white button with green text and a pale border. Preserve this contextual override.

Button and navigation press states slightly darken with `brightness(.97)`. Disabled buttons use half opacity and a not-allowed cursor. Focus-visible controls have a green outline (2px) offset from the edge (4px); do not remove it.

### Chips

Status labels use soft green, warm, or neutral backgrounds and wrap when necessary. They are descriptive text, not interactive filter controls. Filters are text buttons with a green underline and `aria-pressed` for selection.

### Cards / Containers

The featured opportunity is a pale green panel. Calculator and invitation content use inset panels. Most opportunities, people, and events remain divided rows. Context panels rely on a rule and spacing instead of a separate elevated surface.

### Inputs / Fields

Inputs use white backgrounds, a quiet border, rounded corners, a green caret, and the shared focus outline. Labels and short supporting text remain visible. Search fields are compact on desktop and expand on mobile. Validation uses browser validity messages; no custom error color system is defined.

### Navigation

The Workspace/Dashboard switch uses a lightly framed track with a white selected segment. Section links combine small outline icons and text. Selected links use a pale green background and darker green text; `aria-current` conveys the current interface or page.

On mobile, opening navigation moves focus to the current section and makes the main content inert. Tab wraps within the drawer links, Escape or the backdrop closes it, and focus returns to the menu control. Closed mobile navigation is inert. Route changes close the drawer, scroll to the top, and focus main content. The skip link becomes visible on focus.

### Dialogs and Feedback

Opportunity details use a native modal dialog with a close control and a dimmed backdrop. Closing returns focus to the initiating control. Toasts use a dark green surface, a short entrance transition, and a polite live region.

## Do's and Don'ts

### Do:

- Do preserve the subtle green accent and system sans typography across both interfaces.
- Do keep record descriptions, eligibility notes, and amounts visually distinct.
- Do retain visible keyboard focus, the skip link, and the mobile drawer focus behavior.
- Do use the actual component overrides when extending the interface.

### Don't:

- Don't reintroduce the removed top metric-card grid into these Roots screens.
- Don't turn every record into a raised card or saturate whole screens with green.
- Don't describe conditional benefits with the same visual certainty as received funding.
- Don't add Trail to either Roots navigation.
