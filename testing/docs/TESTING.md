---
Version: 0.1.0
Last Updated: 2025-11-19
Status: Draft
Owner: Desktop AI Companion Team
---

# TESTING.md

This document defines how to validate the Desktop AI Companion MVP. It covers manual acceptance scenarios, technical checks, and regression steps so future changes do not break core behavior.

## 1. Test environments

- Platform: Windows 10 and Windows 11
- Build: current `main` branch
- Node: 18 or later
- Commands:
  - `npm install`
  - `npm run dev` or `npm start` (whichever starts Vite plus Electron)
  - `npm run build`

Optional:

- Local test OpenAI key to avoid using production usage
- A user account with permission to read event logs and run PowerShell

---

## 2. Smoke tests

### 2.1 Install and run

1. Clone the repo into a clean folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Confirm:
   - Electron window appears.
   - Sidebar, top bar, dashboard cards, and chat panel all render without errors.
   - No red errors in the developer console.

### 2.2 Build

1. Run `npm run build`.
2. Confirm:
   - TypeScript and Vite build complete successfully.
   - Electron builder produces installers or binaries without hard errors.
   - Any warnings about description or icon are expected if icons are not final.

---

## 3. Functional acceptance tests

### 3.1 Chat and AI service

Goal: Verify `AIService`, IPC `ai:sendMessage`, and chat UI (I, J, K).

Steps:

1. In the main view, locate the chat panel.
2. Type a simple question in the input, such as:
   - "What is the purpose of this app."
3. Press Send.
4. Confirm:
   - Message appears as a user bubble.
   - Assistant bubble appears with a non empty response.
   - While waiting, a loading indicator or typing feedback appears.
   - If OpenAI returns an error, an error message is shown but the app does not crash.

Additional checks:

- Send two or three messages and confirm the conversation scrolls and keeps history.
- Close and reopen the app and confirm chat history is still present for that chat.

Expected result: basic conversational loop works and errors are handled gracefully.

---

### 3.2 Navigation and layout

Goal: Verify Sidebar (L and M), TopBar (A to C), and navigation context.

Steps:

1. Click each main nav item in the sidebar:
   - Home
   - Chats
   - Projects
   - Notebook
   - System
2. Confirm:
   - The top bar title and context change correctly.
   - The main content switches to the correct view.
   - The active nav item is visually highlighted.
3. Resize the window to a smaller size.
4. Confirm:
   - Layout remains readable.
   - Cards stack in a sensible way.
   - No content disappears or overlaps.

Expected result: all top level sections load without errors and navigation state is consistent.

---

### 3.3 Projects (Phase 2A)

Goal: Validate `ProjectService`, project IPC, and ProjectsView.

#### 3.3.1 Create and list projects

1. Navigate to Projects.
2. Click "New project."
3. Enter:
   - Name: "Video Server"
   - Description: "Local video server experiment."
   - Optional color or icon if supported.
4. Save.
5. Repeat for at least one more project (for example "Hex Gorilla").
6. Confirm:
   - Both projects appear in the list.
   - Sidebar context list shows the new projects.

#### 3.3.2 Project detail view

1. Click "Video Server."
2. Confirm:
   - Project details appear (name, description, created date if shown).
   - Any linked chats or notebook entries are listed, even if empty.

#### 3.3.3 Move chat to project

1. Start or open a chat that discusses the video server.
2. Use the "Move to project" action in ChatHeader.
3. Select "Video Server."
4. Return to Projects and open "Video Server."
5. Confirm the chat is listed under that project.

#### 3.3.4 Update and delete

1. Edit the project name or description.
2. Confirm updates persist after app restart.
3. Delete a test project that does not contain important data.
4. Confirm:
   - It no longer appears in the list.
   - Navigation remains stable and no reference to the deleted project crashes.

---

### 3.4 Notebook (Phase 2B)

Goal: Validate `NotebookService`, IPC, NotebookView, and chat insertion.

#### 3.4.1 Create entries

1. Navigate to Notebook.
2. Click "New entry."
3. Create entries of each type:
   - Prompt
   - Snippet
   - Note
   - Template
4. Add tags and set one entry scope to Global and one to a specific project.
5. Save all entries.

Confirm:

- The list updates with all entries.
- Types and tags are visible in the UI.

#### 3.4.2 Search and filters

1. Use the search bar with a keyword that appears in at least one entry.
2. Confirm:
   - Matching entries are shown.
   - Non matching entries are hidden.
