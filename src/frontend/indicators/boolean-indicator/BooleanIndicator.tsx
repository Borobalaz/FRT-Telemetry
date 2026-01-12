import { useRef } from "preact/hooks";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";
import { useRAF } from "../../../backend/time/UseRAF";
import { canSignals } from "../../../backend/signals/CANsignals";

interface BooleanIndicatorProps {
  signalName: string;
}

export function BooleanIndicator({ signalName }: BooleanIndicatorProps) {
  const valueRef = useRef<HTMLSpanElement>(null);


  useRAF(() => {
    const el = valueRef.current;
    if (!el) return;

    el.textContent = canSignals.get(signalName) ? "1" : "0";
  });

  return (
    <div className="boolean-indicator">
      {signalName} - <span ref={valueRef} />
    </div>
  );
}
