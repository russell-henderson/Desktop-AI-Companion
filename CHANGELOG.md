---
Version: 0.1.0
Last Updated: 2025-11-19
Status: Draft
Owner: Desktop AI Companion Team
---

# Changelog

All notable changes to this project are documented in this file.  
Version numbers follow a simple `MAJOR.MINOR.PATCH` convention.

---

## 0.1.0 (2025-11-19)  MVP Desktop AI Companion

First full MVP release that matches the PRD, UI, and brand guidelines.

### Added

#### Core architecture

- Electron based desktop shell for Windows with:
  - Main process owning services and IPC.
  - Preload bridge that exposes a typed `window.desktop` API.
  - Renderer implemented with React and TypeScript.
- Vite based build pipeline for the renderer.
- Tailwind CSS with brand tokens and global styles.

#### Secure AI and chat

- `AIService` in the main process handles all OpenAI calls.
- OpenAI key loaded only in the main process from environment variables.
- IPC channel `ai:sendMessage` with a typed interface exposed through `window.desktop`.
- Chat stack in the renderer:
  - `ChatPanel`, `ChatHeader`, `ChatArea`, `ChatInput`.
  - Persistent chat history stored in SQLite.
  - Tool reports rendered as structured, collapsible messages inside the chat.

#### Data layer and persistence

- SQLite database using `sql.js` (WASM, no native compilation).
- Schema and repository layer for:
  - Projects
  - Chats
  - Messages
  - Notebook entries
  - Tool reports
  - Notifications
- Seed service to bootstrap minimal initial data for the dashboard.
- All user data persists across app restarts.

#### Dashboard and layout (A to M structure)

- Top bar:
  - Context title.
  - Model or persona selector.
  - Notebook and settings buttons.
- Dashboard cards:
  - Active project card.
  - System overview card.
  - Recent activity card.
  - Suggested prompts card.
  - Notebook highlights card.
- Chat section:
  - Header with project and model badges.
  - Scrollable chat history.
  - Input area with notebook insertion and attachments.
- Sidebar:
  - Assistant avatar and role label.
  - Navigation items for Home, Chats, Projects, Notebook, System.
  - Contextual list for the selected section.
- Bottom sidebar zone:
  - Toolbox entry point.
  - Settings and logs access.
- Responsive layout that adapts when the window is resized.

#### Projects (Phase 2A)

- `ProjectService` in the main process with full CRUD operations.
- `ProjectRepository` in the data layer.
- IPC handlers:
  - `projects:list`
  - `projects:get`
  - `projects:create`
  - `projects:update`
  - `projects:delete`
  - `projects:linkChat`
- `ProjectsView` in the renderer:
  - Project list with basic metadata.
  - Project detail view showing description and related items.
- `ProjectForm` component for create and edit flows.
- Chat integration:
  - "Move to project" action in `ChatHeader` so chats can be associated with a project.

#### Notebook (Phase 2B)

- `NotebookService` with full CRUD and keyword based search.
- `NotebookEntryRepository` in the data layer.
- IPC handlers:
  - `notebook:list`
  - `notebook:get`
  - `notebook:create`
  - `notebook:update`
  - `notebook:delete`
  - `notebook:search`
- Notebook model supports:
  - Title, content, type, tags, scope, pinned flags and timestamps.
  - Types: prompt, snippet, note, template.
  - Scope: global or project specific.
- `NotebookView` with:
  - Search bar.
  - List of entries.
  - Editor detail pane.
- `NotebookEntryForm` component to create and edit entries.
- Chat integration:
  - "Insert from notebook" button in `ChatInput`.
  - Search driven picker to insert notebook content into the current message.
- Notebook and search code structured so semantic embeddings can be added in a future release.

#### Toolbox v1 (Phase 2C)

- `ToolboxService` in the main process.
- `ToolReportRepository` for storing reports in SQLite.
- Tool implementations:
  - Process Inspector:
    - PowerShell based process listing.
    - Returns process name, PID, CPU, memory and related details.
  - Event Log Triage:
    - Reads Windows event logs.
    - Groups errors and warnings by source and severity.
    - Produces summaries suitable for AI explanation.
  - Network Check:
    - Connectivity and DNS checks.
    - Simple metrics and pass or fail results.
- IPC handlers:
  - `toolbox:run`
  - `toolbox:listReports`
  - `toolbox:getReport`
- `SystemView` in the renderer:
  - Tiles to launch each tool.
  - Report history list with severity badges.
- Chat integration:
  - Each tool run automatically posts a structured, collapsible report message into the active chat.

#### Monitoring and notifications (Phase 2D)

- `MonitoringService` in the main process:
  - CPU and memory monitoring loop with a fixed interval.
  - Generates notification records when thresholds are exceeded.
- `NotificationRepository` with read and unread tracking.
- IPC handlers:
  - `notifications:list`
  - `notifications:markRead`
- Notification UI:
  - Toast notifications that slide up from the bottom.
  - Severity based styling that uses the brand palette.
  - `NotificationHistory` view for browsing past notifications.

#### Navigation and layout

- Unified navigation context that:
  - Tracks the active section and selected chat or project.
  - Drives which main view is rendered.
- All views implemented:
  - Dashboard (Home)
  - Chats
  - Projects
  - Notebook
  - System
  - Notification history

#### Error handling and hardening (Phase 2E)

- `ErrorBoundary` components wrapping:
  - App shell.
  - ChatPanel.
- Graceful error states for:
  - Tool failures.
  - IPC failures.
  - Data loading errors.
- Vitest configuration with initial unit tests for:
  - Services and IPC endpoints (sanity coverage).
- `package.json` metadata updated with:
  - Product name.
  - Description.
- Build and packaging validation:
  - `npm run build` passes end to end.
  - TypeScript checks pass.
  - Vite build succeeds.
  - Electron builder produces a working Windows installer.
- Linting run with no reported errors.

#### Branding and UI polish

- Tailwind configuration with brand tokens based on:
  - Orange `#E65D00`
  - Light blue `#EDF7FD`
  - Green `#0CBD85`
  - Blue `#0D99C9`
  - Cool grey `#D8E4ED`
- Severity levels mapped into palette colors for info, success, warning and critical.
- Card based dashboard design aligned with the brand guidelines.
- Consistent components for cards, toasts and report blocks.

#### Documentation

- `PRD.md` describing the product requirements and MVP scope.
- `BRAND_GUIDELINES.md` defining brand, voice and visual identity.
- `UI.md` defining the layout and interface behavior.
- `Desktop-AI-Companion-faq.md` with technical assessment and updated FAQ.
- `README.md` updated to match the current MVP and testing results.
- `TESTING.md` manual test plan.
- `TESTING_RESULTS.md` summary of the latest test run.
- `TECHSPEC_ARCHITECTURE.md` updated with the implemented architecture and IPC surface.
- This `CHANGELOG.md` file.

---

## Unreleased

There are no unreleased changes recorded yet.  
Future versions will document additions such as semantic notebook search, natural language file querying, visual context features and cloud sync if they are implemented.