3. Filter by type (for example only Snippets) and confirm the list updates.

#### 3.4.3 Insert into chat

1. Open a chat.
2. In ChatInput, click "Insert from notebook."
3. Search for one of your entries.
4. Select it.
5. Confirm:
   - Content is inserted into the input at the cursor position.
   - You can edit the combined text before sending.
6. Send the message and confirm the notebook content appears in the chat bubble.

---

### 3.5 Toolbox v1 (Phase 2C)

Goal: Validate `ToolboxService`, IPC, SystemView, tool runs, and chat integration.

#### 3.5.1 System view and tiles

1. Navigate to System view.
2. Confirm tiles or cards exist for:
   - Process Inspector
   - Event Log Triage
   - Network Check

#### 3.5.2 Run Process Inspector

1. Click "Run" on Process Inspector.
2. Confirm:
   - The tool reports progress or a loading indicator.
   - A report appears in the System view with process data.
   - A new message appears in the active chat:
     - Title such as "Process Inspector report."
     - Severity badge if used.
     - Collapsible details with process list.

#### 3.5.3 Run Event Log Triage

1. Run Event Log Triage.
2. Confirm:
   - Errors and warnings are listed by source.
   - Assistant description text is readable and suggests next steps.
   - A report is posted into the active chat.

#### 3.5.4 Run Network Check

1. Disconnect from the network or simulate a poor connection if possible.
2. Run Network Check.
3. Confirm:
   - Report shows basic connectivity and DNS results.
   - Severity matches the situation.
   - Chat message is created with summary and details.

Also confirm that if PowerShell or event log access fails, the app shows a friendly error message and does not crash.

---

### 3.6 Monitoring and Notifications (Phase 2D)

Goal: Validate `MonitoringService`, `NotificationRepository`, IPC, and toast UI.

#### 3.6.1 Trigger CPU or memory notification

1. Open several heavy applications or start a load generator so CPU or memory is high for a while.
2. Wait at least one monitoring interval (for example 30 seconds).
3. Confirm:
   - A notification toast slides up from the bottom or designated area.
   - It shows severity, title, and a short message.
4. Click the toast.
5. Confirm:
   - You are taken to System view or the relevant tool report.
   - The notification is marked as read if that state is displayed.

#### 3.6.2 Notification history

1. Navigate to the notifications list or history view.
2. Confirm:
   - Recent notifications appear with correct timestamps and severity colors.
   - Read and unread states are clearly indicated.
3. Use any available "mark read" action and confirm it updates both history and toast behavior.

---

### 3.7 Error boundaries and stability (Phase 2E)

Goal: Verify ErrorBoundary components and resiliency.

1. Intentionally break a small part of the UI (for development testing only) or simulate a component error through a test hook if present.
2. Confirm:
   - ErrorBoundary for App shows a friendly fallback rather than a blank screen.
   - ErrorBoundary for ChatPanel shows a local fallback without crashing the entire app.
3. Return the code to a normal state and rebuild.

---

### 3.8 Persistence and restart behavior

Goal: Verify SQLite via sql.js and repository logic.

1. Create at least:
   - Two projects.
   - Several notebook entries.
   - Several chats.
   - At least one toolbox run and one notification.
2. Close the app completely.
3. Restart it.
4. Confirm:
   - All previously created records are still present.
   - Dashboard cards show recent activity and notebook highlights.
   - Projects, Notebook, System, and notifications views reflect the stored data.

---

## 4. Technical tests

### 4.1 IPC contract

Goal: Check `window.desktop` API surface and type safety.

1. In a dev build, open the dev tools console.
2. Inspect `window.desktop` and confirm:
   - Expected namespaces exist (for example `ai`, `projects`, `notebook`, `toolbox`, `notifications`, `dashboard`).
3. Call a harmless method such as listing projects or notebook entries and ensure the promise resolves and errors are logged cleanly if they occur.

### 4.2 Vitest

Run:

```bash
npm test
```

---
Version: 0.1.0
Last Updated: 2025-11-19
Status: Draft
Owner: Desktop AI Companion Team
---

# TESTING.md

This document defines how to validate the Desktop AI Companion MVP. It covers manual acceptance scenarios, technical checks, and regression steps so future changes do not break core behavior.

## 1. Test environments

