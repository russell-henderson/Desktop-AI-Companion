import { BaseRepository } from './BaseRepository';
import type { ToolReportRecord } from '../types/database';

export interface CreateToolReportInput {
    toolName: string;
    status: string;
    summary?: string;
    details?: Record<string, unknown>;
    chatId?: string;
}

export class ToolReportRepository extends BaseRepository {
    async listRecent(limit = 20): Promise<ToolReportRecord[]> {
        return this.db.query<ToolReportRecord>(
            'SELECT * FROM tool_reports ORDER BY created_at DESC LIMIT :limit',
            { ':limit': limit },
        );
    }

    async getById(id: string): Promise<ToolReportRecord | null> {
        return this.db.get<ToolReportRecord>('SELECT * FROM tool_reports WHERE id = :id', { ':id': id });
    }

    async create(input: CreateToolReportInput): Promise<ToolReportRecord> {
        const id = this.generateId();
        const timestamp = this.now();

        await this.db.execute(
            `INSERT INTO tool_reports (id, tool_name, status, summary, details, chat_id, created_at)
             VALUES (:id, :tool_name, :status, :summary, :details, :chat_id, :created_at)`,
            {
                ':id': id,
                ':tool_name': input.toolName,
                ':status': input.status,
                ':summary': input.summary ?? null,
                ':details': input.details ? JSON.stringify(input.details) : null,
                ':chat_id': input.chatId ?? null,
                ':created_at': timestamp,
            },
        );

        const report = await this.db.get<ToolReportRecord>('SELECT * FROM tool_reports WHERE id = :id', { ':id': id });
        if (!report) {
            throw new Error('Failed to create tool report');
        }

        return report;
    }

    async delete(id: string): Promise<void> {
        await this.db.execute('DELETE FROM tool_reports WHERE id = :id', { ':id': id });
    }

    async deleteAll(): Promise<void> {
        await this.db.execute('DELETE FROM tool_reports');
    }
}

