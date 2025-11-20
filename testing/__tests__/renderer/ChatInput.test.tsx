import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '../../../src/renderer/components/chat/ChatInput';
import { renderWithProviders, createMockDesktopBridge } from '../test-utils';

describe('ChatInput', () => {
    const mockOnSend = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders input and send button', () => {
        renderWithProviders(<ChatInput onSend={mockOnSend} />);
        expect(screen.getByPlaceholderText('Message Nova...')).toBeInTheDocument();
        expect(screen.getByTitle(/send message/i)).toBeInTheDocument();
    });

    it('disables send button while message is in flight', async () => {
        const user = userEvent.setup();
        const slowOnSend = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));

        renderWithProviders(<ChatInput onSend={slowOnSend} />);
        const input = screen.getByPlaceholderText('Message Nova...');
        const sendButton = screen.getByTitle(/send message/i);

        // Button starts disabled (empty input)
        expect(sendButton).toBeDisabled();

        await user.type(input, 'Test message');
        
        // Wait for button to be enabled after typing
        await waitFor(() => {
            expect(sendButton).not.toBeDisabled();
        });

        await user.click(sendButton);

        // Button should be disabled and show "…" when sending
        await waitFor(() => {
            expect(sendButton).toBeDisabled();
            expect(sendButton).toHaveTextContent('…');
        }, { timeout: 2000 });

        // After sending, input is cleared, so button should be disabled again
        await waitFor(() => {
            expect(sendButton).toBeDisabled(); // Disabled because input is cleared
            expect(sendButton).toHaveTextContent('➤');
        }, { timeout: 2000 });
    });

    it('re-enables send button after response', async () => {
        const user = userEvent.setup();
        const mockOnSendResolved = vi.fn().mockResolvedValue(undefined);

        renderWithProviders(<ChatInput onSend={mockOnSendResolved} />);
        const input = screen.getByPlaceholderText('Message Nova...');
        const sendButton = screen.getByTitle(/send message/i);

        // Button starts disabled (empty input)
        expect(sendButton).toBeDisabled();

        await user.type(input, 'Test message');
        
        // Wait for button to be enabled after typing
        await waitFor(() => {
            expect(sendButton).not.toBeDisabled();
        });

        await user.click(sendButton);

        // After sending, input is cleared, so button should be disabled again
        await waitFor(() => {
            expect(sendButton).toBeDisabled(); // Disabled because input is cleared
            expect(mockOnSendResolved).toHaveBeenCalledWith('Test message');
        }, { timeout: 2000 });
    });

    it('re-enables send button after error', async () => {
        const user = userEvent.setup();
        const mockOnSendError = vi.fn().mockImplementation(async () => {
            throw new Error('Test error');
        });

        // Suppress unhandled rejection for this test (error is handled by component)
        const originalRejectionHandler = process.listeners('unhandledRejection');
        process.removeAllListeners('unhandledRejection');
        process.on('unhandledRejection', (error) => {
            // Suppress expected error from test
            if (error instanceof Error && error.message === 'Test error') {
                return;
            }
            // Re-throw unexpected errors
            throw error;
        });

        try {
            renderWithProviders(<ChatInput onSend={mockOnSendError} />);
            const input = screen.getByPlaceholderText('Message Nova...');
            const sendButton = screen.getByTitle(/send message/i);

            await user.type(input, 'Test message');
            await user.click(sendButton);

            // Wait for the error to be handled and button re-enabled
            await waitFor(() => {
                expect(mockOnSendError).toHaveBeenCalled();
            }, { timeout: 2000 });

            await waitFor(() => {
                expect(sendButton).not.toBeDisabled();
            }, { timeout: 2000 });
        } finally {
            // Restore original handlers
            process.removeAllListeners('unhandledRejection');
            originalRejectionHandler.forEach((handler) => process.on('unhandledRejection', handler));
        }
    });

    it('clears input after sending', async () => {
        const user = userEvent.setup();
        const mockOnSendResolved = vi.fn().mockResolvedValue(undefined);

        renderWithProviders(<ChatInput onSend={mockOnSendResolved} />);
        const input = screen.getByPlaceholderText('Message Nova...') as HTMLTextAreaElement;

        await user.type(input, 'Test message');
        await user.click(screen.getByTitle(/send message/i));

        await waitFor(() => {
            expect(input.value).toBe('');
        });
    });

    it('does not send empty messages', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ChatInput onSend={mockOnSend} />);
        const sendButton = screen.getByTitle(/send message/i);

        await user.click(sendButton);
        expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('notebook button opens picker', async () => {
        const user = userEvent.setup();
        const mockEntries = [
            {
                id: 'entry-1',
                type: 'note',
                title: 'Test Entry',
                content: 'Test content',
                scope: 'global',
                pinned: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ];
        // Mock resolves immediately to avoid timing issues
        const mockList = vi.fn().mockResolvedValue(mockEntries);
        
        // Render first (renderWithProviders creates its own mock)
        renderWithProviders(<ChatInput onSend={mockOnSend} />);
        
        // Then override the mock with our custom one (component accesses window.desktop at call time, not render time)
        const mockBridge = createMockDesktopBridge({
            notebook: {
                list: mockList,
                get: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue(mockEntries[0]),
                update: vi.fn().mockResolvedValue(null),
                delete: vi.fn().mockResolvedValue(undefined),
                search: vi.fn().mockResolvedValue([]),
            },
        });
        (window as any).desktop = mockBridge;
        (window as any).ai = mockBridge;
        
        // Notebook button is now hidden on small screens, so find by text content
        const notebookButton = screen.getByText('Notebook');

        // Stage 1: Click notebook button (triggers setShowNotebookPicker(true))
        await act(async () => {
            await user.click(notebookButton);
        });

        // Stage 2: Wait for picker to appear (showNotebookPicker state change triggers useEffect)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Search notebook...')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Stage 3: Wait for notebook.list to be called (useEffect triggered after state change)
        // The useEffect depends on showNotebookPicker, so it should trigger after the click
        await waitFor(() => {
            expect(mockList).toHaveBeenCalled();
        }, { timeout: 5000 });

        // Stage 4: Wait for entries to render in UI (state update from loadNotebookEntries)
        await waitFor(() => {
            expect(screen.getByText('Test Entry')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('inserts notebook entry at cursor position', async () => {
        const user = userEvent.setup();
        const mockEntries = [
            {
                id: 'entry-1',
                type: 'note',
                title: 'Test Entry',
                content: 'Inserted content',
                scope: 'global',
                pinned: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ];
        // Mock resolves immediately to avoid timing issues
        const mockList = vi.fn().mockResolvedValue(mockEntries);
        
        // Render first (renderWithProviders creates its own mock)
        renderWithProviders(<ChatInput onSend={mockOnSend} />);
        
        // Then override the mock with our custom one (component accesses window.desktop at call time, not render time)
        const mockBridge = createMockDesktopBridge({
            notebook: {
                list: mockList,
                get: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue(mockEntries[0]),
                update: vi.fn().mockResolvedValue(null),
                delete: vi.fn().mockResolvedValue(undefined),
                search: vi.fn().mockResolvedValue([]),
            },
        });
        (window as any).desktop = mockBridge;
        (window as any).ai = mockBridge;
        
        const input = screen.getByPlaceholderText('Message Nova...') as HTMLTextAreaElement;
        // Notebook button is now hidden on small screens, so find by text content
        const notebookButton = screen.getByText('Notebook');

        // Stage 1: Type existing text
        await user.type(input, 'Existing text');
        expect(input.value).toBe('Existing text');

        // Stage 2: Click notebook button (triggers setShowNotebookPicker(true))
        await act(async () => {
            await user.click(notebookButton);
        });

        // Stage 3: Wait for picker to appear
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Search notebook...')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Stage 4: Wait for notebook.list to be called (useEffect triggered after state change)
        await waitFor(() => {
            expect(mockList).toHaveBeenCalled();
        }, { timeout: 5000 });

        // Stage 5: Wait for entries to render
        await waitFor(() => {
            expect(screen.getByText('Test Entry')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Stage 6: Click the entry to insert it (triggers handleInsertEntry)
        const entryButton = screen.getByText('Test Entry');
        await act(async () => {
            await user.click(entryButton);
        });

        // Stage 7: Wait for content to be inserted (handleInsertEntry updates state)
        await waitFor(() => {
            const updatedInput = screen.getByPlaceholderText('Message Nova...') as HTMLTextAreaElement;
            expect(updatedInput.value).toContain('Existing text');
            expect(updatedInput.value).toContain('Inserted content');
        }, { timeout: 3000 });
    });

    it('handles long prompts (15k characters)', async () => {
        const user = userEvent.setup();
        const longMessage = 'a'.repeat(15000);
        renderWithProviders(<ChatInput onSend={mockOnSend} />);
        const input = screen.getByPlaceholderText('Message Nova...') as HTMLTextAreaElement;

        // Set value directly and trigger change event
        await user.clear(input);
        Object.defineProperty(input, 'value', {
            writable: true,
            value: longMessage,
        });
        await user.type(input, ' '); // Trigger change
        await user.type(input, '{backspace}'); // Remove the space

        expect(input.value.length).toBe(15000);

        const sendButton = screen.getByTitle(/send message/i);
        await user.click(sendButton);

        await waitFor(() => {
            expect(mockOnSend).toHaveBeenCalledWith(longMessage);
        }, { timeout: 5000 });
    });

    it('prevents double submission on double click', async () => {
        const user = userEvent.setup();
        const mockOnSendResolved = vi.fn().mockResolvedValue(undefined);

        renderWithProviders(<ChatInput onSend={mockOnSendResolved} />);
        const input = screen.getByPlaceholderText('Message Nova...');
        const sendButton = screen.getByTitle(/send message/i);

        await user.type(input, 'Test message');
        await user.dblClick(sendButton);

        await waitFor(() => {
            expect(mockOnSendResolved).toHaveBeenCalledTimes(1);
        });
    });
});

