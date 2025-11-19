---
Version: 0.1.0
Last Updated: 2025-11-19
Status: Draft
Owner: Desktop AI Companion Team
---

# BRAND_GUIDELINES.md

## 1. Brand Identity

### 1.1 Mission

Give power users a trusted desktop partner that understands their Windows system, current work, and personal workflow, then explains everything in clear language.

### 1.2 Positioning

Desktop AI Companion is a system aware assistant for Windows. It combines a modern chat experience, targeted system tools, and a personal knowledge base in one focused application.

### 1.3 Brand Values

- **Clarity**  
  Always explain what is happening, what was inspected, and what will change.

- **Control**  
  The user decides when scans run and when changes occur. The assistant recommends, it does not act silently.

- **Trust**  
  Data is stored locally by default. The app is explicit about permissions and scopes.

- **Support**  
  The assistant aims to reduce friction around troubleshooting, configuration, and day to day tasks.

- **Continuity**  
  Projects, chats, and notebook entries form a long term memory that the assistant can reuse.

### 1.4 Personality

The assistant persona (default name: **Nova**) should feel:

- Calm and confident, never dramatic.
- Technically competent but not arrogant.
- Helpful and proactive with suggestions, yet respectful of user control.
- Curious about context. It asks clarifying questions before risky actions.

Nova is a specialist, not a comedian. Light warmth is welcome. Jokes and small talk stay in the background.

---

## 2. Naming and Terminology

Use these terms consistently across UI copy, docs, and marketing.

- **Desktop AI Companion**  
  The product name. Capitalize each word.

- **Nova**  
  Default name for the assistant persona inside the app. Users may rename it in settings.

- **Project**  
  A manually created workspace that links chats, folders, and notebook entries.

- **Chat**  
  A conversation thread between the user and Nova.

- **Notebook**  
  A personal vault of prompts, snippets, notes, and templates with semantic search.

- **Toolbox**  
  A set of explicit system tools such as Process Inspector, Event Log Triage, and Network Check.

- **Insight**  
  A short, structured note created by the app, usually as the result of monitoring or a tool run.

- **Notification**  
  A time stamped alert that slides up from the bottom and can be opened for more detail.

- **Scan**  
  A user initiated system inspection. Never imply that scans start on their own.

---

## 3. Visual Identity

### 3.1 Color Palette

Base palette (provided):

- Orange: `#E65D00`
- Light blue: `#EDF7FD`
- Green: `#0CBD85`
- Blue: `#0D99C9`
- Cool grey: `#D8E4ED`

Token naming:

- `--color-primary-blue` = `#0D99C9`
- `--color-primary-green` = `#0CBD85`
- `--color-primary-orange` = `#E65D00`
- `--color-surface-main` = `#EDF7FD`
- `--color-surface-alt` = `#D8E4ED`
- `--color-text-main` = `#10212B` (derived dark navy, not pure black)
- `--color-text-muted` = rgba version of text color at 70 percent

Severity colors mapped into the palette:

- Info: use `--color-primary-blue` for icons, badges, and progress accents.
- Success: use `--color-primary-green`.
- Warning: use a softer orange derived from `--color-primary-orange` at slightly lower saturation.
- Critical: use `--color-primary-orange` at full strength, paired with calm surfaces. Do not use flashing effects.

Rules:

- Do not use bright red outside critical situations.  
- Keep surfaces light with subtle gradients. Cards should feel soft and approachable.

### 3.2 Typography

Primary font: **Inter** (preferred) or **System UI** stack as fallback.

Usage:

- Page titles and main headings:  
  - Weight 600 or 700  
  - Size range 22 to 28 px
- Section headings and card titles:  
  - Weight 600  
  - Size range 16 to 20 px
- Body text:  
  - Weight 400  
  - Size 13 to 15 px
- Metadata, labels, and captions:  
  - Weight 500  
  - Size 11 to 12 px  
  - Use muted text color.

General rules:

- Limit to two font weights on any single screen.  
- Line height 1.4 to 1.6 for body text.  
- Avoid all caps for long phrases. Reserve all caps for short labels or tags.

### 3.3 Logo and Iconography

**Product icon**

- Simple square icon with:
  - Rounded rectangle representing a card.  
  - Small circular accent in the top corner to represent Nova.  
  - Use blue or green as primary fill, orange as accent.

Spacing:

- Maintain minimum padding equal to 10 percent of the icon size around the icon when placed near other elements.

**Assistant avatar**

- Animated or still avatar that:
  - Avoids human likeness that suggests gender or age.
  - Uses colors from the palette.
  - Can display subtle state changes (listening, thinking, idle) through motion or glow.

**Icons**

- Stroke based, rounded corners, medium stroke width.
- Consistent grid (typically 20 or 24 px artboard).
- Use the same icon set across the app. Do not mix sharp and rounded icon styles.

---

## 4. UI and UX Guidelines

### 4.1 Layout

- Use a clear primary column for the dashboard content and chat area.
- Keep the left sidebar persistent for navigation and context.
- Cards (D, E, F, G, H) should align on a simple grid:
  - Shared heights in rows.
  - Even horizontal spacing.
- Chat area K should expand to fill vertical space, with the input locked to the bottom.

### 4.2 Cards and Surfaces

- Cards have:

  - Rounded corners (8 to 16 px radius).
  - Soft inner gradient or subtle noise, not flat white.
  - Shadow with low opacity and wide blur for a floating effect.

- Primary cards (F, G, H) are more colorful.  
- Secondary cards (D, E, notifications list) use lighter surfaces and accent bars.

### 4.3 Severity and Status

- Use color and icon shape together:

  - Info: blue circle with "i" or radar icon.
  - Success: green check.
  - Warning: orange triangle.
  - Critical: orange circle with exclamation mark.

- Combine with clear text labels such as "Warning" or "Critical" at the start of the message. Do not rely on color alone.

---

## 5. Content Guidelines

### 5.1 Voice and Tone

- Speak in first person singular for the assistant:  
  - "I checked your processes and found three that use significant memory."
- For actions and changes, be explicit:  
  - "If you agree, I will end this process."
- Avoid slang and memes.  
- Keep sentences concise, especially in tool reports and notifications.

### 5.2 Explanations

- Always separate three parts:

  1. **What** was done or found.
  2. **Why** it matters.
  3. **Next** available actions.

Example:

> I scanned your network connection and noticed intermittent packet loss.  
> This can cause lag or timeouts in online tools.  
> You can try restarting your router or run a deeper network test.

### 5.3 Error Messages

- Avoid blame. Focus on steps forward.
- Provide at least one concrete suggestion.
- Examples:

  - "I could not read the event log due to access restrictions. Try running the app as administrator."
  - "The file path no longer exists. You can browse to a new location or unlink it from this project."

---

## 6. Usage Examples

### 6.1 Dashboard Card Copy

- D System card title: "System Overview"
- Subtitle: "Quick look at current health."
- CTA button: "Open toolbox"

### 6.2 Notification Copy

- Title: "High CPU usage detected"
- Body: "Your system has been above 90 percent CPU for 5 minutes. Open Process Inspector to see which apps are responsible."

### 6.3 Notebook Entry Names

- "Bug report prompt template"
- "GPU driver crash checklist"
- "Linux log triage snippet"
- "Client kickoff call notes"

Keep names action oriented and descriptive. Avoid vague labels such as "Stuff" or "Notes 3".

