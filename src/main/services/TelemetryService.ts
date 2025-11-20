import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export interface TelemetryEvent {
    correlationId: string;
    stage: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface MessageTiming {
    correlationId: string;
    stages: {
        rendererSend?: number;
        ipcRequestSent?: number;
        aiServiceStarted?: number;
        openaiResponseReceived?: number;
        aiServiceFinished?: number;
        ipcReplyDelivered?: number;
        rendererStateUpdated?: number;
    };
    totalLatency?: number;
    metadata?: Record<string, unknown>;
}

export class TelemetryService {
    private events: TelemetryEvent[] = [];
    private readonly logFilePath: string;
    private readonly maxEvents = 1000; // Keep last 1000 events in memory

    constructor() {
        const userDataPath = app.getPath('userData');
        this.logFilePath = path.join(userDataPath, 'dev-telemetry.log');
    }

    recordEvent(stage: string, correlationId: string, metadata?: Record<string, unknown>): void {
        const event: TelemetryEvent = {
            correlationId,
            stage,
            timestamp: Date.now(),
            metadata,
        };

        this.events.push(event);
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // Write to log file (async, don't block)
        this.writeToLog(event).catch((err) => {
            console.error('Failed to write telemetry event to log', err);
        });
    }

    private async writeToLog(event: TelemetryEvent): Promise<void> {
        const logLine = JSON.stringify({
            ...event,
            timestamp: new Date(event.timestamp).toISOString(),
        });
        fs.appendFileSync(this.logFilePath, logLine + '\n', 'utf-8');
    }

    getTimings(limit = 50): MessageTiming[] {
        const timingsMap = new Map<string, MessageTiming>();

        // Group events by correlationId
        for (const event of this.events) {
            if (!timingsMap.has(event.correlationId)) {
                timingsMap.set(event.correlationId, {
                    correlationId: event.correlationId,
                    stages: {},
                    metadata: event.metadata,
                });
            }

            const timing = timingsMap.get(event.correlationId)!;
            switch (event.stage) {
                case 'rendererSend':
                    timing.stages.rendererSend = event.timestamp;
                    break;
                case 'ipcRequestSent':
                    timing.stages.ipcRequestSent = event.timestamp;
                    break;
                case 'aiServiceStarted':
                    timing.stages.aiServiceStarted = event.timestamp;
                    break;
                case 'openaiResponseReceived':
                    timing.stages.openaiResponseReceived = event.timestamp;
                    break;
                case 'aiServiceFinished':
                    timing.stages.aiServiceFinished = event.timestamp;
                    break;
                case 'ipcReplyDelivered':
                    timing.stages.ipcReplyDelivered = event.timestamp;
                    break;
                case 'rendererStateUpdated':
                    timing.stages.rendererStateUpdated = event.timestamp;
                    break;
            }
        }

        // Calculate total latency and sort by most recent
        const timings = Array.from(timingsMap.values())
            .map((timing) => {
                const { rendererSend, rendererStateUpdated } = timing.stages;
                if (rendererSend && rendererStateUpdated) {
                    timing.totalLatency = rendererStateUpdated - rendererSend;
                }
                return timing;
            })
            .sort((a, b) => {
                const aTime = Math.max(...Object.values(a.stages).filter((v) => v !== undefined) as number[]);
                const bTime = Math.max(...Object.values(b.stages).filter((v) => v !== undefined) as number[]);
                return bTime - aTime;
            })
            .slice(0, limit);

        return timings;
    }

    getStats(): {
        averageAiResponseTime: number;
        averageToolboxRunTime: Record<string, number>;
        errorCounts: Record<string, number>;
    } {
        const timings = this.getTimings(100);
        const aiTimings = timings.filter((t) => t.stages.aiServiceStarted && t.stages.aiServiceFinished);
        const toolboxTimings = this.events.filter((e) => e.stage.startsWith('toolbox:'));
        const errors = this.events.filter((e) => e.stage === 'error');

        const averageAiResponseTime =
            aiTimings.length > 0
                ? aiTimings.reduce((sum, t) => {
                      const duration = (t.stages.aiServiceFinished || 0) - (t.stages.aiServiceStarted || 0);
                      return sum + duration;
                  }, 0) / aiTimings.length
                : 0;

        const toolboxTimes: Record<string, number[]> = {};
        for (const event of toolboxTimings) {
            const toolName = event.metadata?.toolName as string;
            const duration = event.metadata?.duration as number;
            if (toolName && duration) {
                if (!toolboxTimes[toolName]) {
                    toolboxTimes[toolName] = [];
                }
                toolboxTimes[toolName].push(duration);
            }
        }

        const averageToolboxRunTime: Record<string, number> = {};
        for (const [tool, durations] of Object.entries(toolboxTimes)) {
            averageToolboxRunTime[tool] = durations.reduce((a, b) => a + b, 0) / durations.length;
        }

        const errorCounts: Record<string, number> = {};
        for (const error of errors) {
            const service = (error.metadata?.service as string) || 'unknown';
            errorCounts[service] = (errorCounts[service] || 0) + 1;
        }

        return {
            averageAiResponseTime,
            averageToolboxRunTime,
            errorCounts,
        };
    }
}

