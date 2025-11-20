import { FormEvent, useState, useEffect } from 'react';
import type { NotebookEntryRecord } from '../../../types/ipc';

interface ChatInputProps {
    onSend: (content: string) => Promise<void> | void;
    onInsertNotebookEntry?: (entry: { content: string }) => void;
}

export function ChatInput({ onSend, onInsertNotebookEntry }: ChatInputProps) {
    const [value, setValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showNotebookPicker, setShowNotebookPicker] = useState(false);
    const [notebookEntries, setNotebookEntries] = useState<NotebookEntryRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Listen for notebook insert events from slide-over
    useEffect(() => {
        const handleNotebookInsert = (event: CustomEvent<{ content: string }>) => {
            const newValue = value ? `${value}\n\n${event.detail.content}` : event.detail.content;
            setValue(newValue);
            if (onInsertNotebookEntry) {
                onInsertNotebookEntry({ content: event.detail.content });
            }
        };

        // Listen for quick prompt insert events
        const handleQuickPromptInsert = (event: CustomEvent<{ text: string }>) => {
            setValue(event.detail.text);
            // Focus the input field
            const inputElement = document.querySelector('input[placeholder="Message Nova..."]') as HTMLInputElement;
            if (inputElement) {
                setTimeout(() => inputElement.focus(), 0);
            }
        };

        window.addEventListener('notebook-insert', handleNotebookInsert as EventListener);
        window.addEventListener('quick-prompt-insert', handleQuickPromptInsert as EventListener);
        return () => {
            window.removeEventListener('notebook-insert', handleNotebookInsert as EventListener);
            window.removeEventListener('quick-prompt-insert', handleQuickPromptInsert as EventListener);
        };
    }, [value, onInsertNotebookEntry]);

    useEffect(() => {
        if (showNotebookPicker) {
            loadNotebookEntries();
        }
    }, [showNotebookPicker, searchQuery]);

    const loadNotebookEntries = async () => {
        try {
            const data = searchQuery
                ? await window.desktop?.notebook.search(searchQuery)
                : await window.desktop?.notebook.list();
            setNotebookEntries(data || []);
        } catch (error) {
            console.error('Failed to load notebook entries', error);
        }
    };

    const handleInsertEntry = (entry: NotebookEntryRecord) => {
        const newValue = value ? `${value}\n\n${entry.content}` : entry.content;
        setValue(newValue);
        setShowNotebookPicker(false);
        setSearchQuery('');
        // Also notify parent if callback provided (for slide-over integration)
        if (onInsertNotebookEntry) {
            onInsertNotebookEntry({ content: entry.content });
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!value.trim()) {
            return;
        }
        setIsSending(true);
        try {
            await onSend(value.trim());
            setValue('');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="mt-3 flex items-center justify-center relative">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-surface rounded-full shadow-card flex items-center px-3 py-2 gap-3"
            >
                <button
                    type="button"
                    className="rounded-full bg-surface-soft p-2 text-text-muted hover:bg-surface-soft/80 transition"
                    title="Attach file (coming soon)"
                >
                    📎
                </button>
                <button
                    type="button"
                    onClick={() => setShowNotebookPicker(!showNotebookPicker)}
                    className="hidden sm:inline-flex items-center rounded-full border border-brand-cyan px-3 py-1 text-xs text-brand-cyan hover:bg-brand-cyan hover:text-white transition"
                    title="Insert from notebook"
                >
                    Notebook
                </button>
                <input
                    type="text"
                    className="flex-1 border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                    placeholder="Message Nova..."
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
                <button
                    type="submit"
                    disabled={isSending || !value.trim()}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-brand-cyan text-white disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-brand-cyan/90"
                    title="Send message"
                >
                    {isSending ? '…' : '➤'}
                </button>
            </form>

            {showNotebookPicker && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-full max-w-md rounded-card border border-surface-soft bg-surface shadow-card">
                    <div className="p-3 border-b border-surface-soft">
                        <input
                            type="text"
                            placeholder="Search notebook..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-surface-soft px-3 py-2 text-sm text-text-primary focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan focus:ring-opacity-40"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notebookEntries.length === 0 ? (
                            <div className="p-4 text-center text-sm text-text-muted">No entries found</div>
                        ) : (
                            notebookEntries.map((entry) => (
                                <button
                                    key={entry.id}
                                    onClick={() => handleInsertEntry(entry)}
                                    className="w-full border-b border-surface-soft px-4 py-3 text-left hover:bg-surface-soft transition"
                                >
                                    <div className="font-medium text-text-primary">{entry.title}</div>
                                    <div className="mt-1 text-xs text-text-muted line-clamp-2">{entry.content}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatInput;

