import { JSX } from "preact/jsx-runtime";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";
import "./Plot2D.css";

interface Plot2DProps {
  xSignalName: string;
  ySignalName: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  style?: JSX.IntrinsicElements["div"]["style"];
}

export function Plot2D({ xSignalName, ySignalName, minX, maxX, minY, maxY, style }: Plot2DProps) {
  const xVal = useCANSignal(xSignalName) ?? 0;
  const yVal = useCANSignal(ySignalName) ?? 0;

  const normX = (xVal - minX) / (maxX - minX);
  const normY = (yVal - minY) / (maxY - minY);

  const clampedX = Math.min(Math.max(normX, 0), 1);
  const clampedY = Math.min(Math.max(normY, 0), 1);

  return (
    <div className="two-d-plot-wrapper" style={style}>
      <div className="two-d-plot">

        {/* Point */}
        <div
          className="plot-point"
          style={{
            left: `${clampedX * 100}%`,
            top: `${(1 - clampedY) * 100}%`,
          }}
        />

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
