---
name: Roots
description: A warm, restrained operations workspace for growing community participation.
colors:
  forest: "#234c3c"
  deep: "#193d30"
  sage: "#e8eddf"
  featured: "#e9eedf"
  featured-line: "#dce5cd"
  positive-bg: "#d8e5c6"
  positive-text: "#496134"
  peach: "#f9ebdf"
  action-bg: "#f7ebdf"
  action-text: "#87522c"
  paper: "#f7f8f3"
  surface: "#fff"
  sidebar: "#f0f3e9"
  topbar: "#fafbf7"
  sheet: "#fcfdf9"
  ink: "#23392f"
  muted: "#68756d"
  secondary-text: "#637157"
  recommendation-text: "#58664f"
  line: "#e1e6dd"
  focus: "#587842"
  tag-bg: "#f1f3ed"
  tag-text: "#59694b"
  table-heading-text: "#5d6d52"
typography:
  display:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "38px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-1.5px"
  headline:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "31px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-1px"
  title:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.3px"
  recommendation-title:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.45px"
  body:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  supporting:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'DM Sans', sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.5
rounded:
  tag: "4px"
  badge: "5px"
  control: "6px"
  field-shell: "7px"
  navigation: "8px"
  compact-card: "10px"
  preview: "12px"
  card: "14px"
  circle: "50%"
spacing:
  micro: "5px"
  tight: "8px"
  small: "12px"
  pair: "16px"
  medium: "20px"
  card: "25px"
  column: "28px"
  section: "32px"
  gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  button-text:
    backgroundColor: "transparent"
    textColor: "#657953"
    typography: "{typography.label}"
    padding: "0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
    width: "100%"
  navigation:
    textColor: "#576659"
    rounded: "{rounded.navigation}"
    padding: "0 15px"
    height: "47px"
  navigation-active:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.surface}"
  badge-positive:
    backgroundColor: "{colors.positive-bg}"
    textColor: "{colors.positive-text}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "4px 7px"
  badge-action:
    backgroundColor: "{colors.action-bg}"
    textColor: "{colors.action-text}"
    typography: "{typography.label}"
    rounded: "{rounded.badge}"
    padding: "4px 7px"
  metric:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "21px 23px 18px"
  recommendation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  recommendation-featured:
    backgroundColor: "{colors.featured}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  event-date:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field-shell}"
    width: "44px"
    height: "51px"
---

# Design System: Roots

## Overview

**Creative North Star: "Community work becomes a clear next action."**

Roots is a calm operations workspace with a living, community-minded character. Warm paper, forest green, and sage establish a practical nonprofit setting. Clear type and fine dividers let coordinators scan information, understand a recommendation, and take a concrete next step.

This documents the implemented expansion of the user's pinned Roots reference. The established identity is the lowercase Roots wordmark, outlined sprout, self-hosted DM Sans, restrained corners, and green positive indicators. Peach is a small action cue. Tonal surfaces carry emphasis without decorative imagery or heavy elevation.

**Key Characteristics:**

- Warm paper ground with white work surfaces and sage emphasis.
- Forest navigation, primary actions, and quiet green-tinted typography.
- Compact operational labels balanced by open horizontal spacing.
- Fine borders, restrained corners, and consistent outlined SVG icons.
- Persistent navigation that becomes a bottom bar on phones.

Source of truth: `dist/style.css`, `dist/index.html`, and `dist/app.js`. Desktop and mobile review screenshots confirm composition; the stylesheet includes the final contrast and focus refinements. Frontmatter records recurring implementation values, including values extracted from component rules rather than only CSS variables. The unused declared lime color is intentionally excluded.

## Colors

The palette combines low-chroma botanical greens with warm off-whites; peach marks a helpful action without becoming a competing brand color.

### Primary

