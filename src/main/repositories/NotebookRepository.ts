import { BaseRepository } from './BaseRepository';
import type { NotebookEntryRecord } from '../types/database';

export interface CreateNotebookEntryInput {
    projectId?: string;
    type: string;
    title: string;
    content: string;
    tags?: string[];
    scope?: string;
    pinned?: boolean;
}

export interface UpdateNotebookEntryInput extends Partial<CreateNotebookEntryInput> {}

export class NotebookRepository extends BaseRepository {
    async getById(id: string): Promise<NotebookEntryRecord | null> {
        return this.db.get<NotebookEntryRecord>('SELECT * FROM notebook_entries WHERE id = :id', { ':id': id });
    }

    async searchByProject(projectId?: string): Promise<NotebookEntryRecord[]> {
        if (projectId) {
            return this.db.query<NotebookEntryRecord>(
                'SELECT * FROM notebook_entries WHERE project_id = :project_id OR scope = \'global\' ORDER BY updated_at DESC',
                { ':project_id': projectId },
            );
        }

        return this.db.query<NotebookEntryRecord>(
            'SELECT * FROM notebook_entries WHERE scope = \'global\' ORDER BY updated_at DESC',
        );
    }

    async create(input: CreateNotebookEntryInput): Promise<NotebookEntryRecord> {
        const id = this.generateId();
        const timestamp = this.now();

        await this.db.execute(
            `INSERT INTO notebook_entries (id, project_id, type, title, content, tags, scope, pinned, created_at, updated_at)
             VALUES (:id, :project_id, :type, :title, :content, :tags, :scope, :pinned, :created_at, :updated_at)`,
            {
                ':id': id,
                ':project_id': input.projectId ?? null,
                ':type': input.type,
                ':title': input.title,
                ':content': input.content,
                ':tags': input.tags ? input.tags.join(',') : null,
                ':scope': input.scope ?? 'global',
                ':pinned': input.pinned ? 1 : 0,
                ':created_at': timestamp,
                ':updated_at': timestamp,
            },
        );

        const entry = await this.getById(id);
        if (!entry) {
            throw new Error('Failed to create notebook entry');
        }

        return entry;
    }

    async update(id: string, input: UpdateNotebookEntryInput): Promise<NotebookEntryRecord | null> {
        const entry = await this.getById(id);
        if (!entry) {
            return null;
        }

        await this.db.execute(
            `UPDATE notebook_entries
             SET project_id = :project_id,
                 type = :type,
                 title = :title,
                 content = :content,
                 tags = :tags,
                 scope = :scope,
                 pinned = :pinned,
                 updated_at = :updated_at
             WHERE id = :id`,
            {
                ':id': id,
                ':project_id': input.projectId ?? entry.project_id ?? null,
                ':type': input.type ?? entry.type,
                ':title': input.title ?? entry.title,
                ':content': input.content ?? entry.content,
                ':tags': input.tags ? input.tags.join(',') : entry.tags ?? null,
                ':scope': input.scope ?? entry.scope ?? 'global',
                ':pinned': input.pinned !== undefined ? (input.pinned ? 1 : 0) : entry.pinned ?? 0,
                ':updated_at': this.now(),
            },
        );

        return this.getById(id);
    }

    async delete(id: string): Promise<void> {
        await this.db.execute('DELETE FROM notebook_entries WHERE id = :id', { ':id': id });
    }

    async deleteAll(): Promise<void> {
        await this.db.execute('DELETE FROM notebook_entries');
    }
}

