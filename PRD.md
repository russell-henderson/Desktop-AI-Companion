---
Version: 0.1.0
Last Updated: 2025-11-19
Status: Draft
Owner: Russell Henderson (Product) / Desktop AI Companion Team
---

# Desktop AI Companion - Product Requirements Document (PRD)

## 1. Overview

Desktop AI Companion is a Windows desktop application built with Electron and React that brings an AI assistant directly into the operating system. It combines conversational AI with system inspection tools, project context, and a long term notebook so the assistant can reason about the local machine, current work, and the user's own saved prompts and notes.

The app is positioned as a "system aware companion" that can:

- Chat like a modern LLM client.
- Inspect processes, event logs, and network state when asked.
- Watch for lightweight signals of trouble and surface suggestions.
- Index local projects and a personal notebook so it can reuse the user's own knowledge.
- Eventually adapt its persona and tools based on the active app or window.

This PRD covers the initial release (MVP) and the roadmap for more advanced context features.

---

## 2. Problem Statement

Modern AI desktop clients are strong at conversation but weak at system context. They usually:

- Treat every message as generic text without understanding the local machine.
- Cannot easily act as a Windows expert or read local logs and processes.
- Provide little structure for long term reuse of prompts, snippets, and project knowledge.
- Separate system tools from AI reasoning, forcing users to jump between utilities.

Power users need an assistant that is both a capable LLM and a knowledgeable guide to their own system, files, and workflows, in a single unified interface.

---

## 3. Goals and Objectives

### Primary goals

1. Deliver a secure, system aware AI companion for Windows that:
   - Talks in natural language.
   - Can inspect key system surfaces through an explicit toolbox.
   - Helps interpret results in plain language.

2. Provide a dashboard style UI (A → M layout) that:
   - Surfaces system insights, recent activity, and notebook items at a glance.
   - Gives quick access to tools, projects, and conversations.

3. Create a durable knowledge layer through:
   - Manually created projects linked to folders and chats.
   - A notebook with semantic search and AI access.

4. Keep all data local by default, with clear options for future selective sync.

### Secondary goals

- Offer a consistent visual system based on the provided palette.  
  - E65D00, EDF7FD, 0CBD85, 0D99C9, D8E4ED.
- Provide a strong foundation for later context features:
  - Natural language file querying.
  - Visual context awareness of the active window.
  - Persona shifts based on the foreground app.

---

## 4. Target Users

- Power users and builders on Windows:
  - Developers, designers, and technical students.
  - Users who already manage multiple projects and tools.
- Users comfortable granting explicit permissions for deeper system inspection, but who want clear control and visibility.
- Early adopters of AI workflows who want a richer experience than a browser tab or simple chat client.

---

## 5. Features and Requirements

### 5.1 MVP Features

#### 5.1.1 Core Architecture

- Electron main process:
  - Manages windows, notifications, and system tools.
  - Owns all secrets and system level APIs.
- Preload bridge:
  - Exposes a small API surface such as `window.ai.sendMessage`, `window.ai.runTool`, `window.ai.searchNotebook`.
  - Uses context isolation for security.
- React renderer:
  - Implements A → M dashboard layout.
  - Manages chat UI, projects, notebook views, and toolbox panels.
- Data store:
  - Local SQLite database under the user profile for:
    - Projects
    - Chats
    - Notebook entries
    - Toolbox reports
    - Notifications and system insights

#### 5.1.2 Chat Engine and Models

- Chat-first interface:
  - Streaming or fast responses.
  - Persistent history per conversation.
  - Distinct bubble colors for user and assistant.
- Model selector (A and B):
  - Dropdown for model choice and assistant role presets.
  - Each preset maps to:
    - A system prompt.
    - Allowed tools.
    - Visual name and badge.
- Internet access:
  - Ability to call out for web search or external APIs through the main process, with clear indication in the UI when external data is used.

#### 5.1.3 A → M Layout

Use the reference dashboard style with cards and a left sidebar.

- **A Top bar region**
  - Page title or current project name.
  - Subtle system status text.
- **B Model selector**
  - Dropdown for model / persona.
- **C Quick access**
  - Icon for settings and notebook slide out.
- **D Workflow card 1**
  - "Active Project" or "Current Workspace":
    - Name, description, quick link to project view.
- **E Workflow card 2**
  - "System Overview":
    - Short summary of recent findings.
    - Button to open toolbox or system view.
- **F Primary card 1**
  - "Recent Activity":
    - Last chat or last tool run.
    - Quick resume button.
- **G Primary card 2**
  - "Suggested prompts":
    - Context aware prompt suggestions.
- **H Primary card 3**
  - "Notebook highlights":
    - Pinned prompts or snippets.
    - Button to open notebook view.
