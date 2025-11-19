Here is a complete `README.md` that matches the current repo and the new PRD, brand, and UI plans.

````markdown
# Desktop AI Companion

Desktop AI Companion is a Windows desktop app that brings an AI assistant directly into your system. It runs as an Electron shell with a React front end and uses OpenAI models to provide:

- Conversational help
- System aware insights
- Project oriented organization
- A reusable notebook of prompts, snippets, and notes

The long term goal is a safe and controllable desktop partner that feels closer to a local "Jarvis" than a simple chat client.

> Status: Early prototype. The current code proves the Electron plus React plus OpenAI stack. New architecture, UI, projects, notebook, toolbox, and notifications are defined in the PRD and are being implemented next.

---

## Features

### Implemented in the current prototype

- Electron shell that wraps a React app.
- Simple chat interaction with OpenAI:
  - One prompt textarea.
  - One button to send the prompt.
  - A single response area.

### Planned for the MVP

These features are specified in `PRD.md` and `UI.md` and will replace the simple demo UI.

- **Dashboard layout (A to M)**  
  - Top bar with model selector and quick access buttons.  
  - Workspace card, system overview card, and three primary cards for recent activity, suggested prompts, and notebook highlights.  
  - Main chat area with bubbles and attachments.  
  - Left sidebar for avatar, navigation, and context lists.  
  - Bottom sidebar zone for toolbox and quick actions.

- **Projects**  
  - Manually created projects that link chats, folders, and notebook entries.  
  - Project view with overview and recent work.

- **Notebook with semantic search**  
  - Persistent vault for prompts, snippets, notes, and templates.  
  - Search by meaning instead of exact text.  
  - Easy insertion of entries into prompts.

- **Toolbox v1**  
  - Process Inspector  
  - Event Log Triage  
  - Network Check  
  Each tool runs only when you ask for it and posts a summary into the current chat.

- **Notifications and system insights**  
  - Lightweight monitoring for CPU spikes, event log patterns, and network issues.  
  - Slide up panels similar to GlassWire that show low, medium, or critical issues.  
  - Notification history view.

- **Local first storage**  
  - All data stored in a local SQLite database under the user profile.  
  - Later option to sync selected items such as notebook entries.

For the full product description see:

- [`PRD.md`](PRD.md)
- [`BRAND_GUIDELINES.md`](BRAND_GUIDELINES.md)
- [`UI.md`](UI.md)
- [`Desktop-AI-Companion-faq.md`](Desktop-AI-Companion-faq.md)

---

## Architecture

### Current prototype

- **Main process**  
  - Entry: `src/main/main.js`  
  - Creates the Electron `BrowserWindow`.  
  - Loads React either from `http://localhost:3000` in development or from the built files in production.

- **Renderer**  
  - Entry: `src/renderer/index.js` and `src/renderer/App.js`.  
  - Simple React component with:
    - A textarea for user input.  
    - A button that calls OpenAI through the Node SDK.  
    - A paragraph that displays the latest response.

- **Styling**  
  - Basic styles in `src/styles/App.css` only.

> Important: The current prototype calls OpenAI directly from the renderer and reads the API key from an environment variable with a `REACT_APP_` prefix. This is acceptable only as a short term demo. The planned architecture moves OpenAI usage into the main process behind a preload and IPC layer so the key never reaches the renderer.

### Planned architecture

Planned design as described in the PRD:

- Electron main process:
  - Owns OpenAI client, system tools, notifications, and data access.
- Preload script:
  - Uses `contextBridge` to expose a small `window.ai` API to the renderer.
- React renderer:
  - Implements the dashboard, chat, projects, notebook, and toolbox UI.
- Data store:
  - Local SQLite database for projects, chats, notebook entries, toolbox reports, and notifications.
- Optional embeddings service:
  - For notebook semantic search and natural language file queries.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 8 or later
- An OpenAI API key

### 1. Clone the repository

```bash
git clone <your-fork-or-repo-url>.git
cd Desktop-AI-Companion
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root if it does not already exist.

```ini
# Used by the current prototype in the React renderer
REACT_APP_OPENAI_API_KEY=your-openai-key-here

# Dev setting that tells Electron to load the React dev server
ELECTRON_START_URL=http://localhost:3000
```

Guidelines:

* Never commit your real key to version control.
* In the future architecture the key will move to a non `REACT_APP_` variable read only by the main process.

### 4. Run the app in development

The development script starts both the React dev server and Electron.

```bash
npm start
```

This runs:

* `react-scripts start` on port 3000
* Electron, which waits for the dev server and then loads it

### 5. Build the React bundle

```bash
npm run build
```

This builds the React app into the `build` directory using `react-scripts build`.

### 6. Package the Electron app

> Packaging assumes you have updated the Electron builder configuration in `package.json` before shipping to others.

To create a distributable build:

```bash
npm run electron-pack
```

Electron Builder will generate installers and binaries under the `dist` folder.

---

## Scripts

Defined in `package.json`:

| Script                   | Description                                   |
| ------------------------ | --------------------------------------------- |
| `npm start`              | Run React dev server and Electron together    |
| `npm run react-start`    | Start React dev server only                   |
| `npm run electron-start` | Start Electron and point it at the dev server |
| `npm run build`          | Build the React app for production            |
| `npm run electron-pack`  | Package the app using electron builder        |

---

## Configuration and Environment

Key files:

* `.env`
  Developer environment variables. Should not be committed with real secrets.

* `Desktop-AI-Companion-faq.md`
  Living technical FAQ and assessment for the project.

* `PRD.md`, `BRAND_GUIDELINES.md`, `UI.md`
  Product, brand, and UI specifications that describe where the app is going.

---

## Security Notes

* The current prototype reads the OpenAI key in the renderer process. Treat this build as a local experiment only.
* Do not distribute binaries that embed real API keys.
* Roadmap work will:

  * Move all secret usage to the main process.
  * Use a preload bridge and IPC so the renderer never sees secrets.
  * Store user data locally in a database instead of scattering it across JSON files.

---

## Roadmap

Short term milestones:

1. Introduce preload and IPC for safe communication between renderer and main.
2. Move OpenAI usage into the main process.
3. Implement the new A to M dashboard layout.
4. Add projects and basic notebook support.
5. Implement Toolbox v1 (Process Inspector, Event Log Triage, Network Check).
6. Add notifications and insight cards.
7. Replace `react-scripts` with Vite and add TypeScript, ESLint, and Prettier.

Longer term ideas:

* Natural language file queries against indexed projects.
* Visual context awareness for active windows.
* Persona shifts based on the foreground application.
* Selective cloud sync for notebook and prompts.
* Advanced optimization mode with user approved automatic fixes.

See `PRD.md` for detailed requirements and the current status.

---

## Contributing

This project is still under heavy design and architecture work.

If you want to contribute:

1. Read `PRD.md`, `BRAND_GUIDELINES.md`, `UI.md`, and `Desktop-AI-Companion-faq.md` to understand direction and constraints.
2. Open an issue describing the change or feature you want to work on.
3. Keep pull requests small and focused:

   * One feature or fix per PR.
   * Include notes on how you tested the changes.

---

## License

This project uses the MIT license as declared in `package.json`.

You are free to use, modify, and distribute the software under the terms of that license.