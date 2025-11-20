# TODO_MVP_PHASE2 - Projects, Notebook, Toolbox, Monitoring

Cursor, you already implemented the core services, SQLite wrapper, AIService, DashboardService, IPC bridge, Tailwind shell, and chat stack. In this phase, focus on completing the MVP features defined in PRD.md and UI.md.

## Phase 2A - Projects

Goal: Make Projects a first class concept with IPC endpoints and a working UI.

- [ ] Add `ProjectRepository` to the data layer
  - Fields: id, name, description, color, icon, createdAt, updatedAt, optional linkedFolderPath.
- [ ] Extend chat and message models so a chat can belong to a project (projectId nullable).
- [ ] Add IPC handlers
  - `projects:list`
  - `projects:get`
  - `projects:create`
  - `projects:update`
  - `projects:delete`
- [ ] Wire these IPCs through preload, exposed via `window.desktop.projects` or similar.
- [ ] Implement Projects view in the renderer
  - When the sidebar section "Projects" is selected, main content shows a grid or list of projects.
  - Each project card shows name, description, color, and a button to open it.
- [ ] Implement a Project detail view
  - Shows description, linked folder (if any), and recent chats and notebook entries for the project.
- [ ] Add "Move to project" action on chats in ChatHeader or chat list
  - Lets user associate an existing chat with a project.

## Phase 2B - Notebook and Search

Goal: Implement the Notebook data model, IPC, and UI including search.

- [ ] Add `NotebookEntryRepository`
  - Fields: id, title, content, type (prompt, snippet, note, template), tags (string array or comma separated), scope (global or project), pinned, createdAt, updatedAt.
- [ ] Add IPC handlers
  - `notebook:list` (with optional filters for projectId, type, tags)
  - `notebook:get`
  - `notebook:create`
  - `notebook:update`
  - `notebook:delete`
  - `notebook:search` (initially keyword based, ready to switch to embeddings later)
- [ ] Expose notebook IPC through preload as `window.desktop.notebook` or similar API.
- [ ] Implement Notebook view in the renderer
  - Left side: list of entries with filters and search bar.
  - Right side: editor for the selected entry.
- [ ] Integrate Notebook with chat
  - Add an "Insert from notebook" button in ChatInput.
  - Clicking it opens a simple search and selection dialog that inserts the chosen entry into the message input.
- [ ] Prepare for semantic search
  - Add an optional embeddings field in the NotebookEntry schema or a separate embeddings table.
  - Leave a clear TODO in code where the embeddings generation will be plugged in.

## Phase 2C - Toolbox v1

Goal: Implement Process Inspector, Event Log Triage, and Network Check behind IPC and a basic UI.

- [ ] Add toolbox service module in main (for example `ToolboxService.ts`)
  - Define a common `ToolReport` shape with id, toolName, severity, summary, details, createdAt.
- [ ] Implement stubs for three tools
  - `runProcessInspector`
  - `runEventLogTriage`
  - `runNetworkCheck`
  - For now, these can return mock or simplified data if native access is not ready, but structure should match the PRD.
- [ ] Add `ToolReportRepository` for persistence.
- [ ] Add IPC handlers
  - `toolbox:listReports`
  - `toolbox:getReport`
  - `toolbox:run` with a parameter for tool name.
- [ ] Wire IPC into preload as `window.desktop.toolbox`.
- [ ] Implement System view in renderer
  - Tiles or list for the three tools with Run buttons.
  - List of recent reports with severity badges.
- [ ] Integrate tools with chat
  - When a tool is run, automatically post a tool report message to the active chat via AIService or a dedicated chat integration helper.
  - Use a collapsible UI for detailed results.

## Phase 2D - Monitoring and Notifications

Goal: Add a lightweight monitoring loop and visible notifications.

- [ ] Add `NotificationRepository` with fields
  - id, type, severity, title, message, createdAt, relatedTool, meta (JSON).
- [ ] Implement a small monitor loop in main
  - Runs on an interval with safe defaults.
  - Uses existing services or simple heuristics to create Notification records for:
    - High CPU or memory usage.
    - Repeated event log errors (can be mocked if event log is not yet wired).
    - Network problems (if detectable).
- [ ] Add IPC handlers
  - `notifications:list`
  - `notifications:markRead` (optional)
- [ ] Wire IPC into preload as `window.desktop.notifications`.
- [ ] Implement toast component in renderer
  - Slide up from bottom right, severity styling from brand palette.
  - Clicking the toast opens the related System view or tool report.
- [ ] Implement a notification history panel
  - Either a dedicated view or a card that opens a modal.
  - Shows notifications with filters by severity and type.

## Phase 2E - Hardening and Tests

Goal: Add basic tests and improve app metadata.

- [ ] Set up Vitest (if not already done) for unit and integration tests in the repo.
- [ ] Add tests for
  - AIService IPC handler (mock OpenAI client).
  - DashboardService summary aggregation.
  - One example notebook IPC handler.
- [ ] Add simple error boundaries in the renderer for
  - App shell.
  - ChatPanel.
- [ ] Update `package.json` for electron builder
  - Add description and productName.
  - Configure icon file if available to remove builder warnings.
- [ ] Ensure `npm run build` and packaging still succeed after all changes.

## Exit Criteria

This phase is complete when:

- The sidebar navigation lets the user switch between Home (dashboard), Projects, Notebook, and System.
- Projects and Notebook views are fully wired with IPC and persist to SQLite.
- Toolbox v1 tools can be triggered from the System view and from notifications, and each run generates a structured report that appears in the associated chat.
- Notifications appear as toasts and in a history view, using severity styling from the brand palette.
- Basic tests pass and `npm run build` and packaging still succeed.