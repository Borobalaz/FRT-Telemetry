// electron/main.ts
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var rendererDist = path.resolve(__dirname, "../dist");
var preloadPath = path.join(__dirname, "preload.cjs");
var maxDBCFileSizeBytes = 10 * 1024 * 1024;
var mainWindow = null;
async function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("Renderer failed to load", { errorCode, errorDescription, validatedURL });
  });
  await mainWindow.loadFile(path.join(rendererDist, "index.html"));
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}
ipcMain.handle("app:get-runtime-info", () => ({
  isDesktop: true,
  version: app.getVersion(),
  isPackaged: app.isPackaged
}));
ipcMain.handle("dialog:open-dbc-file", async () => {
  const window = BrowserWindow.getFocusedWindow() ?? mainWindow;
  const { canceled, filePaths } = await dialog.showOpenDialog(window ?? void 0, {
    properties: ["openFile"],
    filters: [{ name: "DBC Files", extensions: ["dbc"] }]
  });
  if (canceled || filePaths.length === 0) {
    return null;
  }
  const filePath = filePaths[0];
  const stats = await fs.stat(filePath);
  if (stats.size > maxDBCFileSizeBytes) {
    throw new Error("Selected DBC file is too large.");
  }
  const contents = await fs.readFile(filePath, "utf8");
  return {
    name: path.basename(filePath),
    contents
  };
});
app.whenReady().then(async () => {
  await createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