- **I Chat header**
  - Current chat title.
  - Badges for project and active persona.
- **J Attachment control**
  - Button near the input to attach files or folders to the current message.
- **K Main chat area**
  - Conversation transcript with chat bubbles.
  - At bottom:
    - Multiline text input.
    - Send button.
    - Attachment button (J).
- **L Left sidebar**
  - Top: animated avatar with assistant name and role.
  - Navigation items:
    - Home (dashboard)
    - Chats
    - Projects
    - Notebook
    - System
  - Context list:
    - If "Projects" selected, show project list.
    - If "Chats" selected, show recent and pinned chats.
- **M Bottom sidebar zone**
  - Quick actions:
    - Optimization mode toggle (future).
    - Open toolbox panel.
    - Settings.
    - Logs or Activity.

#### 5.1.4 Projects

- Manual project creation:
  - Name, icon, color.
  - Optional description.
  - Optional linked folder path.
- Project content:
  - Linked chats (a chat can belong to one project).
  - Linked notebook entries scoped to the project.
- Project view:
  - Uses area K to show:
    - Overview (description, tags).
    - Linked folders and quick file open.
    - Recent chats and notebook entries.
- Actions:
  - From any chat, "Move to project".
  - From notebook entry, set scope to "Global" or "Project:<Name>".

#### 5.1.5 Notebook with Semantic Search

- Entry types:
  - Prompt
  - Snippet
  - Note
  - Template
- Fields:
  - id, title, content (markdown), type, tags, scope, pinned, createdAt, updatedAt.
- Semantic search:
  - Each entry stored with a vector embedding.
  - Search queries can be natural language:
    - "gpu crash log fix"
    - "bug report template"
  - Search respects scope:
    - Prefer project scoped entries when inside a project.
    - Fall back to global entries if needed.
- UI:
  - Notebook view:
    - Search bar.
    - Filters for type, tags, scope.
    - List on left, editor on right.
  - In chat:
    - "Insert from notebook" button to open a search driven picker.
- Assistant integration:
  - Backend tool `notebook_search` so the assistant can:
    - Suggest relevant entries in responses.
    - Ask to reuse or adapt existing templates.

#### 5.1.6 Toolbox v1

The toolbox follows an explicit permission model. Nothing runs without a user command or click.

Tools in MVP:

1. **Process Inspector**
   - Lists processes with:
     - Name, PID.
     - CPU, memory, basic network usage.
   - Actions:
     - End process (with confirmation).
     - "Explain this process" request to the assistant.
   - Views:
     - Standalone panel.
     - Summarized output in chat as a collapsible message.

2. **Event Log Triage**
   - Reads recent Windows event log entries:
     - Errors and warnings within a time window.
   - Groups by source and severity.
   - Provides:
     - Short, plain language explanation for each category.
     - Suggested next actions.
   - Summaries post to chat as structured messages.

3. **Network Check**
   - Runs quick tests:
     - Ping or latency to a few endpoints.
     - DNS resolution.
     - Basic connectivity checks.
   - Shows simple results:
     - Status (ok, degraded, failed).
     - Metrics.
   - Posts a summary message to the current chat.

Each toolbox run:

- Creates a structured report stored in the database.
- Posts a message into the active chat:
  - "I ran a Network Check. Here is what I found." with collapsible details.

#### 5.1.7 Notifications and Issue Awareness

- Lightweight monitoring:
  - Track non invasive signals such as:
    - CPU or memory spikes.
    - Frequent event log errors.
    - Loss of connectivity.
- When thresholds are met:
  - Create a notification record:
    - Type, severity, title, message, timestamp, related tool.
  - Show a slide up notification from the bottom right / M region:
    - Small panel with severity color.
    - Short description.
    - Button to "Open details" (launches the related tool) or "Discuss in chat".
- Notification severity mapping within the palette:
  - Info: 0D99C9 based accents.
  - Warning: softer E65D00 variant.
  - Safe/normal: 0CBD85.
- Notifications view:
  - Accessed from L or a dashboard card.
  - Shows history with filters by type and severity.

#### 5.1.8 Natural Language File Querying - Initial Slice

For MVP, include a constrained version:

- Scope:
  - Index file names, sizes, types, modified dates within folders linked to projects.
- Natural language queries like:
  - "Find large video files in this project folder."
  - "Show me the most recently edited document in Project X."
- Results:
  - Listed in K with:
    - Path, size, modified date.
  - Optional "Open in Explorer" action.

Full cross system queries that mix system logs and file content are reserved for later phases.

#### 5.1.9 Theming and Visual Design

- Primary palette:
  - Orange: `#E65D00`
  - Light blue: `#EDF7FD`
  - Green: `#0CBD85`
  - Blue: `#0D99C9`
  - Cool grey: `#D8E4ED`