- **Forest** carries active desktop navigation and primary buttons. **Deep** is its button hover state.
- **Sage** provides quiet hover and saved-state fills. **Featured** and **Featured Line** create the highlighted recommendation surface.
- **Positive Background** and **Positive Text** pair in fit badges. Small positive trends use their own lighter green treatment, preserving restrained emphasis.

### Secondary

- **Peach** sits behind the outreach icon. **Action Background** and **Action Text** pair in the next-action badge.
- Avatar initials may use muted sage, peach, lavender, or sand. These are identity accents, not additional navigation or action colors.

### Neutral

- **Paper** is the application ground; **Surface** is the white card and field surface.
- **Sidebar**, **Topbar**, and **Sheet** establish subtle spatial layers without strong contrast changes.
- **Ink** carries primary content; **Muted** and **Secondary Text** carry support copy. **Recommendation Text**, **Tag Text**, and **Table Heading Text** preserve the final readable contrast on their specific surfaces.
- **Line** separates cards and sections. **Focus** is the keyboard outline shared by interactive controls.

**The Action Emphasis Rule.** Use forest for a committed primary action, sage for relevant context, and peach for the established outreach cue. Preserve these meanings when extending the interface.

The sidecar's eight-step tonal strips are synthesized preview aids, not additional production palette tokens.

## Typography

**Display and body font:** DM Sans, with a generic sans-serif fallback. Regular, medium, semibold, and bold faces are self-hosted as TTF files under `dist/fonts/`; each uses `font-display: swap`. The UI relies mainly on regular, medium, and semibold.

The typography is friendly and direct. Headlines use medium weight and modest negative tracking; values use tabular numerals. Supporting copy remains compact and comfortable to scan. There is no separate serif or monospace family.

### Hierarchy

- **Display:** the metric value role in the frontmatter. It grows to 42px at wide desktop, reduces to 33px at tablet, and 31px on phones.
- **Headline:** page titles use the frontmatter role; responsive sizes are 29px, 26px, then 27px on phones. Mobile tracking is −0.8px.
- **Title:** section headings use the frontmatter title role. Recommendation titles use their own role, becoming 21px at wide desktop and 18px on phones.
- **Body:** the base application role is 14px. Card descriptions and most form content use 12px. Recommendation paragraphs have a 53ch maximum and 1.8 line height; wide desktop raises them to 13px.
- **Label:** functional metadata, badges, dates, filter labels, and compact buttons use 11px. Navigation labels are 14px on desktop and 11px on phones.
- **Sheet headline:** 28px, weight 600, 1.25 line height, and −0.8px tracking; 26px on phones. Lead copy is 13px with 1.8 line height.
- **Brand:** the desktop wordmark is 35px, weight 600, with −2px tracking; the mobile header wordmark is 24px with −1.2px tracking.

**The Legible Detail Rule.** Keep functional small text at least 11px and preserve the final contrast colors. Do not remove visible focus to make controls appear quieter.

## Layout

The desktop shell uses a fixed sidebar, a quiet horizontal top bar, and a fluid main area capped at 1400px. The default sidebar is 224px, the top bar is 76px high, and main padding is 38px 40px 20px. Page and footer containers share the same maximum width.

The overview starts with a greeting and month control, followed by three equal metric columns with an 18px gap. Recommendations occupy the wider column of a `minmax(0, 1.7fr) minmax(270px, 1fr)` grid, separated by 28px. The upcoming-event rail and project prompt sit alongside them. This overview composition is a surface pattern, not a requirement for every screen. Funding and event listings use two equal columns; the people view uses a bordered table with local horizontal overflow.

| Viewport | Implemented changes |
| --- | --- |
| 1500px and above | Sidebar 240px; main top padding 48px; grid gap 30px; recommendation padding 29px; metric values 42px. |
| 1190px and below | Sidebar 200px; horizontal main padding 26px; overview grid 1.6fr / minimum 245px with 20px gap; recommendation footers stack. |
| 980px and below | Sidebar 180px; horizontal main padding 22px; overview becomes one column; rail becomes a two-column 1.15fr / 1fr section; metric values 33px. Recommendation footers return to a row while space permits. |
| 760px and below | Sidebar becomes a fixed 67px bottom navigation bar; top bar becomes 61px; main padding 29px 20px 12px; app reserves 67px below content. Rail, listings, toolbars, activity, and footer stack. Recommendation actions fill the available width. |

