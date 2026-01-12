import { useEffect, useRef } from "preact/hooks";
import { rafTicker } from "./RAFTicker";

/**
 * useRAF
 * Calls your callback once per animation frame before React/Preact render.
 * Automatically subscribes/unsubscribes to the global RAF loop.
 */
export function useRAF(callback: () => void) {
  const cbRef = useRef(callback);
  cbRef.current = callback; // always point to latest callback

  useEffect(() => {
    const unsubscribe = rafTicker.subscribe(() => {
      cbRef.current();
    });
    return unsubscribe; // only one subscription
  }, []); // no dependencies
}
