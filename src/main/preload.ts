import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ai', {
    sendMessage: (conversationId: string, content: string, attachments: any[] = []) =>
        ipcRenderer.invoke('ai:sendMessage', conversationId, content, attachments),
});
