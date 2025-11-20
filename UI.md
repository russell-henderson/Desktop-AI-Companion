Here is the updated `UI.md` you can add to the repo.

````markdown
---
Version: 1.0.0
Last Updated: 2025-01-19
Status: Locked (v1.0 Stable)
Owner: UX Engineering
---

# UI Specification

**Version 1.0 - Locked Baseline**

This is the **locked UI specification for v1.0**. The layout structure, color roles, and component behavior described here are frozen for this release. Only micro-spacing adjustments and copy changes are permitted. No structural changes or color role modifications should be made without updating this document first.

Desktop AI Companion has a single primary screen that behaves like a live control room.  
This document describes the visual system and layout so designers and engineers can implement the interface in a consistent way.

---

## 1. Design Principles

1. **Liquid cards on a calm canvas**  
   The app uses a soft, almost white canvas with floating cards. Borders are rare. Separation comes from spacing, shadow, and color.

2. **Action first, data second**  
   The interface should always make it obvious what the user can do next. Buttons, chips, and prompts come before long text.

3. **Semantic color, not decorative color**  
   Cyan means action, orange means risk, emerald means safe, dark ink carries text. The same color should never carry conflicting meaning.

4. **Chat as the hero**  
   Nova is the core of the product. The chat panel owns the lower portion of the screen and is always visible. Only the message list scrolls.

5. **System awareness without fear**  
   Elevated states are clear but not alarming. Problems are highlighted with orange, but the surrounding environment stays calm.

---

## 2. Color System

The palette is defined once in Tailwind config and reused everywhere.

### 2.1 Brand tokens

| Token                | Hex      | Usage                                                                         |
| -------------------- | -------- | ----------------------------------------------------------------------------- |
| `canvas`             | `#F0F4F8`| Main background behind all content                                            |
| `sidebar`            | `#DFEBF7`| Sidebar background                                                            |
| `brand.cyan`         | `#0D95C5`| Primary actions, user messages, active pills                                  |
| `brand.emerald`      | `#0DBC83`| Healthy system, success states                                                |
| `brand.orange`       | `#E45C00`| Alerts, warnings, elevated risk                                               |
| `brand.ink`          | `#243135`| Primary text, dark surfaces                                                   |
| `text.primary`       | `#243135`| Default text color                                                            |
| `text.subtle`        | `#4B5A64`| Secondary text                                                                |
| `text.muted`         | `#7C8A96`| Hints, placeholders                                                           |
| `surface`            | `#FFFFFF`| Card and bubble background                                                    |
| `surface.soft`       | `#F6FAFD`| Soft background for inputs and secondary chips                                |

### 2.2 Elevation and radius

- `borderRadius.card` set to `20px` for all major cards.
- `borderRadius.pill` set to a large value such as `9999px` for pills and circular buttons.
- `shadow.card`  
  `0 4px 20px rgba(0, 0, 0, 0.05)` for floating cards and chat bubbles.

No solid borders on cards unless needed for separation from side panels.

### 2.3 Heavy Fill Areas (Locked for v1.0)

**Heavy color fills are allowed only in three specific areas:**

1. **System Watch Card in alert state**
   * Full `brand.orange` background with white text
   * Small white "Alert" pill on bottom right

2. **User chat bubbles**
   * Full `brand.cyan` background with white text
   * Rounded large corners (`rounded-3xl`)

3. **Primary buttons**
   * Full `brand.cyan` background with white text
   * Examples: Notebook button in WorkspaceCard, Send button in ChatInputBar

**Everything else stays white cards:**
* Quick Prompts card: white background, cyan outline chips only (no cyan fill)
* Active Workspace card: white background, cyan accents only (no cyan fill)
* Nova (assistant) bubbles: white background with `brand.ink` text (no cyan fill)
* All other cards: white on `brand.canvas` with subtle shadows and brand-colored accents

This rule ensures visual hierarchy and prevents color overload.

---

## 3. Global Layout

