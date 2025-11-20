import { useEffect, useMemo, useState } from 'react';
import type { ChatListItem, ChatMessage } from '../../../types/ipc';
import ChatHeader from './ChatHeader';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import { ErrorBoundary } from '../ErrorBoundary';

interface ChatPanelProps {
    onInsertNotebookEntry?: (entry: { content: string }) => void;
}

export function ChatPanel({ onInsertNotebookEntry }: ChatPanelProps = {}) {
    const [chats, setChats] = useState<ChatListItem[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        const bridge = window.desktop ?? window.ai;
        if (!bridge) {
            return;
        }
        bridge
            .getChats()
            .then((data) => {
                setChats(data);
                if (!activeChatId && data.length) {
                    setActiveChatId(data[0].id);
                }
            })
            .catch((error) => console.error('Failed to load chats', error));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount - activeChatId is checked inside, not needed as dependency

    useEffect(() => {
        const bridge = window.desktop ?? window.ai;
        if (!bridge || !activeChatId) {
            return;
        }
        setLoadingMessages(true);
        bridge
            .getMessages(activeChatId)
            .then((data) => setMessages(data))
            .catch((error) => console.error('Failed to load messages', error))
            .finally(() => setLoadingMessages(false));
    }, [activeChatId]);

    const activeChat = useMemo(() => chats.find((chat) => chat.id === activeChatId) ?? null, [activeChatId, chats]);

    const handleSend = async (content: string) => {
        const bridge = window.desktop ?? window.ai;
        if (!bridge || !activeChatId || !activeChat) {
            return;
        }
        // Pass the model from the active chat
        await bridge.sendMessage(activeChatId, content, [], activeChat.model);
        const updatedMessages = await bridge.getMessages(activeChatId);
        setMessages(updatedMessages);
    };

    if (!activeChat) {
        return <div className="rounded-2xl bg-white/80 p-6 text-sm text-text-muted">No chat selected.</div>;
    }

    return (
        <ErrorBoundary>
            <div className="flex-1 min-h-0 flex flex-col">
                <div className="shrink-0">
                    <ChatHeader chatId={activeChat.id} title={activeChat.title} model={activeChat.model} projectId={activeChat.project_id} />
                </div>
                <ChatArea messages={messages} isLoading={loadingMessages} />
                <div className="shrink-0 px-6 pb-4">
                    <ChatInput onSend={handleSend} onInsertNotebookEntry={onInsertNotebookEntry} />
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default ChatPanel;

