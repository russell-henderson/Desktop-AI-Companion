# Project Context

## Product Vision
Desktop AI Companion is a secure, system-aware AI assistant for Windows that runs locally. Unlike standard chat bots, it integrates deeply with the OS to inspect processes, logs, and network status, while maintaining a persistent memory of the user's projects and notes. It aims to be a "Jarvis-like" partner that empowers power users by combining conversational intelligence with explicit system tools and a personal knowledge base.

## MVP Features
- **Secure Architecture:** Electron main process handles all secrets and system APIs; React renderer is isolated.
- **Dashboard UI (A-M Layout):** A rich dashboard with quick access to projects, system overview, recent activity, and suggested prompts.
- **Chat Interface:** Persistent conversations with a model selector and distinct user/AI bubbles.
- **Projects:** Manually created workspaces linking chats, folders, and notebook entries.
- **Notebook:** A personal vault for prompts, snippets, and notes with semantic search.
- **Toolbox v1:**
    - **Process Inspector:** View and manage running processes.
    - **Event Log Triage:** Analyze Windows event logs for errors/warnings.
    - **Network Check:** Basic connectivity and latency tests.
- **Notifications:** Lightweight monitoring for system issues (CPU, logs, network) with slide-up alerts.
- **Local Data Store:** SQLite database for all user data (projects, chats, notes, reports).

## Out of Scope for MVP
- Non-Windows platforms (macOS, Linux).
- Multi-user support or team sharing.
- Remote management of other machines.
- Deep OS modifications (e.g., registry edits).
- Dark mode (deferred).
- Voice input/output.
- Cloud sync.

## A-M Dashboard Layout
The UI follows a specific grid layout labeled A through M:
- **A (Top Bar):** Title and system status.
- **B (Model Selector):** Dropdown for choosing the AI persona/model.
- **C (Quick Access):** Settings and notebook toggle.
- **D (Workflow Card 1):** Active Project/Workspace summary.
- **E (Workflow Card 2):** System Overview (health check).
- **F, G, H (Primary Cards):** Recent Activity, Suggested Prompts, Notebook Highlights.
- **I (Chat Header):** Chat title and context badges.
- **J (Attachments):** File/folder attachment control.
- **K (Main Chat):** The central conversation area.
- **L (Left Sidebar):** Navigation (Home, Chats, Projects, Notebook, System) and context lists.
- **M (Bottom Sidebar):** Toolbox, settings, and quick actions.
