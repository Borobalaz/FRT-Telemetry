
export type LogLevel = "debug" | "info" | "warning" | "error";

export class LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: Date;

  constructor(level: LogLevel, message: string) {
    this.level = level;
    this.message = message;
    this.timestamp = new Date();
  }

  toString(): string {
    return `[${this.timestamp.toISOString()}] [${this.level.toUpperCase()}] ${this.message}`;
  }
}

class AppLogger {
  private entries: LogEntry[] = [];
  private readonly maxEntries = 1000;
  private listeners: Set<() => void> = new Set();

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // --- Add a new log entry ---
  private add(level: LogLevel, message: string) {
    const entry = new LogEntry(level, message);
    this.entries.push(entry);

    while (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    this.notify();
    return entry;
  }

  // --- Public logging methods ---
  debug(message: string) {
    return this.add("debug", message);
  }

  info(message: string) {
    return this.add("info", message);
  }

  warning(message: string) {
    return this.add("warning", message);
  }

  error(message: string) {
    return this.add("error", message);
  }

  getAll(): LogEntry[] {
    return [...this.entries]; // return a copy
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  getLast(): LogEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  count(): number {
    return this.entries.length;
  }

  countLevel(level: LogLevel): number {
    return this.entries.filter((e) => e.level === level).length;
  }

  clear() {
    this.entries = [];
    this.notify();
  }
}

export const appLogger: AppLogger = new AppLogger(); 