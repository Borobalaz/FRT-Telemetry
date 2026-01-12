import { JSX } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";
import { useRAF } from "../../../backend/time/UseRAF";
import "./Plot2D.css";
import { canSignals } from "../../../backend/signals/CANsignals";

interface Plot2DProps {
  xSignalName: string;
  ySignalName: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  style?: JSX.IntrinsicElements["div"]["style"];
}

export function Plot2D({
  xSignalName,
  ySignalName,
  minX,
  maxX,
  minY,
  maxY,
  style,
}: Plot2DProps) {
  const pointRef = useRef<HTMLDivElement>(null);

  useRAF(() => {
    const el = pointRef.current;
    if (!el) return;

    const normX = (canSignals.get(xSignalName) - minX) / (maxX - minX);
    const normY = (canSignals.get(ySignalName) - minY) / (maxY - minY);

    const clampedX = Math.min(Math.max(normX, 0), 1);
    const clampedY = Math.min(Math.max(normY, 0), 1);

    el.style.left = `${clampedX * 100}%`;
    el.style.top = `${(1 - clampedY) * 100}%`;
  });

  return (
    <div className="two-d-plot-wrapper" style={style}>
      <div className="two-d-plot">
        {/* Point (moves imperatively) */}
        <div ref={pointRef} className="plot-point" />

        {/* Corner labels */}
        <div className="corner top">
          <div className="top-left">({minX}, {maxY})</div>
          <div className="top-right">({maxX}, {maxY})</div>
        </div>
        <div className="corner bottom">
          <div className="bottom-left">({minX}, {minY})</div>
          <div className="bottom-right">({maxX}, {minY})</div>
        </div>

        {/* Axis labels */}
        <div className="axis-label x-label">{xSignalName}</div>
        <div className="axis-label y-label">{ySignalName}</div>
      </div>
    </div>
  );
}