**This layout structure is locked for v1.0. Only micro-spacing and copy adjustments are allowed. No structure or color role changes.**

The app lives on one screen. **Only the chat message list scrolls.** All other regions (sidebar, header, heads up deck, chat header, input bar) remain fixed.

### 3.1 Root shell

- `<html>`, `<body>`, and `#root` all have `height: 100%`.
- `body` uses `overflow: hidden` to prevent page scroll.
- Root React container:

  ```tsx
  <div className="h-screen flex overflow-hidden bg-canvas">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <HeadsUpDeck />
      <ChatShell />
    </main>
  </div>
````

* Minimum supported resolution is 1920 x 1080. On smaller heights the sidebar middle section becomes scrollable, not the entire window.

### 3.2 Regions

1. **Sidebar** (left rail, fixed width)
2. **Header** (top bar inside main content)
3. **Heads up deck** (three cards row under the header)
4. **Chat shell** (lower main area that owns the conversation)
5. **Notebook slide over** (optional right side overlay panel)

---

## 4. Sidebar

The sidebar is a calm rail that anchors navigation.

### 4.1 Structure

```tsx
<aside className="w-68 h-full bg-sidebar flex flex-col px-4 py-4">
  <SidebarHeader />   // Nova avatar and label
  <SidebarNav />      // Home, Chats, Projects, Notebook, System, Insights
  <SidebarUtilities />// Toolbox, Optimization Mode, Activity
</aside>
```

* `SidebarHeader` height: about 80 to 100 px.
* `SidebarNav` uses `flex-1 min-h-0 overflow-y-auto` so it can scroll independently.
* `SidebarUtilities` sits at the bottom and never scrolls away.

### 4.2 Nova avatar

* Circle `48 x 48 px` with background `brand.cyan` and text `N` in white.

* Card shadow.

* Label under avatar:

  ```text
  Nova
  System aware assistant
  ```

* Set in `text-xs`, `text.text.subtle`.

### 4.3 Navigation items

Each nav item is a pill with icon plus label.

* Layout: `flex items-center gap-2 px-3 py-2 text-sm rounded-pill`.
* Active state:

  * Background `brand.cyan`
  * Text `white`
  * Icon `white`
  * Shadow `shadow.card`
* Inactive state:

  * Background `transparent`
  * Text `text.primary`
  * Icon `text.subtle`
  * Hover state uses `bg-white/60` and `cursor-pointer`.

Items:

1. Home
2. Chats
3. Projects
4. Notebook
5. System
6. Insights

### 4.4 Bottom utilities

Placed under a thin top border:

* `Toolbox`
* `Optimization Mode`
* `Activity`

Use compact variant of `NavItem` with smaller font and optional icon only on very small heights.

---

## 5. Header

The header provides context and immediate system status.

### 5.1 Layout

```tsx
<header className="flex items-center justify-between px-6 pt-4 pb-3">
  <HeaderContext />   // greeting and mode
  <SystemTicker />    // global system state pill
</header>
```

### 5.2 HeaderContext

* Main heading:

  * Text: `Good morning, Russell` (or time based greeting such as `Good afternoon`, `Good evening`).
  * Style: `text-xl`, `font-semibold`, `text.text.primary`.

* Subheading:

  * Example: `System admin mode • Nova is monitoring your machine`.
  * Style: `text-sm`, `text.text.subtle`.

### 5.3 SystemTicker

Pill shaped indicator on the right.

* Base class: `inline-flex items-center gap-2 rounded-pill px-3 py-2 text-sm`.
* Normal state:

  * Background: `surface`
  * Dot: small circle in `brand.emerald`
  * Text: `System nominal`
* Elevated state:

  * Background: `brand.orange`
  * Text: `white`
  * Copy: `GPU usage elevated` or relevant summary.
  * Optional button or chevron `View details` that routes to System view.

---

## 6. Heads Up Deck

Three cards just under the header show the most important status and actions.

Layout:

```tsx
<section className="px-6 pb-3 mb-4">
  <div className="grid grid-cols-3 gap-4">
    <SystemWatchCard />  {/* Component may be named WatchdogCard in code */}
    <QuickPromptsCard />
    <ActiveWorkspaceCard />
  </div>
