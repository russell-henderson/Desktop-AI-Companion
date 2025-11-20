import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToolboxService } from '../../src/main/services/ToolboxService';
import { ToolReportRepository } from '../../src/main/repositories/ToolReportRepository';
import { Database } from '../../src/main/db/Database';

// Mock sql.js and fs
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

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn(() => false),
        readFileSync: vi.fn(() => 'CREATE TABLE IF NOT EXISTS tool_reports (id TEXT PRIMARY KEY);'),
        writeFileSync: vi.fn(),
        mkdirSync: vi.fn(),
    },
}));

vi.mock('child_process', () => {
    const mockExec = vi.fn((cmd: string, cb: (error: Error | null, result: { stdout: string }) => void) => {
        if (cmd.includes('Get-Process')) {
            cb(null, { stdout: JSON.stringify([{ Id: 1234, ProcessName: 'test.exe', CPU: 10, WorkingSet: 1024 }]) });
        } else if (cmd.includes('Get-EventLog')) {
            cb(null, {
                stdout: JSON.stringify([
                    { Source: 'Test', EntryType: 'Error', Message: 'Test error', TimeGenerated: new Date() },
                ]),
            });
        } else if (cmd.includes('Test-NetConnection')) {
            cb(null, { stdout: 'True' });
        } else {
            cb(null, { stdout: '' });
        }
    });
    return {
        exec: mockExec,
        default: {
            exec: mockExec,
        },
    };
});

vi.mock('os', () => ({
    default: {
        platform: vi.fn(() => 'win32'),
        hostname: vi.fn(() => 'test-host'),
    },
}));

describe('ToolboxService', () => {
    let db: Database;
    let toolboxService: ToolboxService;
    let toolReportRepo: ToolReportRepository;

    beforeEach(async () => {
        db = new Database(':memory:');
        await db.initialize();
        toolReportRepo = new ToolReportRepository(db);
        
        // Mock the create method to return a valid report
        vi.spyOn(toolReportRepo, 'create').mockImplementation(async (input: any) => ({
            id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            tool_name: input.toolName,
            status: input.status,
            summary: input.summary ?? null,
            details: input.details ? JSON.stringify(input.details) : null,
            chat_id: input.chatId ?? null,
            created_at: new Date().toISOString(),
        }));
        
        toolboxService = new ToolboxService(toolReportRepo);
        vi.clearAllMocks();
    });

    it('runs ProcessInspector and creates report', async () => {
        const report = await toolboxService.runProcessInspector();
        expect(report).toBeDefined();
        expect(report.tool_name).toBe('ProcessInspector');
        expect(report.status).toBe('success');
    });

    it('runs EventLogTriage and creates report', async () => {
        const report = await toolboxService.runEventLogTriage();
        expect(report).toBeDefined();
        expect(report.tool_name).toBe('EventLogTriage');
    });

    it('runs NetworkCheck and creates report', async () => {
        const report = await toolboxService.runNetworkCheck();
        expect(report).toBeDefined();
        expect(report.tool_name).toBe('NetworkCheck');
    });

    it('handles errors gracefully', async () => {
        // Mock the repository create to throw an error to test error handling
        const originalCreate = toolReportRepo.create;
        vi.spyOn(toolReportRepo, 'create').mockRejectedValueOnce(new Error('Database error'));

        const report = await toolboxService.runProcessInspector();
        expect(report.status).toBe('error');
        expect(report.summary).toContain('Failed');
        
        // Restore original
        toolReportRepo.create = originalCreate;
    });
});

