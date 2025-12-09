import { useEffect, useState } from "preact/hooks";
import { appOptions } from "../options/Options";

export function useTick() {
  const [currentTime, setCurrentTime] = useState(performance.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(performance.now());
    }, appOptions.getOption("refreshInterval"));

    return () => clearInterval(interval);
  }, []);

  return currentTime;
}
