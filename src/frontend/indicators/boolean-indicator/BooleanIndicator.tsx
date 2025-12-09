import { useCANSignal } from "../../../backend/signals/UseCANSignal";

export function BooleanIndicator({ signalName }) {
  const val = useCANSignal(signalName);

  return (
    <div className="boolean-indicator" >
      {signalName} - {val ? "1" : "0"}
    </div>
  );
}
