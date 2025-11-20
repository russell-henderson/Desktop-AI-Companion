import { useEffect, useState } from 'react';
import type { ProjectRecord } from '../../types/ipc';
import ProjectForm from '../components/projects/ProjectForm';

export default function ProjectsView() {
    const [projects, setProjects] = useState<ProjectRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await window.desktop?.projects.list();
            setProjects(data || []);
        } catch (error) {
            console.error('Failed to load projects', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-text-muted">Loading projects...</div>;
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }
        try {
            await window.desktop?.projects.delete(id);
            await loadProjects();
            if (selectedProject?.id === id) {
                setSelectedProject(null);
            }
        } catch (error) {
            console.error('Failed to delete project', error);
        }
    };

    if (showForm || editingProject) {
        return (
            <div className="flex h-full flex-col p-6">
                <h2 className="mb-6 text-2xl font-semibold">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                <ProjectForm
                    initialData={editingProject || undefined}
                    onSave={(project) => {
                        setShowForm(false);
                        setEditingProject(null);
                        loadProjects();
                        setSelectedProject(project);
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProject(null);
                    }}
                />
            </div>
        );
    }

    if (selectedProject) {
        return (
            <div className="flex h-full flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                    <button
                        onClick={() => setSelectedProject(null)}
                        className="text-sm text-brand-cyan hover:underline"
                    >
                        ← Back to projects
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setEditingProject(selectedProject)}
                            className="rounded-card border border-surface-soft px-3 py-1 text-sm font-medium text-text-primary hover:bg-surface-soft transition"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(selectedProject.id)}
                            className="rounded-card border border-brand-orange px-3 py-1 text-sm font-medium text-brand-orange hover:bg-brand-orange/10 transition"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <h2 className="mb-4 text-2xl font-semibold">{selectedProject.name}</h2>
                {selectedProject.description && <p className="mb-4 text-text-muted">{selectedProject.description}</p>}
                {selectedProject.path && (
                    <div className="mb-4">
                        <span className="text-sm font-medium text-text-muted">Linked folder:</span>
                        <span className="ml-2 text-sm">{selectedProject.path}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Projects</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="rounded-card bg-brand-cyan px-4 py-2 text-sm font-medium text-white hover:bg-brand-cyan/90 transition"
                >
                    New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-text-muted">
                    <p>No projects yet. Create one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => setSelectedProject(project)}
                            className="cursor-pointer rounded-card border border-surface-soft bg-surface p-4 shadow-card transition-shadow hover:shadow-card"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                {project.color && (
                                    <div
                                        className="h-4 w-4 rounded-full"
                                        style={{ backgroundColor: project.color }}
                                    />
                                )}
                                <h3 className="font-semibold">{project.name}</h3>
                            </div>
                            {project.description && (
                                <p className="text-sm text-text-muted line-clamp-2">{project.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