</section>
```

### 6.1 System Watch Card

Card dedicated to live system metrics. This is one of only three areas where heavy color fills are allowed (when in alert state).

**Alert State** (one of three allowed heavy fills):

* Background: Full `brand.orange` background
* Title: `SYSTEM WATCH` in `text-xs`, uppercase, `text-white/80`.
* Main text: Alert message (e.g., "GPU usage is elevated") in `text-base`, `font-semibold`, `text-white`.
* Subtext: `Last check X minutes ago` in `text-xs`, `text-white/80`, positioned at bottom.
* Alert pill: Small white pill on bottom right with `bg-white`, `text-brand-orange`, `text-xs`, `font-medium`, `px-2`, `py-0.5`, `rounded-full`.

**Nominal State** (white card background):

* Background: `bg-surface` with subtle border or shadow.
* Title: `SYSTEM WATCH` in `text-xs`, `text.text.muted`, uppercase.
* Main text: Status message (e.g., "System nominal") in `text-base`, `font-semibold`, `text.text.primary`.
* Subtext: `Last check X minutes ago` in `text-xs`, `text.text-muted`, positioned at bottom.
* Status indicator: Small emerald dot and label like "System nominal" in `brand.emerald`, `text-xs`, `font-medium`.

**Note:** Can keep always-alert while real status is wired. Once monitoring is connected, both states should be supported.

### 6.2 Quick Prompts Card

Card that surfaces three pre-defined prompts. **White card background only** (no cyan fill - this stays calm).

* Background: `bg-surface`, `rounded-card`, `shadow.card`, `px-4`, `py-3`.
* Title: `QUICK PROMPTS` in `text-xs`, `text.text-muted`, uppercase.

* Inside, a row or wrap list with generous gap spacing (`flex flex-wrap gap-2`):

  * `Summarize incidents`
  * `Check logs`
  * `Create notebook entry`

* Chip style (cyan outline only, not filled):

  * Base: `inline-flex items-center rounded-full border border-brand-cyan px-3 py-1 text-xs font-medium text-brand-cyan`.
  * Hover: `bg-brand-cyan`, `text-white`, with smooth transition.
  * On click they send the text to the current chat input or trigger a tool plus chat template.

**Important:** This card must remain a white card. Chips are outlined, not filled, until hover.

### 6.3 Active Workspace Card

Shows current project context. **White card background only** (no cyan fill - this stays calm).

* Background: `bg-surface`, `rounded-card`, `shadow.card`, `px-4`, `py-3`.
* Title: `ACTIVE WORKSPACE` in `text-xs`, `text.text-muted`, uppercase.

* Content:

  * Project name: Project title as main heading in `text-lg`, `font-semibold`, `text.text-primary`.
  * Subtitle: Project description or short context in `text-sm`, `text.text-subtle`.
  * Path: `Path: C:/Projects/DesktopAI` in `text-xs`, `text.text-muted`.

* Actions:

  * `Notebook` button: Solid cyan primary button (`bg-brand-cyan`, `text-white`, `rounded-pill`, `px-3`, `py-1.5`, `text-xs`, `font-medium`, `shadow-card`). This is one of three allowed heavy fills.
  * `Change project` button: Subtle text link or ghost button (`text-xs`, `text-brand-cyan`, `hover:underline`).

**Note:** Marketing tagline can be removed to reduce clutter. Keep only project information.

---

## 7. Chat Shell

Chat is the primary working surface. It occupies most of the vertical space.

### 7.1 Layout

```tsx
<section className="flex-1 min-h-0 px-6 pb-6 flex flex-col gap-3">
  <ChatPanel />
</section>
```

`ChatPanel` internals:

```tsx
<div className="flex-1 min-h-0 flex flex-col">
  <ChatHeaderBar />
  <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
    {/* messages */}
  </div>
  <ChatInputBar />
