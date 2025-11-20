import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { config } from './config';
import { Database } from './db/Database';
import { AIService } from './services/AIService';
import { ProjectRepository } from './repositories/ProjectRepository';
import { ChatRepository } from './repositories/ChatRepository';
import { MessageRepository } from './repositories/MessageRepository';
import { NotebookRepository } from './repositories/NotebookRepository';
import { ToolReportRepository } from './repositories/ToolReportRepository';
import { NotificationRepository } from './repositories/NotificationRepository';
import { SeedService } from './services/SeedService';
import { DashboardService } from './services/DashboardService';
import { ProjectService } from './services/ProjectService';
import { NotebookService } from './services/NotebookService';
import { ToolboxService } from './services/ToolboxService';
import { MonitoringService } from './services/MonitoringService';
import { TelemetryService } from './services/TelemetryService';
import { SystemTelemetryService } from './services/SystemTelemetryService';
import { AlertStore } from './services/AlertStore';
import { randomUUID } from 'crypto';

let mainWindow: BrowserWindow | null = null;
let telemetryService: TelemetryService | null = null;
let systemTelemetryService: SystemTelemetryService | null = null;
let alertStore: AlertStore | null = null;
let database: Database | null = null;
const aiService = new AIService(config.openAiApiKey, config.defaultModel);
let dashboardService: DashboardService | null = null;
let projectService: ProjectService | null = null;
let notebookService: NotebookService | null = null;
let toolboxService: ToolboxService | null = null;
let monitoringService: MonitoringService | null = null;
let projectRepository: ProjectRepository | null = null;
let chatRepository: ChatRepository | null = null;
let messageRepository: MessageRepository | null = null;
let notebookRepository: NotebookRepository | null = null;
let toolReportRepository: ToolReportRepository | null = null;
let notificationRepository: NotificationRepository | null = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    const startURL = config.electronStartUrl || `file://${path.join(__dirname, '../build/index.html')}`;

    if (config.electronStartUrl) {
        mainWindow.loadURL(startURL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    // Initialize telemetry service (dev only, but safe to initialize always)
    telemetryService = new TelemetryService();
    
    // Initialize system telemetry service
    systemTelemetryService = new SystemTelemetryService();
    systemTelemetryService.start();
    
    // Initialize alert store
    alertStore = new AlertStore();

    const databasePath = path.join(app.getPath('userData'), 'desktop-ai-companion.sqlite');
    database = new Database(databasePath);
    await database.initialize();

    projectRepository = new ProjectRepository(database);
    chatRepository = new ChatRepository(database);
    messageRepository = new MessageRepository(database);
    notebookRepository = new NotebookRepository(database);
    toolReportRepository = new ToolReportRepository(database);
    notificationRepository = new NotificationRepository(database);

    const seedService = new SeedService({
        projects: projectRepository,
        chats: chatRepository,
        messages: messageRepository,
        notebook: notebookRepository,
        toolReports: toolReportRepository,
        notifications: notificationRepository,
    });
    await seedService.ensureSeedData();

    dashboardService = new DashboardService({
        projects: projectRepository,
        chats: chatRepository,
        messages: messageRepository,
        notebook: notebookRepository,
    });

    projectService = new ProjectService(projectRepository, chatRepository);
    notebookService = new NotebookService(notebookRepository);
    toolboxService = new ToolboxService(toolReportRepository);
    monitoringService = new MonitoringService(notificationRepository, toolboxService, systemTelemetryService, alertStore);

    monitoringService.start(30000);

    createMainWindow();

    app.on('activate', () => {
        if (mainWindow === null) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('ai:getModel', async () => {
    return aiService.getCurrentModel();
});

ipcMain.handle('ai:setModel', async (_event, modelId: string) => {
    aiService.setCurrentModel(modelId);
    return modelId;
});

ipcMain.handle('ai:listModels', async () => {
    return [
        { id: 'gpt-4o-mini', label: 'Nova · System Expert', description: 'Precision + tool access' },
        { id: 'gpt-4.1-mini', label: 'Nova · Research', description: 'Long context, grounded answers' },
        { id: 'gpt-3.5-turbo', label: 'Nova · Fast Drafts', description: 'Speed over depth' },
    ];
});

ipcMain.handle('ai:sendMessage', async (_event, conversationId: string, content: string, attachments: unknown[] = [], modelId?: string) => {
    const correlationId = randomUUID();
    telemetryService?.recordEvent('ipcRequestSent', correlationId, { conversationId, contentLength: content.length });

    if (!content) {
        telemetryService?.recordEvent('error', correlationId, { service: 'ai:sendMessage', error: 'Message content is required' });
        throw new Error('Message content is required');
    }

    if (!messageRepository || !chatRepository) {
        telemetryService?.recordEvent('error', correlationId, { service: 'ai:sendMessage', error: 'Repositories not initialized' });
        throw new Error('Repositories are not initialized');
    }

    let targetChatId = conversationId;
    let selectedModel = modelId || config.defaultModel;
    
    if (conversationId === 'default') {
        const chats = await chatRepository.listAll();
        if (!chats.length) {
            telemetryService?.recordEvent('error', correlationId, { service: 'ai:sendMessage', error: 'No chat threads available' });
            throw new Error('No chat threads available');
        }
        targetChatId = chats[0].id;
    }

    // Get chat to retrieve its model if modelId not provided
    if (!modelId) {
        const chat = await chatRepository.getById(targetChatId);
        if (chat?.model) {
            selectedModel = chat.model;
        }
    }

    // Get message history for this chat
    const existingMessages = await messageRepository.listByChat(targetChatId);
    const history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = existingMessages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        }));

    try {
        telemetryService?.recordEvent('aiServiceStarted', correlationId, { conversationId: targetChatId });

        await messageRepository.create({
            chatId: targetChatId,
            role: 'user',
            content,
            attachments,
        });

        const aiStartTime = Date.now();
        const assistantMessage = await aiService.sendMessage({
            conversationId: targetChatId,
            content,
            history,
            model: selectedModel,
            telemetryService: systemTelemetryService,
            alertStore: alertStore,
        });
        const aiEndTime = Date.now();

        telemetryService?.recordEvent('openaiResponseReceived', correlationId, { duration: aiEndTime - aiStartTime });
        telemetryService?.recordEvent('aiServiceFinished', correlationId);

        await messageRepository.create({
            chatId: targetChatId,
            role: 'assistant',
            content: assistantMessage.content,
        });

        telemetryService?.recordEvent('ipcReplyDelivered', correlationId);
        return assistantMessage;
    } catch (error) {
        console.error('Failed to process ai:sendMessage', error);
        telemetryService?.recordEvent('error', correlationId, {
            service: 'ai:sendMessage',
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
});

ipcMain.handle('dashboard:getSummary', async () => {
    if (!dashboardService) {
        throw new Error('Dashboard service is not initialized');
    }
    return dashboardService.getSummary();
});

ipcMain.handle('chats:list', async () => {
    if (!chatRepository) {
        return [];
    }
    return chatRepository.listAll();
});

ipcMain.handle('messages:list', async (_event, chatId: string) => {
    if (!messageRepository) {
        return [];
    }
    const messages = await messageRepository.listByChat(chatId);
    // Parse attachments from JSON string
    return messages.map((msg) => ({
        ...msg,
        attachments: msg.attachments ? JSON.parse(msg.attachments as string) : undefined,
    }));
});

// Projects IPC handlers
ipcMain.handle('projects:list', async () => {
    if (!projectService) {
        return [];
    }
    return projectService.listAll();
});

ipcMain.handle('projects:get', async (_event, id: string) => {
    if (!projectService) {
        return null;
    }
    return projectService.getById(id);
});

ipcMain.handle('projects:create', async (_event, input: { name: string; description?: string; path?: string; color?: string }) => {
    if (!projectService) {
        throw new Error('Project service is not initialized');
    }
    return projectService.create(input);
});

ipcMain.handle('projects:update', async (_event, id: string, input: { name?: string; description?: string; path?: string; color?: string }) => {
    if (!projectService) {
        throw new Error('Project service is not initialized');
    }
    return projectService.update(id, input);
});

ipcMain.handle('projects:delete', async (_event, id: string) => {
    if (!projectService) {
        throw new Error('Project service is not initialized');
    }
    await projectService.delete(id);
});

ipcMain.handle('projects:linkChat', async (_event, chatId: string, projectId: string | null) => {
    if (!projectService) {
        throw new Error('Project service is not initialized');
    }
    await projectService.linkChatToProject(chatId, projectId);
});

// Notebook IPC handlers
ipcMain.handle('notebook:list', async (_event, filters?: { projectId?: string; type?: string; tags?: string[] }) => {
    if (!notebookService) {
        return [];
    }
    return notebookService.list(filters);
});

ipcMain.handle('notebook:get', async (_event, id: string) => {
    if (!notebookService) {
        return null;
    }
    return notebookService.getById(id);
});

ipcMain.handle('notebook:create', async (_event, input: { projectId?: string; type: string; title: string; content: string; tags?: string[]; scope?: string; pinned?: boolean }) => {
    if (!notebookService) {
        throw new Error('Notebook service is not initialized');
    }
    return notebookService.create(input);
});

ipcMain.handle('notebook:update', async (_event, id: string, input: { projectId?: string; type?: string; title?: string; content?: string; tags?: string[]; scope?: string; pinned?: boolean }) => {
    if (!notebookService) {
        throw new Error('Notebook service is not initialized');
    }
    return notebookService.update(id, input);
});

ipcMain.handle('notebook:delete', async (_event, id: string) => {
    if (!notebookService) {
        throw new Error('Notebook service is not initialized');
    }
    await notebookService.delete(id);
});

ipcMain.handle('notebook:deleteAll', async () => {
    if (!notebookService) {
        throw new Error('Notebook service is not initialized');
    }
    await notebookService.deleteAll();
});

ipcMain.handle('notebook:search', async (_event, query: string, projectId?: string) => {
    if (!notebookService) {
        return [];
    }
    return notebookService.search(query, projectId);
});

// Toolbox IPC handlers
ipcMain.handle('toolbox:listReports', async () => {
    if (!toolReportRepository) {
        return [];
    }
    return toolReportRepository.listRecent(20);
});

ipcMain.handle('toolbox:getReport', async (_event, id: string) => {
    if (!toolReportRepository) {
        return null;
    }
    return toolReportRepository.getById(id);
});

ipcMain.handle('toolbox:deleteReport', async (_event, id: string) => {
    if (!toolboxService) {
        throw new Error('Toolbox service is not initialized');
    }
    await toolboxService.deleteReport(id);
});

ipcMain.handle('toolbox:deleteAllReports', async () => {
    if (!toolboxService) {
        throw new Error('Toolbox service is not initialized');
    }
    await toolboxService.deleteAllReports();
});

ipcMain.handle('toolbox:run', async (_event, toolName: string, chatId?: string) => {
    const correlationId = randomUUID();
    const startTime = Date.now();
    telemetryService?.recordEvent('toolbox:started', correlationId, { toolName });

    if (!toolboxService) {
        telemetryService?.recordEvent('error', correlationId, { service: 'toolbox:run', error: 'Toolbox service not initialized' });
        throw new Error('Toolbox service is not initialized');
    }

    let report;
    try {
        switch (toolName) {
            case 'ProcessInspector':
                report = await toolboxService.runProcessInspector();
                break;
            case 'EventLogTriage':
                report = await toolboxService.runEventLogTriage();
                break;
            case 'NetworkCheck':
                report = await toolboxService.runNetworkCheck();
                break;
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }

        const duration = Date.now() - startTime;
        telemetryService?.recordEvent('toolbox:finished', correlationId, { toolName, duration, status: report.status });

        if (chatId && messageRepository) {
            const details = report.details ? JSON.parse(report.details as string) : {};
            await messageRepository.create({
                chatId,
                role: 'assistant',
                content: `I ran ${toolName}. ${report.summary || 'Tool execution completed.'}`,
                attachments: [{ type: 'toolReport', reportId: report.id, toolName, details }],
            });
        }

        return report;
    } catch (error) {
        const duration = Date.now() - startTime;
        telemetryService?.recordEvent('error', correlationId, {
            service: 'toolbox:run',
            toolName,
            duration,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
});

// Notifications IPC handlers
ipcMain.handle('notifications:list', async (_event, unreadOnly = false) => {
    if (!notificationRepository) {
        return [];
    }
    return unreadOnly ? notificationRepository.listUnread() : notificationRepository.listAll(50);
});

ipcMain.handle('notifications:markRead', async (_event, id: string) => {
    if (!notificationRepository) {
        throw new Error('Notification repository is not initialized');
    }
    await notificationRepository.markRead(id);
});

// System telemetry IPC handlers
ipcMain.handle('system:getTelemetry', async () => {
    if (!systemTelemetryService) {
        return null;
    }
    return systemTelemetryService.getSnapshot();
});

ipcMain.handle('system:getActiveAlert', async () => {
    if (!alertStore) {
        return null;
    }
    return alertStore.getActiveAlert();
});

ipcMain.handle('system:resolveAlert', async (_event, alertId: string) => {
    if (!alertStore) {
        throw new Error('Alert store is not initialized');
    }
    return alertStore.resolve(alertId);
});

// Debug IPC handlers (dev only)
if (process.env.NODE_ENV !== 'production') {
    ipcMain.handle('debug:getTimings', async (_event, limit = 50) => {
        if (!telemetryService) {
            return [];
        }
        return telemetryService.getTimings(limit);
    });

    ipcMain.handle('debug:getStats', async () => {
        if (!telemetryService) {
            return {
                averageAiResponseTime: 0,
                averageToolboxRunTime: {},
                errorCounts: {},
            };
        }
        return telemetryService.getStats();
    });
}
