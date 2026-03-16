// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  app: {
    getRuntimeInfo: async () => import_electron.ipcRenderer.invoke("app:get-runtime-info")
  },
  files: {
    openDBCFile: async () => import_electron.ipcRenderer.invoke("dialog:open-dbc-file")
  }
});
