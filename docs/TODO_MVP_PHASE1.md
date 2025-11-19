# MVP Implementation Roadmap

## Phase 1: Tooling & Skeleton
- [ ] **Initialize Vite + TypeScript**
    -   Remove `react-scripts`.
    -   Install `vite`, `typescript`, `@types/react`, `@types/node`.
    -   Create `vite.config.ts` and `tsconfig.json`.
- [ ] **Electron Setup**
    -   Create `src/main/main.ts` (TypeScript).
    -   Create `src/main/preload.ts`.
    -   Update `package.json` scripts (`dev`, `build`).
- [ ] **Renderer Entry**
    -   Move `index.html` to `src/renderer`.
    -   Update `src/renderer/index.tsx` and `App.tsx`.
- [ ] **Verify Build**
    -   Ensure `npm run dev` launches Electron with Vite HMR.

## Phase 2: IPC & Data Layer
- [ ] **Database Setup**
    -   Install `better-sqlite3` (or similar).
    -   Create `src/main/db/schema.sql`.
    -   Implement `DataService` to handle migrations and connections.
- [ ] **IPC Bridge**
    -   Define `window.ai` types in `src/types.d.ts`.
    -   Implement `contextBridge` in `preload.ts`.
    -   Set up `ipcMain` handlers in `main.ts`.
- [ ] **OpenAI Integration**
    -   Move OpenAI logic to `src/main/services/AIService.ts`.
    -   Implement `ai:sendMessage` handler.

## Phase 3: UI Shell (A-M Layout)
- [ ] **Tailwind Setup**
    -   Install `tailwindcss`, `postcss`, `autoprefixer`.
    -   Configure `tailwind.config.js` with brand palette.
- [ ] **Layout Components**
    -   Create `Sidebar` (L, M).
    -   Create `TopBar` (A, B, C).
    -   Create `Dashboard` grid container.
- [ ] **Chat UI**
    -   Create `ChatInterface` (I, K, J).
    -   Implement message bubbles and auto-scroll.

## Phase 4: Features
- [ ] **Projects**
    -   Implement `ProjectService` (CRUD).
    -   Create `ProjectView` in renderer.
- [ ] **Notebook**
    -   Implement `NotebookService` (CRUD + Search).
    -   Create `NotebookView` sidebar/panel.
- [ ] **Toolbox v1**
    -   Implement `ProcessInspector` tool (using `ps-list` or similar).
    -   Implement `EventLogTriage` (using `powershell` or native API).
    -   Implement `NetworkCheck`.
    -   Create `ToolboxPanel` UI.
- [ ] **Notifications**
    -   Implement `NotificationService`.
    -   Create slide-up notification component.

## Phase 5: Hardening
- [ ] **Error Handling**
    -   Add global error boundary in React.
    -   Add try/catch blocks in IPC handlers.
- [ ] **Logging**
    -   Implement file-based logging for Main process.
- [ ] **Packaging**
    -   Configure `electron-builder`.
    -   Verify production build artifact.
