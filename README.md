# Desktop AI Companion

Desktop AI Companion is a Windows desktop application that brings an AI assistant directly into your system. It runs inside an Electron shell with a React plus TypeScript front end and uses OpenAI models behind a secure IPC layer. The assistant understands your chats, your projects, your saved prompts, and key parts of your Windows environment, and surfaces everything in a structured dashboard.

Status: MVP implemented and tested. All core features in `PRD.md` for the first release are now live and passing build and test checks.

---

## Features

### System aware chat

- Secure `AIService` in the Electron main process  
- IPC endpoint `ai:sendMessage` exposed as `window.desktop.ai.sendMessage` (or equivalent)  
- Persistent message history per chat stored in SQLite  
- Chat bubbles with:
  - User and assistant messages
  - Tool reports rendered as collapsible blocks
  - Inserted notebook content rendered inline

### Projects

Phase 2A implemented

- Project management with full CRUD:
  - Create, read, update, delete projects
  - Optional color and description
- Project linking:
  - Chats can be moved into a project
  - Notebook entries can be scoped to a project
- UI:
  - `ProjectsView` with list and detail screens
  - Project detail shows metadata plus related chats and notebook entries
- IPC:
  - `projects:list`
  - `projects:get`
  - `projects:create`
  - `projects:update`
  - `projects:delete`
  - `projects:linkChat`

### Notebook

Phase 2B implemented

- Notebook entries with types:
  - Prompt
  - Snippet
  - Note
  - Template
- Fields:
  - Title, content, type, tags, scope, pinned
- Features:
  - Full CRUD through `NotebookService`
  - Keyword search with type filtering
  - Global or project scoped entries
- Chat integration:
  - "Insert from notebook" button in ChatInput
  - Search driven picker to insert content into the current message
- IPC:
  - `notebook:list`
  - `notebook:get`
  - `notebook:create`
  - `notebook:update`
  - `notebook:delete`
  - `notebook:search`  
- Ready for semantic search:
  - Service and schema are structured so embeddings can be added later

### Toolbox v1

Phase 2C implemented

Toolbox is a set of explicit, user triggered tools that inspect the system and post structured reports into chat.

Implemented tools:

- **Process Inspector**  
  - PowerShell based process listing  
  - Returns process name, PID, CPU, memory and related data

- **Event Log Triage**  
  - Reads Windows event logs  
  - Groups errors and warnings by source and severity  
  - Produces a summary suitable for plain language explanation

- **Network Check**  
  - Connectivity and DNS checks  
  - Simple metrics and pass or fail status

Features:

- `SystemView` with tool tiles and report history
- Each tool run:
  - Creates a `ToolReport` entry in SQLite
  - Posts a collapsible report message into the active chat
- IPC:
  - `toolbox:run`
  - `toolbox:listReports`
  - `toolbox:getReport`

### Monitoring and notifications

Phase 2D implemented

- `MonitoringService` in main:
  - CPU and memory monitoring loop on a timer (for example every 30 seconds)
  - Creates notifications when thresholds are exceeded
- `NotificationRepository`:
  - Stores notifications with type, severity, title, message and metadata
  - Tracks read and unread state
- UI:
  - Toast notifications with slide up animation
  - Notification history view with severity based styling drawn from the brand palette
- IPC:
  - `notifications:list`
  - `notifications:markRead`

Notifications are informational by default. They suggest running a toolbox tool rather than acting on their own.

### Dashboard and layout

The main window follows the A through M layout defined in `UI.md`.

- Top bar:
  - Current context title
  - Model or persona selector
  - Notebook and settings shortcuts
- Dashboard cards:
  - Active project and system overview
  - Recent activity
  - Suggested prompts
  - Notebook highlights
- Chat section:
  - Chat header with project and model badges
  - Chat body with message history
  - Chat input with attachment and notebook controls
- Sidebar:
  - Assistant avatar and role label
  - Navigation items:
    - Home
    - Chats
    - Projects
    - Notebook
    - System
  - Context list for the selected section
- Bottom sidebar zone:
  - Toolbox entry point
  - Settings and logs

Layout is responsive and remains usable when the window is resized to narrower widths.

### Persistence and data

- SQLite backend using `sql.js` (WASM)  
- Repositories for:
  - Projects
  - Chats
  - Messages
  - Notebook entries
  - Tool reports
  - Notifications
- Full schema defined and seeded for initial dashboard content
- All user data persists between sessions:
  - Projects, chats, notebook entries, tool reports, notifications

---

## Architecture

High level components:

- **Electron main process**
  - Window management
  - AIService
  - DashboardService
  - ProjectService
  - NotebookService
  - ToolboxService
  - MonitoringService
  - SQLite plus repository layer
  - IPC handlers for all capabilities

