export type AiRole = 'assistant' | 'user' | 'system';

export interface AiMessage {
    role: AiRole;
    content: string;
}

export interface DashboardSummary {
    workspace: {
        title: string;
        description?: string;
        path?: string;
    } | null;
    systemOverview: {
        status: 'ok' | 'warning' | 'critical';
        summary: string;
        actionLabel: string;
    };
    recentActivity?: {
        title: string;
        message: string;
        timestamp: string;
        actionLabel: string;
    };
    suggestedPrompts: { id: string; text: string }[];
    notebookHighlights: { id: string; title: string; type: string }[];
}

export interface ChatListItem {
    id: string;
    title: string;
    project_id?: string;
    model: string;
}

export interface ChatMessage {
    id: string;
    chat_id: string;
    role: AiRole;
    content: string;
    attachments?: unknown[];
    created_at: string;
}

export interface ProjectRecord {
    id: string;
    name: string;
    description?: string;
    path?: string;
    color?: string;
    created_at: string;
    updated_at: string;
}

export interface NotebookEntryRecord {
    id: string;
    project_id?: string;
    type: string;
    title: string;
    content: string;
    tags?: string;
    scope: string;
    pinned: number;
    embedding?: unknown;
    created_at: string;
    updated_at: string;
}

export interface ToolReportRecord {
    id: string;
    tool_name: string;
    status: string;
    summary?: string;
    details?: string;
    chat_id?: string;
    created_at: string;
}

export interface NotificationRecord {
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    related_tool?: string;
    read: number;
    created_at: string;
}

export interface TelemetrySnapshot {
    status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
    cpuLoad: number;
    memoryLoad: number;
    gpuLoad?: number;
    activeAlerts: string[];
    lastUpdated: string;
}

export interface Alert {
    id: string;
    severity: 'warning' | 'critical';
    source: string;
    message: string;
    createdAt: string;
    resolvedAt?: string;
}

export interface MessageTiming {
    correlationId: string;
    stages: {
        rendererSend?: number;
        ipcRequestSent?: number;
        aiServiceStarted?: number;
        openaiResponseReceived?: number;
        aiServiceFinished?: number;
        ipcReplyDelivered?: number;
        rendererStateUpdated?: number;
    };
    totalLatency?: number;
    metadata?: Record<string, unknown>;
}

export interface TelemetryStats {
    averageAiResponseTime: number;
    averageToolboxRunTime: Record<string, number>;
    errorCounts: Record<string, number>;
}

export interface DesktopBridge {
    sendMessage: (conversationId: string, content: string, attachments?: unknown[], modelId?: string) => Promise<AiMessage>;
    ai: {
        getCurrentModel: () => Promise<string>;
        setCurrentModel: (modelId: string) => Promise<string>;
        listModels: () => Promise<Array<{ id: string; label: string; description: string }>>;
    };
    getDashboardSummary: () => Promise<DashboardSummary>;
    getChats: () => Promise<ChatListItem[]>;
    getMessages: (chatId: string) => Promise<ChatMessage[]>;
    projects: {
        list: () => Promise<ProjectRecord[]>;
        get: (id: string) => Promise<ProjectRecord | null>;
        create: (input: { name: string; description?: string; path?: string; color?: string }) => Promise<ProjectRecord>;
        update: (id: string, input: { name?: string; description?: string; path?: string; color?: string }) => Promise<ProjectRecord | null>;
        delete: (id: string) => Promise<void>;
        linkChat: (chatId: string, projectId: string | null) => Promise<void>;
    };
    notebook: {
        list: (filters?: { projectId?: string; type?: string; tags?: string[] }) => Promise<NotebookEntryRecord[]>;
        get: (id: string) => Promise<NotebookEntryRecord | null>;
        create: (input: { projectId?: string; type: string; title: string; content: string; tags?: string[]; scope?: string; pinned?: boolean }) => Promise<NotebookEntryRecord>;
        update: (id: string, input: { projectId?: string; type?: string; title?: string; content?: string; tags?: string[]; scope?: string; pinned?: boolean }) => Promise<NotebookEntryRecord | null>;
        delete: (id: string) => Promise<void>;
        deleteAll: () => Promise<void>;
        search: (query: string, projectId?: string) => Promise<NotebookEntryRecord[]>;
    };
    toolbox: {
        listReports: () => Promise<ToolReportRecord[]>;
        getReport: (id: string) => Promise<ToolReportRecord | null>;
        run: (toolName: string, chatId?: string) => Promise<ToolReportRecord>;
        deleteReport: (id: string) => Promise<void>;
        deleteAllReports: () => Promise<void>;
    };
    notifications: {
        list: (unreadOnly?: boolean) => Promise<NotificationRecord[]>;
        markRead: (id: string) => Promise<void>;
    };
    system?: {
        getTelemetry: () => Promise<TelemetrySnapshot | null>;
        getActiveAlert: () => Promise<Alert | null>;
        resolveAlert: (alertId: string) => Promise<boolean>;
    };
    debug?: {
        getLastTimings: (limit?: number) => Promise<MessageTiming[]>;
        getStats: () => Promise<TelemetryStats>;
    };
}

declare global {
    interface Window {
        ai?: DesktopBridge;
        desktop?: DesktopBridge;
    }
}

export {};