</div>
```

Rules:

* Only the messages container scrolls.
* `ChatInputBar` sits on the bottom and never leaves view.
* Scrollbar style matches system defaults with subtle track and thumb.

### 7.2 Chat Header Bar

Live context about the current conversation.

* Title: Current chat name (e.g., `Crash triage session`) in `text-base`, `font-semibold`, `text.text-primary`, left aligned.
* Small chips on the right (same style as Quick Prompt chips, not heavy buttons):

  * Project badge: `inline-flex items-center rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-subtle`
  * `Move to project` button: Same chip style with hover state
  * Model badge: Same chip style showing current model name from ModelContext

### 7.3 Message Bubbles

Two distinct styles: user and Nova. **Only user bubbles use heavy fill** (one of three allowed heavy fills).

**User Bubble** (heavy fill - brand.cyan):

* Alignment: `self-end`, max width 70%.
* Container: `max-w-[70%]`, right aligned.
* Bubble style:

  * `rounded-3xl`, `bg-brand-cyan`, `text-white`, `px-4`, `py-3`, `shadow-card`.
  * This is one of three allowed heavy fills.
* Timestamp: Small muted text below bubble, right aligned.

  * `mt-1 text-[10px] text-text-muted text-right`.

**Nova Bubble** (white card - no fill):

* Alignment: `self-start`, max width 72%.
* Container: `max-w-[72%] self-start`, left aligned.
* Bubble style:

  * `rounded-3xl`, `bg-surface`, `text-text-primary`, `px-4`, `py-3`, `shadow-card`.
  * **This is a white card**, not filled. Maintains calm appearance.
* Timestamp: Small muted text below bubble, left aligned.

  * `mt-1 text-[10px] text-text-muted`.
* Code blocks inside Nova messages:

  * Dark `brand.ink` background (`#243135`), light text (`#ffffff` or white).
  * Monospace font (`font-mono`), rounded corners (`rounded-lg`), padding (`px-3 py-2`).
  * Font size: `text-xs`.

System messages and tool reports can use a variant of Nova bubble with accent strip or label such as `Process Inspector`, but still use white card background.

### 7.4 Chat Input Bar

Floating pill input centered at the bottom of the chat area.

Layout:

```tsx
<div className="mt-3 flex items-center justify-center relative">
  <div className="w-full max-w-4xl bg-surface rounded-full shadow-card flex items-center px-3 py-2 gap-3">
    <AttachButton />
    <NotebookButton />  {/* Optional, outlined pill */}
    <TextField />
    <SendButton />
  </div>
</div>
```

* Attach button (left side):

  * Small circle with `bg-surface-soft`, `text-text-muted`, `rounded-full`, `p-2`.
  * Icon or emoji for attachment functionality.
* Notebook button (optional, left of input):

  * Outlined pill: `hidden sm:inline-flex items-center rounded-full border border-brand-cyan px-3 py-1 text-xs text-brand-cyan hover:bg-brand-cyan hover:text-white transition`.
  * Reuses cyan outline style from Quick Prompts chips (not filled).
* Text field (center):

  * `flex-1`, borderless, `bg-transparent`, `text-sm`, `text-text-primary`.
  * Placeholder: `Message Nova...` in `text-text-muted`.
* Send button (right side, most prominent):

  * Circle, solid cyan: `h-9 w-9 flex items-center justify-center rounded-full bg-brand-cyan text-white`.
  * This is one of three allowed heavy fills.
  * Disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`.
  * Icon: `➤` or similar send indicator.

---

## 8. Notebook Slide Over

The notebook is a secondary view that must not shrink the chat area permanently. It appears as an overlaid side panel.

### 8.1 Trigger points

* Notebook nav item in Sidebar.
* Notebook button in WorkspaceCard.
* Notebook button in the top bar utility area, if present.

### 8.2 Panel behavior

* Opens from the right with a slide transition.
* Width: about `360 to 400 px` on desktop.
* Full height, anchored to the right edge.
* Keeps a subtle shadow against the main content.

Layout:

```tsx
<div className="fixed inset-y-0 right-0 w-[380px] bg-surface shadow.card border-l border-surface.soft flex flex-col">
  <NotebookHeader />
  <NotebookBody />
