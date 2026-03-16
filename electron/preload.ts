import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  app: {
    getRuntimeInfo: () => ipcRenderer.invoke('app:getRuntimeInfo'),
  },
  files: {
    openDBCFile: () => ipcRenderer.invoke('files:openDBCFile'),
  },
});
