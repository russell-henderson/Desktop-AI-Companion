import { useState } from 'react';
import type { NotebookEntryRecord } from '../../../types/ipc';
import type { ProjectRecord } from '../../../types/ipc';

interface NotebookEntryFormProps {
    onSave: (entry: NotebookEntryRecord) => void;
    onCancel: () => void;
    initialData?: Partial<NotebookEntryRecord>;
    projects?: ProjectRecord[];
}

export default function NotebookEntryForm({ onSave, onCancel, initialData, projects = [] }: NotebookEntryFormProps) {
    const [type, setType] = useState(initialData?.type || 'note');
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [tags, setTags] = useState(initialData?.tags?.split(',').join(', ') || '');
    const [scope, setScope] = useState(initialData?.scope || 'global');
    const [projectId, setProjectId] = useState(initialData?.project_id || '');
    const [pinned, setPinned] = useState(initialData?.pinned === 1);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            return;
        }

        setSaving(true);
        try {
            const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
            const entry = initialData?.id
                ? await window.desktop?.notebook.update(initialData.id, {
                      type,
                      title,
                      content,
                      tags: tagArray,
                      scope: projectId ? `project:${projectId}` : scope,
                      projectId: projectId || undefined,
                      pinned,
                  })
                : await window.desktop?.notebook.create({
                      type,
                      title,
                      content,
                      tags: tagArray,
                      scope: projectId ? `project:${projectId}` : scope,
                      projectId: projectId || undefined,
                      pinned,
                  });

            if (entry) {
                onSave(entry);
            }
        } catch (error) {
            console.error('Failed to save notebook entry', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-primary">Type *</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                >
                    <option value="prompt">Prompt</option>
                    <option value="snippet">Snippet</option>
                    <option value="note">Note</option>
                    <option value="template">Template</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary">Title *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                    placeholder="Entry title"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary">Content *</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={10}
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40 font-mono"
                    placeholder="Entry content"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary">Tags (comma-separated)</label>
                <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                    placeholder="tag1, tag2, tag3"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary">Scope</label>
                <select
                    value={projectId ? `project:${projectId}` : scope}
                    onChange={(e) => {
                        if (e.target.value.startsWith('project:')) {
                            setProjectId(e.target.value.replace('project:', ''));
                            setScope('project');
                        } else {
                            setScope(e.target.value);
                            setProjectId('');
                        }
                    }}
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                >
                    <option value="global">Global</option>
                    {projects.map((p) => (
                        <option key={p.id} value={`project:${p.id}`}>
                            Project: {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="pinned"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-surface-soft text-brand-cyan focus:ring-brand-cyan"
                />
                <label htmlFor="pinned" className="text-sm font-medium text-text-primary">
                    Pin this entry
                </label>
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving || !title.trim() || !content.trim()}
                    className="flex-1 rounded-card bg-brand-cyan px-4 py-2 text-sm font-medium text-white hover:bg-brand-cyan/90 disabled:opacity-50 transition"
                >
                    {saving ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-card border border-surface-soft px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-soft transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

