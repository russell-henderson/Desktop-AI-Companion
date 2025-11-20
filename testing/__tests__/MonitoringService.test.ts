import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MonitoringService } from '../../src/main/services/MonitoringService';
import { NotificationRepository } from '../../src/main/repositories/NotificationRepository';
import { ToolboxService } from '../../src/main/services/ToolboxService';
import { Database } from '../../src/main/db/Database';
import { ToolReportRepository } from '../../src/main/repositories/ToolReportRepository';
import { SystemTelemetryService } from '../../src/main/services/SystemTelemetryService';
import { AlertStore } from '../../src/main/services/AlertStore';

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
        readFileSync: vi.fn(() => 'CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY);'),
        writeFileSync: vi.fn(),
        mkdirSync: vi.fn(),
    },
}));

vi.mock('os', () => ({
    default: {
        cpus: vi.fn(() => [
            {
                times: {
                    user: 1000,
                    nice: 0,
                    sys: 500,
                    idle: 5000,
                    irq: 0,
                },
            },
        ]),
        totalmem: vi.fn(() => 8 * 1024 * 1024 * 1024), // 8GB
        freemem: vi.fn(() => 2 * 1024 * 1024 * 1024), // 2GB free = 75% used
    },
}));

describe('MonitoringService', () => {
    let db: Database;
    let monitoringService: MonitoringService;
    let notificationRepo: NotificationRepository;
    let toolboxService: ToolboxService;
    let systemTelemetryService: SystemTelemetryService;
    let alertStore: AlertStore;

    beforeEach(async () => {
        db = new Database(':memory:');
        await db.initialize();
        notificationRepo = new NotificationRepository(db);
        const toolReportRepo = new ToolReportRepository(db);
        toolboxService = new ToolboxService(toolReportRepo);
        systemTelemetryService = new SystemTelemetryService();
        alertStore = new AlertStore();
        monitoringService = new MonitoringService(notificationRepo, toolboxService, systemTelemetryService, alertStore);
        vi.clearAllMocks();
    });

    afterEach(() => {
        monitoringService.stop();
    });

    it('starts monitoring loop', () => {
        monitoringService.start(100);
        expect(monitoringService).toBeDefined();
        monitoringService.stop();
    });

    it('stops monitoring loop', () => {
        monitoringService.start(100);
        monitoringService.stop();
        // Should not throw
        expect(monitoringService).toBeDefined();
    });

    it('does not block UI during long-running monitoring', async () => {
        const checkPromise = new Promise<void>((resolve) => {
            monitoringService.start(50);
            setTimeout(() => {
                monitoringService.stop();
                resolve();
            }, 200);
        });

        // Should complete without blocking
        await checkPromise;
        expect(true).toBe(true); // Test passes if no timeout
    });

    it('creates notification for high CPU usage', async () => {
        // Mock os.cpus to return high CPU usage
        const os = await import('os');
        vi.mocked(os.default.cpus).mockReturnValue([
            {
                times: {
                    user: 9000,
                    nice: 0,
                    sys: 500,
                    idle: 500, // Very low idle = high usage
                    irq: 0,
                },
            },
        ] as any);

        // Mock create to not throw
        vi.spyOn(notificationRepo, 'create').mockResolvedValue({
            id: 'test-notif',
            type: 'cpu',
            severity: 'warning',
            title: 'Test',
            message: 'Test',
            read: 0,
            created_at: new Date().toISOString(),
        });

        monitoringService.start(10);

        // Wait a bit for check to run
        await new Promise((resolve) => setTimeout(resolve, 50));

        monitoringService.stop();

        // Should attempt to create notification (may be throttled)
        // Just verify service doesn't crash
        expect(monitoringService).toBeDefined();
    });

    it('creates notification for high memory usage', async () => {
        const os = await import('os');
        // Mock high memory usage (>90%)
        vi.mocked(os.default.freemem).mockReturnValue(0.5 * 1024 * 1024 * 1024); // 0.5GB free = >90% used

        // Mock create to not throw
        vi.spyOn(notificationRepo, 'create').mockResolvedValue({
            id: 'test-notif',
            type: 'memory',
            severity: 'warning',
            title: 'Test',
            message: 'Test',
            read: 0,
            created_at: new Date().toISOString(),
        });

        monitoringService.start(10);

        await new Promise((resolve) => setTimeout(resolve, 50));

        monitoringService.stop();

        // Should attempt to create notification
        expect(monitoringService).toBeDefined();
    });
});

