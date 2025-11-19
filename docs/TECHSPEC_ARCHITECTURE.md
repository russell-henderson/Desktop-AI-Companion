# Technical Specification & Architecture

## 1. Goals
-   **Security:** Zero trust in the renderer. All secrets and sensitive operations live in the Main process.
-   **Performance:** Fast UI load (Vite) and responsive IPC.
-   **Persistence:** Robust local data storage using SQLite.
-   **Modularity:** Clear separation between UI, System Services, and AI Logic.

## 2. System Architecture

### 2.1 Module Overview
-   **Main Process (Node.js)**
    -   `MainApp`: Entry point, window management.
    -   `AIService`: Wraps OpenAI SDK, manages API keys.
    -   `DataService`: Manages SQLite connection and schema.
    -   `ToolboxService`: Executes system tools (Process, Logs, Network).
    -   `NotebookService`: Handles semantic search and embeddings.
-   **Preload Layer**
    -   `contextBridge`: Exposes `window.ai` API.
-   **Renderer Process (React + Vite)**
    -   `App`: Root component.
    -   `Dashboard`: A-M layout container.
    -   `ChatInterface`: Message list and input.
    -   `ToolboxPanel`: UI for system tools.

### 2.2 IPC Interface (`window.ai`)

#### Chat & AI
-   `ai.sendMessage(conversationId: string, content: string, attachments?: any[]): Promise<Message>`
-   `ai.getModels(): Promise<Model[]>`

#### Data & Projects
-   `ai.getProjects(): Promise<Project[]>`
-   `ai.createProject(data: ProjectDTO): Promise<Project>`
-   `ai.getRecentActivity(): Promise<ActivityItem[]>`

#### Notebook
-   `ai.searchNotebook(query: string, scope?: string): Promise<NotebookEntry[]>`
-   `ai.saveNotebookEntry(entry: NotebookEntryDTO): Promise<NotebookEntry>`

#### Toolbox
-   `ai.runTool(toolName: string, params?: any): Promise<ToolReport>`
-   `ai.getSystemStatus(): Promise<SystemStatus>`

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
