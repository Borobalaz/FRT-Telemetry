import { Dbc } from "candied";
import { dbcReader } from "candied/lib/filesystem/DbcWebFs";
import { canSignals } from "../signals/CANsignals";
import { appLogger } from "../app-logger/AppLogger";
import { Message, Signal } from "candied/lib/dbc/Dbc";

export interface IDBCManager {
  loadDBCFromString(contents: string, fileName: string): void;
  loadDBCFile(file: File): Promise<void>;
  isReady(): boolean;
  getMessages(): any[];
  getMessageById(id: number): any | null;
  getAllSignals(): any[];
  processCANFrame(id: number, data: Uint8Array): void;
  getSignalNames(): string[];
  printSummary(): void;
}

interface LoadedDBC {
  fileName: string;
  dbc: Dbc;
}

export class DBCManager implements IDBCManager {
  private dbcs: LoadedDBC[] = [];

  // -----------------------------------------------------
  //  Loaders
  // -----------------------------------------------------

  loadDBCFromString(contents: string, fileName: string): void {
    const dbc = new Dbc();
    dbc.load(contents);

    this.dbcs.push({ fileName, dbc });
  }

  async loadDBCFile(file: File): Promise<void> {
    const dbc = new Dbc();

    return new Promise<void>((resolve, reject) => {
      dbcReader(file, (fileContent: string) => {
        try {
          dbc.load(fileContent);

          this.dbcs.push({ fileName: file.name, dbc });
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
      const msg = dbc.getMessageById(id);
      if (msg) return msg;
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
  // -----------------------------------------------------
  //  CAN Decoding
  // -----------------------------------------------------

  processCANFrame(id: number, data: Uint8Array): void {
    const msg = this.getMessageById(id);
    if (!msg) return;

    // Candied decode
    const decoded = msg.decode(data);

    Object.entries(decoded).forEach(([signalName, value]) => {
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