import { useEffect, useState } from 'react';
import type { NotebookEntryRecord } from '../../../types/ipc';
import type { ProjectRecord } from '../../../types/ipc';

interface NotebookSlideOverProps {
    onClose: () => void;
    onInsert?: (entry: NotebookEntryRecord) => void;
}

export function NotebookSlideOver({ onClose, onInsert }: NotebookSlideOverProps) {
    const [entries, setEntries] = useState<NotebookEntryRecord[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<NotebookEntryRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    const [projects, setProjects] = useState<ProjectRecord[]>([]);

    useEffect(() => {
        loadEntries();
        loadProjects();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            searchEntries();
        } else {
            loadEntries();
        }
    }, [searchQuery, filterType]);

    const loadProjects = async () => {
        try {
            const data = await window.desktop?.projects.list();
            setProjects(data || []);
        } catch (error) {
            console.error('Failed to load projects', error);
        }
    };

    const loadEntries = async () => {
        try {
            const filters: { type?: string } = {};
            if (filterType && filterType !== 'all') {
                filters.type = filterType;
            }
            const data = await window.desktop?.notebook.list(filters);
            setEntries(data || []);
        } catch (error) {
            console.error('Failed to load notebook entries', error);
        } finally {
            setLoading(false);
        }
    };

    const searchEntries = async () => {
        try {
            const data = await window.desktop?.notebook.search(searchQuery);
            setEntries(data || []);
        } catch (error) {
            console.error('Failed to search notebook entries', error);
        }
    };

    const handleInsert = (entry: NotebookEntryRecord) => {
        if (onInsert) {
            onInsert(entry);
        }
        onClose();
    };

    return (
        <div className="fixed inset-y-0 right-0 w-[380px] bg-surface shadow-card border-l border-surface-soft flex flex-col z-50">
            {/* NotebookHeader */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-surface-soft">
                <h2 className="text-lg font-semibold text-text-primary">Notebook</h2>
                <button
                    onClick={onClose}
                    className="rounded-full w-8 h-8 flex items-center justify-center text-text-muted hover:bg-surface-soft transition"
                    aria-label="Close notebook"
                >
                    ×
                </button>
            </div>

            {/* Search */}
            <div className="shrink-0 px-4 py-3 border-b border-surface-soft">
                <input
                    type="text"
                    placeholder="Search notebook..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                />
            </div>

            {/* Filters */}
            <div className="shrink-0 px-4 py-2 border-b border-surface-soft flex gap-2">
                {['all', 'template', 'prompt', 'note'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`rounded-pill px-3 py-1 text-xs font-medium transition ${
                            filterType === type
                                ? 'bg-brand-cyan text-white'
                                : 'bg-surface-soft text-text-primary hover:bg-surface-soft/80'
                        }`}
                    >
                        {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {/* NotebookBody */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-sm text-text-muted">Loading...</div>
                ) : entries.length === 0 ? (
                    <div className="p-4 text-center text-sm text-text-muted">No entries found</div>
                ) : (
                    <div className="p-4 space-y-2">
                        {entries.map((entry) => (
                            <button
                                key={entry.id}
                                onClick={() => setSelectedEntry(entry)}
                                className={`w-full text-left rounded-card p-3 transition ${
                                    selectedEntry?.id === entry.id
                                        ? 'bg-brand-cyan/10 border border-brand-cyan'
                                        : 'bg-surface-soft border border-surface-soft hover:bg-surface-soft/80'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-text-primary">{entry.title}</h4>
                                    {entry.pinned && <span className="text-xs text-brand-orange">📌</span>}
                                </div>
                                <p className="mt-1 text-xs text-text-muted line-clamp-2">{entry.content}</p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs text-text-subtle">{entry.type}</span>
                                    {entry.tags && (
                                        <span className="text-xs text-text-muted">
                                            {entry.tags.split(',').slice(0, 2).join(', ')}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail View */}
            {selectedEntry && (
                <div className="shrink-0 border-t border-surface-soft p-4 bg-surface-soft">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-text-primary">{selectedEntry.title}</h3>
                        <button
                            onClick={() => setSelectedEntry(null)}
                            className="rounded-full w-6 h-6 flex items-center justify-center text-text-muted hover:bg-surface transition"
                            aria-label="Close detail"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-sm text-text-subtle mb-3 whitespace-pre-wrap">{selectedEntry.content}</p>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-text-muted">Type: {selectedEntry.type}</span>
                        {selectedEntry.tags && (
                            <span className="text-xs text-text-muted">
                                Tags: {selectedEntry.tags}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleInsert(selectedEntry)}
                            className="flex-1 rounded-pill bg-brand-cyan text-white px-4 py-2 text-sm font-medium hover:bg-brand-cyan/90 transition"
                        >
                            Insert into Chat
                        </button>
                        <button
                            onClick={async () => {
                                if (!confirm('Are you sure you want to delete this entry?')) return;
                                try {
                                    await window.desktop?.notebook.delete(selectedEntry.id);
                                    setSelectedEntry(null);
                                    loadEntries();
                                } catch (error) {
                                    console.error('Failed to delete entry', error);
                                }
                            }}
                            className="rounded-pill border border-brand-orange px-3 py-2 text-xs font-medium text-brand-orange hover:bg-brand-orange/10 transition"
                            title="Delete entry"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Clear all button */}
            {entries.length > 0 && (
                <div className="shrink-0 border-t border-surface-soft p-4">
                    <button
                        onClick={async () => {
                            if (!confirm('Are you sure you want to delete all notebook entries? This cannot be undone.')) return;
                            try {
                                await window.desktop?.notebook.deleteAll();
                                setEntries([]);
                                setSelectedEntry(null);
                            } catch (error) {
                                console.error('Failed to clear all entries', error);
                            }
                        }}
                        className="w-full rounded-pill border border-brand-orange px-4 py-2 text-sm font-medium text-brand-orange hover:bg-brand-orange/10 transition"
                    >
                        Clear all entries
                    </button>
                </div>
            )}
        </div>
    );
}

export default NotebookSlideOver;

