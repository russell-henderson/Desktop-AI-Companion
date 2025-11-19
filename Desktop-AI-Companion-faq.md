# Desktop AI Companion - FAQ and Technical Assessment

## 1. What is Desktop AI Companion?

Desktop AI Companion is a Windows desktop application that brings an AI assistant directly into the operating system. It is built with Electron and React and is evolving into a system aware companion that can:

- Chat like a modern LLM client.
- Inspect key parts of the system through an explicit toolbox.
- Organize work into projects.
- Reuse prompts, snippets, and notes through a searchable notebook.
- Surface system insights through notifications and dashboard cards.

The long term vision is a Jarvis style assistant that understands your machine, your projects, and your personal workflows, while keeping you fully in control.

---

## 2. What does the app do right now?

### Current state of the codebase

From the uploaded project:

- Electron main process creates a browser window but is partially incomplete.
- React renderer shows a very simple UI:
  - Textarea for a prompt.
  - Button to send the prompt.
  - Area to show a single OpenAI response.
- OpenAI SDK is imported and used directly in the renderer.
- There is no preload script and no IPC bridge between renderer and main.
- Styling is minimal, based on a single CSS file.

This is an early scaffold that proves Electron plus React plus OpenAI, but it is not yet the full Desktop AI Companion experience.

### What is missing right now

- No secure preload or IPC layer.
- No chat history or projects.
- No notebook.
- No system toolbox or notifications.
- No implemented A to M dashboard layout.

The code runs only as a basic demo and still needs structural work before it matches the new PRD and UI design.

---

## 3. What is the desired MVP (v0.1)?

The first real version of the app aims to deliver:

1. **Secure architecture**

   - Electron main process owns secrets and system tools.
   - Preload exposes a small `window.ai` API to the renderer.
   - Renderer never touches API keys or raw system APIs.

2. **Dashboard layout (A to M)**

   - Top bar with model selector and quick access.
   - Workspace card and system overview card.
   - Three primary cards for:
     - Recent activity.
     - Suggested prompts.
     - Notebook highlights.
   - Chat area with bubbles and attachments.
   - Left sidebar with avatar, navigation, and context list.
   - Bottom sidebar zone for quick actions and toolbox.

3. **Projects**

   - User created projects that link chats, folders, and notebook entries.
   - Project view with overview and recent activity.

4. **Notebook**

   - Persistent vault of prompts, snippets, notes, and templates.
   - Semantic search so user and assistant can find entries by meaning, not just exact text.
   - Integration with chat so entries can be inserted or referenced easily.

5. **Toolbox v1**

   - Process Inspector.
   - Event Log Triage.
   - Network Check.

   Each tool runs only when triggered and posts a structured summary back into the current chat.

6. **Notifications and insights**

   - Lightweight monitoring for CPU spikes, event log patterns, and network issues.
   - Slide up notification panels similar to GlassWire.
   - Severity mapped into the main palette (info, warning, critical).
   - Notification history view.

7. **Local only storage**

   - All app data stored locally under the user profile in a SQLite database and log files.
   - Future option to sync selected items (for example notebook entries) to the cloud.

---

## 4. What is the current and planned tech stack?

### Current stack

- Shell: Electron 24
- Frontend: React 18 with Create React App, plain CSS
- Backend in app: none yet (no IPC or local services)
- Build tooling: electron builder, concurrently, wait on, cross env
- OpenAI SDK: `openai` v4
- Config: dotenv with `.env` containing REACT keys and Electron start URL

### Planned stack

- Shell: Electron 24 or newer
- Frontend: React with Vite and TypeScript
- Styling: token driven CSS (or Tailwind) aligned with brand palette
- IPC: preload script with `contextBridge` and `ipcRenderer`
- Main process:
  - OpenAI client.
  - System toolbox tools.
  - Lightweight monitors and notification engine.
- Data: SQLite via a small data access layer, stored under `%APPDATA%/DesktopAICompanion`
- Tests: Vitest, ESLint, Prettier, minimal smoke tests for preload and toolbox

---

## 5. How will the UI be structured (A to M)?

High level mapping for the main dashboard view:

- **A** - Top bar container  
  Page title or current project, status text.

- **B** - Model selector  
  Dropdown for persona or model choice (for example System expert, Writer, Research).

- **C** - Utility buttons  
  Notebook toggle, settings, and possibly profile.

- **D** - Workspace card  
  Active project summary with quick open action.

- **E** - System card  
  System overview plus button to open toolbox.

- **F** - Recent activity card  
  Most recent chat or tool run with resume button.

