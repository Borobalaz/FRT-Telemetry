import { appLogger } from "../app-logger/AppLogger";

export type OptionFields = {
  refreshInterval: number;
  maxHistory: number;
  stringOption: string,
  themeDark: boolean;
  // maxChartTime: number;
};

type Listener = () => void;

export class Options {
  private fields: OptionFields = {
    refreshInterval: 100,
    maxHistory: 10_000,
    themeDark: true,
    stringOption: "ASD",
  };

  private listeners: Set<Listener> = new Set();

  /** Get a single option */
  getOption<K extends keyof OptionFields>(key: K): OptionFields[K] {
    return this.fields[key];
  }

  /** Set an option (type-safe) */
  setOption<K extends keyof OptionFields>(key: K, value: OptionFields[K]) {
    this.fields[key] = value;
    this.notify();
    appLogger.info(`${key} option changed to ${value}`);
  }

  /** Get all options (for Settings UI) */
  getAll(): OptionFields {
    return this.fields;
  }

  /** Subscribe to option changes */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Notify all listeners */
  private notify() {
    for (const l of this.listeners) l();
  }
}

export const appOptions = new Options();
