
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

  // --- Add a new log entry ---
  private add(level: LogLevel, message: string) {
    const entry = new LogEntry(level, message);
    this.entries.push(entry);
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
  }
}

export const appLogger: AppLogger = new AppLogger(); 