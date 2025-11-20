import { BaseRepository } from './BaseRepository';
import type { MessageRecord } from '../types/database';

export interface CreateMessageInput {
    chatId: string;
    role: string;
    content: string;
    attachments?: unknown[];
}

export class MessageRepository extends BaseRepository {
    async listByChat(chatId: string): Promise<MessageRecord[]> {
        return this.db.query<MessageRecord>(
            'SELECT * FROM messages WHERE chat_id = :chat_id ORDER BY created_at ASC',
            { ':chat_id': chatId },
        );
    }

    async create(input: CreateMessageInput): Promise<MessageRecord> {
        const id = this.generateId();
        const timestamp = this.now();

        await this.db.execute(
            `INSERT INTO messages (id, chat_id, role, content, attachments, created_at)
             VALUES (:id, :chat_id, :role, :content, :attachments, :created_at)`,
            {
                ':id': id,
                ':chat_id': input.chatId,
                ':role': input.role,
                ':content': input.content,
                ':attachments': input.attachments ? JSON.stringify(input.attachments) : null,
                ':created_at': timestamp,
            },
        );

        const created = await this.db.get<MessageRecord>('SELECT * FROM messages WHERE id = :id', { ':id': id });
        if (!created) {
            throw new Error('Failed to create message');
        }

        return created;
    }

    async deleteByChat(chatId: string): Promise<void> {
        await this.db.execute('DELETE FROM messages WHERE chat_id = :chat_id', { ':chat_id': chatId });
    }
}

