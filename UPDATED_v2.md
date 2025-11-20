# Updated v2

---

## 1. Freeze the visual shell

First, stop touching colors and layout except where it is required for behavior.

* Keep the current sidebar, header, cards, and chat look.
* Only visual changes allowed for this pass:

  * Move the green status pill into the header.
  * Hide or remove buttons and nav items that no longer have behavior.
  * Add simple dismiss buttons where needed.

Everything else is functionality.

---

## 2. UI surgery - what stays and what goes

### Sidebar (A, B, C)

**Keep**

* Nova profile header.
* Home.
* Notebook.
* System.
* Utility cluster (Toolbox, Optimization Mode, Activity) but only if they actually do something.

**Remove or disable for now**

* Chats - hide it. Home is the chat surface.
* Projects - hide it until we really use multi project state.
* Insights - either hide or repurpose as Activity view when we have data.

**Utility actions (C)**

For this pass:

* Toolbox

  * Navigate to System view and scroll to System Tools section.
* Optimization Mode

  * Toggle a boolean setting `optimizationModeEnabled` stored in local settings.
  * Show simple on/off visual feedback.
* Activity

  * Navigate to a very simple list view that shows recent tool runs and alerts from a shared Activity store.
  * If there is nothing yet, show an explicit empty state.

If any of these cannot be wired in a session, hide that button instead of leaving a dead control.

---

### Header and top bar (D, E, F, G)

* Move the System nominal pill (G) into the header area (D) on the right side.
* The top right trio is now:

  * Model selector (E).
  * Notebook button (F) - opens the right slide over.
  * Settings button (F) - opens a simple Settings page.
* The header line becomes:

  * Left: "Good evening" + "System admin mode - Nova is monitoring your machine".
  * Right: Green status pill which reflects real alert state from the monitoring store.

**Model selector (E)**

* When you select a model, it must:

  * Update `currentModelProfile` in global renderer state.
  * Persist the model per chat in the database.
  * Pass `modelId` to the AI IPC call.

No more fake model selector. The chip in the chat header will mirror this profile.

**Settings**

Minimum content for now:

* API key display state (not the key itself, just whether one exists).
* Optimization Mode toggle mirroring the sidebar button.
* Clear data section:

  * Clear notebook entries.
  * Clear system reports and alerts.
  * Clear chats.
  * A big red "Wipe all local data" button with explicit confirmation.

---

### Main cards (H, I, J, K, L)

**System Watch (H)**

Tie this to a real alert store instead of a hard coded GPU message.

* Create `AlertStore` in the main process or shared service with fields:

  * `id`, `severity`, `source` (ProcessInspector, Monitoring loop), `message`, `createdAt`, `resolvedAt`.
* System Watch shows:

  * Most recent active alert (no `resolvedAt`).
  * Last check time from monitoring service.
* Add actions:

  * "View details" to open System view and scroll to the matching report.
  * "Dismiss" that sets `resolvedAt = now` in the store and hides the card.
* If there are no active alerts:

  * Show a calm card saying "No active issues" rather than a forever orange block.

This gives you "run, save, clear" on alerts.

**Quick Prompts (I)**

Right sizing:

* MVP behavior is simple: clicking a quick prompt inserts that text into the chat input and focuses the field.
* Once the alert plumbing is in, we can upgrade some quick prompts to reflect the alert state (for example, "Investigate latest alert").
* If we do not wire even the basic insert in this pass, hide the card. Better no Quick Prompts than non functional ones.

**Active Workspace (J)**

Since Projects are being cut back, Active Workspace should be minimal:

* Show a single static context:

  * Title: Desktop AI Companion.
  * Path: your repo path or app root.
* Keep a single Notebook button out of this card or remove it:

  * Since we are keeping Notebook in the header and sidebar, we can remove this extra button to reduce duplication.

Later, if you reintroduce multi project support, this card can become the place where you switch context.

**Chat header and chips (K, L)**

* Keep the chat title as is.
* Chips:

  * Remove or hide the project chip and "Move to project" until we really use Projects.
  * Keep only the Model chip that reflects the actual model from the selector.

This keeps the header meaningful without pretending there is project logic when there is not.

---

### Chat surface (M, N)

**Chat panel (M)**

The core fix is knowledge. Nova must stop saying "I cannot see your machine" because we will now feed it system telemetry. I describe that bridge in the next section.

For this pass:

* Keep scrolling behavior and message styles as they are.
* Ensure the chat list is the only scrollable vertical region.

**Chat input (N)**

* Keep the text box and send button behavior.
* Notebook button here should be strictly "insert from notebook into current message":

  * Open the notebook picker.
  * On selection, insert content into the input at the cursor.
* Remove any extra Notebook button in this region that simply duplicates header behavior.

---

## 3. System Context Bridge - how we fix the "I cannot see your GPU" problem

Since this is an Electron app, you already have a Node capable main process. For this MVP we do not need a separate HTTP sidecar, the main process can be the "sidecar".

### 3.1 Telemetry source

Implement a small `TelemetryService` in the main process.

Responsibilities:

* Periodically sample:

  * CPU load.
  * Memory load.
  * Optional GPU load using PowerShell or `nvidia-smi` if available.
* Write a current snapshot to memory and, optionally, a history to the database.

Example skeleton (conceptual, not tied to exact file names):

