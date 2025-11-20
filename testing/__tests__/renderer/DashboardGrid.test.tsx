import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardGrid from '../../../src/renderer/components/dashboard/DashboardGrid';
import { createMockDesktopBridge } from '../test-utils';
import type { DashboardSummary } from '../../../src/types/ipc';

describe('DashboardGrid', () => {
    it('displays workspace card with active project', async () => {
        const mockSummary: DashboardSummary = {
            workspace: {
                title: 'Test Project',
                description: 'Test description',
                path: 'C:\\Projects\\Test',
            },
            systemOverview: {
                status: 'ok',
                summary: 'System OK',
                actionLabel: 'Open toolbox',
            },
            suggestedPrompts: [],
            notebookHighlights: [],
        };

        const mockBridge = createMockDesktopBridge({
            getDashboardSummary: vi.fn().mockResolvedValue(mockSummary),
        });
        (window as any).desktop = mockBridge;

        render(<DashboardGrid />);

        await waitFor(() => {
            expect(screen.getByText('Test Project')).toBeInTheDocument();
            expect(screen.getByText('Test description')).toBeInTheDocument();
            expect(screen.getByText(/C:\\Projects\\Test/)).toBeInTheDocument();
        });
    });

    it('shows "No project selected" when workspace is null', async () => {
        const mockSummary: DashboardSummary = {
            workspace: null,
            systemOverview: {
                status: 'ok',
                summary: 'System OK',
                actionLabel: 'Open toolbox',
            },
            suggestedPrompts: [],
            notebookHighlights: [],
        };

        const mockBridge = createMockDesktopBridge({
            getDashboardSummary: vi.fn().mockResolvedValue(mockSummary),
        });
        (window as any).desktop = mockBridge;

        render(<DashboardGrid />);

        await waitFor(() => {
            expect(screen.getByText(/No project selected/i)).toBeInTheDocument();
        });
    });

    it('displays system card with status', async () => {
        const mockSummary: DashboardSummary = {
            workspace: null,
            systemOverview: {
                status: 'warning',
                summary: 'System warning detected',
                actionLabel: 'Check system',
            },
            suggestedPrompts: [],
            notebookHighlights: [],
        };

        const mockBridge = createMockDesktopBridge({
            getDashboardSummary: vi.fn().mockResolvedValue(mockSummary),
        });
        (window as any).desktop = mockBridge;

        render(<DashboardGrid />);

        await waitFor(() => {
            expect(screen.getByText('System warning detected')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Check system/i })).toBeInTheDocument();
        });
    });

    it('displays notebook highlights card with pinned entries', async () => {
        const mockSummary: DashboardSummary = {
            workspace: null,
            systemOverview: {
                status: 'ok',
                summary: 'System OK',
                actionLabel: 'Open toolbox',
            },
            suggestedPrompts: [],
            notebookHighlights: [
                { id: 'entry-1', title: 'Template 1', type: 'Template' },
                { id: 'entry-2', title: 'Prompt 1', type: 'Prompt' },
            ],
        };

        const mockBridge = createMockDesktopBridge({
            getDashboardSummary: vi.fn().mockResolvedValue(mockSummary),
        });
        (window as any).desktop = mockBridge;

        render(<DashboardGrid />);

        await waitFor(() => {
            expect(screen.getByText('Template 1')).toBeInTheDocument();
            expect(screen.getByText('Prompt 1')).toBeInTheDocument();
            expect(screen.getByText('Template')).toBeInTheDocument();
        });
    });

    it('displays recent activity card', async () => {
        const mockSummary: DashboardSummary = {
            workspace: null,
            systemOverview: {
                status: 'ok',
                summary: 'System OK',
                actionLabel: 'Open toolbox',
            },
            recentActivity: {
                title: 'Recent Chat',
                message: 'Last message 5 minutes ago',
                timestamp: new Date().toISOString(),
                actionLabel: 'View chat',
            },
            suggestedPrompts: [],
            notebookHighlights: [],
        };

        const mockBridge = createMockDesktopBridge({
            getDashboardSummary: vi.fn().mockResolvedValue(mockSummary),
        });
        (window as any).desktop = mockBridge;

        render(<DashboardGrid />);

        await waitFor(() => {
            expect(screen.getByText('Recent Chat')).toBeInTheDocument();
            expect(screen.getByText('Last message 5 minutes ago')).toBeInTheDocument();
        });
    });

    it('updates system card after toolbox runs', async () => {
        const initialSummary: DashboardSummary = {
            workspace: null,
            systemOverview: {
                status: 'ok',
                summary: 'System OK',
                actionLabel: 'Open toolbox',
            },
            suggestedPrompts: [],
            notebookHighlights: [],
        };

        const updatedSummary: DashboardSummary = {
            workspace: null,
            systemOverview: {
                status: 'ok',
                summary: 'Last tool run: ProcessInspector completed 2m ago',
                actionLabel: 'Open toolbox',
            },
            suggestedPrompts: [],
            notebookHighlights: [],
        };

        // Mock to return initial summary first, then updated
        const mockGetSummary = vi
            .fn()
            .mockResolvedValueOnce(initialSummary)
            .mockResolvedValue(updatedSummary);
        const mockBridge = createMockDesktopBridge({
            getDashboardSummary: mockGetSummary,
        });
        (window as any).desktop = mockBridge;

        render(<DashboardGrid />);

        await waitFor(() => {
            expect(screen.getByText('System OK')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Update mock to return updated summary
        mockGetSummary.mockResolvedValue(updatedSummary);

        // Unmount and remount to trigger useEffect
        const { unmount } = render(<DashboardGrid />);
        unmount();
        render(<DashboardGrid />);

        // Wait for updated summary to be displayed
        await waitFor(() => {
            expect(screen.getByText(/Last tool run: ProcessInspector/i)).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});

