# Technical Specification & Architecture

## 1. Goals
-   **Security:** Zero trust in the renderer. All secrets and sensitive operations live in the Main process.
-   **Performance:** Fast UI load (Vite) and responsive IPC.
-   **Persistence:** Robust local data storage using SQLite.
-   **Modularity:** Clear separation between UI, System Services, and AI Logic.

## 2. System Architecture

### 2.1 Module Overview
-   **Main Process (Node.js)**
    -   `main.ts`: Entry point, window management, IPC handlers.
    -   `AIService`: Wraps OpenAI SDK, manages API keys.
    -   `Database`: Manages SQLite connection and schema (using sql.js).
    -   `ProjectService`: Manages project CRUD and chat linking.
    -   `NotebookService`: Handles notebook entries with keyword search (ready for embeddings).
    -   `ToolboxService`: Executes system tools (Process Inspector, Event Log Triage, Network Check).
    -   `MonitoringService`: Lightweight monitoring loop for CPU, memory, and system health.
    -   `DashboardService`: Aggregates dashboard summary data.
    -   **Repositories**: ProjectRepository, ChatRepository, MessageRepository, NotebookRepository, ToolReportRepository, NotificationRepository.
-   **Preload Layer**
    -   `preload.ts`: Exposes `window.desktop` and `window.ai` APIs via contextBridge.
-   **Renderer Process (React + TypeScript + Vite)**
    -   `App.tsx`: Root component with navigation routing.
    -   `DashboardGrid`: A-M layout container with cards D, E, F, G, H.
    -   `ChatPanel`: Full chat interface with header (I), area (K), and input (J).
    -   `ProjectsView`: Project management UI.
    -   `NotebookView`: Notebook entry list and editor.
    -   `SystemView`: Toolbox tools UI and report history.
    -   `NotificationManager`: Toast notifications and history.

### 2.2 IPC Interface (`window.desktop` / `window.ai`)

#### Chat & AI
-   `sendMessage(conversationId: string, content: string, attachments?: any[]): Promise<AiMessage>`
-   `getDashboardSummary(): Promise<DashboardSummary>`
-   `getChats(): Promise<ChatListItem[]>`
-   `getMessages(chatId: string): Promise<ChatMessage[]>`

#### Projects
-   `projects.list(): Promise<ProjectRecord[]>`
-   `projects.get(id: string): Promise<ProjectRecord | null>`
-   `projects.create(input): Promise<ProjectRecord>`
-   `projects.update(id: string, input): Promise<ProjectRecord | null>`
-   `projects.delete(id: string): Promise<void>`
-   `projects.linkChat(chatId: string, projectId: string | null): Promise<void>`

#### Notebook
-   `notebook.list(filters?): Promise<NotebookEntryRecord[]>`
-   `notebook.get(id: string): Promise<NotebookEntryRecord | null>`
-   `notebook.create(input): Promise<NotebookEntryRecord>`
-   `notebook.update(id: string, input): Promise<NotebookEntryRecord | null>`
-   `notebook.delete(id: string): Promise<void>`
-   `notebook.search(query: string, projectId?: string): Promise<NotebookEntryRecord[]>` (keyword-based, ready for semantic)

#### Toolbox
-   `toolbox.listReports(): Promise<ToolReportRecord[]>`
-   `toolbox.getReport(id: string): Promise<ToolReportRecord | null>`
-   `toolbox.run(toolName: string, chatId?: string): Promise<ToolReportRecord>` (ProcessInspector, EventLogTriage, NetworkCheck)

#### Notifications
-   `notifications.list(unreadOnly?: boolean): Promise<NotificationRecord[]>`
-   `notifications.markRead(id: string): Promise<void>`

## 3. Data Model (SQLite)

### Projects
-   `id` (UUID)
-   `name` (Text)
-   `description` (Text)
-   `path` (Text, optional)
-   `createdAt` (ISO Date)

### Chats
-   `id` (UUID)
-   `projectId` (UUID, FK)
-   `title` (Text)
-   `model` (Text)

### Messages
-   `id` (UUID)
-   `chatId` (UUID, FK)
-   `role` (user/assistant/system)
-   `content` (Text)
-   `timestamp` (ISO Date)

### NotebookEntries
-   `id` (UUID)
-   `projectId` (UUID, FK, nullable)
-   `type` (prompt/snippet/note)
-   `title` (Text)
-   `content` (Text)
-   `embedding` (Blob/Vector)

### ToolReports
-   `id` (UUID)
-   `toolName` (Text)
-   `status` (success/error)
-   `summary` (Text)
-   `details` (JSON)
-   `createdAt` (ISO Date)

## 4. Security Model
-   **Secrets:** `OPENAI_API_KEY` stored in `.env` (dev) or secure store (prod), accessed ONLY by `AIService` in Main.
-   **Renderer:** Has NO access to Node.js primitives (`fs`, `child_process`). Must request actions via IPC.
-   **Validation:** All IPC inputs validated using Zod in the Main process before execution.
