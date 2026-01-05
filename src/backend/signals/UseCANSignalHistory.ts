import { useEffect, useRef } from "preact/hooks";
import { canSignals } from "./CANsignals";
import { HistoryEntry } from "./SignalHistory";

/**
 * Returns a ref pointing to the main CAN signal history buffer.
 * Does NOT allocate new arrays or trigger re-renders.
 */
export function useCANSignalHistory(
  signalName: string
): HistoryEntry<any>[] {
  const historyRef = useRef<HistoryEntry<any>[]>([]);

  useEffect(() => {
    canSignals.enableHistoryForSignal(signalName);

    historyRef.current = canSignals.getHistory(signalName);
    
    return () => {};
  }, [signalName]);

  return historyRef.current;
}