- **G** - Suggested prompts card  
  Context aware prompt suggestions.

- **H** - Notebook highlights card  
  Pinned or recent notebook entries.

- **I** - Chat header  
  Chat title, project badge, persona badge, and menu.

- **J** - Attachment control  
  File and folder picker for attaching context to messages.

- **K** - Chat body and input  
  Chat bubbles, tool reports, and text input at the bottom.

- **L** - Left sidebar  
  Nova avatar, primary navigation (Home, Chats, Projects, Notebook, System), and context list (projects or chats).

- **M** - Bottom sidebar zone  
  Toolbox button, settings, logs, and later advanced mode toggles.

Other views (Projects, Notebook, System, toolbox detail) reuse A, L, M and repurpose the main content area.

---

## 6. How is security and privacy handled?

### Current issues

- OpenAI API key lives in the renderer.
- `.env` with secrets is included in the project.
- No preload or IPC layer means there is no clean separation between main and renderer.

### Planned fixes

- Move all OpenAI usage to main process.
- Use preload to expose only safe functions such as `ai.sendMessage` and `ai.runTool`.
- Load secrets from environment or OS secure storage in main only.
- Stop committing `.env` to the repository and ensure it is in `.gitignore`.
- Use explicit permission checks for each system tool and clearly explain what will be read before each run.

---

## 7. What are the major issues and gaps right now?

1. **Incomplete main process**  
   `src/main/main.js` is missing parts of the window creation logic and there is no `preload.js` file.

2. **Renderer side OpenAI calls**  
   The renderer directly imports the OpenAI SDK and reads the API key from `process.env.REACT_APP_OPENAI_API_KEY`. This is unsafe and may not work with strict Electron settings.

3. **Outdated frontend tooling**  
   Create React App is still present, while other projects use Vite. Tooling is inconsistent with newer standards.

4. **No data layer**  
   No structure for chats, projects, notebook entries, or toolbox reports. Everything is in ephemeral React state.

5. **No visual system**  
   The current UI does not use the agreed palette or card based layout and lacks the planned dashboard and sidebar.

6. **No tests or logging policy**  
   Failures in IPC, OpenAI calls, or toolbox tools are hard to diagnose.

---

## 8. What is the recommended path forward?

Short term, to reach a working MVP:

1. **Refactor the scaffold**

   - Migrate from CRA to Vite plus React plus TypeScript.
   - Implement `main.ts`, `preload.ts`, and renderer entry points with clear separation.

2. **Implement preload and IPC**

   - Expose `window.ai.sendMessage`, `window.ai.runTool`, `window.ai.searchNotebook`.
   - Use `ipcMain.handle` in main for OpenAI calls and toolbox commands.

3. **Define the data layer**

   - Introduce models for Project, Chat, NotebookEntry, ToolReport, Notification.
   - Persist them using SQLite with a thin repository layer.

4. **Build the A to M layout**

   - Implement sidebar (L and M).
   - Implement top bar (A, B, C).
   - Implement dashboard cards (D, E, F, G, H).
   - Implement chat section (I, J, K).

5. **Add Toolbox v1**

   - Implement Process Inspector, Event Log Triage, and Network Check in main.
   - Create UI panels and chat integrated reports.

6. **Add notifications**

   - Implement simple monitoring for CPU, event log, and network.
   - Add slide up notification panels and history view.

7. **Add notebook and semantic search**

   - Data model and storage for entries.
   - Embeddings based search endpoint in main.
   - UI for notebook view and chat integration.

8. **Add basic tests and logging**

   - Smoke tests for IPC and main to renderer communication.
   - Structured logs for toolbox runs and errors.

---

## 9. SAQC checks

- **IN!**  
  Previous FAQ did not capture the new product requirements for projects, notebook, toolbox, notifications, or the A to M layout. This update aligns the description with the new PRD and UI plan.

- **SC!**  
  Statements about current code being incomplete and unsafe for secrets are based on direct inspection of the uploaded files. The roadmap items are clearly labeled as planned rather than present.

- **OT!**  
  If additional platforms (macOS, Linux), voice input, or background optimization features are considered, they should be added to the roadmap and not assumed to be part of the MVP.

---

## 10. Confidence score

- Tech: 98  
- Component: 96  
- Behavior: 96  
- Content: 97  
- Style: 97  

Overall confidence: **97** that this FAQ now matches the most recent product vision and the current state of the repository.

If you like, the next step can be a TECHSPEC document that translates this into concrete modules, IPC contracts, and data schemas for implementation.
```
