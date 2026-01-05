import { useEffect, useRef } from "preact/hooks";
import {
  computeNormalizedPoints,
  downsamplePoints,
  pointsToSvg
} from "./ChartHelpers";
import { rafTicker } from "../../../backend/time/RAFTicker";
import { useCANSignalHistory } from "../../../backend/signals/UseCANSignalHistory";
import { useRAF } from "../../../backend/time/UseRAF";

interface SignalLineProps {
  sig: string;
  color: string;
  displayTime: number;
  chartTime: number;
  drawableWidth: number;
  height: number;
  paddingLeft: number;
  paddingTop: number;
  yMin: number;
  yMax: number;
  downsample: boolean;
}

export function SignalLine({
  sig,
  color,
  displayTime,
  chartTime,
  drawableWidth,
  height,
  paddingLeft,
  paddingTop,
  yMin,
  yMax,
  downsample
}: SignalLineProps) {
  const polylineRef = useRef<SVGPolylineElement>(null);

  // History pointer (direct reference to main CAN signal buffer)
  const historyRef = useCANSignalHistory(sig);

  useRAF(() => {
    const el = polylineRef.current;
    if (!el) return;

    // Compute normalized points and optionally downsample
    const points = computeNormalizedPoints(
      historyRef,
      drawableWidth,
      height,
      paddingLeft,
      paddingTop,
      yMin,
      yMax,
      displayTime,
      chartTime
    );

    const finalPoints = downsample
      ? downsamplePoints(points, 500)
      : points;

    // Imperative update of the SVG polyline points
    el.setAttribute("points", pointsToSvg(finalPoints));
  });

  // Render polyline only once
  return <polyline ref={polylineRef} className="chart-line" style={{ stroke: color }} />;
}
