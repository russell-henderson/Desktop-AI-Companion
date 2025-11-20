import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import type { DesktopBridge } from '../../src/types/ipc';

// Mock window.desktop for tests
export function createMockDesktopBridge(overrides?: Partial<DesktopBridge>): DesktopBridge {
    return {
        sendMessage: vi.fn().mockResolvedValue({ role: 'assistant', content: 'Mocked response' }),
        getDashboardSummary: vi.fn().mockResolvedValue({
            workspace: null,
            systemOverview: { status: 'ok', summary: 'System OK', actionLabel: 'Open toolbox' },
            suggestedPrompts: [],
            notebookHighlights: [],
        }),
        getChats: vi.fn().mockResolvedValue([]),
        getMessages: vi.fn().mockResolvedValue([]),
        projects: {
            list: vi.fn().mockResolvedValue([]),
            get: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 'test', name: 'Test', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
            update: vi.fn().mockResolvedValue(null),
            delete: vi.fn().mockResolvedValue(undefined),
            linkChat: vi.fn().mockResolvedValue(undefined),
        },
        notebook: {
            list: vi.fn().mockResolvedValue([]),
            get: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({
                id: 'test',
                type: 'note',
                title: 'Test',
                content: 'Test content',
                scope: 'global',
                pinned: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }),
            update: vi.fn().mockResolvedValue(null),
            delete: vi.fn().mockResolvedValue(undefined),
            search: vi.fn().mockResolvedValue([]),
        },
        toolbox: {
            listReports: vi.fn().mockResolvedValue([]),
            getReport: vi.fn().mockResolvedValue(null),
            run: vi.fn().mockResolvedValue({
                id: 'test',
                tool_name: 'TestTool',
                status: 'success',
                created_at: new Date().toISOString(),
            }),
        },
        notifications: {
            list: vi.fn().mockResolvedValue([]),
            markRead: vi.fn().mockResolvedValue(undefined),
        },
        ai: {
            getCurrentModel: vi.fn().mockResolvedValue('gpt-3.5-turbo'),
            setCurrentModel: vi.fn().mockResolvedValue('gpt-3.5-turbo'),
            listModels: vi.fn().mockResolvedValue([
                { id: 'gpt-4o-mini', label: 'Nova · System Expert', description: 'Precision + tool access' },
                { id: 'gpt-4.1-mini', label: 'Nova · Research', description: 'Long context, grounded answers' },
                { id: 'gpt-3.5-turbo', label: 'Nova · Fast Drafts', description: 'Speed over depth' },
            ]),
        },
        debug: {
            getLastTimings: vi.fn().mockResolvedValue([]),
            getStats: vi.fn().mockResolvedValue({
                averageAiResponseTime: 0,
                averageToolboxRunTime: {},
                errorCounts: {},
            }),
        },
        ...overrides,
    };
}

// Custom render function that includes providers
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
    const mockBridge = createMockDesktopBridge();
    
    // Set up window.desktop mock
    (window as any).desktop = mockBridge;
    (window as any).ai = mockBridge;

    return {
        ...render(ui, options),
        mockBridge,
    };
}

// Helper to wait for async updates
export async function waitForAsync() {
    await new Promise((resolve) => setTimeout(resolve, 0));
}