- Style:
  - Soft cards with rounded corners.
  - Subtle drop shadows.
  - Light gradients for primary cards F, G, H.
  - Chat bubbles in two distinct colors that reference the palette.
- Dark mode is out of scope for MVP but should be considered in component design.

---

### 5.2 Roadmap Features (Post MVP)

These features are desired but not required for the first release.

#### 5.2.1 Natural Language File Querying - Advanced

- Deeper indexing:
  - File content for selected file types (documents, logs, code).
  - System logs and application specific logs.
- Cross signal queries:
  - "Find that large video file I was editing last Tuesday that was causing the drive to fill up."
    - Combine file size, modification time, and relevant log events.

#### 5.2.2 Visual Context Awareness

- Ability to inspect the active window contents:
  - For spreadsheets:
    - Understand columns, visible charts, and ranges.
    - Respond to questions like "Explain this trend".
  - For documents:
    - Summarize the visible section.
- Implementation will require:
  - OS level APIs, OCR or structured export from apps where possible.
  - Permissions and clear communication about what is captured.

#### 5.2.3 Contextual Tooling and Personas

- Persona shifts based on foreground app:
  - Terminal or IDE in focus:
    - Coding expert persona, development oriented tools.
  - Design or media tool in focus:
    - Creative assistant persona, design prompts and file helpers.
  - Office or note applications:
    - Writing and organization persona.
- User can override persona from the model selector.

#### 5.2.4 Cloud Sync (Selective)

- Option to sync:
  - Notebook entries.
  - Prompt templates.
  - Project metadata.
- Never sync:
  - Logs, system reports, or file indexes unless explicitly opted in.

#### 5.2.5 Advanced Optimization Mode

- When enabled, allows:
  - Pre approved automatic fixes (clear cache, rotate logs, shut down known problem processes).
- Always:
  - Log actions.
  - Provide a digest in chat and in logs.

---

## 6. Success Metrics

### Usage metrics

- Daily active users of the app.
- Average number of toolbox runs per session.
- Percentage of chats associated with projects.

### Experience metrics

- Time to first useful insight:
  - From install to first successful toolbox run with an interpreted result.
- Notebook reuse:
  - Number of times notebook entries are surfaced or inserted into prompts.
- Notification engagement:
  - Percentage of notifications that lead to a toolbox run or chat conversation.

### Quality and reliability

- Crash free sessions rate.
- Number of failed toolbox runs.
- Latency for core actions:
  - Time to render dashboard.
  - Time from tool trigger to visible summary.

---

## 7. Constraints and Assumptions

- Platform:
  - Windows 10 and 11 for MVP.
- Connectivity:
  - Online connection required for LLM calls.
  - System tools should still open and present information even if offline.
- Security:
  - All secrets stay in the main process.
  - Renderer never sees API keys or raw system handles.
- Data:
  - All data stored locally by default in the user profile using a local database and log files.
  - No cloud sync or telemetry in MVP.
- Performance:
  - Lightweight monitoring must not significantly impact CPU or RAM.
  - Toolbox runs may be more intensive but are user initiated.

---

## 8. Out of Scope (MVP)

- Non Windows platforms (macOS, Linux).
- Multi user or team shared projects.
- Full remote management of other machines.
- Deep OS changes such as registry edits without explicit later design.
- Dark mode or extensive theme customization.
- Voice input, wake words, or always listening behavior.

---

## 9. Open Questions

1. LLM provider and model lineup:
   - Exact models to support at launch.
   - Policy for switching or adding models over time.

2. Permissions UX:
   - How to present system access permissions in a way that is clear but not overwhelming.
   - Whether to group permissions per tool or per capability surface.

3. File indexing boundaries:
   - Which paths are indexed by default.
   - How to respect user privacy for personal folders.

4. Notification thresholds:
   - Concrete rules for low, medium, and critical severity for:
     - CPU spikes
     - Event log patterns
     - Network issues

5. Visual context:
   - Which applications are in scope for visual context first.
   - Whether to use screen capture plus OCR or application specific APIs where available.

6. Extensibility:
   - Plugin architecture for adding new toolbox tools.
   - Scriptable interface for power users to define their own tools.

---

## 10. Next Steps

1. Confirm PRD scope and resolve open questions that block architecture choices.
2. Define TECHSPEC and ARCHITECTURE docs:
   - IPC surface and data schemas.
   - Toolbox implementation approach per tool.
   - Notebook search and embedding strategy.
3. Create UI wireframes that map precisely to A → M using the selected palette.
4. Implement a vertical slice:
   - Single project.
   - Simple notebook entries and search.
   - One toolbox tool (Process Inspector).
   - Full chat flow with notifications for one issue type.
5. Iterate with real usage to refine thresholds, UX, and future roadmap priorities.

