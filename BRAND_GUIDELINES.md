# BRAND_GUIDELINES.md

```markdown
Desktop AI Companion · Nova

Last updated: 2025-11-19  

These guidelines define the visual and verbal identity for the **Desktop AI Companion** and its system avatar **Nova**.  
They are the source of truth for colors, typography, spacing, and tone.  
See `UI.md` for layout rules and component structure.
```

---

## 1. Brand Foundations

### 1.1 Product identity

**Product name**  
Desktop AI Companion

**Persona**  
Nova, a calm and precise system expert who helps Windows power users understand and manage their machine.

**Positioning**  
A trusted, local desktop assistant that can speak both human and system language.  
It focuses on three things:

1. Clear visibility into system health  
2. Fast, focused actions through tools  
3. Reusable knowledge through projects and notebook entries  

### 1.2 Brand values

- **Clarity first**  
  Information is always more important than decoration.

- **Action over curiosity**  
  Every panel, card, and prompt should invite a concrete next step.

- **Reassuring technical depth**  
  Nova is not playful or quirky. It is kind, steady, and deeply competent.

- **Safety and control**  
  The user is always in control of scans, tools, and changes.

---

## 2. Color System

The palette is opinionated and tightly scoped.  
Colors are never decorative. Every color has a role.

### 2.1 Core tokens

These names should be configured in `tailwind.config.cjs` under `theme.extend.colors.brand`  
and treated as the single source of truth.

| Token             | Hex      | Purpose                                                     |
| ----------------- | -------- | ----------------------------------------------------------- |
| `brand.canvas`    | `#F0F4F8`| Global app background behind all cards                      |
| `brand.sidebar`   | `#DFEBF7`| Sidebar background                                         |
| `brand.cyan`      | `#0D95C5`| Primary action, user chat bubbles, active nav pills        |
| `brand.emerald`   | `#0DBC83`| Healthy system, success states, “all good” badges          |
| `brand.orange`    | `#E45C00`| Warnings, high severity system alerts                      |
| `brand.ink`       | `#243135`| Primary text and dark UI surfaces                          |
| `brand.white`     | `#FFFFFF`| Cards, chat bubbles, surface panels                        |

Supporting neutrals can be derived from Tailwind gray, or introduced as:

- `neutral.100` `#E3E8EF`  
- `neutral.200` `#CBD2E1`  
- `neutral.700` `#3B4250`

### 2.2 Usage rules

**Primary actions**  

- Buttons that send, run tools, or confirm operations use `brand.cyan` fill and white text.  
- Hover state uses a slightly darker cyan (`#0B7EA6` suggested) with the same text color.

**System health**

- Healthy or idle: accents in `brand.emerald`.  
- Elevated or warning: cards and badges in `brand.orange`.  
- Critical: `brand.orange` background with `brand.ink` text or white text, plus icon.

**Chat bubbles**

- User messages: `brand.cyan` background, white text, rounded “pill” shape.  
- Nova messages: white card with `brand.ink` text and `shadow.card`.

**Notebook and projects**

- Neutral by default: white cards on `brand.canvas`.  
- Pinned or important entries can use a left border or small tag in `brand.cyan`.

**Do not**

- Do not use `brand.orange` for buttons that are not warnings or destructive actions.  
- Do not mix `brand.cyan` and `brand.orange` in the same component unless it clearly represents a comparison of safe vs warning.  
- Do not introduce new accent colors without adding them to this file and `tailwind.config`.

---

## 3. Elevation, Radius, and Spacing

### 3.1 Corner radius

Configure in Tailwind:

- `rounded.card` → `1.25rem` (20 px) for all main cards and large buttons  
- `rounded.full` for pills, nav items, and chat bubbles  
- Form fields may use `rounded-lg` if they need slightly tighter geometry

Rules:

- All primary surfaces (cards, toasts, modals, slide overs) share `rounded.card`.  
- Inner elements (tags, chips) use `rounded-full` or `rounded-lg` only.

### 3.2 Shadows

Configure in Tailwind:

- `shadow.card` → `0 14px 30px rgba(0, 0, 0, 0.07)`  

Usage:

- Cards, chat bubbles (Nova), toasts, slide overs.  
- Never apply heavier shadows than `shadow.card`.  
- Hover can use a slightly stronger y offset but the same blur and alpha.

### 3.3 Spacing

Adopt an 8 px spacing grid:

- XS: 4 px  
- S: 8 px  
- M: 16 px  
- L: 24 px  
- XL: 32 px  

Rules:

- Card padding: 24 px  
- Gap between major sections: 24–32 px  
- Gap between chat messages: 8–12 px  

---

## 4. Layout Principles

High level layout is fully defined in `UI.md`.  
Brand guidelines here describe the intended feel.

1. **Full height shell**  
   - `App` is a `flex` container with sidebar on the left and main content on the right.  
   - The only scrollable region is the chat message list.

2. **Sidebar rail**  
   - Background `brand.sidebar`.  
   - Avatar at the top, main nav pills in the middle, utilities (Toolbox, Optimization Mode, Activity) pinned to the bottom.  
   - Active nav pill: `brand.cyan` fill, white text. Inactive: transparent, `brand.ink` text.

