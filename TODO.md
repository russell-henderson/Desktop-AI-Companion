# Cursor First Run Plan - Desktop AI Companion

You are the AI coding assistant inside Cursor working on the `Desktop-AI-Companion` repository.

Goal of this first run: understand the project, align with the PRD, UI, and brand docs, and produce clear planning artifacts. Do not refactor or migrate tooling yet. Focus on analysis and planning output files.

---

## Phase 0 - Ground Rules

- Respect the existing docs as the source of truth  
  - `PRD.md`  
  - `BRAND_GUIDELINES.md`  
  - `UI.md`  
  - `Desktop-AI-Companion-faq.md`  
  - `README.md`
- Do not introduce new dependencies or change build tooling in this phase.
- All work in this phase produces markdown docs only.

Output directory for planning docs:

- `docs/` at the project root  
  - Create it if it does not exist.

---

## Phase 1 - Context Intake

**Objective**: Build a concise engineering summary of what the app should do and what the UI should look like.

Tasks:

1. [ ] Read `PRD.md`, `BRAND_GUIDELINES.md`, `UI.md`, `Desktop-AI-Companion-faq.md`, and `README.md`.
2. [ ] Create `docs/PROJECT_CONTEXT.md` with:
   - [ ] One paragraph summary of the product vision.
   - [ ] Bullet list of MVP features.
   - [ ] Bullet list of out of scope items for MVP.
   - [ ] Short section that describes the A through M layout in developer friendly terms.

Do not inspect source files yet in this phase. Focus only on the written requirements.

---

## Phase 2 - Codebase Assessment

**Objective**: Document the current state of the implementation and highlight gaps relative to the PRD.

Tasks:

1. [ ] Inventory project structure  
   - Inspect:
     - `package.json`
     - `src/main/main.js`
     - `src/renderer/index.js`
     - `src/renderer/App.js`
     - `src/styles/App.css`
   - Note any missing files referenced in code, especially `preload.js`.
2. [ ] Create `docs/CODEBASE_ASSESSMENT.md` with:
   - [ ] Current runtime flow from app start to first OpenAI call.
   - [ ] List of main process responsibilities that are present and missing.
   - [ ] List of renderer responsibilities that are present and missing.
   - [ ] Current OpenAI integration method and its problems.
   - [ ] Current styling approach and how it differs from the UI spec.
3. [ ] Add a short section that maps current features to PRD features with three columns:
   - Feature name
   - Implemented status (yes, partial, no)
   - Notes

No refactors yet. Only reading and documentation.

---

## Phase 3 - Target Architecture Sketch

**Objective**: Define the technical shape needed to reach the MVP, in terms of modules and data flows.

Tasks:

1. [ ] Create `docs/TECHSPEC_ARCHITECTURE.md` with these sections:
   - [ ] Goals for the architecture.
   - [ ] High level module list:
     - Electron main process
     - Preload bridge
     - Renderer app shell
     - Data layer (SQLite)
     - Toolbox services
     - Notebook service
   - [ ] IPC surface:
     - Proposed channels such as `ai:sendMessage`, `toolbox:run`, `notebook:search`.
     - Expected request and response shapes in JSON style.
   - [ ] Data model sketch:
     - Project
     - Chat
     - NotebookEntry
     - ToolReport
     - Notification
   - [ ] Security model:
     - Where secrets live.
     - What the renderer can and cannot do.
2. [ ] Keep this file at the level of diagrams and type outlines. Do not write implementation code yet.

---

## Phase 4 - Implementation Roadmap

**Objective**: Break the MVP into clear, sequential work packages that later Cursor runs can execute.

Tasks:

1. [ ] Create `docs/TODO_MVP_PHASE1.md` with the following structure:

   - `Phase 1 - Tooling and skeleton`
     - Remove CRA and migrate to Vite plus React plus TypeScript.
     - Introduce `main.ts`, `preload.ts`, and `renderer` entry files.
   - `Phase 2 - IPC and data layer`
     - Implement preload bridge and IPC handlers for chat and toolbox.
     - Add SQLite data layer and basic models.
   - `Phase 3 - UI shell`
     - Implement sidebar (L and M), top bar (A, B, C), and chat frame (I, K, J).
   - `Phase 4 - Features`
     - Projects
     - Notebook
     - Toolbox v1 and notifications.
   - `Phase 5 - Hardening`
     - Error handling, logging, basic tests.

2. [ ] For each phase, list individual tasks as checkboxes with:
   - One sentence description.
   - Pointers to the relevant spec sections.

This file is the main task list that later Cursor sessions will follow.

---

## Phase 5 - Quick Sanity Checks

**Objective**: Make sure the repo still runs in its original state after the planning docs are added.

Tasks:

1. [ ] Confirm `npm install` completes without new warnings introduced by this planning phase.
2. [ ] Confirm `npm start` still launches the existing prototype without changes to behavior.
3. [ ] Note any existing runtime issues in `docs/CODEBASE_ASSESSMENT.md` if they block future phases.

No code edits are allowed in this phase except adding the `docs/` folder and markdown files.

---

## Exit Criteria For First Run

Cursor should consider this first planning run complete when:

- [ ] `docs/PROJECT_CONTEXT.md` exists and accurately summarizes the PRD and UI.
- [ ] `docs/CODEBASE_ASSESSMENT.md` exists and describes the current implementation and gaps.
- [ ] `docs/TECHSPEC_ARCHITECTURE.md` exists with a clear module and IPC sketch.
- [ ] `docs/TODO_MVP_PHASE1.md` exists with a sequenced list of implementation tasks.
- [ ] The app still runs in its original simple form with `npm start`.

After this, later Cursor runs will follow `docs/TODO_MVP_PHASE1.md` and implement the architecture and UI step by step.
