import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, findByText, findByPlaceholderText } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatPanel from '../../../src/renderer/components/chat/ChatPanel';
import { createMockDesktopBridge } from '../test-utils';
import type { ChatListItem, ChatMessage } from '../../../src/types/ipc';

describe('ChatPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('displays "No chat selected" when no chats available', () => {
        const mockBridge = createMockDesktopBridge({
            getChats: vi.fn().mockResolvedValue([]),
        });
        (window as any).desktop = mockBridge;
        (window as any).ai = mockBridge;

        render(<ChatPanel />);
        expect(screen.getByText(/No chat selected/i)).toBeInTheDocument();
    });

    it('loads and displays chat list', async () => {
        const mockChats: ChatListItem[] = [
            { id: 'chat-1', title: 'Chat 1', model: 'gpt-3.5-turbo' },
            { id: 'chat-2', title: 'Chat 2', model: 'gpt-4' },
        ];

        const mockGetChats = vi.fn().mockResolvedValue(mockChats);
        const mockGetMessages = vi.fn().mockResolvedValue([]);
        const mockBridge = createMockDesktopBridge({
            getChats: mockGetChats,
            getMessages: mockGetMessages,
        });
        (window as any).desktop = mockBridge;
        (window as any).ai = mockBridge;

        render(<ChatPanel />);

        // Wait for getChats to be called and complete
        await waitFor(() => {
            expect(mockGetChats).toHaveBeenCalled();
        }, { timeout: 10000 });

        // Wait for getMessages to be called (indicates activeChatId was set)
        await waitFor(() => {
            expect(mockGetMessages).toHaveBeenCalled();
        }, { timeout: 10000 });

        // Now wait for ChatInput to appear (indicates activeChat is computed and component rendered)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Message Nova...')).toBeInTheDocument();
        }, { timeout: 10000 });
    });

    it('displays messages for active chat', async () => {
        const mockChats: ChatListItem[] = [{ id: 'chat-1', title: 'Chat 1', model: 'gpt-3.5-turbo' }];
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
                content: 'Hi!',
                created_at: new Date().toISOString(),
            },
        ];

        const mockGetChats = vi.fn().mockResolvedValue(mockChats);
        const mockGetMessages = vi.fn().mockResolvedValue(mockMessages);
        const mockBridge = createMockDesktopBridge({
            getChats: mockGetChats,
            getMessages: mockGetMessages,
        });
        (window as any).desktop = mockBridge;
        (window as any).ai = mockBridge;

        render(<ChatPanel />);

        // Wait for getChats and getMessages to be called
        await waitFor(() => {
            expect(mockGetChats).toHaveBeenCalled();
            expect(mockGetMessages).toHaveBeenCalled();
        }, { timeout: 10000 });

        // Wait for messages to render
        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
            expect(screen.getByText('Hi!')).toBeInTheDocument();
        }, { timeout: 10000 });
    });

    it('sends message and updates UI', async () => {
        const user = userEvent.setup();
        const mockChats: ChatListItem[] = [{ id: 'chat-1', title: 'Chat 1', model: 'gpt-3.5-turbo' }];
        const initialMessages: ChatMessage[] = [];

        const updatedMessages: ChatMessage[] = [
            {
                id: 'msg-1',
                chat_id: 'chat-1',
                role: 'user',
                content: 'Test message',
                created_at: new Date().toISOString(),
            },
            {
                id: 'msg-2',
                chat_id: 'chat-1',
                role: 'assistant',
                content: 'Response 1',
                created_at: new Date().toISOString(),
            },
        ];

        const mockGetChats = vi.fn().mockResolvedValue(mockChats);
        const mockGetMessages = vi
            .fn()
            .mockResolvedValueOnce(initialMessages) // First call: initial load
            .mockResolvedValueOnce(updatedMessages); // Second call: after send

        const mockSendMessage = vi.fn().mockResolvedValue({ role: 'assistant', content: 'Response 1' });

        const mockBridge = createMockDesktopBridge({
            getChats: mockGetChats,
            getMessages: mockGetMessages,
            sendMessage: mockSendMessage,
        });
        (window as any).desktop = mockBridge;
        (window as any).ai = mockBridge;

        render(<ChatPanel />);

        // Stage 1: Wait for initial load - chats loaded
        await waitFor(() => {
            expect(mockGetChats).toHaveBeenCalled();
        }, { timeout: 5000 });

        // Stage 2: Wait for initial messages load
        await waitFor(() => {
            expect(mockGetMessages).toHaveBeenCalledWith('chat-1');
        }, { timeout: 5000 });

        // Stage 3: Wait for ChatInput to render (indicates activeChat is set)
        const input = await screen.findByPlaceholderText('Message Nova...', {}, { timeout: 5000 });
        expect(input).toBeInTheDocument();

        // Stage 4: Type and send message
        await user.type(input, 'Test message');
        // Send button is now just an arrow icon, find by title
        const sendButton = screen.getByTitle(/send message/i);
        await user.click(sendButton);

        // Stage 5: Verify sendMessage was called
        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'Test message', [], 'gpt-3.5-turbo');
        }, { timeout: 3000 });

        // Stage 6: Verify getMessages was called again (after send)
        await waitFor(() => {
            expect(mockGetMessages).toHaveBeenCalledTimes(2);
        }, { timeout: 3000 });

        // Stage 7: Wait for messages to appear in UI
        await waitFor(() => {
            expect(screen.getByText('Test message')).toBeInTheDocument();
            expect(screen.getByText('Response 1')).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    it('shows user message before assistant response', async () => {
        const user = userEvent.setup();
        const mockChats: ChatListItem[] = [{ id: 'chat-1', title: 'Chat 1', model: 'gpt-3.5-turbo' }];

        const updatedMessages: ChatMessage[] = [
            {
                id: 'msg-1',
                chat_id: 'chat-1',
                role: 'user',
                content: 'User message',
                created_at: new Date().toISOString(),
            },
            {
                id: 'msg-2',
                chat_id: 'chat-1',
                role: 'assistant',
                content: 'Assistant response',
                created_at: new Date().toISOString(),
            },
        ];

        const mockGetChats = vi.fn().mockResolvedValue(mockChats);
        const mockGetMessages = vi
            .fn()
            .mockResolvedValueOnce([]) // First call: initial load
            .mockResolvedValueOnce(updatedMessages); // Second call: after send

        const mockSendMessage = vi.fn().mockResolvedValue({ role: 'assistant', content: 'Assistant response' });
        const mockBridge = createMockDesktopBridge({
            getChats: mockGetChats,
            getMessages: mockGetMessages,
            sendMessage: mockSendMessage,
        });
        (window as any).desktop = mockBridge;
        (window as any).ai = mockBridge;

        render(<ChatPanel />);

        // Stage 1: Wait for initial load - chats loaded
        await waitFor(() => {
            expect(mockGetChats).toHaveBeenCalled();
        }, { timeout: 5000 });

        // Stage 2: Wait for initial messages load
        await waitFor(() => {
            expect(mockGetMessages).toHaveBeenCalledWith('chat-1');
        }, { timeout: 5000 });

        // Stage 3: Wait for ChatInput to render
        const input = await screen.findByPlaceholderText('Message Nova...', {}, { timeout: 5000 });
        expect(input).toBeInTheDocument();

        // Stage 4: Type and send message
        await user.type(input, 'User message');
        // Send button is now just an arrow icon, find by title or type="submit"
        const sendButton = input.closest('form')?.querySelector('button[type="submit"]');
        if (sendButton) {
            await user.click(sendButton);
        } else {
            // Fallback: find button with title "Send message"
            const sendBtn = screen.getByTitle(/send message/i);
            await user.click(sendBtn);
        }

        // Stage 5: Verify sendMessage was called
        await waitFor(() => {
            expect(mockSendMessage).toHaveBeenCalledWith('chat-1', 'User message', [], 'gpt-3.5-turbo');
        }, { timeout: 3000 });

        // Stage 6: Verify getMessages was called again
        await waitFor(() => {
            expect(mockGetMessages).toHaveBeenCalledTimes(2);
        }, { timeout: 3000 });

        // Stage 7: Wait for both messages to appear in UI, verify order
        await waitFor(() => {
            const userMsg = screen.getByText('User message');
            const assistantMsg = screen.getByText('Assistant response');
            expect(userMsg).toBeInTheDocument();
            expect(assistantMsg).toBeInTheDocument();
            
            // Verify user message appears before assistant message in DOM order
            const allMessages = screen.getAllByText(/User message|Assistant response/);
            expect(allMessages.length).toBeGreaterThanOrEqual(2);
            const userIndex = allMessages.findIndex(msg => msg.textContent === 'User message');
            const assistantIndex = allMessages.findIndex(msg => msg.textContent === 'Assistant response');
            expect(userIndex).toBeLessThan(assistantIndex);
        }, { timeout: 5000 });
    });
});

