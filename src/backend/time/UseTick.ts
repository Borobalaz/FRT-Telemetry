import { useEffect, useState, useMemo } from "preact/hooks";
import { appOptions } from "../options/Options";

export function useTick() {
  const [currentTime, setCurrentTime] = useState(performance.now());

  const refreshInterval = useMemo(
    () => appOptions.getOption("refreshInterval"),
    [] // Options don't change frequently; if they do, you can add a dependency
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(performance.now());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return currentTime;
}
