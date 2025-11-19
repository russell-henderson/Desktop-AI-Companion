# Copilot Instructions for Desktop AI Companion

## Project Overview

**Desktop AI Companion** is an Electron desktop application that wraps a React UI for local OpenAI prompt entry and response display. The architecture separates the main process (Electron) from the renderer (React).

**Stack:** Electron 24, React 18 (via CRA), OpenAI SDK v4, plain CSS

## Critical Security Pattern: IPC for API Keys

**The most important pattern in this codebase:**

- **Never expose API keys to the renderer.** The current `App.js` incorrectly creates an OpenAI client in the renderer using `process.env.REACT_APP_OPENAI_API_KEY`.
- **Use IPC + preload bridge instead.** Create `src/main/preload.js` with `contextBridge.exposeInMainWorld()` to expose safe methods. Handle OpenAI calls in `src/main/main.js` using `ipcMain.handle()`.
- **Example flow:**
  - Renderer calls: `window.ai.ask(userPrompt)`
  - Main process listens: `ipcMain.handle('ai:ask', (e, prompt) => openai.createChatCompletion())`
  - Environment variable `OPENAI_API_KEY` stays in main process only, never in `.env.local`

**Files to update when adding OpenAI features:**
- `src/main/main.js` — add `ipcMain.handle()` handlers
- `src/main/preload.js` — expose safe IPC methods via `contextBridge`
- `src/renderer/App.js` — call `window.ai.ask()` or similar, remove OpenAI import
- `package.json` — ensure `dotenv` loads in main, not renderer

## Development Workflow

### Start Development
```bash
npm start
```
This runs `concurrently` to start the React dev server (port 3000) and Electron, which waits for React to be ready via `wait-on`. The Electron window loads from `http://localhost:3000` in dev (see `ELECTRON_START_URL` in `.env`).

### Build for Production
```bash
npm run build          # React bundle to /build
npm run electron-pack  # Package with electron-builder
```

### Debugging
- React DevTools: DevTools are commented out in `main.js` line 24. Uncomment `mainWindow.webContents.openDevTools()` to inspect renderer.
- Main process logs: Log to console in `src/main/main.js`; output appears in the terminal.

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| `src/main/main.js` | Electron main process. Creates window, loads React, manages IPC handlers for OpenAI. |
| `src/main/preload.js` | **Missing file.** Must create this to expose safe IPC methods to renderer via `contextBridge`. |
| `src/renderer/App.js` | React component. User input form and response display. **Remove OpenAI client from here.** |
| `src/renderer/index.js` | React entry point. Mounts App to DOM. |
| `.env` | Environment variables (dev only). **Remove from repo.** Use local `.env.local` instead. Contains `ELECTRON_START_URL` and `REACT_APP_OPENAI_API_KEY`. |
| `public/index.html` | HTML shell for React. Minimal CRA template. |
| `src/styles/App.css` | Basic styling. No design system. |

## Process Architecture

```
[Renderer Process (React)]
    |
    | IPC message
    v
[Preload Bridge (contextBridge)]
    |
    | Safe method call
    v
[Main Process (Electron)]
    |
    | OpenAI SDK call (with API key from env)
    v
[OpenAI API]
```

## Environment & Configuration

- **Dev:** `.env` defines `ELECTRON_START_URL=http://localhost:3000` and `REACT_APP_OPENAI_API_KEY`. React dev server on port 3000.
- **Prod:** `main.js` falls back to `file://` path to bundled HTML. No `.env` in packaged app; use system env vars or secure config store.
- **API Key:** Must load in main process from `process.env.OPENAI_API_KEY`, never expose to renderer.

## Common Tasks

### Add a New OpenAI Feature (e.g., Chat Completions)

1. **In `src/main/preload.js`:**
   ```javascript
   contextBridge.exposeInMainWorld('ai', {
     chat: (messages) => ipcRenderer.invoke('ai:chat', messages)
   });
   ```

2. **In `src/main/main.js`:**
   ```javascript
   const { OpenAI } = require('openai');
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

   ipcMain.handle('ai:chat', async (event, messages) => {
     const response = await openai.chat.completions.create({
       model: 'gpt-4',
       messages: messages
     });
     return response.choices[0].message.content;
   });
   ```

3. **In `src/renderer/App.js`:**
   ```javascript
   const response = await window.ai.chat([
     { role: 'user', content: userInput }
   ]);
   ```

### Add UI Styling

Current: plain CSS in `src/styles/App.css`. Options:
- **Tailwind CSS:** Add `tailwindcss` + `postcss` to dev dependencies. Create `tailwind.config.js`, update `postcss.config.js`, import in App.
- **Mantine:** Install `@mantine/core`, `@mantine/hooks`. Use Mantine providers and components. Includes dark mode, typography system, responsive grid.

No design system exists yet. Use consistent spacing (8px scale), neutral colors, and 12px border radius if adding components.

### Test the Build Locally

```bash
npm run build
npm run electron-pack
```
Check `dist/` for packaged app. On Windows, installer is in `dist/`.

## Anti-Patterns to Avoid

- ❌ Creating OpenAI client in renderer with API key in `.env.local`
- ❌ Using `nodeIntegration: true` in `webPreferences`
- ❌ Omitting `contextIsolation: true`
- ❌ Committing `.env` or keys to repo
- ❌ Calling OpenAI from React directly instead of via IPC

## Code Style & Tooling

- **Language:** JavaScript (ES6 modules in renderer, CommonJS in main).
- **Linting/Formatting:** None configured. Consider ESLint + Prettier for consistency.
- **Testing:** None configured. Consider Vitest for unit tests and IPC bridge integration tests.
- **Type Safety:** No TypeScript. Consider migrating to TypeScript for better DX, especially in main process.

## Known Gaps & Future Work

- No error handling strategy (try-catch, user feedback).
- No logging framework.
- No state management (Redux, Zustand, Jotai).
- No persistent chat history or local storage.
- No IPC request/response cancellation or timeouts.
- No accessibility (a11y) in React components.

When adding features, handle errors gracefully and surface them to the user in the UI.