</div>
```

`NotebookHeader`:

* Title `Notebook`.
* Close button `×` in the top right.
* Optional search field.

`NotebookBody`:

* Tabs or filters such as `All`, `Templates`, `Prompts`.
* List of entries with titles and tags.
* Detail view or simple preview.
* Insert action that sends content to the active chat input.

---

## 9. Model Selector and Persona

The visible model and persona must match the model that the backend uses.

### 9.1 ModelContext

* The renderer reads `currentModel` through a React context.

* ModelContext calls IPC methods:

  * `ai:listModels`
  * `ai:getModel`
  * `ai:setModel(modelId)`

* On startup, context loads the current model from main.

* `ai:sendMessage` always uses `currentModel` to build the request.

### 9.2 Model card

The model selector lives close to the SystemTicker or in the top right row of cards.

* Card style:

  * Small white card with `rounded-card`, `shadow.card`, `px-4`, `py-3`.
* Content:

  * Label: `MODEL` in `text-xs`, uppercase, `text.text.muted`.
  * Selector: native `select` or custom control with options such as `gpt-4o-mini`, `gpt-5-nano`.
  * Persona label: `Nova • System expert` in `text-xs` under the selector.

---

## 10. Responsiveness

Target is desktop first with graceful handling on slightly smaller windows.

* For widths above 1440 px:

  * Heads up deck uses three equal columns.
* Between 1024 px and 1440 px:

  * Heads up deck can wrap to two columns on the first row and one card on the second row.
* Heights below 900 px:

  * Sidebar nav becomes scrollable.
  * Main content still avoids global scroll. Chat messages list scrolls more.

Mobile screens are out of scope for this version and can fall back to a minimal view if needed later.

---

## 11. Accessibility (Locked for v1.0)

Accessibility requirements that are part of the v1.0 locked specification:

* Text contrast:

  * All foreground text must pass WCAG AA on its background. Palette choices already support this, but verify any new combinations.
* Keyboard:

  * Sidebar nav, Heads up chips, chat input, and buttons are keyboard focusable.
  * Focus state uses a visible outline in `brand.cyan`.
* Screen readers:

  * Landmark roles:

    * `aside` for Sidebar.
    * `header` for Header.
    * `main` for main content.
  * SystemTicker includes an `aria-live="polite"` region so status changes are announced.
  * Notifications and alerts from system tools use `role="status"` or `role="alert"` depending on severity.

---

## 12. Future Expansion Slots (Post-v1.0)

**Note:** These are post-v1.0 considerations. They are not part of the locked v1.0 specification.

Reserved areas for later features so the layout does not need to be redesigned:

* Additional row in HeadsUpDeck for advanced insights.
* Small summary strip above ChatShell for multi model comparison.
* Compact mode switch for power users that reduces padding and card spacing.

---

## 13. Version Lock Notice

**This UI specification is locked for v1.0.**

* Layout structure: Fixed. No changes to sidebar, header, heads up deck, or chat shell arrangement.
* Color roles: Fixed. Only three heavy fill areas allowed (System Watch alert, user bubbles, primary buttons). All other cards remain white.
* Component behavior: Fixed. Only the chat messages list scrolls. All other regions remain fixed.

**Allowed changes:**
* Micro-spacing adjustments (padding, margins within existing structure)
* Copy/text updates
* Bug fixes that align with this specification

**Not allowed without updating this specification:**
* Structural layout changes
* Color role modifications
* New heavy fill areas
* Changes to scroll behavior

This specification is the source of truth for the Desktop AI Companion interface v1.0.  
Any new UI work should reference these sections and reuse the tokens and patterns defined here.

```bash
::contentReference[oaicite:0]{index=0}
```
