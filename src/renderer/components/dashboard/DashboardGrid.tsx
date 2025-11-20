import { useEffect, useState } from 'react';
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

export function DashboardGrid() {
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

    return (
        <div className="gap-4 flex flex-col">
            {error && <p className="rounded-card bg-brand-orange/10 p-3 text-sm text-brand-orange">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
                <section className="rounded-card border border-surface-soft bg-brand-orange/10 py-3 px-4 text-brand-orange">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange/70">D · Workspace</p>
                    <h3 className="mt-2 text-2xl font-semibold text-text-primary">
                        {summary.workspace?.title ?? 'No project selected'}
                    </h3>
                    <p className="text-sm text-text-muted">
                        {summary.workspace?.description ?? 'Create a project to link chats and notebook entries.'}
                    </p>
                    {summary.workspace?.path && (
                        <p className="mt-3 text-xs font-semibold text-text-muted">Path: {summary.workspace.path}</p>
                    )}
                </section>

                <section className="rounded-card border border-surface-soft bg-brand-emerald/10 py-3 px-4 text-brand-emerald">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-emerald/70">E · System</p>
                    <h3 className="mt-2 text-xl font-semibold text-text-primary">{summary.systemOverview.summary}</h3>
                    <button
                        type="button"
                        className="mt-4 rounded-pill bg-brand-emerald px-4 py-2 text-sm font-semibold text-white shadow-card"
                    >
                        {summary.systemOverview.actionLabel}
                    </button>
                </section>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <section className="flex flex-col rounded-card border border-surface-soft bg-brand-cyan/10 py-3 px-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-cyan/70">F · Recent activity</p>
                    {summary.recentActivity ? (
                        <>
                            <h3 className="mt-2 text-xl font-semibold text-text-primary">{summary.recentActivity.title}</h3>
                            <p className="text-sm text-text-muted">{summary.recentActivity.message}</p>
                            <button
                                type="button"
                                className="mt-auto rounded-pill bg-brand-cyan px-4 py-2 text-sm font-semibold text-white"
                            >
                                {summary.recentActivity.actionLabel}
                            </button>
                        </>
                    ) : (
                        <p className="text-sm text-text-muted">No activity yet.</p>
                    )}
                </section>

                <section className="rounded-card border border-surface-soft bg-brand-emerald/10 py-3 px-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-emerald/70">G · Prompts</p>
                    <ul className="mt-3 space-y-3 text-sm text-text-primary">
                        {summary.suggestedPrompts.map((prompt) => (
                            <li key={prompt.id} className="rounded-card bg-surface px-4 py-3 shadow-card">
                                {prompt.text}
                            </li>
                        ))}
                        {summary.suggestedPrompts.length === 0 && <li>No prompts yet.</li>}
                    </ul>
                </section>

                <section className="rounded-card border border-surface-soft bg-brand-orange/10 py-3 px-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange/70">H · Notebook</p>
                    <ul className="mt-3 space-y-3 text-sm text-text-primary">
                        {summary.notebookHighlights.map((entry) => (
                            <li key={entry.id} className="rounded-card bg-surface px-4 py-3 shadow-card">
                                <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange/70">
                                    {entry.type}
                                </p>
                                <p className="text-base font-semibold">{entry.title}</p>
                            </li>
                        ))}
                        {summary.notebookHighlights.length === 0 && <li>No highlights yet.</li>}
                    </ul>
                </section>
            </div>
        </div>
    );
}

export default DashboardGrid;