- **Preload script**
  - Uses `contextBridge` to expose a typed `window.desktop` API
  - Only exposes high level methods such as:
    - `desktop.ai.sendMessage`
    - `desktop.projects.*`
    - `desktop.notebook.*`
    - `desktop.toolbox.*`
    - `desktop.notifications.*`
    - `desktop.dashboard.getSummary`
  - Renderer cannot access Node or secrets directly

- **Renderer**
  - React plus TypeScript app
  - Bundled with Vite
  - Tailwind CSS configured with brand tokens and global styles
  - Components:
    - App shell and ErrorBoundary
    - Sidebar
    - TopBar
    - DashboardGrid
    - ChatPanel (ChatHeader, ChatArea, ChatInput)
    - ProjectsView
    - NotebookView
    - SystemView
    - NotificationHistory
    - Reusable UI primitives for cards, toasts and report blocks

- **Data and storage**
  - SQLite via `sql.js` loaded in main
  - Schema initialization from a schema file or embedded string
  - SeedService for initial demo data

For more detail see:

- `TECHSPEC_ARCHITECTURE.md`
- `Desktop-AI-Companion-faq.md`
- `PRD.md`
- `UI.md`
- `BRAND_GUIDELINES.md`

---

## Getting started

### Prerequisites

- Windows 10 or Windows 11
- Node.js 18 or later
- npm 8 or later
- OpenAI API key

### Clone the repository

```bash
git clone <your-repo-url>.git
cd Desktop-AI-Companion
````

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file at the project root. The exact keys may vary depending on the final service naming, but at minimum you will need:

```ini
OPENAI_API_KEY=your-openai-key-here
# Add any other app specific settings here
```

Notes:

- Do not commit `.env` to version control.
- The OpenAI key is loaded in the main process only. The renderer never sees it.

### Run in development

The dev script starts Vite for the renderer and Electron for the shell.

```bash
npm run dev
```

Then:

- A desktop window should open.
- The dashboard and chat should render.
- Open the dev tools in the renderer if you need to inspect UI behavior.

If your scripts differ, check `package.json` for the exact dev command names that Cursor set up.

### Build for production

To build the app:

```bash
npm run build
```

This should:

- Run TypeScript checks
- Build the renderer bundle with Vite
- Package the Electron app with electron builder
- Produce a Windows installer in the dist folder

Any warnings about icons or description can be resolved later by adjusting electron builder config and package metadata.

---

## Scripts

Scripts may vary slightly, but the standard set looks like:

| Script          | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Start Vite and Electron together for development |
| `npm run build` | Run type checks, Vite build and electron builder |
| `npm test`      | Run Vitest unit tests                            |
| `npm run lint`  | Run the linter (if configured)                   |

Check `package.json` for the exact names and any additional scripts.

---

## Testing

Testing status for the current MVP:

- TypeScript compilation: passing
- Vite build: passing
- Electron builder: Windows installer builds successfully
- Linter: no errors
- Unit tests: all passing
- Manual testing:

  - Projects CRUD verified
  - Notebook CRUD and insertion verified
  - Toolbox v1 tools verified with reports posted to chat
  - Monitoring and notifications verified
  - Navigation, layout, and persistence verified

Testing guides and results:

- `TESTING.md` manual test plan
- `TESTING_RESULTS.md` current test run summary

To run tests locally:

```bash
npm test
```

---

## Security and privacy

- OpenAI API key lives only in the main process.
- Renderer communicates with main through a narrow, typed IPC surface.
- All user data is stored locally in SQLite using `sql.js`.
- No cloud sync or telemetry is enabled in the MVP build.
- System tools and monitors are read only except where explicitly triggered:

  - Process Inspector can end processes only when requested.
  - Other tools inspect and report but do not change system state.

---

## Roadmap

Future work ideas that extend beyond the current MVP:

- Semantic notebook search using embeddings
- Natural language file queries over indexed project folders
- Visual context from the active window for spreadsheets and documents
- Persona shifts based on foreground application
- Optional cloud sync for prompts and notebook entries
- Additional toolbox tools and more detailed monitoring
- Dark mode and extended theming

See `PRD.md` for more detail and open questions.

---

## Contributing

This project is under active development and already has a defined architecture and UI.

If you plan to contribute:

1. Read `PRD.md`, `UI.md`, `BRAND_GUIDELINES.md`, `TECHSPEC_ARCHITECTURE.md`, `Desktop-AI-Companion-faq.md`, and `TESTING.md`.
2. Open an issue describing the feature, refactor, or bug fix you want to work on.
3. Follow these guidelines:

   - Keep pull requests focused and small.
   - Maintain type safety and IPC contracts.
   - Update docs when behavior changes.
   - Run `npm run build` and `npm test` before submitting.

---

## License

This project uses the MIT license. See `LICENSE` for details.

```bash
::contentReference[oaicite:0]{index=0}
```
