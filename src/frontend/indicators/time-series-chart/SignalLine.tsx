import { useCANSignalHistory } from "../../../backend/signals/UseCANSignalHistory";
import { computeNormalizedPoints, downsamplePoints, pointsToSvg } from "./ChartHelpers";
import { useMemo } from "preact/hooks";

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
}: {
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
}) {
  const hist = useCANSignalHistory(
    sig,
    displayTime - chartTime,
    displayTime
  );

  const pointsString = useMemo(() => {
    const points = computeNormalizedPoints(
      hist,
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
      ? downsamplePoints(points, 200)
      : points;

    return pointsToSvg(finalPoints);
  }, [hist, drawableWidth, height, paddingLeft, paddingTop, yMin, yMax, displayTime, chartTime, downsample]);

  return (
    <polyline
      points={pointsString}
      className="chart-line"
      style={{ stroke: color }}
    />
  );
}
