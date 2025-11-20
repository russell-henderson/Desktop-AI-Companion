export interface ProjectRecord {
    id: string;
    name: string;
    description?: string;
    path?: string;
    color?: string;
    created_at: string;
    updated_at: string;
}

export interface ChatRecord {
    id: string;
    project_id?: string;
    title: string;
    model: string;
    created_at: string;
    updated_at: string;
}

export interface MessageRecord {
    id: string;
    chat_id: string;
    role: string;
    content: string;
    attachments?: string;
    created_at: string;
}

export interface NotebookEntryRecord {
    id: string;
    project_id?: string;
    type: string;
    title: string;
    content: string;
    tags?: string;
    scope?: string;
    pinned?: number;
    embedding?: Uint8Array;
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

