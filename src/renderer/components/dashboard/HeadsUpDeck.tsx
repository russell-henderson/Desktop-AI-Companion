import { useEffect, useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import type { DashboardSummary } from '../../../types/ipc';

const FALLBACK_SUMMARY: DashboardSummary = {
    workspace: null,
    systemOverview: {
        status: 'ok',
        summary: 'No system signals yet.',
        actionLabel: 'Open toolbox',
    },
    suggestedPrompts: [],
    notebookHighlights: [],
};

function WatchdogCard({ summary }: { summary: DashboardSummary }) {
    const { setSection } = useNavigation();
    const [telemetry, setTelemetry] = useState<any>(null);
    const [activeAlert, setActiveAlert] = useState<any>(null);
    const [lastCheck, setLastCheck] = useState<string>('');

    useEffect(() => {
        const updateData = async () => {
            const bridge = window.desktop;
            if (!bridge?.system) return;

            try {
                const [telemetryData, alertData] = await Promise.all([
                    bridge.system.getTelemetry(),
                    bridge.system.getActiveAlert(),
                ]);
                
                setTelemetry(telemetryData);
                setActiveAlert(alertData);
                
                if (telemetryData?.lastUpdated) {
                    const lastUpdated = new Date(telemetryData.lastUpdated);
                    const minutesAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
                    setLastCheck(minutesAgo === 0 ? 'Just now' : `${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago`);
                }
            } catch (error) {
                console.error('Failed to fetch telemetry', error);
            }
        };

        updateData();
        const interval = setInterval(updateData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleViewDetails = () => {
        setSection('system');
    };

    const handleDismiss = async () => {
        if (!activeAlert) return;
        
        const bridge = window.desktop;
        if (!bridge?.system) return;

        try {
            await bridge.system.resolveAlert(activeAlert.id);
            setActiveAlert(null);
        } catch (error) {
            console.error('Failed to dismiss alert', error);
        }
    };

    const hasAlert = activeAlert || (telemetry && (telemetry.status === 'WARNING' || telemetry.status === 'CRITICAL'));
    const alertMessage = activeAlert?.message || telemetry?.activeAlerts?.[0] || summary.systemOverview.summary || 'No metrics yet';

    if (hasAlert) {
        // Alert state: orange background, white text
        return (
            <section className="rounded-card shadow-card px-4 py-3 bg-brand-orange text-white relative">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">SYSTEM WATCH</p>
                <h3 className="mt-2 text-base font-semibold text-white">
                    {alertMessage}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-white/80">Last check {lastCheck || '2 minutes ago'}</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleViewDetails}
                            className="text-xs text-white/80 hover:text-white underline"
                        >
                            View details
                        </button>
                        {activeAlert && (
                            <button
                                onClick={handleDismiss}
                                className="text-xs text-white/80 hover:text-white underline"
                            >
                                Dismiss
                            </button>
                        )}
                        <span className="inline-flex items-center rounded-full bg-white text-brand-orange text-xs font-medium px-2 py-0.5">
                            Alert
                        </span>
                    </div>
                </div>
            </section>
        );
    }

    // Normal state: white/sidebar background, emerald accents
    return (
        <section className="rounded-card shadow-card px-4 py-3 bg-surface border border-surface-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">SYSTEM WATCH</p>
            <h3 className="mt-2 text-base font-semibold text-text-primary">
                {telemetry ? 'No active issues' : summary.systemOverview.summary || 'System nominal'}
            </h3>
            <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-text-muted">Last check {lastCheck || '2 minutes ago'}</p>
                <span className="text-xs font-medium text-brand-emerald">System nominal</span>
            </div>
        </section>
    );
}

function QuickActionsCard({ prompts }: { prompts: { id: string; text: string }[] }) {
    const handlePromptClick = (text: string) => {
        // Dispatch custom event to insert text into chat input
        window.dispatchEvent(
            new CustomEvent('quick-prompt-insert', {
                detail: { text },
            })
        );
        
        // Focus the chat input after a short delay to ensure it's mounted
        setTimeout(() => {
            const inputElement = document.querySelector('input[placeholder="Message Nova..."]') as HTMLInputElement;
            if (inputElement) {
                inputElement.focus();
            }
        }, 100);
    };

    const defaultPrompts = [
        { id: '1', text: 'Summarize incidents' },
        { id: '2', text: 'Check logs' },
        { id: '3', text: 'Create notebook entry' },
    ];

    const displayPrompts = prompts.length > 0 ? prompts.slice(0, 3) : defaultPrompts;

    return (
        <section className="bg-surface rounded-card shadow-card px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Quick prompts</p>
            <div className="mt-3 flex flex-wrap gap-2">
                {displayPrompts.map((prompt) => (
                    <button
                        key={prompt.id}
                        onClick={() => handlePromptClick(prompt.text)}
                        className="inline-flex items-center rounded-full border border-brand-cyan px-3 py-1 text-xs font-medium text-brand-cyan transition hover:bg-brand-cyan hover:text-white"
                    >
                        {prompt.text}
                    </button>
                ))}
            </div>
        </section>
    );
}

function WorkspaceCard({
    workspace,
}: {
    workspace: DashboardSummary['workspace'];
}) {
    return (
        <section className="bg-surface rounded-card shadow-card px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">ACTIVE WORKSPACE</p>
            <h3 className="mt-2 text-lg font-semibold text-text-primary">
                {workspace?.title ?? 'Desktop AI Companion'}
            </h3>
            {workspace?.description && (
                <p className="mt-1 text-sm text-text-subtle">{workspace.description}</p>
            )}
            {workspace?.path && (
                <p className="mt-2 text-xs text-text-muted">Path: {workspace.path}</p>
            )}
        </section>
    );
}

export function HeadsUpDeck({}: {}) {
    const [summary, setSummary] = useState<DashboardSummary>(FALLBACK_SUMMARY);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const bridge = window.desktop ?? window.ai;
        if (!bridge) {
            setError('Desktop bridge is unavailable.');
            return;
        }

        bridge
            .getDashboardSummary()
            .then((data) => {
                if (data) {
                    setSummary(data);
                }
            })
            .catch((err) => {
                console.error('Failed to load dashboard summary', err);
                setError('Unable to load dashboard cards.');
            });
    }, []);

    if (error) {
        return (
            <section className="px-6 pb-3">
                <p className="rounded-card bg-brand-orange/10 p-3 text-sm text-brand-orange">{error}</p>
            </section>
        );
    }

    return (
        <section className="px-6 pb-3 mb-4">
            <div className="grid grid-cols-3 gap-4">
                <WatchdogCard summary={summary} />
                <QuickActionsCard prompts={summary.suggestedPrompts} />
                <WorkspaceCard workspace={summary.workspace} />
            </div>
        </section>
    );
}

export default HeadsUpDeck;

