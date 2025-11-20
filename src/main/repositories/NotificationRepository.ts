import { BaseRepository } from './BaseRepository';
import type { NotificationRecord } from '../types/database';

export interface CreateNotificationInput {
    type: string;
    severity: string;
    title: string;
    message: string;
    relatedTool?: string;
}

export class NotificationRepository extends BaseRepository {
    async listUnread(): Promise<NotificationRecord[]> {
        return this.db.query<NotificationRecord>('SELECT * FROM notifications WHERE read = 0 ORDER BY created_at DESC');
    }

    async listAll(limit = 50): Promise<NotificationRecord[]> {
        return this.db.query<NotificationRecord>(
            'SELECT * FROM notifications ORDER BY created_at DESC LIMIT :limit',
            { ':limit': limit },
        );
    }

    async create(input: CreateNotificationInput): Promise<NotificationRecord> {
        const id = this.generateId();
        const timestamp = this.now();

        await this.db.execute(
            `INSERT INTO notifications (id, type, severity, title, message, related_tool, read, created_at)
             VALUES (:id, :type, :severity, :title, :message, :related_tool, 0, :created_at)`,
            {
                ':id': id,
                ':type': input.type,
                ':severity': input.severity,
                ':title': input.title,
                ':message': input.message,
                ':related_tool': input.relatedTool ?? null,
                ':created_at': timestamp,
            },
        );

        const notification = await this.db.get<NotificationRecord>('SELECT * FROM notifications WHERE id = :id', {
            ':id': id,
        });

        if (!notification) {
            throw new Error('Failed to create notification');
        }

        return notification;
    }

    async markRead(id: string): Promise<void> {
        await this.db.execute('UPDATE notifications SET read = 1 WHERE id = :id', { ':id': id });
    }

    async markAllRead(): Promise<void> {
        await this.db.execute('UPDATE notifications SET read = 1');
    }
}

