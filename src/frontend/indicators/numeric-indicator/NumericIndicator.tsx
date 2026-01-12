import { useRef } from "preact/hooks";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";
import { useRAF } from "../../../backend/time/UseRAF";
import "./NumericIndicator.css";
import { canSignals } from "../../../backend/signals/CANsignals";

interface NumericIndicatorProps {
  signalName: string;
}

export function NumericIndicator({ signalName }: NumericIndicatorProps) {
  const valueRef = useRef<HTMLSpanElement>(null);

  useRAF(() => {
    const el = valueRef.current;
    if (!el) return;

    el.textContent = canSignals.get(signalName)?.toFixed(2);
  });

  return (
    <div className="numeric-indicator">
      {signalName} - <span ref={valueRef} />
    </div>
  );
}
