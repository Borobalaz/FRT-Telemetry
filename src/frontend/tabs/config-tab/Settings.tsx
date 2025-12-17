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
  const update = <K extends keyof OptionFields>(key: K, value: any) => {
    appOptions.setOption(key, value);
  };

  return (
    <div className="settings">
      <div className="settings-list">
        {Object.entries(options).map(([key, option]) => {
          const typedKey = key as keyof OptionFields;

          return (
            <div className="setting-row" key={key}>
              <label className="setting-label">{key}</label>

              {/* Pick input type based on field type */}
              {typeof option.value === "number" && (
                <input
                  className="setting-input"
                  type="number"
                  value={option.value}
                  onInput={(e) => update(typedKey, (e.target as HTMLInputElement).valueAsNumber)}
                />
              )}

              {typeof option.value === "boolean" && (
                <input
                  type="checkbox"
                  checked={option.value}
                  onInput={(e) => update(typedKey, (e.target as HTMLInputElement).checked)}
                />
              )}

              {typeof option.value === "string" && (
                <input
                  className="setting-input"
                  type="text"
                  value={option.value}
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
