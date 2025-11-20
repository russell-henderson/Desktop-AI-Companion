import { useState } from 'react';
import type { ProjectRecord } from '../../../types/ipc';

interface ProjectFormProps {
    onSave: (project: ProjectRecord) => void;
    onCancel: () => void;
    initialData?: Partial<ProjectRecord>;
}

export default function ProjectForm({ onSave, onCancel, initialData }: ProjectFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [path, setPath] = useState(initialData?.path || '');
    const [color, setColor] = useState(initialData?.color || '#0D99C9');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            return;
        }

        setSaving(true);
        try {
            const project = initialData?.id
                ? await window.desktop?.projects.update(initialData.id, { name, description, path, color })
                : await window.desktop?.projects.create({ name, description, path, color });

            if (project) {
                onSave(project);
            }
        } catch (error) {
            console.error('Failed to save project', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-primary">Name *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                    placeholder="Project name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                    placeholder="Project description"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary">Linked Folder Path</label>
                <input
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                    placeholder="C:\Projects\MyProject"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary">Color</label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-surface-soft"
                />
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={saving || !name.trim()}
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

