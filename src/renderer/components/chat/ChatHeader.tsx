import { useState, useEffect } from 'react';
import type { ProjectRecord } from '../../../types/ipc';

interface ChatHeaderProps {
    chatId: string;
    title: string;
    model: string;
    projectId?: string;
}

export function ChatHeader({ chatId, title, model, projectId }: ChatHeaderProps) {
    const [projects, setProjects] = useState<ProjectRecord[]>([]);
    const [showProjectMenu, setShowProjectMenu] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await window.desktop?.projects.list();
            setProjects(data || []);
        } catch (error) {
            console.error('Failed to load projects', error);
        }
    };

    const handleLinkProject = async (projectId: string | null) => {
        try {
            await window.desktop?.projects.linkChat(chatId, projectId);
            setShowProjectMenu(false);
            window.location.reload();
        } catch (error) {
            console.error('Failed to link project', error);
        }
    };

    const activeProject = projects.find((p) => p.id === projectId);

    return (
        <div className="px-6 py-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                <div className="flex items-center gap-2">
                    {activeProject && (
                        <span className="inline-flex items-center rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-subtle">
                            {activeProject.name}
                        </span>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => setShowProjectMenu(!showProjectMenu)}
                            className="inline-flex items-center rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-subtle hover:bg-surface-soft/80 transition"
                        >
                            Move to project
                        </button>
                        {showProjectMenu && (
                            <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-card border border-surface-soft bg-surface shadow-card">
                                <button
                                    onClick={() => handleLinkProject(null)}
                                    className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-soft transition"
                                >
                                    No Project
                                </button>
                                {projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => handleLinkProject(project.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface-soft transition"
                                    >
                                        {project.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-text-subtle">
                        {model}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ChatHeader;

