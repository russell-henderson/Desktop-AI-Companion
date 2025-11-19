// src/main/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
require('dotenv').config(); // Loads .env file

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,  // Keep this false for security
      contextIsolation: true,  // Recommended for security
      preload: path.join(__dirname, 'preload.js') // If you need to use preload scripts
    },
  });

  // Load local React dev server or production build
  const startURL = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../../build/index.html')}`;
  mainWindow.loadURL(startURL);

  // Open DevTools (optional)
  // mainWindow.webContents.openDevTools();
}

// Called when Electron has finished initialization
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});