```ts
// src/main/services/TelemetryService.ts
import { exec } from "child_process";
import os from "os";

export type TelemetrySnapshot = {
  status: "NOMINAL" | "WARNING" | "CRITICAL";
  cpuLoad: number;
  memoryLoad: number;
  gpuLoad?: number;
  activeAlerts: string[];
  lastUpdated: string;
};

export class TelemetryService {
  private latest: TelemetrySnapshot | null = null;

  start() {
    this.sample();
    setInterval(() => this.sample(), 30_000);
  }

  getSnapshot(): TelemetrySnapshot | null {
    return this.latest;
  }

  private sample() {
    const cpu = this.sampleCpu();
    const mem = this.sampleMemory();
    this.sampleGpu().then((gpu) => {
      const alerts: string[] = [];
      let status: TelemetrySnapshot["status"] = "NOMINAL";

      if (gpu !== undefined && gpu > 85) {
        status = "WARNING";
        alerts.push(`GPU usage is high at ${gpu.toFixed(0)} percent`);
      }

      if (cpu > 90 || mem > 90) {
        status = "WARNING";
        alerts.push("CPU or memory is heavily loaded");
      }

      this.latest = {
        status,
        cpuLoad: cpu,
        memoryLoad: mem,
        gpuLoad: gpu,
        activeAlerts: alerts,
        lastUpdated: new Date().toISOString(),
      };
    });
  }

  private sampleCpu(): number {
    // simple 1 second average over all cores
    // for MVP you can use os.loadavg or a single snapshot
    return Math.min(100, Math.round(os.loadavg()[0] * 25));
  }

  private sampleMemory(): number {
    const used = os.totalmem() - os.freemem();
    return Math.round((used / os.totalmem()) * 100);
  }

  private sampleGpu(): Promise<number | undefined> {
    // MVP: optionally call nvidia-smi if present, otherwise return undefined
    return new Promise((resolve) => {
      exec("nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits", (err, stdout) => {
        if (err) {
          resolve(undefined);
          return;
        }
        const value = parseInt(stdout.trim(), 10);
        if (Number.isNaN(value)) {
          resolve(undefined);
        } else {
          resolve(value);
        }
      });
    });
  }
}
```

You already have a MonitoringService. We can either extend it with this logic or use TelemetryService as a source for MonitoringService and AlertStore.

Expose an IPC handler like `system:getTelemetry` to let the renderer read the latest snapshot for System Watch and the status pill.

### 3.2 AI system prompt injection in AIService

In `AIService` (main process) where you handle `ai:sendMessage`:

1. Before calling OpenAI, fetch the latest telemetry snapshot from TelemetryService and the latest alert from AlertStore.
2. Build a dynamic system message that describes Nova and embeds the telemetry.
3. Use that as the first message in the OpenAI call.

Conceptual example:

```ts
// src/main/services/AIService.ts
import { TelemetryService } from "./TelemetryService";
import { getActiveAlert } from "./AlertStore";

export class AIService {
  constructor(private telemetry: TelemetryService) {}

  async sendMessage(payload: SendMessagePayload): Promise<AIResponse> {
    const telemetry = this.telemetry.getSnapshot();
    const alert = getActiveAlert();

    const telemetryBlock = telemetry
      ? [
          "CURRENT SYSTEM TELEMETRY:",
          `- Health status: ${telemetry.status}`,
          `- CPU load: ${telemetry.cpuLoad}%`,
          `- Memory load: ${telemetry.memoryLoad}%`,
          telemetry.gpuLoad !== undefined ? `- GPU load: ${telemetry.gpuLoad}%` : "- GPU load: not available",
          telemetry.activeAlerts.length
            ? `- Active alerts: ${telemetry.activeAlerts.join(" | ")}`
            : "- Active alerts: none",
          alert ? `- Primary alert: ${alert.message}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "CURRENT SYSTEM TELEMETRY: not available";

    const systemInstruction = [
      "You are Nova, a system admin companion for Windows power users.",
      "You can see the telemetry block below and must treat it as ground truth.",
      "Never say that you cannot see the system. If telemetry is missing, say it is temporarily unavailable.",
      "Use alerts to prioritize what you explain and which tools you propose.",
      "",
      telemetryBlock,
    ].join("\n");

    const messages = [
      { role: "system", content: systemInstruction },
      ...payload.history, // prior messages from the chat
      { role: "user", content: payload.newMessage },
    ];

    // Call OpenAI using the selected model id
    return this.callOpenAI(payload.modelId, messages);
  }
}
```

With this in place, when you ask "Can you confirm that elevated GPU usage", Nova has actual numbers in its prompt and will respond with something grounded.

---

## 4. Save and clear everywhere

You are absolutely right that anything that accumulates must also have a clear path.

For this pass:

* Notebook

  * In the slide over and the Notebook view, add delete controls:

    * Per entry delete.
    * Clear all entries button.
* Reports and alerts

  * In System view, clear per report and clear all.
  * In AlertStore, mark alerts resolved and hide them.
* Activity and insights

  * Keep a simple log of tool runs and alert changes.
  * Provide Clear all in Activity view.

All clear operations should be read only safe in terms of the OS: they only touch the app database, not the system itself.

---

## 5. Safety and toolbox

You already flagged that permissions are critical. For this iteration:

* All tool actions remain read only.

  * ProcessInspector: list processes and CPU or memory.
  * EventLogTriage: read logs and classify.
  * NetworkCheck: pings, DNS lookups, simple checks.
* AI advice can include "you can terminate process X" or "consider disabling Y on startup", but it does not execute anything.
* In the future we can add explicit "Execute" action cards that call PowerShell, but behind a clear confirmation.

This keeps Nova useful without giving it power to break the system by mistake.