3. **Heads up deck**  
   - Three main cards at the top of the main area: Watchdog, Quick Actions, Workspace.  
   - These sit on the `brand.canvas` background with `shadow.card` and `rounded.card`.  
   - Watchdog uses status colors (emerald for ok, orange for elevated) according to system state.

4. **Chat panel as the hero**  
   - Occupies the lower 60 to 70 percent of the viewport.  
   - Visible without vertical scroll except inside the message list.  
   - Input bar is a floating pill above the bottom edge, not glued to the window frame.

5. **Notebook slide over**  
   - Right side slide over panel that opens from Notebook controls (top header and chat input).  
   - Background white, `shadow.card`, `rounded.card` on the inner edge.  
   - Never permanently steals horizontal space from the chat when closed.

---

## 5. Typography

### 5.1 Font stack

Use **Inter** as the primary typeface, with the following stack:

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
````

### 5.2 Type scale

Recommended Tailwind classes:

- Page title: `text-2xl` or `text-3xl`, `font-semibold`
- Section titles and card headings: `text-lg`, `font-semibold`
- Body text: `text-sm` or `text-base`, `font-normal`
- Small labels, tags: `text-xs`, `font-medium`

### 5.3 Text color rules

- Default text on light surfaces: `brand.ink`
- Muted text: `text-slate-500` or `rgba(36, 49, 53, 0.7)`
- Text on `brand.cyan`: white
- Text on `brand.orange`: white or `brand.ink` depending on contrast needs

---

## 6. Interaction and States

### 6.1 Navigation

- Active nav items: filled pill with `brand.cyan`.
- Hover: lighter cyan background, `cursor-pointer`.
- Focus: visible focus ring using Tailwind `ring-2 ring-offset-2 ring-brand.cyan`.

### 6.2 Buttons

**Primary**

- Fill `brand.cyan`, white text, `rounded-full` or `rounded-card`.
- Hover: darker cyan, subtle scale up (`scale-105`) within motion preferences.
- Disabled: `opacity-60` and `cursor-not-allowed`.

**Secondary**

- White or transparent background with `brand.cyan` border and text.
- Hover: light cyan background.

**Destructive / warning**

- Use `brand.orange` only when the action is destructive or directly tied to a warning card.
- Confirm flows should require clear copy, not just color.

### 6.3 Severity mapping

Use the palette and tokens consistently:

- **Info:** soft blue or neutral accents; usually not color coded heavily.
- **Success / Healthy:** `brand.emerald`.
- **Warning / Elevated:** `brand.orange` as main accent.
- **Critical:** combination of `brand.orange` fill and strong iconography, with clear copy.

### 6.4 Motion

- Use small, quick transitions (150–200 ms) on hover, focus, toast slides, and slide overs.
- Respect `prefers-reduced-motion` and disable non essential transitions when set.

---

## 7. Voice and Content

### 7.1 Tone

Nova uses:

- Short, clear sentences
- Direct recommendations, no hype
- Occasional reassurance when reporting scary issues, such as crashes or high GPU usage

Examples:

- Good: “GPU usage is elevated. I recommend running Process Inspector to see which app is responsible.”
- Avoid: “Uh oh, your GPU is freaking out.”

### 7.2 System insight messages

System notifications and heads up messages should:

- State what happened
- State why it matters
- Offer one clear next action

Pattern:

> `What` + `Impact` + `Next step`

Example:

> “New startup program detected. It may slow boot time. Open Toolbox to review startup entries.”

### 7.3 Notebook entries

- Titles are concise and action oriented.
- Tags help retrieval: `gpu`, `driver`, `bug-report`, `checklist`.
- Templates should explain how to use them in one short sentence in the description, not inside the main content.

---

## 8. Accessibility

- Aim for WCAG AA contrast for all text.
- Check cyan and orange usage on white and on the sidebar to ensure contrast is sufficient.
- Never communicate severity using color alone. Include icons and clear labels like “Warning” or “Healthy”.
- All interactive elements must be reachable with keyboard navigation and show a visible focus state.

---

## 9. Implementation Checklist

When implementing or refactoring UI, verify:

1. **Tailwind tokens**

   - `brand.canvas`, `brand.sidebar`, `brand.cyan`, `brand.emerald`, `brand.orange`, `brand.ink` are defined.
   - `rounded.card` and `shadow.card` exist and are used on all cards.

2. **Layout alignment with `UI.md`**

   - Full height layout, single scroll region in chat message list.
   - Sidebar and heads up deck match the described positions.

3. **Color semantics**

   - Orange appears only in alerts, warnings, and critical states.
   - Cyan appears in actions and user chat only.
   - Emerald appears only for healthy or success states.

4. **Chat experience**

   - Nova vs user bubbles follow the color rules.
   - Notebook slide over opens from Notebook controls and uses the specified styling.

5. **Accessibility**

   - Focus rings visible.
   - Text contrast passes AA in both base light palette and any future variants.

---

## 10. Future Extensions

When adding new features or views:

- Reuse the existing tokens and component patterns before inventing new ones.
- If a new color or elevation level is required, update this file first and then `tailwind.config`.
- Confirm that any new alert types still fit within the cyan, emerald, orange, and ink system.

These guidelines keep the Desktop AI Companion coherent as it grows.
All visual and copy changes should be checked against this document and `UI.md` before merging.

```bash
::contentReference[oaicite:0]{index=0}
```
