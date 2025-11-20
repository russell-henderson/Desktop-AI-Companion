import { BaseRepository } from './BaseRepository';
import type { ChatRecord } from '../types/database';

export interface CreateChatInput {
    projectId?: string;
    title: string;
    model: string;
}

export interface UpdateChatInput {
    title?: string;
    model?: string;
    projectId?: string | null;
}

export class ChatRepository extends BaseRepository {
    async listAll(): Promise<ChatRecord[]> {
        return this.db.query<ChatRecord>('SELECT * FROM chats ORDER BY updated_at DESC');
    }

    async getById(id: string): Promise<ChatRecord | null> {
        return this.db.get<ChatRecord>('SELECT * FROM chats WHERE id = :id', { ':id': id });
    }

    async listByProject(projectId: string): Promise<ChatRecord[]> {
        return this.db.query<ChatRecord>('SELECT * FROM chats WHERE project_id = :project_id ORDER BY updated_at DESC', {
            ':project_id': projectId,
        });
    }

    async create(input: CreateChatInput): Promise<ChatRecord> {
        const id = this.generateId();
        const timestamp = this.now();

        await this.db.execute(
            `INSERT INTO chats (id, project_id, title, model, created_at, updated_at)
             VALUES (:id, :project_id, :title, :model, :created_at, :updated_at)`,
            {
                ':id': id,
                ':project_id': input.projectId ?? null,
                ':title': input.title,
                ':model': input.model,
                ':created_at': timestamp,
                ':updated_at': timestamp,
            },
        );

        const chat = await this.getById(id);
        if (!chat) {
            throw new Error('Failed to create chat');
        }

        return chat;
    }

    async update(id: string, input: UpdateChatInput): Promise<ChatRecord | null> {
        const chat = await this.getById(id);
        if (!chat) {
            return null;
        }

        await this.db.execute(
            `UPDATE chats
             SET title = :title,
                 model = :model,
                 project_id = :project_id,
                 updated_at = :updated_at
             WHERE id = :id`,
            {
                ':id': id,
                ':title': input.title ?? chat.title,
                ':model': input.model ?? chat.model,
                ':project_id': input.projectId ?? chat.project_id ?? null,
                ':updated_at': this.now(),
            },
        );

        return this.getById(id);
    }

    async delete(id: string): Promise<void> {
        await this.db.execute('DELETE FROM chats WHERE id = :id', { ':id': id });
    }
}

