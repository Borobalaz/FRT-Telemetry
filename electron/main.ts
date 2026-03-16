import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const rendererPath = join(__dirname, '..', 'dist', 'index.html');
  mainWindow.loadFile(rendererPath);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('app:getRuntimeInfo', () => {
  return {
    isDesktop: true,
    version: app.getVersion(),
    isPackaged: app.isPackaged,
  };
});

ipcMain.handle('files:openDBCFile', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Open DBC File',
    filters: [{ name: 'DBC Files', extensions: ['dbc'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const contents = readFileSync(filePath, 'utf-8');
  const name = filePath.split(/[\\/]/).pop() ?? filePath;

  return { name, contents };
});
