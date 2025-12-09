import { useEffect, useState } from "preact/hooks";
import { appOptions, type OptionFields } from "../../../backend/options/Options";
import "./Settings.css";

export function Settings() {
  const [options, setOptions] = useState<OptionFields>(appOptions.getAll());

  // Re-render when options are updated externally
  useEffect(() => {
    const unsubscribe = appOptions.subscribe(() => {
      setOptions({ ...appOptions.getAll() });
    });
    return unsubscribe;
  }, []);

  // Handle updates
  const update = <K extends keyof OptionFields>(key: K, value: OptionFields[K]) => {
    appOptions.setOption(key, value);
  };

  return (
    <div className="settings">
      <div className="settings-list">
        {Object.entries(options).map(([key, value]) => {
          const typedKey = key as keyof OptionFields;

          return (
            <div className="setting-row" key={key}>
              <label className="setting-label">{key}</label>

              {/* Pick input type based on field type */}
              {typeof value === "number" && (
                <input
                  className="setting-input"
                  type="number"
                  value={value}
                  onInput={(e) => update(typedKey, Number((e.target as HTMLInputElement).value))}
                />
              )}

              {typeof value === "boolean" && (
                <input
                  type="checkbox"
                  checked={value}
                  onInput={(e) => update(typedKey, (e.target as HTMLInputElement).checked)}
                />
              )}

              {typeof value === "string" && (
                <input
                  className="setting-input"
                  type="text"
                  value={value}
                  onInput={(e) => update(typedKey, (e.target as HTMLInputElement).value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
