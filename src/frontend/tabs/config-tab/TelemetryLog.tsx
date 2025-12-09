import { useState, useEffect } from "preact/hooks";
import { appLogger, LogEntry, LogLevel } from "../../../backend/app-logger/AppLogger";
import "./TelemetryLog.css";
import { IconButton } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';

const LEVELS: LogLevel[] = ["debug", "info", "warning", "error"];

export function TelemetryLog() {
  const [visibleLevels, setVisibleLevels] = useState<Set<LogLevel>>(
    new Set(LEVELS)
  );
  const [entries, setEntries] = useState<LogEntry[]>([]);

  // Poll logger every 300ms to stay in sync
  useEffect(() => {
    const interval = setInterval(() => {
      setEntries(appLogger.getAll());
    }, 300);

    return () => clearInterval(interval);
  }, []);

  function toggleLevel(level: LogLevel) {
    const newLevels = new Set(visibleLevels);
    if (newLevels.has(level)) newLevels.delete(level);
    else newLevels.add(level);
    setVisibleLevels(newLevels);
  }

  const filtered = entries.filter((e) => visibleLevels.has(e.level));

  return (
    <div className="telemetry-log">
      <div className="log-header">
        <div className="log-filters">
          {LEVELS.map((level) => (
            <label className="log-filter" key={level}>
              <input
                type="checkbox"
                checked={visibleLevels.has(level)}
                onInput={() => toggleLevel(level)}
              />
              {level}
            </label>
          ))}
        </div>
        <IconButton className="clear-log-button"
          onClick={() => appLogger.clear()}>
          <ClearIcon htmlColor="white" />
        </IconButton>
      </div>

      <div className="log-entries">
        {filtered.length === 0 && (
          <div className="log-empty">No entries to display.</div>
        )}

        {filtered.map((entry, i) => (
          <div className={`log-entry ${entry.level}`} key={i}>
            <span className="log-timestamp">
              {entry.timestamp.toLocaleTimeString()}
            </span>
            <span className="log-level">{entry.level.toUpperCase()}</span>
            <span className="log-message">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
