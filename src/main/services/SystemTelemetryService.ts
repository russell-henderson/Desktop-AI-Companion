import { exec } from 'child_process';
import os from 'os';

export type TelemetrySnapshot = {
    status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    cpuLoad: number;
    memoryLoad: number;
    gpuLoad?: number;
    activeAlerts: string[];
    lastUpdated: string;
};

export class SystemTelemetryService {
    private latest: TelemetrySnapshot | null = null;
    private intervalId: NodeJS.Timeout | null = null;

    start() {
        this.sample();
        this.intervalId = setInterval(() => this.sample(), 30_000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    getSnapshot(): TelemetrySnapshot | null {
        return this.latest;
    }

    private sample() {
        const cpu = this.sampleCpu();
        const mem = this.sampleMemory();
        this.sampleGpu().then((gpu) => {
            const alerts: string[] = [];
            let status: TelemetrySnapshot['status'] = 'NOMINAL';

            if (gpu !== undefined && gpu > 85) {
                status = 'WARNING';
                alerts.push(`GPU usage is high at ${gpu.toFixed(0)} percent`);
            }

            if (cpu > 90 || mem > 90) {
                status = status === 'NOMINAL' ? 'WARNING' : status;
                if (cpu > 90) {
                    alerts.push(`CPU usage is high at ${cpu.toFixed(0)} percent`);
                }
                if (mem > 90) {
                    alerts.push(`Memory usage is high at ${mem.toFixed(0)} percent`);
                }
            }

            // Critical if any metric exceeds 95%
            if (cpu > 95 || mem > 95 || (gpu !== undefined && gpu > 95)) {
                status = 'CRITICAL';
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
        // Simple 1 second average over all cores
        // Using os.loadavg()[0] which gives 1-minute load average
        // Converting to percentage (multiply by 100 and divide by number of cores)
        const loadAvg = os.loadavg()[0];
        const cpuCount = os.cpus().length;
        const cpuUsage = Math.min(100, Math.round((loadAvg / cpuCount) * 100));
        return cpuUsage;
    }

    private sampleMemory(): number {
        const used = os.totalmem() - os.freemem();
        return Math.round((used / os.totalmem()) * 100);
    }

    private sampleGpu(): Promise<number | undefined> {
        // MVP: optionally call nvidia-smi if present, otherwise return undefined
        return new Promise((resolve) => {
            exec('nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits', (err, stdout) => {
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

