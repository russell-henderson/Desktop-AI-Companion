import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from '../../src/main/services/DashboardService';
import { ProjectRepository } from '../../src/main/repositories/ProjectRepository';
import { ChatRepository } from '../../src/main/repositories/ChatRepository';
import { MessageRepository } from '../../src/main/repositories/MessageRepository';
import { NotebookRepository } from '../../src/main/repositories/NotebookRepository';
import { Database } from '../../src/main/db/Database';

// Mock sql.js for testing
vi.mock('sql.js', () => {
    class MockDatabase {
        run = vi.fn();
        exec = vi.fn(() => []);
        prepare = vi.fn(() => ({
            bind: vi.fn(),
            step: vi.fn(() => false),
            getAsObject: vi.fn(() => ({})),
            free: vi.fn(),
        }));
        export = vi.fn(() => new Uint8Array());
    }

    return {
        default: vi.fn().mockResolvedValue({
            Database: MockDatabase,
        }),
    };
});

// Mock fs
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(() => false),
        readFileSync: vi.fn(() => 'CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY);'),
        writeFileSync: vi.fn(),
        mkdirSync: vi.fn(),
    },
}));

describe('DashboardService', () => {
    let db: Database;
    let dashboardService: DashboardService;

    beforeEach(async () => {
        db = new Database(':memory:');
        await db.initialize();

        dashboardService = new DashboardService({
            projects: new ProjectRepository(db),
            chats: new ChatRepository(db),
            messages: new MessageRepository(db),
            notebook: new NotebookRepository(db),
        });
    });

    it('should get summary with empty data', async () => {
        const summary = await dashboardService.getSummary();

        expect(summary).toBeDefined();
        expect(summary.workspace).toBeNull();
        expect(summary.systemOverview).toBeDefined();
        expect(summary.suggestedPrompts).toBeDefined();
        expect(summary.notebookHighlights).toBeDefined();
    });
});

