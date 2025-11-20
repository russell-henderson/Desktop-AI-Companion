import { useEffect, useState } from 'react';
import type { TelemetryStats, MessageTiming } from '../../types/ipc';

export default function InsightsView() {
    const [stats, setStats] = useState<TelemetryStats | null>(null);
    const [timings, setTimings] = useState<MessageTiming[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(20);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            // Hide in production
            return;
        }
        loadData();
    }, [limit]);

    const loadData = async () => {
        try {
            if (window.desktop?.debug) {
                const [statsData, timingsData] = await Promise.all([
                    window.desktop.debug.getStats(),
                    window.desktop.debug.getLastTimings(limit),
                ]);
                setStats(statsData);
                setTimings(timingsData);
            }
        } catch (error) {
            console.error('Failed to load telemetry data', error);
        } finally {
            setLoading(false);
        }
    };

    if (process.env.NODE_ENV === 'production') {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <p className="text-text-muted">Insights view is only available in development mode.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="p-6 text-text-muted">Loading insights...</div>;
    }

    return (
        <div className="flex h-full flex-col p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Diagnostics & Insights</h1>
                <div className="flex items-center gap-4">
                    <label className="text-sm text-text-muted">
                        Last N operations:
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="ml-2 rounded-lg border border-surface-soft px-2 py-1 text-sm text-text-primary"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </label>
                    <button
                        onClick={loadData}
                        className="rounded-card bg-brand-cyan px-4 py-2 text-sm font-medium text-white hover:bg-brand-cyan/90 transition"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-card border border-surface-soft bg-surface p-6 shadow-card">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">Average AI Response Time</h3>
                    <p className="text-3xl font-bold text-brand-cyan">
                        {stats ? `${(stats.averageAiResponseTime / 1000).toFixed(2)}s` : 'N/A'}
                    </p>
                </div>

                <div className="rounded-card border border-surface-soft bg-surface p-6 shadow-card">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">Toolbox Run Times</h3>
                    <div className="space-y-2">
                        {stats && Object.keys(stats.averageToolboxRunTime).length > 0 ? (
                            Object.entries(stats.averageToolboxRunTime).map(([tool, avgTime]) => (
                                <div key={tool} className="flex justify-between text-sm">
                                    <span className="text-text-muted">{tool}:</span>
                                    <span className="font-medium">{(avgTime / 1000).toFixed(2)}s</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-muted">No toolbox runs yet</p>
                        )}
                    </div>
                </div>

                <div className="rounded-card border border-surface-soft bg-surface p-6 shadow-card">
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">Error Counts</h3>
                    <div className="space-y-2">
                        {stats && Object.keys(stats.errorCounts).length > 0 ? (
                            Object.entries(stats.errorCounts).map(([service, count]) => (
                                <div key={service} className="flex justify-between text-sm">
                                    <span className="text-text-muted">{service}:</span>
                                    <span className="font-medium text-brand-orange">{count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-text-muted">No errors recorded</p>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h2 className="mb-4 text-lg font-semibold">Recent Message Timings</h2>
                {timings.length === 0 ? (
                    <p className="text-text-muted">No timing data available yet. Send some messages to see latency breakdown.</p>
                ) : (
                    <div className="space-y-3">
                        {timings.map((timing) => (
                            <div key={timing.correlationId} className="rounded-card border border-surface-soft bg-surface p-4 shadow-card">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-mono text-text-muted">{timing.correlationId.slice(0, 8)}</span>
                                    {timing.totalLatency && (
                                        <span className="text-sm font-semibold text-brand-cyan">
                                            Total: {(timing.totalLatency / 1000).toFixed(2)}s
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {timing.stages.rendererSend && timing.stages.ipcRequestSent && (
                                        <div>
                                            <span className="text-text-muted">Renderer → IPC: </span>
                                            <span className="font-medium">
                                                {((timing.stages.ipcRequestSent - timing.stages.rendererSend) / 1000).toFixed(3)}s
                                            </span>
                                        </div>
                                    )}
                                    {timing.stages.aiServiceStarted && timing.stages.aiServiceFinished && (
                                        <div>
                                            <span className="text-text-muted">AI Service: </span>
                                            <span className="font-medium">
                                                {((timing.stages.aiServiceFinished - timing.stages.aiServiceStarted) / 1000).toFixed(3)}s
                                            </span>
                                        </div>
                                    )}
                                    {timing.stages.openaiResponseReceived && timing.stages.aiServiceStarted && (
                                        <div>
                                            <span className="text-text-muted">OpenAI Response: </span>
                                            <span className="font-medium">
                                                {((timing.stages.openaiResponseReceived - timing.stages.aiServiceStarted) / 1000).toFixed(3)}s
                                            </span>
                                        </div>
                                    )}
                                    {timing.stages.ipcReplyDelivered && timing.stages.rendererStateUpdated && (
                                        <div>
                                            <span className="text-text-muted">IPC → Renderer: </span>
                                            <span className="font-medium">
                                                {((timing.stages.rendererStateUpdated - timing.stages.ipcReplyDelivered) / 1000).toFixed(3)}s
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

