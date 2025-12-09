import { useCANSignal } from "../../../backend/signals/UseCANSignal";
import "./NumericIndicator.css"

export function NumericIndicator({ signalName }) {
  const val = useCANSignal(signalName);

  return (
    <div className="numeric-indicator">
      {signalName} - {val.toFixed(2)}
    </div>
  );
}