On phones, all three metric columns remain visible with a 9px gap, 10px corners, and final padding of 14px 10px. Metric icons are hidden, trends occupy their own line, and labels can wrap. The greeting/month row may wrap, placing the month selector beneath the greeting. Navigation retains all four destinations; counters, workspace identity, and the desktop profile block are hidden. Table overflow stays inside its own wrapper.

The side sheet occupies `min(540px, 100vw)` and the full dynamic viewport height. It consequently fills phone width. Its header stays sticky while the body scrolls. Two-field form rows remain two columns, with a narrower 12px gap on phones. Toasts sit above the mobile bar at 81px from the bottom.

## Elevation & Depth

Cards are flat, separated by pale borders and tonal fills. Elevation is reserved for transient layers: the action sheet casts a leftward shadow, its backdrop dims and slightly blurs the workspace, and a toast has a small supporting shadow. Cards do not lift on hover.

### Shadow Vocabulary

- **Sheet:** `-12px 0 60px #193d3017` anchors the temporary layer against the workspace.
- **Toast:** `0 6px 20px #1b35221a` separates transient feedback from content.
- **Backdrop:** `#1d342d55` with `blur(2px)` keeps the underlying context recognizable.

**The Flat Workspace Rule.** Use a border or a tonal surface to separate ordinary content. Reserve shadows for the sheet and toast patterns already established.

The sheet enters from 40px to the right over 280ms using `cubic-bezier(.22,1,.36,1)`, with opacity moving from .7 to 1. Buttons, navigation, and metric borders use brief 150ms state transitions. Toast opacity and translation use 200ms; feedback remains for 3500ms. Reduced-motion preference disables animations and transitions throughout.

## Shapes

Cards and table containers use the recurring 14px radius. Compact phone metrics use 10px; draft previews use 12px. Buttons and form controls use 6px, navigation uses 8px, and date/search shells use 7px. Badges use 5px and interest tags 4px. Initial avatars and small step numbers are circular. The side sheet has square outer edges.

Borders are usually 1px. Outlined icons use a 24-unit viewBox, no fill, current-color strokes, rounded caps and joins, and a default stroke width of 1.6. They are generally 20px, shrinking with metadata and controls. The sprout mark has a slightly stronger desktop brand stroke; larger decorative sprout marks remain light. Keep actual inline SVG shapes consistent instead of mixing emoji or icon fonts.

## Components

### Buttons

Compact and dependable. Primary, secondary, and quiet buttons share the frontmatter dimensions, a 36px minimum height, 8px icon gap, and 14px icons. On phones the default minimum is 39px; compact page-heading add actions retain their 34px treatment.

Primary buttons use forest and white; hover deepens to Deep. Secondary buttons are white with a Line border. Quiet buttons are transparent with a muted green border (`#ccd7c0`). Secondary and quiet hover use a pale green surface (`#f0f4ea`). Text buttons have no enclosure and underline on hover. Disabled buttons use .5 opacity and a not-allowed cursor. Focus is a 3px Focus outline with 4px offset; no separate pressed transformation is implemented.

### Badges, tags, and people

Fit and action badges pair the relevant background and text tokens, use medium 11px type with a 1.2 line height, and keep their text on one line. Positive badges may include an 11px check. Interest tags use Tag Background and Tag Text, 3px 6px padding, and the small tag radius. Filter chips use a muted green selected fill and expose the selected state in the rendered control. Initial avatars have a 2px white border; grouped avatars overlap by 5px and use a 26px diameter.

