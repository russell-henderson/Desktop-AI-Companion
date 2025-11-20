# Cursor Test Suite - Communication Clarity and Latency

Goal: Find and fix any slow or confusing parts of the communication loop between UI, IPC, services, and OpenAI, with special focus on the annotated areas A, B, C, D, E, F, G, H, T in the main dashboard.

## Phase 0 - Trace the message pipeline

Objective: Make latency visible end to end.

Tasks for Cursor:

- [ ] Add a small diagnostic helper in the main process that timestamps each stage:
  - Chat send received in renderer
  - IPC request sent
  - AIService request started
  - OpenAI response received
  - AIService finished
  - IPC reply delivered
  - Renderer state updated
- [ ] Log these timestamps into a structured dev log (for example `dev-telemetry.log`) with a correlation id per message.
- [ ] Add a dev only command in the renderer (for example window.desktop.debug.getLastTimings) to fetch the last N timings for quick inspection.
- [ ] Verify with a few manual chats that total latency and each segment are recorded.

This gives us concrete data when something feels slow.

---

## Phase 1 - Chat loop clarity and performance (G, H, T)

### 1.1 Chat UI state tests

Use Vitest plus React Testing Library with a mocked `window.desktop.ai`.

- [ ] Test: send button disabled while a message is in flight
  - Given ChatPanel and ChatInput are rendered
  - When the user submits a message and `ai.sendMessage` promise is pending
  - Then:
    - The Send button is disabled
    - The input is disabled or marked as "sending"
    - A "Nova is thinking" indicator or skeleton appears

- [ ] Test: send button re enabled after response or error
  - Mock a resolved response and an error response
  - Assert that input and button return to normal state in both cases

- [ ] Test: user message and assistant message ordering
  - When sending a message with a mocked response
  - Then ChatArea should show:
    - User bubble first
    - Assistant bubble after the response
    - No duplicate or out of order messages

- [ ] Test: long prompt handling
  - When the user types a very long message (for example 15k characters)
  - Then:
    - Either the input is limited with a clear character counter
    - Or an error / warning appears before sending

### 1.2 IPC and AIService latency tests

Use Vitest to test the main process AIService and IPC handlers with mocked OpenAI.

- [ ] Test: AIService returns within timeout
  - Mock OpenAI client to resolve after a known delay
  - Wrap `sendMessage` in a timer
  - Assert that the method returns within a configured maximum (for example 25 seconds) and surfaces a timeout error if not

- [ ] Test: IPC handler returns structured errors
  - Mock AIService to throw different failure types (network error, invalid key, rate limit)
  - Assert IPC reply maps them to clear error codes and messages for the renderer

- [ ] Test: no double requests on double click
  - In the renderer tests, simulate double click on Send
  - Assert that the logic only calls `ai.sendMessage` once for that input

### 1.3 Notebook and Attach in ChatInput (H)

- [ ] Test: Notebook button opens selection panel
  - Click Notebook in ChatInput
  - Assert notebook picker appears and focus is set inside it

- [ ] Test: selected notebook entry is inserted correctly
  - Pick an entry with some unique content
  - Assert that the ChatInput field now contains that content at the cursor position, not overwriting existing text unless specified

- [ ] Test: Attach button opens file picker and shows chips or status
  - Click Attach
  - Mock file selection
  - Assert attached file(s) show up as chips or labels and are included in the message payload passed to IPC

---

## Phase 2 - Model, persona, and top bar clarity (A, B, C, D)

### 2.1 Model selector and persona panel (A, B)

- [ ] Test: changing model selector updates config used for AIService
  - Mock `window.desktop.ai.setModel` or equivalent
  - Change the model in the UI
  - Assert correct model string is passed down and stored
  - Assert the next `sendMessage` uses that model id

- [ ] Test: persona label and description match selected model/persona
  - Render TopBar with a given persona selection
  - Assert persona name and subtext match the config (for example "Nova · System Expert", "Precision plus tool access")

- [ ] Test: Notebook and Settings buttons open correct views
  - Click Notebook
  - Assert NotebookView is focused and the main area switches
  - Click Settings
  - Assert a settings panel or page appears without losing context

### 2.2 Workspace and system cards (C and system card in E)

- [ ] Test: Workspace card shows active project
  - When a project is selected in navigation context
  - Workspace card should show project name, description, and path if available

