import { useEffect, useState, useRef } from "preact/hooks";
import { canSignals } from "./CANsignals";

/**
 * Hook: returns the rolling history for a CAN signal constrained to [startTime, endTime].
 *
 * Reason for implementation:
 *  - We subscribe once per signal (effect depends on signalName) to avoid churn.
 *  - We store the moving time window in a ref so the subscriber callback always
 *    uses the latest start/end values (avoids stale-closure filtering that ignored
 *    newly arriving entries).
 */
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

  // Keep a ref of the latest time window so the subscriber's closure always
  // uses current values instead of the values captured when the effect ran.
  const timeWindowRef = useRef({ startTime, endTime });
  timeWindowRef.current = { startTime, endTime };

  useEffect(() => {
    // Ensure history is enabled for this signal
    canSignals.enableHistoryForSignal(signalName);

    // Subscriber uses the ref to get the current window when new values arrive
    const update = () => {
      const { startTime: s, endTime: e } = timeWindowRef.current;
      const data = canSignals
        .getHistory(signalName)
        .filter((entry) => entry.timestamp >= s && entry.timestamp <= e);
      setHistory(data);
    };

    // Subscribe to new signal values; unsubscribe when signalName changes
    const unsubscribe = canSignals.subscribe(signalName, update);

    // Run an immediate update to populate history for the current window
    update();

    return () => unsubscribe();
  }, [signalName]);

  return history;
}