- Platform: Windows 10 and Windows 11
- Build: current `main` branch
- Node: 18 or later
- Commands:
  - `npm install`
  - `npm run dev` or `npm start` (whichever starts Vite plus Electron)
  - `npm run build`

Optional:

- Local test OpenAI key to avoid using production usage
- A user account with permission to read event logs and run PowerShell

---

## 2. Smoke tests

### 2.1 Install and run

1. Clone the repo into a clean folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Confirm:
   - Electron window appears.
   - Sidebar, top bar, dashboard cards, and chat panel all render without errors.
   - No red errors in the developer console.

### 2.2 Build

1. Run `npm run build`.
2. Confirm:
   - TypeScript and Vite build complete successfully.
   - Electron builder produces installers or binaries without hard errors.
   - Any warnings about description or icon are expected if icons are not final.

---

## 3. Functional acceptance tests

### 3.1 Chat and AI service

Goal: Verify `AIService`, IPC `ai:sendMessage`, and chat UI (I, J, K).

Steps:

1. In the main view, locate the chat panel.
2. Type a simple question in the input, such as:
   - "What is the purpose of this app."
3. Press Send.
4. Confirm:
   - Message appears as a user bubble.
   - Assistant bubble appears with a non empty response.
   - While waiting, a loading indicator or typing feedback appears.
   - If OpenAI returns an error, an error message is shown but the app does not crash.

Additional checks:

- Send two or three messages and confirm the conversation scrolls and keeps history.
- Close and reopen the app and confirm chat history is still present for that chat.

Expected result: basic conversational loop works and errors are handled gracefully.

---

### 3.2 Navigation and layout

Goal: Verify Sidebar (L and M), TopBar (A to C), and navigation context.

Steps:

1. Click each main nav item in the sidebar:
   - Home
   - Chats
   - Projects
   - Notebook
   - System
2. Confirm:
   - The top bar title and context change correctly.
   - The main content switches to the correct view.
   - The active nav item is visually highlighted.
3. Resize the window to a smaller size.
4. Confirm:
   - Layout remains readable.
   - Cards stack in a sensible way.
   - No content disappears or overlaps.

Expected result: all top level sections load without errors and navigation state is consistent.

---

### 3.3 Projects (Phase 2A)

Goal: Validate `ProjectService`, project IPC, and ProjectsView.

#### 3.3.1 Create and list projects

1. Navigate to Projects.
2. Click "New project."
3. Enter:
   - Name: "Video Server"
   - Description: "Local video server experiment."
   - Optional color or icon if supported.
4. Save.
5. Repeat for at least one more project (for example "Hex Gorilla").
6. Confirm:
   - Both projects appear in the list.
   - Sidebar context list shows the new projects.

#### 3.3.2 Project detail view

1. Click "Video Server."
2. Confirm:
   - Project details appear (name, description, created date if shown).
   - Any linked chats or notebook entries are listed, even if empty.

#### 3.3.3 Move chat to project

1. Start or open a chat that discusses the video server.
2. Use the "Move to project" action in ChatHeader.
3. Select "Video Server."
4. Return to Projects and open "Video Server."
5. Confirm the chat is listed under that project.

#### 3.3.4 Update and delete

1. Edit the project name or description.
2. Confirm updates persist after app restart.
3. Delete a test project that does not contain important data.
4. Confirm:
   - It no longer appears in the list.
   - Navigation remains stable and no reference to the deleted project crashes.

---

### 3.4 Notebook (Phase 2B)

Goal: Validate `NotebookService`, IPC, NotebookView, and chat insertion.

#### 3.4.1 Create entries

1. Navigate to Notebook.
2. Click "New entry."
3. Create entries of each type:
   - Prompt
   - Snippet
   - Note
   - Template
4. Add tags and set one entry scope to Global and one to a specific project.
5. Save all entries.

Confirm:

- The list updates with all entries.
- Types and tags are visible in the UI.

#### 3.4.2 Search and filters

1. Use the search bar with a keyword that appears in at least one entry.
2. Confirm:
   - Matching entries are shown.
   - Non matching entries are hidden.
3. Filter by type (for example only Snippets) and confirm the list updates.

#### 3.4.3 Insert into chat

1. Open a chat.
2. In ChatInput, click "Insert from notebook."
3. Search for one of your entries.
4. Select it.
5. Confirm:
   - Content is inserted into the input at the cursor position.
   - You can edit the combined text before sending.
6. Send the message and confirm the notebook content appears in the chat bubble.