- [ ] Test: System card updates after toolbox runs
  - Run a toolbox tool
  - System card text should update with the latest tool run time and summary

### 2.3 Notebook highlights card (D)

- [ ] Test: highlights card shows pinned or recent entries
  - Seed notebook with pinned entries
  - Assert the highlights card displays them with correct type labels (Template, Prompt)

- [ ] Test: clicking a highlight opens the entry
  - Click a highlighted notebook entry
  - Assert that:
    - NotebookView opens with that entry selected
    - Or that the entry content is inserted into ChatInput depending on the intended design; clarify and test accordingly

---

## Phase 3 - Navigation and sidebar behavior (E, F)

### 3.1 Main nav stability

- [ ] Test: each nav item loads correct view
  - Home, Chats, Projects, Notebook, System, Insights (if implemented)
  - Clicking each sets the navigation context and renders the appropriate root component in the main area

- [ ] Test: context list updates with selected section
  - When switching between sections, verify context items (for example project contexts, chat contexts) update correctly

- [ ] Test: navigation within a slow operation
  - Simulate a slow AI call or toolbox run
  - Navigate to another section while request is in flight
  - Assert app does not crash and either:
    - Cancels the request, or
    - Finishes the request but does not attach results to the wrong chat or view

### 3.2 Bottom sidebar actions (F)

- [ ] Test: Toolbox entry opens System or toolbox panel
  - Click Toolbox
  - Assert SystemView or a toolbox modal opens and focus is set correctly

- [ ] Test: Optimization Mode toggle wiring
  - If Optimization Mode already exists:
    - Toggle it on or off
    - Assert relevant flags in state change
    - Assert UI shows the mode state clearly
  - If not yet implemented:
    - Leave a TODO and ensure the button is disabled or clearly labeled as coming soon

- [ ] Test: Activity view
  - Click Activity
  - Assert a list of recent system events, chats or tool runs appears based on spec

---

## Phase 4 - Toolbox and monitoring communication

The goal here is to ensure the user always understands what is happening and nothing feels like a black box.

### 4.1 Toolbox run clarity

- [ ] Test: starting a tool shows progress state
  - Click a tool card in SystemView
  - Assert:
    - Tool card shows "Running" state
    - A spinner or progress indicator appears
    - Run button is disabled while tool is active

- [ ] Test: tool chat message wording
  - After a tool completes, inspect the chat message text
  - Assert it clearly states:
    - What tool ran
    - When it ran
    - Brief summary line before the collapsible details

- [ ] Test: collapsing and expanding tool report
  - Clicking the report header should expand and collapse details without affecting other messages

### 4.2 Monitoring and notifications

- [ ] Test: long running monitoring loop does not block UI
  - Mock `MonitoringService` to trigger frequent notifications
  - Assert the UI remains responsive and does not freeze when toasts appear

- [ ] Test: toast content clarity
  - For a test notification, assert toast text includes:
    - Severity label (Info, Warning, Critical)
    - Short cause summary
    - Suggested next action (for example "Open toolbox" or "View report")

- [ ] Test: clicking toast routes to useful view
  - Click the toast
  - Assert the app navigates to a relevant System or report view and highlights the related item

---

## Phase 5 - Diagnostics and Insights view (E: Insights item)

If the Insights nav item is intended as a diagnostics panel, Cursor should wire it up now to help future debugging.

- [ ] Implement an Insights view that reads dev telemetry (from Phase 0) and displays:
  - Average AI response time
  - Average toolbox run time by tool
  - Count of recent errors by service
- [ ] Add a simple date range or last N operations filter
- [ ] Confirm this page works on dev builds without affecting the production UX

---

## Phase 6 - Regression checklist for Cursor

Cursor should add or update tests and then validate:

- [ ] All new Vitest tests pass.
- [ ] `npm run dev` still launches without errors.
- [ ] `npm run build` still completes successfully.
- [ ] Manual check:
  - Send a chat message and confirm clear progress and final message.
  - Run each toolbox tool and confirm chat reports and System card updates.
  - Trigger a notification and confirm toast plus history entry.
  - Navigate through all sidebar items and confirm views load quickly and clearly.

If any test reveals slow segments or unclear wording, Cursor should:

- First adjust diagnostics and logs so the cause is visible.
- Then implement the smallest change that improves clarity or speed.
- Update this document and PRD if behavior or wording changes.

