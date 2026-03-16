export interface RuntimeInfo {
  isDesktop: boolean;
  version: string;
  isPackaged: boolean;
}

export interface DesktopDBCFile {
  name: string;
  contents: string;
}

export interface ElectronAPI {
  app: {
    getRuntimeInfo(): Promise<RuntimeInfo>;
  };
  files: {
    openDBCFile(): Promise<DesktopDBCFile | null>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export { };