import { Can, Dbc } from "candied";
import { dbcReader } from "candied/lib/filesystem/DbcWebFs";
import { canSignals } from "../signals/CANsignals";
import { appLogger } from "../app-logger/AppLogger";
import { Message, Signal } from "candied/lib/dbc/Dbc";

type DBCsChangedListener = () => void;

export interface DecodedCANFrame {
  fileName: string;
  decodedSignals: Record<string, unknown>;
}

export interface IDBCManager {
  loadDBCFromString(contents: string, fileName: string): void;
  loadDBCFile(file: File): Promise<void>;
  isReady(): boolean;
  getMessages(): any[];
  getMessageById(id: number): any | null;
  getAllSignals(): any[];
  decodeCANFrame(id: number, data: Uint8Array): DecodedCANFrame | null;
  processCANFrame(id: number, data: Uint8Array): void;
  getSignalNames(): string[];
  getLoadedFileNames(): string[];
  subscribeLoadedDBCs(listener: DBCsChangedListener): () => void;
  printSummary(): void;
}

interface LoadedDBC {
  fileName: string;
  dbc: Dbc;
  can: Can;
}

export class DBCManager implements IDBCManager {
  private dbcs: LoadedDBC[] = [];
  private dbcsChangedListeners: Set<DBCsChangedListener> = new Set();

  private notifyDBCsChanged() {
    for (const listener of this.dbcsChangedListeners) {
      listener();
    }
  }

  // -----------------------------------------------------
  //  Loaders
  // -----------------------------------------------------

  loadDBCFromString(contents: string, fileName: string): void {
    const dbc = new Dbc();
    dbc.load(contents);
    const can = new Can();
    can.database = dbc.data;

    this.dbcs.push({ fileName, dbc, can });
    this.notifyDBCsChanged();
  }

  async loadDBCFile(file: File): Promise<void> {
    const dbc = new Dbc();

    return new Promise<void>((resolve, reject) => {
      dbcReader(file, (fileContent: string) => {
        try {
          dbc.load(fileContent);
          const can = new Can();
          can.database = dbc.data;

          this.dbcs.push({ fileName: file.name, dbc, can });
          this.notifyDBCsChanged();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  removeDBC(name: string) {
    this.dbcs = this.dbcs.filter(entry => entry.fileName !== name);
    appLogger.info(`Deleted DBC: ${name}`);
    this.notifyDBCsChanged();
  }

  // -----------------------------------------------------
  //  Queries
  // -----------------------------------------------------

  isReady(): boolean {
    return this.dbcs.length > 0;
  }

  getMessages(): Message[] {
    const result: any[] = [];
    for (const { dbc } of this.dbcs) {
      for (const msg of dbc.data.messages) {
        result.push(msg);
      }
    }
    return result;
  }

  getMessageById(id: number): any | null {
    for (const { dbc } of this.dbcs) {
      try {
        const msg = dbc.getMessageById(id);
        if (msg) return msg;
      } catch {
        // Ignore missing IDs in this DBC and try the next one.
      }
    }
    return null;
  }

  getAllSignals(): Signal[] {
    const signals: Signal[] = [];
    for (const msg of this.getMessages()) {
      msg[1].signals.forEach(element => {
        signals.push(element)   // THERE COULD BE MULTIPLES WHEN MORE DBCs ARE LOADED
      });
    }
    return signals;
  }

  getSignalNames(): string[] {
    return this.getAllSignals().map(sig => sig.name);
  }

  getLoadedFileNames(): string[] {
    return this.dbcs.map(d => d.fileName);
  }

  subscribeLoadedDBCs(listener: DBCsChangedListener): () => void {
    this.dbcsChangedListeners.add(listener);
    return () => {
      this.dbcsChangedListeners.delete(listener);
    };
  }
  // -----------------------------------------------------
  //  CAN Decoding
  // -----------------------------------------------------

  decodeCANFrame(id: number, data: Uint8Array): DecodedCANFrame | null {
    const frame = {
      id,
      dlc: data.length,
      isExtended: false,
      payload: Array.from(data),
    };

    for (const { fileName, can } of this.dbcs) {
      const decoded = can.decode(frame);
      if (!decoded) {
        continue;
      }

      const decodedSignals: Record<string, unknown> = {};
      for (const [signalName, signal] of decoded.boundSignals) {
        decodedSignals[signalName] = signal.value;
      }

      return { fileName, decodedSignals };
    }

    return null;
  }

  processCANFrame(id: number, data: Uint8Array): void {
    const decodedFrame = this.decodeCANFrame(id, data);
    if (!decodedFrame) return;

    Object.entries(decodedFrame.decodedSignals).forEach(([signalName, value]) => {
      canSignals.set(signalName, value);
    });
  }

  // -----------------------------------------------------
  //  Logging / Debugging
  // -----------------------------------------------------

  printSummary(): void {
    appLogger.info("=== DBC Summary ===");
    appLogger.info(`Loaded DBC files: ${this.dbcs.map(d => d.fileName)}`);
    appLogger.info(`Messages: ${this.getMessages().length}`);
    appLogger.info(`Signals: ${this.getAllSignals().length}`);
  }
}

export const dbcManager = new DBCManager(); 