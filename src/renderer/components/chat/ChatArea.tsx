import { useState } from 'react';
import type { ChatMessage } from '../../../types/ipc';

interface ChatAreaProps {
    messages: ChatMessage[];
    isLoading?: boolean;
}

function ToolReportMessage({ content, attachments }: { content: string; attachments?: unknown[] }) {
    const [expanded, setExpanded] = useState(false);
    const toolReport = attachments?.find((a: any) => a?.type === 'toolReport');

    if (!toolReport) {
        return <p>{content}</p>;
    }

    const details = toolReport.details || {};

    return (
        <div>
            <p>{content}</p>
            <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs font-medium text-brand-cyan hover:underline"
            >
                {expanded ? '▼ Hide details' : '▶ Show details'}
            </button>
            {expanded && (
                <div className="mt-2 rounded-lg border border-surface-soft bg-surface-soft p-3 text-xs">
                    <pre className="whitespace-pre-wrap font-mono text-text-primary">{JSON.stringify(details, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
    if (isLoading) {
        return (
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-3">
                <div className="rounded-card bg-surface p-6 text-sm text-text-muted">Loading conversation…</div>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 px-6">
            {messages.map((message) => {
                const attachments = (message as any).attachments;
                const hasToolReport = attachments?.some((a: any) => a?.type === 'toolReport');
                const isUser = message.role === 'user';
                const timestamp = new Date(message.created_at).toLocaleTimeString();

                return (
                    <div
                        key={message.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`${isUser ? 'max-w-[70%]' : 'max-w-[72%]'} ${isUser ? '' : 'self-start'}`}>
                            <div
                                className={`rounded-3xl px-4 py-3 text-sm shadow-card ${
                                    isUser
                                        ? 'bg-brand-cyan text-white'
                                        : 'bg-surface text-text-primary chat-ai'
                                }`}
                            >
                                {hasToolReport && (
                                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
                                        Process Inspector
                                    </div>
                                )}
                                {hasToolReport ? (
                                    <ToolReportMessage content={message.content} attachments={attachments} />
                                ) : (
                                    <p>{message.content}</p>
                                )}
                            </div>
                            <p
                                className={`mt-1 text-[10px] text-text-muted ${
                                    isUser ? 'text-right' : 'text-left'
                                }`}
                            >
                                {timestamp}
                            </p>
                        </div>
                    </div>
                );
            })}

            {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-text-muted">No messages yet.</p>
                </div>
            )}
        </div>
    );
}

export default ChatArea;

