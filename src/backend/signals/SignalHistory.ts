type SignalHistoryMap = Record<string, number[]>;

export interface HistoryEntry<T> {
  timestamp: number;
  value: T;
}

// DEPRECATED

//class SignalHistory {
//  private history: SignalHistoryMap = {};
//  private maxPoints = 500;
//
//  // Add a new value to a signal
//  add(signalName: string, value: number) {
//    if (!this.history[signalName]) this.history[signalName] = [];
//    this.history[signalName].push(value);
//    if (this.history[signalName].length > this.maxPoints) {
//      this.history[signalName].shift();
//    }
//  }
//
//  // Get the rolling history for a signal
//  get(signalName: string): number[] {
//    return this.history[signalName] || [];
//  }
//
//  // Optional: reset a signal's history
//  reset(signalName: string) {
//    this.history[signalName] = [];
//  }
//
//  // Optional: reset all histories
//  resetAll() {
//    this.history = {};
//  }
//}
//
//// Singleton
//export const signalHistory = new SignalHistory();
