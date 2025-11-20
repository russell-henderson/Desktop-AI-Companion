import { ProjectRepository, type CreateProjectInput, type UpdateProjectInput } from '../repositories/ProjectRepository';
import { ChatRepository } from '../repositories/ChatRepository';
import type { ProjectRecord } from '../types/database';

export class ProjectService {
    constructor(
        private projectRepo: ProjectRepository,
        private chatRepo: ChatRepository,
    ) {}

    async listAll(): Promise<ProjectRecord[]> {
        return this.projectRepo.getAll();
    }

    async getById(id: string): Promise<ProjectRecord | null> {
        return this.projectRepo.getById(id);
    }

    async create(input: CreateProjectInput): Promise<ProjectRecord> {
        return this.projectRepo.create(input);
    }

    async update(id: string, input: UpdateProjectInput): Promise<ProjectRecord | null> {
        return this.projectRepo.update(id, input);
    }

    async delete(id: string): Promise<void> {
        await this.projectRepo.delete(id);
    }

    async linkChatToProject(chatId: string, projectId: string | null): Promise<void> {
        await this.chatRepo.update(chatId, { projectId });
    }
}

