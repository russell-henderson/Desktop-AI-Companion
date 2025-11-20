import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatArea } from '../../../src/renderer/components/chat/ChatArea';
import type { ChatMessage } from '../../../src/types/ipc';

describe('ChatArea', () => {
    const mockMessages: ChatMessage[] = [
        {
            id: 'msg-1',
            chat_id: 'chat-1',
            role: 'user',
            content: 'Hello',
            created_at: new Date().toISOString(),
        },
        {
            id: 'msg-2',
            chat_id: 'chat-1',
            role: 'assistant',
            content: 'Hi there!',
            created_at: new Date().toISOString(),
        },
    ];

    it('displays user and assistant messages in order', () => {
        render(<ChatArea messages={mockMessages} />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('shows user message first, then assistant', () => {
        render(<ChatArea messages={mockMessages} />);
        const messages = screen.getAllByText(/Hello|Hi there!/);
        expect(messages[0]).toHaveTextContent('Hello');
        expect(messages[1]).toHaveTextContent('Hi there!');
    });

    it('displays loading state', () => {
        render(<ChatArea messages={[]} isLoading={true} />);
        expect(screen.getByText(/Loading conversation/i)).toBeInTheDocument();
    });

    it('displays empty state', () => {
        render(<ChatArea messages={[]} isLoading={false} />);
        expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
    });

    it('renders tool report messages with collapsible details', () => {
        const messagesWithToolReport: ChatMessage[] = [
            {
                id: 'msg-1',
                chat_id: 'chat-1',
                role: 'assistant',
                content: 'I ran ProcessInspector.',
                attachments: [
                    {
                        type: 'toolReport',
                        reportId: 'report-1',
                        toolName: 'ProcessInspector',
                        details: { processes: [{ name: 'test.exe', pid: 1234 }] },
                    },
                ],
                created_at: new Date().toISOString(),
            },
        ];

        render(<ChatArea messages={messagesWithToolReport} />);
        expect(screen.getByText('I ran ProcessInspector.')).toBeInTheDocument();
        expect(screen.getByText(/Show details/i)).toBeInTheDocument();
    });

    it('expands and collapses tool report details', async () => {
        const user = (await import('@testing-library/user-event')).default;
        const userEvent = user.setup();

        const messagesWithToolReport: ChatMessage[] = [
            {
                id: 'msg-1',
                chat_id: 'chat-1',
                role: 'assistant',
                content: 'I ran ProcessInspector.',
                attachments: [
                    {
                        type: 'toolReport',
                        reportId: 'report-1',
                        toolName: 'ProcessInspector',
                        details: { processes: [{ name: 'test.exe', pid: 1234 }] },
                    },
                ],
                created_at: new Date().toISOString(),
            },
        ];

        render(<ChatArea messages={messagesWithToolReport} />);
        const toggleButton = screen.getByText(/Show details/i);

        await userEvent.click(toggleButton);
        expect(screen.getByText(/Hide details/i)).toBeInTheDocument();
        expect(screen.getByText(/test\.exe/)).toBeInTheDocument();

        await userEvent.click(screen.getByText(/Hide details/i));
        expect(screen.getByText(/Show details/i)).toBeInTheDocument();
    });
});

