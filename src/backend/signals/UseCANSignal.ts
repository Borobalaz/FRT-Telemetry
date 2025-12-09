import { useState, useEffect } from "react";
import { canSignals } from "./CANsignals";

export function useCANSignal<K extends string>(key: K) {
  const [value, setValue] = useState(() => canSignals.get(key));

  useEffect(() => {
    const unsubscribe = canSignals.subscribe(key, setValue);
    return unsubscribe;
  }, [key]);

  return value;
}
