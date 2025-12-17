import { appLogger } from "../app-logger/AppLogger";
import { appOptions } from "../options/Options";
import { HistoryEntry } from "./SignalHistory";

type Listener<T> = (value: T) => void;


class CANSignals<T extends Record<string, any>> {
  private data: Partial<T> = {};
  private listeners: Map<keyof T, Set<Listener<any>>> = new Map();

  private history: Map<keyof T, HistoryEntry<any>[]> = new Map();
  private historySubscribers: Set<keyof T> = new Set();

  subscribe<K extends keyof T>(key: K, callback: Listener<T[K]>): () => void {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(callback);

    // Debug: log listener count
    const count = this.listeners.get(key)!.size;
    console.warn(`${count} listeners`);

    if (count > 10) {
      appLogger.warning(`⚠️ High listener count for signal "${String(key)}": ${count} listeners`);
    }

    return () => {
      this.listeners.get(key)!.delete(callback);
    };
  }

  enableHistoryForSignal<K extends keyof T>(key: K) {
    if (!this.historySubscribers.has(key)) {
      this.historySubscribers.add(key);
      if (!this.history.has(key)) {
        this.history.set(key, []);
      }
    }
  }

  getHistory<K extends keyof T>(key: K): HistoryEntry<T[K]>[] {
    return (this.history.get(key) ?? []) as HistoryEntry<T[K]>[];
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.data[key];
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.data[key] = value;

    if (this.historySubscribers.has(key)) {
      const arr = this.history.get(key)!;
      arr.push({
        timestamp: performance.now(), // high-resolution timestamp
        value
      });

      if (arr.length > appOptions.getOption("maxHistory")) {
        arr.shift();
      }
    }

    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((cb) => cb(value));
    }
  }

  // Debug helper: get listener counts
  getListenerCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.listeners.forEach((set, key) => {
      counts[String(key)] = set.size;
    });
    return counts;
  }
}

export const canSignals = new CANSignals<Record<string, any>>();
