import { useEffect, useState } from 'react';
import type { ToolReportRecord } from '../../types/ipc';

export default function SystemView() {
    const [reports, setReports] = useState<ToolReportRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningTool, setRunningTool] = useState<string | null>(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const data = await window.desktop?.toolbox.listReports();
            setReports(data || []);
        } catch (error) {
            console.error('Failed to load tool reports', error);
        } finally {
            setLoading(false);
        }
    };

    const runTool = async (toolName: string) => {
        setRunningTool(toolName);
        try {
            await window.desktop?.toolbox.run(toolName);
            await loadReports();
        } catch (error) {
            console.error(`Failed to run ${toolName}`, error);
        } finally {
            setRunningTool(null);
        }
    };

    const getSeverityColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'text-brand-emerald';
            case 'warning':
                return 'text-brand-orange';
            case 'error':
                return 'text-brand-orange';
            default:
                return 'text-text-muted';
        }
    };

    if (loading) {
        return <div className="p-6 text-text-muted">Loading system tools...</div>;
    }

    return (
        <div className="flex h-full flex-col p-6">
            <h1 className="mb-6 text-2xl font-semibold">System Tools</h1>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-card border border-surface-soft bg-surface p-6 shadow-card">
                    <h3 className="mb-2 font-semibold text-text-primary">Process Inspector</h3>
                    <p className="mb-4 text-sm text-text-muted">View running processes and resource usage</p>
                    <button
                        onClick={() => runTool('ProcessInspector')}
                        disabled={!!runningTool}
                        className="w-full rounded-card bg-brand-cyan px-4 py-2 text-sm font-medium text-white hover:bg-brand-cyan/90 disabled:opacity-50 transition"
                    >
                        {runningTool === 'ProcessInspector' ? 'Running...' : 'Run Inspector'}
                    </button>
                </div>

                <div className="rounded-card border border-surface-soft bg-surface p-6 shadow-card">
                    <h3 className="mb-2 font-semibold text-text-primary">Event Log Triage</h3>
                    <p className="mb-4 text-sm text-text-muted">Analyze Windows event logs for errors</p>
                    <button
                        onClick={() => runTool('EventLogTriage')}
                        disabled={!!runningTool}
                        className="w-full rounded-card bg-brand-cyan px-4 py-2 text-sm font-medium text-white hover:bg-brand-cyan/90 disabled:opacity-50 transition"
                    >
                        {runningTool === 'EventLogTriage' ? 'Running...' : 'Run Triage'}
                    </button>
                </div>

                <div className="rounded-card border border-surface-soft bg-surface p-6 shadow-card">
                    <h3 className="mb-2 font-semibold text-text-primary">Network Check</h3>
                    <p className="mb-4 text-sm text-text-muted">Test connectivity and DNS resolution</p>
                    <button
                        onClick={() => runTool('NetworkCheck')}
                        disabled={!!runningTool}
                        className="w-full rounded-card bg-brand-cyan px-4 py-2 text-sm font-medium text-white hover:bg-brand-cyan/90 disabled:opacity-50 transition"
                    >
                        {runningTool === 'NetworkCheck' ? 'Running...' : 'Run Check'}
                    </button>
                </div>
            </div>

            <div>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Recent Reports</h2>
                    {reports.length > 0 && (
                        <button
                            onClick={async () => {
                                if (!confirm('Are you sure you want to delete all reports? This cannot be undone.')) return;
                                try {
                                    await window.desktop?.toolbox.deleteAllReports();
                                    await loadReports();
                                } catch (error) {
                                    console.error('Failed to clear all reports', error);
                                }
                            }}
                            className="rounded-pill border border-brand-orange px-3 py-1.5 text-xs font-medium text-brand-orange hover:bg-brand-orange/10 transition"
                        >
                            Clear all reports
                        </button>
                    )}
                </div>
                {reports.length === 0 ? (
                    <p className="text-text-muted">No reports yet. Run a tool to see results.</p>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="rounded-card border border-surface-soft bg-surface p-4 shadow-card"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{report.tool_name}</h4>
                                        {report.summary && <p className="mt-1 text-sm text-text-muted">{report.summary}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${getSeverityColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Are you sure you want to delete this report?')) return;
                                                try {
                                                    await window.desktop?.toolbox.deleteReport(report.id);
                                                    await loadReports();
                                                } catch (error) {
                                                    console.error('Failed to delete report', error);
                                                }
                                            }}
                                            className="rounded-full w-6 h-6 flex items-center justify-center text-text-muted hover:text-brand-orange hover:bg-surface-soft transition"
                                            title="Delete report"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-text-muted">
                                    {new Date(report.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

