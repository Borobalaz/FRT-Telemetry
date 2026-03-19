import { appLogger } from "../app-logger/AppLogger";
import { appOptions } from "../options/Options";
import { HistoryEntry } from "./SignalHistory";

type Listener<T> = (value: T) => void;


export class CANSignals<T extends Record<string, any>> {
  private data: Partial<T> = {};
  private listeners: Map<keyof T, Set<Listener<any>>> = new Map();

  private history: Map<keyof T, HistoryEntry<any>[]> = new Map();
  private historyRefCounts: Map<keyof T, number> = new Map();

  subscribe<K extends keyof T>(key: K, callback: Listener<T[K]>): () => void {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(callback);

    const count = this.listeners.get(key)!.size;
    if (count > 10) {
      appLogger.warning(`⚠️ High listener count for signal "${String(key)}": ${count} listeners`);
    }

    return () => {
      const keyListeners = this.listeners.get(key);
      if (!keyListeners) return;
      keyListeners.delete(callback);
      if (keyListeners.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  enableHistoryForSignal<K extends keyof T>(key: K) {
    const currentRefCount = this.historyRefCounts.get(key) ?? 0;
    this.historyRefCounts.set(key, currentRefCount + 1);

    if (!this.history.has(key)) {
      this.history.set(key, []);
    }
  }

  disableHistoryForSignal<K extends keyof T>(key: K) {
    const currentRefCount = this.historyRefCounts.get(key) ?? 0;
    if (currentRefCount <= 1) {
      this.historyRefCounts.delete(key);
      this.history.delete(key);
      return;
    }

    this.historyRefCounts.set(key, currentRefCount - 1);
  }

  getHistory<K extends keyof T>(key: K): HistoryEntry<T[K]>[] {
    return (this.history.get(key) ?? []) as HistoryEntry<T[K]>[];
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.data[key];
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.data[key] = value;

    if ((this.historyRefCounts.get(key) ?? 0) > 0) {
      const arr = this.history.get(key) ?? [];
      if (!this.history.has(key)) {
        this.history.set(key, arr);
      }

      arr.push({
        timestamp: performance.now(), // high-resolution timestamp
        value
      });

      const configuredMaxHistory = appOptions.getOption("maxHistory");
      const maxHistory = Number.isFinite(configuredMaxHistory)
        ? Math.max(1, Math.floor(configuredMaxHistory))
        : 1000;

      while (arr.length > maxHistory) {
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

  getHistoryRefCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.historyRefCounts.forEach((count, key) => {
      counts[String(key)] = count;
    });
    return counts;
  }

  reset() {
    this.data = {};
    this.listeners.clear();
    this.history.clear();
    this.historyRefCounts.clear();
  }
}

export const canSignals = new CANSignals<Record<string, any>>();
