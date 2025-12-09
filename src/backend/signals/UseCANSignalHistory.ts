import { useEffect, useState } from "preact/hooks";
import { canSignals } from "./CANsignals";

export function useCANSignalHistory(
  signalName: string,
  startTime: number,
  endTime: number
) {
  const [history, setHistory] = useState(() =>
    canSignals.getHistory(signalName).filter(
      (entry) => entry.timestamp >= startTime && entry.timestamp <= endTime
    )
  );

  useEffect(() => {
    canSignals.enableHistoryForSignal(signalName);

    const update = () => {
      const data = canSignals
        .getHistory(signalName)
        .filter((entry) => entry.timestamp >= startTime && entry.timestamp <= endTime);
      setHistory(data);
    };

    // Subscribe to new signal values
    const unsubscribe = canSignals.subscribe(signalName, update);

    // Also update immediately in case startTime / endTime changed
    update();

    return () => unsubscribe();
  }, [signalName, startTime, endTime]);

  return history;
}
