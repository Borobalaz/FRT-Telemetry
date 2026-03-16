// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  app: {
    getRuntimeInfo: async () => ipcRenderer.invoke("app:get-runtime-info")
  },
  files: {
    openDBCFile: async () => ipcRenderer.invoke("dialog:open-dbc-file")
  }
});
