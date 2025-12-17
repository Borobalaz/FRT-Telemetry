import { appLogger } from "../app-logger/AppLogger";

type OptionValue<T> = {
  value: T;
  min?: T;
  max?: T;
};
export type OptionFields = {
  refreshInterval: OptionValue<number>;
  maxHistory: OptionValue<number>;
  stringOption: OptionValue<string>,
  themeDark: OptionValue<boolean>;
  // maxChartTime: number;
};

type Listener = () => void;

export class Options {
  private fields: OptionFields = {
    refreshInterval: {value: 50, min: 20, max: 1000 },
    maxHistory: {value: 1000, min: 100, max: 10000 },
    themeDark: {value: true},
    stringOption: {value: "ASD"},
  };

  private listeners: Set<Listener> = new Set();

  /** Get a single option */
  getOption<K extends keyof OptionFields>(key: K): any {
    return this.fields[key].value;
  }

  /** Set an option (type-safe) */
  setOption<K extends keyof OptionFields>(key: K, value: any) {
    if(this.fields[key].min && this.fields[key].min > value) return;
    if(this.fields[key].max && this.fields[key].max < value) return;
    this.fields[key].value = value;
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
