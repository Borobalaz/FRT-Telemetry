import { useEffect } from "preact/hooks";
import { rafTicker } from "./RAFTicker";

/**
 * useRAF
 * Calls your callback once per animation frame before React/Preact render.
 * Automatically subscribes/unsubscribes to the global RAF loop.
 */
export function useRAF(callback: () => void) {
  useEffect(() => {
    // Subscribe to the global RAF ticker
    const unsubscribe = rafTicker.subscribe(() => {
      callback();
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [callback]);
}
