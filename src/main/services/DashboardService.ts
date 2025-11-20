import { ProjectRepository } from '../repositories/ProjectRepository';
import { ChatRepository } from '../repositories/ChatRepository';
import { MessageRepository } from '../repositories/MessageRepository';
import { NotebookRepository } from '../repositories/NotebookRepository';
import type { DashboardSummary } from '../../types/ipc';

interface DashboardDependencies {
    projects: ProjectRepository;
    chats: ChatRepository;
    messages: MessageRepository;
    notebook: NotebookRepository;
}

export class DashboardService {
    constructor(private readonly deps: DashboardDependencies) {}

    async getSummary(): Promise<DashboardSummary> {
        const projects = await this.deps.projects.getAll();
        const workspace = projects[0]
            ? {
                  title: projects[0].name,
                  description: projects[0].description ?? undefined,
                  path: projects[0].path ?? undefined,
              }
            : null;

        const chats = projects[0] ? await this.deps.chats.listByProject(projects[0].id) : [];
        const primaryChat = chats[0];
        const messages = primaryChat ? await this.deps.messages.listByChat(primaryChat.id) : [];
        const latestMessage = messages[messages.length - 1];

        const notebookHighlights = await this.deps.notebook.searchByProject(projects[0]?.id);
        const pinnedHighlights = notebookHighlights
            .filter((entry) => entry.pinned)
            .slice(0, 3)
            .map((entry) => ({
                id: entry.id,
                title: entry.title,
                type: entry.type,
            }));

        return {
            workspace,
            systemOverview: {
                status: 'warning',
                summary: 'GPU usage is elevated. Last Process Inspector run completed 12 minutes ago.',
                actionLabel: 'Open toolbox',
            },
            recentActivity: latestMessage
                ? {
                      title: latestMessage.role === 'user' ? 'User message' : 'Nova response',
                      message: latestMessage.content.slice(0, 120),
                      timestamp: latestMessage.created_at,
                      actionLabel: 'Resume chat',
                  }
                : undefined,
            suggestedPrompts: [
                { id: 'prompt-1', text: 'Summarize all open incidents in the last 24 hours.' },
                { id: 'prompt-2', text: 'What changed on this system since the last crash?' },
                { id: 'prompt-3', text: 'Generate a notebook entry for this log snippet.' },
            ],
            notebookHighlights: pinnedHighlights,
        };
    }
}

