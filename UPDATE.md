Got it. You want:

* Whole app visible on one screen at full HD.
* Only the **chat message list** scrolls, not the whole page.
* Sidebar tightened so its bottom section is visible without page scroll.
* Top right area split so **Model** and **Notebook/Settings** feel like two separate zones and the model label stays in sync with the actual model.

I will break this into concrete layout changes that Cursor can implement.

---

## 1. Make the whole shell one screen, with only chat scrolling

### Goal

* No document level scroll on a normal desktop window.
* Layout is `sidebar + main` that fills the viewport height.
* Inside main: `top dashboard` with natural height, `chat panel` fills the remaining space and has its own vertical scroll.

### Tasks

**1.1 Root layout**

In your top level `App` component (or whatever wraps `Sidebar` and the main content), change to a pure flex layout that owns the full viewport height:

```tsx
// App.tsx (structure example)
export const App = () => (
  <div className="h-screen flex overflow-hidden bg-surface">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">
      <TopBar />   {/* model, notebook, settings, etc */}
      <div className="flex-1 flex flex-col gap-4 px-6 pb-4 pt-2 overflow-hidden">
        <DashboardGrid />  {/* A, C, D, E, F, G, H cards */}
        <ChatPanel />      {/* I and chat area */}
      </div>
    </main>
  </div>
);
```

Global styles:

```css
/* globals.css or index.css */
html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  overflow: hidden; /* stop page scrolling */
}
```

Key points:

* `h-screen` on the root container.
* `overflow-hidden` on the root and main so the browser never adds scrollbars for the whole page.
* Only nested elements decide where scrolling happens.

**1.2 Chat panel set to fill remaining height and scroll internally**

Inside `ChatPanel`, treat it as a column that expands within the available height and lets the **messages area** scroll:

```tsx
const ChatPanel = () => (
  <section className="flex flex-col flex-1 min-h-0 bg-white rounded-3xl shadow-sm">
    <ChatHeader className="px-4 py-3 border-b" />
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
      {/* message bubbles */}
    </div>
    <ChatInput className="px-4 py-3 border-t shrink-0" />
  </section>
);
```

Important bits:

* `flex-1 min-h-0` on the wrapper so it can grow and shrink.
* `flex-1 min-h-0 overflow-y-auto` on the message list so only messages scroll.
* `ChatInput` uses `shrink-0` so it always stays visible at the bottom, never pushed out of view.

**1.3 Tighter vertical rhythm so everything fits (cards and header)**

You are close already, but to guarantee no extra vertical scroll:

* Reduce vertical padding on top level containers: use `pt-2 pb-4` instead of `pt-6 pb-8`.
* Remove any large `mt-8` or `mb-8` between sections. Prefer `gap-4` on the parent flex.
* Ensure dashboard cards (D, E, F, G, H) have a reasonable fixed or min height, not something like `min-h-[260px]`. Somewhere around `min-h-[160px]` is usually enough.

Cursor checklist:

* Search for large vertical margins or padding in dashboard related components and normalise to a smaller set: `py-3` for cards, `gap-4` for rows.

---

## 2. Sidebar: keep top and bottom visible without page scroll (area 3)

Goal:

* Left column should show avatar, main nav, and the small bottom section (Toolbox, Optimization Mode, Activity) in a single column that fits the viewport height.
* If it does overflow on a very short screen, the **sidebar itself** should scroll, not the whole page.

Recommended structure:

```tsx
const Sidebar = () => (
  <aside className="w-72 h-full bg-primary-700 text-white flex flex-col">
    {/* top: avatar and label */}
    <div className="px-4 pt-4 pb-3">
      <AssistantAvatar />
      <p className="mt-2 text-sm opacity-80">Nova\nSystem aware assistant</p>
    </div>

    {/* middle: main nav + context list, scrollable if needed */}
    <nav className="flex-1 min-h-0 overflow-y-auto px-4 space-y-2">
      {/* Home, Chats, Projects, Notebook, System, Insights */}
      {/* Context pills */}
    </nav>

    {/* bottom: toolbox, optimization mode, activity */}
    <div className="px-4 pb-4 pt-3 space-y-2 border-t border-primary-600">
      <SidebarButton icon="wrench">Toolbox</SidebarButton>
      <SidebarButton icon="sparkles">Optimization Mode</SidebarButton>
      <SidebarButton icon="clock">Activity</SidebarButton>
    </div>
  </aside>
);
```

Key tricks:

* `flex flex-col` with `h-full` on the outer sidebar.
* Middle nav uses `flex-1 min-h-0 overflow-y-auto` so only that column scrolls if it must.
* Bottom block is fixed with `border-t`, so it always hugs the bottom of the window.

This directly solves issue 3 from your screenshot.

---

## 3. Top right: make Model accurate and visually separated from Notebook/Settings (area 4 and 5)

You want:

* The **model card** to always show the actual model that the AI service is using.
* Notebook and Settings to feel like a separate utility block, similar to the second example screenshot.

### 3.1 Model state wiring

