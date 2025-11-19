import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let mainWindow: BrowserWindow | null = null;

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

    const startURL = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../build/index.html')}`;

    if (process.env.ELECTRON_START_URL) {
        mainWindow.loadURL(startURL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
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

// Placeholder for IPC handlers - to be implemented in Phase 2
ipcMain.handle('ai:sendMessage', async (event, ...args) => {
    console.log('ai:sendMessage called', args);
    return { role: 'assistant', content: 'Echo from main process' };
});