---

### 3.5 Toolbox v1 (Phase 2C)

Goal: Validate `ToolboxService`, IPC, SystemView, tool runs, and chat integration.

#### 3.5.1 System view and tiles

1. Navigate to System view.
2. Confirm tiles or cards exist for:
   - Process Inspector
   - Event Log Triage
   - Network Check

#### 3.5.2 Run Process Inspector

1. Click "Run" on Process Inspector.
2. Confirm:
   - The tool reports progress or a loading indicator.
   - A report appears in the System view with process data.
   - A new message appears in the active chat:
     - Title such as "Process Inspector report."
     - Severity badge if used.
     - Collapsible details with process list.

#### 3.5.3 Run Event Log Triage

1. Run Event Log Triage.
2. Confirm:
   - Errors and warnings are listed by source.
   - Assistant description text is readable and suggests next steps.
   - A report is posted into the active chat.

#### 3.5.4 Run Network Check

1. Disconnect from the network or simulate a poor connection if possible.
2. Run Network Check.
3. Confirm:
   - Report shows basic connectivity and DNS results.
   - Severity matches the situation.
   - Chat message is created with summary and details.

Also confirm that if PowerShell or event log access fails, the app shows a friendly error message and does not crash.

---

### 3.6 Monitoring and Notifications (Phase 2D)

Goal: Validate `MonitoringService`, `NotificationRepository`, IPC, and toast UI.

#### 3.6.1 Trigger CPU or memory notification

1. Open several heavy applications or start a load generator so CPU or memory is high for a while.
2. Wait at least one monitoring interval (for example 30 seconds).
3. Confirm:
   - A notification toast slides up from the bottom or designated area.
   - It shows severity, title, and a short message.
4. Click the toast.
5. Confirm:
   - You are taken to System view or the relevant tool report.
   - The notification is marked as read if that state is displayed.

#### 3.6.2 Notification history

1. Navigate to the notifications list or history view.
2. Confirm:
   - Recent notifications appear with correct timestamps and severity colors.
   - Read and unread states are clearly indicated.
3. Use any available "mark read" action and confirm it updates both history and toast behavior.

---

### 3.7 Error boundaries and stability (Phase 2E)

Goal: Verify ErrorBoundary components and resiliency.

1. Intentionally break a small part of the UI (for development testing only) or simulate a component error through a test hook if present.
2. Confirm:
   - ErrorBoundary for App shows a friendly fallback rather than a blank screen.
   - ErrorBoundary for ChatPanel shows a local fallback without crashing the entire app.
3. Return the code to a normal state and rebuild.

---

### 3.8 Persistence and restart behavior

Goal: Verify SQLite via sql.js and repository logic.

1. Create at least:
   - Two projects.
   - Several notebook entries.
   - Several chats.
   - At least one toolbox run and one notification.
2. Close the app completely.
3. Restart it.
4. Confirm:
   - All previously created records are still present.
   - Dashboard cards show recent activity and notebook highlights.
   - Projects, Notebook, System, and notifications views reflect the stored data.

---

## 4. Technical tests

### 4.1 IPC contract

Goal: Check `window.desktop` API surface and type safety.

1. In a dev build, open the dev tools console.
2. Inspect `window.desktop` and confirm:
   - Expected namespaces exist (for example `ai`, `projects`, `notebook`, `toolbox`, `notifications`, `dashboard`).
3. Call a harmless method such as listing projects or notebook entries and ensure the promise resolves and errors are logged cleanly if they occur.

### 4.2 Vitest

Run:

```bash
npm test
```

or the configured Vitest script.

Confirm:

- All existing tests pass.
- No test fails intermittently.
- Coverage is sufficient for critical services and IPC handlers.

## 5. Regression checklist

Run this quick set of checks before merging any significant change:

1. `npm run build`
2. `npm test`
3. Manual smoke:

- Launch app.

- Send a chat message.

- Open Projects and Notebook.

- Run at least one toolbox tool.

- Trigger or view at least one notification.

If any of these fail, treat it as a blocker and fix before release.

## 6. Known limitations for MVP

- Toolbox tools may provide simplified or partial results on some systems depending on permissions and PowerShell availability.
- Monitoring currently focuses on CPU and memory and may not cover all possible failure modes.
- Notebook search is keyword based today. Semantic search using embeddings will come later.

Document new limitations here as they are discovered during testing.
