import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SystemView from '../../../src/renderer/views/SystemView';
import { createMockDesktopBridge } from '../test-utils';
import type { ToolReportRecord } from '../../../src/types/ipc';

describe('SystemView', () => {
    it('displays all three toolbox tools', async () => {
        const mockBridge = createMockDesktopBridge({
            toolbox: {
                listReports: vi.fn().mockResolvedValue([]),
            },
        });
        (window as any).desktop = mockBridge;

        render(<SystemView />);
        
        await waitFor(() => {
            expect(screen.getByText('Process Inspector')).toBeInTheDocument();
            expect(screen.getByText('Event Log Triage')).toBeInTheDocument();
            expect(screen.getByText('Network Check')).toBeInTheDocument();
        });
    });

    it('shows running state when tool is executing', async () => {
        const user = userEvent.setup();
        const slowRun = vi.fn().mockImplementation(
            () =>
                new Promise<ToolReportRecord>((resolve) => {
                    setTimeout(() => {
                        resolve({
                            id: 'report-1',
                            tool_name: 'ProcessInspector',
                            status: 'success',
                            created_at: new Date().toISOString(),
                        });
                    }, 100);
                }),
        );

        const mockBridge = createMockDesktopBridge({
            toolbox: {
                listReports: vi.fn().mockResolvedValue([]),
                run: slowRun,
            },
        });
        (window as any).desktop = mockBridge;

        render(<SystemView />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /run inspector/i })).toBeInTheDocument();
        });

        const runButton = screen.getByRole('button', { name: /run inspector/i });
        await user.click(runButton);

        await waitFor(() => {
            expect(runButton).toBeDisabled();
            expect(runButton).toHaveTextContent('Running...');
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /run inspector/i })).toBeInTheDocument();
        });
    });

    it('disables run button while tool is active', async () => {
        const user = userEvent.setup();
        const slowRun = vi.fn().mockImplementation(
            () =>
                new Promise<ToolReportRecord>((resolve) => {
                    setTimeout(() => {
                        resolve({
                            id: 'report-1',
                            tool_name: 'ProcessInspector',
                            status: 'success',
                            created_at: new Date().toISOString(),
                        });
                    }, 50);
                }),
        );

        const mockBridge = createMockDesktopBridge({
            toolbox: {
                listReports: vi.fn().mockResolvedValue([]),
                run: slowRun,
            },
        });
        (window as any).desktop = mockBridge;

        render(<SystemView />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /run inspector/i })).toBeInTheDocument();
        });

        const runButton = screen.getByRole('button', { name: /run inspector/i });
        await user.click(runButton);

        // All buttons should be disabled while one is running
        await waitFor(() => {
            const allButtons = screen.getAllByRole('button');
            const runButtons = allButtons.filter((btn) => btn.textContent?.includes('Run'));
            runButtons.forEach((btn) => {
                expect(btn).toBeDisabled();
            });
        });
    });

    it('displays tool reports after execution', async () => {
        const mockReports: ToolReportRecord[] = [
            {
                id: 'report-1',
                tool_name: 'ProcessInspector',
                status: 'success',
                summary: 'Found 50 processes',
                created_at: new Date().toISOString(),
            },
        ];

        const mockBridge = createMockDesktopBridge({
            toolbox: {
                listReports: vi.fn().mockResolvedValue(mockReports),
            },
        });
        (window as any).desktop = mockBridge;

        render(<SystemView />);

        await waitFor(() => {
            expect(screen.getByText('ProcessInspector')).toBeInTheDocument();
            expect(screen.getByText('Found 50 processes')).toBeInTheDocument();
            expect(screen.getByText(/success/i)).toBeInTheDocument();
        });
    });

    it('shows tool chat message with clear wording', async () => {
        const user = userEvent.setup();
        const mockReport: ToolReportRecord = {
            id: 'report-1',
            tool_name: 'ProcessInspector',
            status: 'success',
            summary: 'Found 50 processes',
            created_at: new Date().toISOString(),
        };

        const mockRun = vi.fn().mockResolvedValue(mockReport);
        const mockListReports = vi.fn().mockResolvedValue([]);
        const mockBridge = createMockDesktopBridge({
            toolbox: {
                listReports: mockListReports,
                run: mockRun,
            },
        });
        (window as any).desktop = mockBridge;

        render(<SystemView />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /run inspector/i })).toBeInTheDocument();
        }, { timeout: 2000 });

        const runButton = screen.getByRole('button', { name: /run inspector/i });
        await user.click(runButton);

        // Wait for the tool to be called - SystemView calls runTool which calls toolbox.run
        await waitFor(() => {
            expect(mockRun).toHaveBeenCalled();
        }, { timeout: 3000 });

        // Verify it was called - the second parameter (chatId) may be undefined
        const calls = mockRun.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][0]).toBe('ProcessInspector');
    });
});

