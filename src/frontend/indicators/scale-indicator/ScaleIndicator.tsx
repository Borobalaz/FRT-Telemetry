import "./ScaleIndicator.css";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";

export function ScaleIndicator({ signalName, max = 100 }) {
  const val = useCANSignal(signalName);
  const percent = Math.min(Math.max((val / max) * 100, 0), 100);

  return (
    <div className="scale-indicator">
      <div className="label">{signalName}</div>
      <div className="bar-container">
        <div
          className="bar-fill"
          style={{ height: `${percent}%` }}
        ></div>
      </div>
      <div className="value">{val.toFixed(2)}</div>
    </div>
  );
}
