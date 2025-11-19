/// <reference types="vite/client" />

interface Window {
    ai: {
        sendMessage: (conversationId: string, content: string, attachments?: any[]) => Promise<any>;
        // Add other methods as defined in TECHSPEC
    };
}