### Cards and metrics

Recommendations are the signature content surface: an icon tile opposite a small badge, a concise title, a readable explanation, and an action area. The featured version uses the pale sage surface and its own border. Its footer has a fine divider, a benefit label, and a clear primary action. Outreach uses a white card, peach icon cue, grouped initials, and a quiet action. Use a real card action instead of suggesting the entire recommendation is clickable.

Metric cards are whole-card buttons. They display a small label, tabular value, and compact trend/support line. Their hover changes only the border to `#a8b999`. Other white listing cards keep a consistent 14px radius and 25px default padding. The project prompt is a subdued green surface with a sprout, headline, explanatory copy, and text action.

### Inputs and fields

White fields have a 1px muted green border (`#d4dec9`), 6px corners, 11px 12px padding, 12px text, and a 1.7 line height. Labels are 11px medium weight with a 7px gap. Textareas resize vertically and normally start at 150px minimum height. Checkboxes use the forest accent.

The search field is a separate bordered 7px shell with a 16px search icon and a transparent inner input. Its maximum width is 350px until the mobile toolbar stacks. Inputs, selects, textareas, and search retain the shared keyboard focus outline. Validation uses native browser validity messages; no separate styled error or disabled field system is implemented.

### Navigation

Desktop navigation is a vertical list of icon-and-label links with 47px rows, 13px gaps, and 8px corners. The current destination uses forest with white content; hover on other destinations uses a pale green background. The active destination has `aria-current="page"`.

At 760px and below, links form a horizontal bottom bar. Each becomes an icon above an 11px label in a 52px row area with at least 65px width. Active navigation uses a pale green fill (`#e6eddd`) and forest content. Preserve the text labels alongside the icons.

### Upcoming events

Each full-row button pairs a compact date tile with a title, time, and attendance line. Dates use tabular numbers; uppercase month labels are lightly tracked. Fine dividers separate rows, and the final row has no divider. Hover changes the event title color without moving the row. The same event detail opens in the standard side sheet.

### Action sheet and feedback

Use the native dialog for details, forms, and project plans. The sticky top bar includes context and a close control; the body uses a large title, quiet lead, divided sections, and explicit actions. Keyboard dismissal, native modal focus handling, and focus return are retained. The underlying page is scroll-locked while open. Preview blocks use gentle green fills. Success and activity feedback use a forest toast with a polite live region.

## Do's and Don'ts

### Do:

- **Do** preserve the Roots wordmark, outlined sprout, forest actions, and self-hosted DM Sans.
- **Do** keep ordinary work surfaces flat with fine borders and use sage to emphasize relevant context.
- **Do** preserve the 11px functional text floor, final contrast colors, visible focus, and reduced-motion behavior.
- **Do** keep navigation labels visible on phones and place stacked rail content after the main recommendations.
- **Do** pair status colors with readable text or icons and use tabular numerals for metrics and dates.

### Don't:

- **Don't** replace the established operational typography with a new display family or introduce a decorative visual identity.
- **Don't** apply sheet-style shadows or animated lifting to ordinary cards.
- **Don't** turn peach, avatar lavender, or avatar sand into competing primary-action colors.
- **Don't** hide keyboard focus, remove small-text contrast refinements, or depend on color alone to communicate state.
- **Don't** treat generated tonal preview strips as additional production colors or assume unimplemented component states exist.


## Overview timeline extension

The front-page Overview uses a horizontal milestone timeline matching the user-provided reference: a thin neutral baseline, small outlined date markers, a filled forest Today marker, and alternating labels above/below. Funding deadlines, community events, and giving campaigns are separate timeline views. Estimated dates display confirmation text. The timeline scrolls inside its own region on narrow screens.

The main workspace and footer are capped at 1120px and centered. Monthly attendance and fundraising analytics sit below the timeline; the report month is independent of the planning date range. Data, milestone edits, and activity records are illustrative and stored locally.
