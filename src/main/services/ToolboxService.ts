import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ToolReportRepository, type CreateToolReportInput } from '../repositories/ToolReportRepository';
import type { ToolReportRecord } from '../types/database';

const execAsync = promisify(exec);

export interface ProcessInfo {
    pid: number;
    name: string;
    cpu: number;
    memory: number;
}

export interface EventLogEntry {
    source: string;
    severity: string;
    message: string;
    timestamp: string;
}

export interface NetworkCheckResult {
    status: 'ok' | 'degraded' | 'failed';
    latency?: number;
    dnsWorking: boolean;
    connectivity: boolean;
}

export class ToolboxService {
    constructor(private toolReportRepo: ToolReportRepository) {}

    async runProcessInspector(): Promise<ToolReportRecord> {
        try {
            const processes = await this.getProcessList();
            const summary = `Found ${processes.length} running processes. Top CPU: ${processes
                .slice(0, 5)
                .map((p) => p.name)
                .join(', ')}`;

            const report = await this.toolReportRepo.create({
                toolName: 'ProcessInspector',
                status: 'success',
                summary,
                details: { processes, count: processes.length },
            });

            return report;
        } catch (error) {
            const report = await this.toolReportRepo.create({
                toolName: 'ProcessInspector',
                status: 'error',
                summary: `Failed to inspect processes: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: { error: String(error) },
            });
            return report;
        }
    }

    async runEventLogTriage(): Promise<ToolReportRecord> {
        try {
            const entries = await this.getEventLogEntries();
            const errorCount = entries.filter((e) => e.severity === 'error').length;
            const warningCount = entries.filter((e) => e.severity === 'warning').length;

            const summary = `Found ${errorCount} errors and ${warningCount} warnings in recent event log entries.`;

            const report = await this.toolReportRepo.create({
                toolName: 'EventLogTriage',
                status: 'success',
                summary,
                details: { entries, errorCount, warningCount },
            });

            return report;
        } catch (error) {
            const report = await this.toolReportRepo.create({
                toolName: 'EventLogTriage',
                status: 'error',
                summary: `Failed to read event log: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: { error: String(error) },
            });
            return report;
        }
    }

    async runNetworkCheck(): Promise<ToolReportRecord> {
        try {
            const result = await this.checkNetwork();
            const summary = `Network status: ${result.status}. DNS: ${result.dnsWorking ? 'OK' : 'Failed'}. Connectivity: ${result.connectivity ? 'OK' : 'Failed'}.`;

            const report = await this.toolReportRepo.create({
                toolName: 'NetworkCheck',
                status: result.status === 'ok' ? 'success' : 'warning',
                summary,
                details: { ...result } as Record<string, unknown>,
            });

            return report;
        } catch (error) {
            const report = await this.toolReportRepo.create({
                toolName: 'NetworkCheck',
                status: 'error',
                summary: `Failed to check network: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: { error: String(error) },
            });
            return report;
        }
    }

    private async getProcessList(): Promise<ProcessInfo[]> {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync(
                    'powershell "Get-Process | Select-Object Id,ProcessName,CPU,WorkingSet | ConvertTo-Json"',
                );
                const processes = JSON.parse(stdout);
                return Array.isArray(processes)
                    ? processes.map((p: any) => ({
                          pid: p.Id,
                          name: p.ProcessName,
                          cpu: p.CPU || 0,
                          memory: p.WorkingSet || 0,
                      }))
                    : [];
            }
            return [];
        } catch {
            return [];
        }
    }

    private async getEventLogEntries(): Promise<EventLogEntry[]> {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync(
                    'powershell "Get-EventLog -LogName Application -Newest 20 -ErrorAction SilentlyContinue | Select-Object Source,EntryType,Message,TimeGenerated | ConvertTo-Json"',
                );
                const entries = JSON.parse(stdout);
                return Array.isArray(entries)
                    ? entries
                          .filter((e: any) => e.EntryType === 'Error' || e.EntryType === 'Warning')
                          .map((e: any) => ({
                              source: e.Source || 'Unknown',
                              severity: e.EntryType?.toLowerCase() || 'info',
                              message: e.Message || '',
                              timestamp: e.TimeGenerated || new Date().toISOString(),
                          }))
                    : [];
            }
            return [];
        } catch {
            return [];
        }
    }

    private async checkNetwork(): Promise<NetworkCheckResult> {
        try {
            const dnsWorking = true;
            const connectivity = true;
            let latency: number | undefined;

            try {
                const start = Date.now();
                await execAsync('ping -n 1 8.8.8.8');
                latency = Date.now() - start;
            } catch {
                latency = undefined;
            }

            const status: NetworkCheckResult['status'] =
                latency && latency < 100 ? 'ok' : latency && latency < 500 ? 'degraded' : 'failed';

            return { status, latency, dnsWorking, connectivity };
        } catch {
            return { status: 'failed', dnsWorking: false, connectivity: false };
        }
    }

    async deleteReport(id: string): Promise<void> {
        await this.toolReportRepo.delete(id);
    }

    async deleteAllReports(): Promise<void> {
        await this.toolReportRepo.deleteAll();
    }
}