Right now the label is static. You need a single source of truth for the current model that both:

* The main process uses (AIService).
* The renderer displays (Model card and dropdown).

Basic pattern:

1. In preload, expose functions:

   ```ts
   // preload.ts
   contextBridge.exposeInMainWorld("desktop", {
     ai: {
       getCurrentModel: () => ipcRenderer.invoke("ai:getModel"),
       setCurrentModel: (modelId: string) => ipcRenderer.invoke("ai:setModel", modelId),
       listModels: () => ipcRenderer.invoke("ai:listModels"),
     },
     // ...
   });
   ```

2. In the renderer, create a simple `ModelContext` that calls `desktop.ai.getCurrentModel()` on mount and updates both context and main when the user changes the dropdown.

3. The header card then reads from `ModelContext` so the label always matches:

   ```tsx
   const { currentModel, setModel } = useModelContext();

   <select
     value={currentModel.id}
     onChange={e => setModel(e.target.value)}
     className="..."
   >
     {models.map(m => (
       <option key={m.id} value={m.id}>{m.label}</option>
     ))}
   </select>

   <p className="text-xs text-muted">
     {currentModel.description}
   </p>
   ```

As long as `setModel` calls `desktop.ai.setCurrentModel`, AIService and UI stay in sync.

### 3.2 Visual separation between Model and Notebook/Settings

Wrap the top right area (the big red box you drew) in a two card layout:

```tsx
const TopBar = () => (
  <header className="flex items-start justify-between gap-4 px-6 pt-4 pb-2">
    {/* left side: title, maybe date */}
    <div>
      <h1 className="text-lg font-semibold text-surface-900">Dashboard</h1>
      <p className="text-sm text-surface-500">System overview and chat</p>
    </div>

    {/* right side: model card + utility card */}
    <div className="flex items-stretch gap-4">
      <ModelCard />      {/* shows GPT-x + persona */}
      <UtilityCard />    {/* Notebook + Settings buttons */}
    </div>
  </header>
);
```

`ModelCard` example:

```tsx
const ModelCard = () => {
  const { currentModel, setModel } = useModelContext();

  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex flex-col min-w-[220px]">
      <span className="text-xs font-medium text-surface-500 tracking-wide">MODEL</span>
      <div className="mt-1 flex items-center justify-between gap-2">
        <select
          value={currentModel.id}
          onChange={e => setModel(e.target.value)}
          className="text-sm font-semibold text-surface-900 bg-surface-50 rounded-full px-3 py-1 border border-surface-200"
        >
          {/* options */}
        </select>
      </div>
      <p className="mt-1 text-xs text-surface-500">
        {currentModel.personaLabel}
      </p>
    </div>
  );
};
```

`UtilityCard` example:

```tsx
const UtilityCard = () => (
  <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
    <button className="rounded-full bg-accent-blue text-white text-sm font-medium px-4 py-2">
      Notebook
    </button>
    <button className="rounded-full bg-surface-50 border border-surface-200 text-sm font-medium text-surface-800 px-4 py-2">
      Settings
    </button>
  </div>
);
```

Visual cues that match your reference image:

* Cards have soft shadows and rounded corners.
* Model card and utility card are spaced with `gap-4`.
* Notebook button is a strong pill, Settings is a subtle pill.
* The whole block is shorter vertically than before which also helps with the “fit everything on one screen” requirement.

---

## 4. Cursor prompt you can paste

Here is a compact instruction you can give Cursor so it actually applies this:

> 1. Refactor the root layout (App, Sidebar, ChatPanel, TopBar) so the app uses a full height flex layout: no document level scrolling, only the chat message area scrolls. Use `h-screen`, `flex`, `overflow-hidden`, and `min-h-0` as needed so the chat input is always visible at the bottom of the screen.
> 2. Tighten vertical spacing: reduce large `mt-*` or `mb-*` on dashboard cards and surrounding containers and rely on `gap-4` plus `py-3` so the whole dashboard and chat panel fit in a 1080p window.
> 3. Update Sidebar so it is `flex-col h-full` with three zones (avatar, nav, bottom actions). Middle nav should use `flex-1 min-h-0 overflow-y-auto` so the bottom actions (Toolbox, Optimization Mode, Activity) are always visible.
> 4. Create `ModelContext` wired to `window.desktop.ai.getCurrentModel`, `setCurrentModel`, and `listModels`, and update AIService so chat calls always use that model. Update the model dropdown in the top bar to read from this context so the label always reflects the selected model.
> 5. Replace the current top right block with two distinct cards: `ModelCard` and `UtilityCard`. ModelCard shows model selector and persona description, UtilityCard shows Notebook and Settings buttons. Match the rounded card, pill buttons, and soft shadow style from UI.md and BRAND_GUIDELINES.
> 6. Run the full test suite and ensure 82/82 tests still pass, and visually confirm that on a full screen window the only scrollable area is the chat message list.

If you like, next we can tune specific card heights and typography so your layout lands even closer to the second reference image.
