import {
    NotebookRepository,
    type CreateNotebookEntryInput,
    type UpdateNotebookEntryInput,
} from '../repositories/NotebookRepository';
import type { NotebookEntryRecord } from '../types/database';

export class NotebookService {
    constructor(private notebookRepo: NotebookRepository) {}

    async list(filters?: { projectId?: string; type?: string; tags?: string[] }): Promise<NotebookEntryRecord[]> {
        if (filters?.projectId) {
            return this.notebookRepo.searchByProject(filters.projectId);
        }
        return this.notebookRepo.searchByProject();
    }

    async getById(id: string): Promise<NotebookEntryRecord | null> {
        return this.notebookRepo.getById(id);
    }

    async create(input: CreateNotebookEntryInput): Promise<NotebookEntryRecord> {
        return this.notebookRepo.create(input);
    }

    async update(id: string, input: UpdateNotebookEntryInput): Promise<NotebookEntryRecord | null> {
        return this.notebookRepo.update(id, input);
    }

    async delete(id: string): Promise<void> {
        await this.notebookRepo.delete(id);
    }

    async deleteAll(): Promise<void> {
        await this.notebookRepo.deleteAll();
    }

    async search(query: string, projectId?: string): Promise<NotebookEntryRecord[]> {
        const entries = await this.list({ projectId });
        const lowerQuery = query.toLowerCase();

        return entries.filter(
            (entry) =>
                entry.title.toLowerCase().includes(lowerQuery) ||
                entry.content.toLowerCase().includes(lowerQuery) ||
                (entry.tags && entry.tags.toLowerCase().includes(lowerQuery)),
        );
    }
}

