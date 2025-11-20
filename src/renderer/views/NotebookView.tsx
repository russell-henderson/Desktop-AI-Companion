import { useEffect, useState } from 'react';
import type { NotebookEntryRecord } from '../../types/ipc';
import type { ProjectRecord } from '../../types/ipc';
import NotebookEntryForm from '../components/notebook/NotebookEntryForm';

export default function NotebookView() {
    const [entries, setEntries] = useState<NotebookEntryRecord[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<NotebookEntryRecord | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEntry, setEditingEntry] = useState<NotebookEntryRecord | null>(null);
    const [filterType, setFilterType] = useState<string>('');
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
            if (filterType) {
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }
        try {
            await window.desktop?.notebook.delete(id);
            await loadEntries();
            if (selectedEntry?.id === id) {
                setSelectedEntry(null);
            }
        } catch (error) {
            console.error('Failed to delete entry', error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to delete all notebook entries? This cannot be undone.')) {
            return;
        }
        try {
            await window.desktop?.notebook.deleteAll();
            await loadEntries();
            setSelectedEntry(null);
        } catch (error) {
            console.error('Failed to clear all entries', error);
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

    if (loading) {
        return <div className="p-6 text-text-muted">Loading notebook...</div>;
    }

    if (showForm || editingEntry) {
        return (
            <div className="flex h-full flex-col p-6">
                <h2 className="mb-6 text-2xl font-semibold">{editingEntry ? 'Edit Entry' : 'New Entry'}</h2>
                <NotebookEntryForm
                    initialData={editingEntry || undefined}
                    projects={projects}
                    onSave={(entry) => {
                        setShowForm(false);
                        setEditingEntry(null);
                        loadEntries();
                        setSelectedEntry(entry);
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingEntry(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex h-full">
            <div className="w-80 border-r border-surface-soft p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Notebook</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-card bg-brand-cyan px-3 py-1 text-xs font-medium text-white hover:bg-brand-cyan/90 transition"
                    >
                        + New
                    </button>
                </div>
                {entries.length > 0 && (
                    <div className="mb-4">
                        <button
                            onClick={handleClearAll}
                            className="w-full rounded-pill border border-brand-orange px-3 py-1.5 text-xs font-medium text-brand-orange hover:bg-brand-orange/10 transition"
                        >
                            Clear all entries
                        </button>
                    </div>
                )}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search notebook..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                    />
                </div>
                <div className="mb-4">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                    >
                        <option value="">All Types</option>
                        <option value="prompt">Prompt</option>
                        <option value="snippet">Snippet</option>
                        <option value="note">Note</option>
                        <option value="template">Template</option>
                    </select>
                </div>
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            onClick={() => setSelectedEntry(entry)}
                            className={`cursor-pointer rounded-card border p-3 transition-colors ${
                                selectedEntry?.id === entry.id
                                    ? 'border-brand-cyan bg-brand-cyan/10'
                                    : 'border-surface-soft hover:bg-surface-soft/50'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">{entry.title}</h4>
                                {entry.pinned && <span className="text-xs text-brand-orange">📌</span>}
                            </div>
                            <p className="mt-1 text-xs text-text-muted line-clamp-2">{entry.content}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-text-muted">{entry.type}</span>
                                {entry.tags && (
                                    <span className="text-xs text-text-muted">
                                        {entry.tags.split(',').slice(0, 2).join(', ')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 p-6">
                {selectedEntry ? (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">{selectedEntry.title}</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingEntry(selectedEntry)}
                                    className="rounded-card border border-surface-soft px-3 py-1 text-sm font-medium text-text-primary hover:bg-surface-soft transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedEntry.id)}
                                    className="rounded-card border border-brand-orange px-3 py-1 text-sm font-medium text-brand-orange hover:bg-brand-orange/10 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="mb-4 flex items-center gap-4 text-sm text-text-muted">
                            <span>Type: {selectedEntry.type}</span>
                            {selectedEntry.scope && <span>Scope: {selectedEntry.scope}</span>}
                        </div>
                        <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-sm">{selectedEntry.content}</pre>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                        <p>Select an entry to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

