import { useRef } from "preact/hooks";
import { useRAF } from "../../../backend/time/UseRAF";
import { canSignals } from "../../../backend/signals/CANsignals";
import "./ScaleIndicator.css";

interface ScaleIndicatorProps {
  signalName: string;
  max?: number;
}

export function ScaleIndicator({ signalName, max = 100 }: ScaleIndicatorProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);

  // Stable RAF subscription
  useRAF(() => {
    const bar = barRef.current;
    const valueEl = valueRef.current;
    if (!bar || !valueEl) return;

    // Read live value from the CAN store
    const val = canSignals.get(signalName) ?? 0;
    const percent = Math.min(Math.max((val / max) * 100, 0), 100);

    // Imperative DOM updates
    bar.style.height = `${percent}%`;
    valueEl.textContent = val.toFixed(2);
  });

  return (
    <div className="scale-indicator">
      <div className="label">{signalName}</div>
      <div className="bar-container">
        <div ref={barRef} className="bar-fill" />
      </div>
      <div ref={valueRef} className="value" />
    </div>
  );
}
