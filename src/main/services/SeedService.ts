import { ProjectRepository } from '../repositories/ProjectRepository';
import { ChatRepository } from '../repositories/ChatRepository';
import { MessageRepository } from '../repositories/MessageRepository';
import { NotebookRepository } from '../repositories/NotebookRepository';
import { ToolReportRepository } from '../repositories/ToolReportRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';

interface RepositoryBundle {
    projects: ProjectRepository;
    chats: ChatRepository;
    messages: MessageRepository;
    notebook: NotebookRepository;
    toolReports: ToolReportRepository;
    notifications: NotificationRepository;
}

export class SeedService {
    constructor(private readonly repositories: RepositoryBundle) {}

    async ensureSeedData() {
        const projects = await this.repositories.projects.getAll();
        if (projects.length > 0) {
            return;
        }

        const project = await this.repositories.projects.create({
            name: 'Desktop AI Companion',
            description: 'System-aware assistant for Windows power users.',
            path: 'C:/Projects/DesktopAI',
            color: '#0D99C9',
        });

        const chat = await this.repositories.chats.create({
            projectId: project.id,
            title: 'Crash triage session',
            model: 'gpt-4o-mini',
        });

        await this.repositories.messages.create({
            chatId: chat.id,
            role: 'user',
            content: 'Process Inspector keeps flagging GPU spikes. What should I try next?',
        });

        await this.repositories.messages.create({
            chatId: chat.id,
            role: 'assistant',
            content: 'Run the Event Log Triage tool and capture the last 500 warnings. I can summarize them for you.',
        });

        await this.repositories.notebook.create({
            projectId: project.id,
            type: 'prompt',
            title: 'GPU driver crash checklist',
            content:
                '- Collect Windows Event IDs 4101 & 14\n- Reinstall latest WHQL driver\n- Run `sfc /scannow`\n- Collect GPU-Z sensor logs',
            tags: ['gpu', 'driver', 'triage'],
            scope: `project:${project.id}`,
            pinned: true,
        });

        await this.repositories.notebook.create({
            type: 'template',
            title: 'Bug report prompt template',
            content:
                'Summarize the issue with steps to reproduce, observed vs expected behavior, and attach relevant logs.',
            tags: ['template'],
            scope: 'global',
            pinned: true,
        });

        await this.repositories.toolReports.create({
            toolName: 'Process Inspector',
            status: 'warning',
            summary: 'GPU usage exceeded 95% across 5 processes.',
            details: { offenders: ['obs64.exe', 'chrome.exe'] },
            chatId: chat.id,
        });

        await this.repositories.notifications.create({
            type: 'system',
            severity: 'warning',
            title: 'High GPU usage detected',
            message: 'Process Inspector observed GPU spikes for 10 minutes.',
            relatedTool: 'Process Inspector',
        });
    }
}

