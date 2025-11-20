import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopBridge } from '../types/ipc';

const api: DesktopBridge = {
    sendMessage: (conversationId, content, attachments = [], modelId) =>
        ipcRenderer.invoke('ai:sendMessage', conversationId, content, attachments, modelId),
    ai: {
        getCurrentModel: () => ipcRenderer.invoke('ai:getModel'),
        setCurrentModel: (modelId: string) => ipcRenderer.invoke('ai:setModel', modelId),
        listModels: () => ipcRenderer.invoke('ai:listModels'),
    },
    getDashboardSummary: () => ipcRenderer.invoke('dashboard:getSummary'),
    getChats: () => ipcRenderer.invoke('chats:list'),
    getMessages: (chatId) => ipcRenderer.invoke('messages:list', chatId),
    projects: {
        list: () => ipcRenderer.invoke('projects:list'),
        get: (id) => ipcRenderer.invoke('projects:get', id),
        create: (input) => ipcRenderer.invoke('projects:create', input),
        update: (id, input) => ipcRenderer.invoke('projects:update', id, input),
        delete: (id) => ipcRenderer.invoke('projects:delete', id),
        linkChat: (chatId, projectId) => ipcRenderer.invoke('projects:linkChat', chatId, projectId),
    },
    notebook: {
        list: (filters) => ipcRenderer.invoke('notebook:list', filters),
        get: (id) => ipcRenderer.invoke('notebook:get', id),
        create: (input) => ipcRenderer.invoke('notebook:create', input),
        update: (id, input) => ipcRenderer.invoke('notebook:update', id, input),
        delete: (id) => ipcRenderer.invoke('notebook:delete', id),
        deleteAll: () => ipcRenderer.invoke('notebook:deleteAll'),
        search: (query, projectId) => ipcRenderer.invoke('notebook:search', query, projectId),
    },
    toolbox: {
        listReports: () => ipcRenderer.invoke('toolbox:listReports'),
        getReport: (id) => ipcRenderer.invoke('toolbox:getReport', id),
        run: (toolName, chatId) => ipcRenderer.invoke('toolbox:run', toolName, chatId),
        deleteReport: (id) => ipcRenderer.invoke('toolbox:deleteReport', id),
        deleteAllReports: () => ipcRenderer.invoke('toolbox:deleteAllReports'),
    },
    notifications: {
        list: (unreadOnly) => ipcRenderer.invoke('notifications:list', unreadOnly),
        markRead: (id) => ipcRenderer.invoke('notifications:markRead', id),
    },
    system: {
        getTelemetry: () => ipcRenderer.invoke('system:getTelemetry'),
        getActiveAlert: () => ipcRenderer.invoke('system:getActiveAlert'),
        resolveAlert: (alertId) => ipcRenderer.invoke('system:resolveAlert', alertId),
    },
    debug: process.env.NODE_ENV !== 'production' ? {
        getLastTimings: (limit) => ipcRenderer.invoke('debug:getTimings', limit),
        getStats: () => ipcRenderer.invoke('debug:getStats'),
    } : undefined,
};

contextBridge.exposeInMainWorld('ai', api);
contextBridge.exposeInMainWorld('desktop', api);
