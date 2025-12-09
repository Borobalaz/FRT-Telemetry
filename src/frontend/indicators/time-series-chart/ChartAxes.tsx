import { computeYTicks, TimeTick } from "./ChartHelpers";

// ChartAxes.tsx
interface ChartAxesProps {
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  yMin: number;
  yMax: number;
  timeTicks: TimeTick[];
  numYTicks?: number;
}

export function ChartAxes({
  width,
  height,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  yMin,
  yMax,
  timeTicks,
  numYTicks = 5
}: ChartAxesProps) {
  const yTicks = computeYTicks(yMin, yMax, numYTicks);
  return (
    <>
      {/* Axes lines */}
      <line
        x1={paddingLeft}
        y1={height - paddingBottom}
        x2={width - paddingRight}
        y2={height - paddingBottom}
        className="axis"
      />
      <line
        x1={paddingLeft}
        y1={paddingTop}
        x2={paddingLeft}
        y2={height - paddingBottom}
        className="axis"
      />

      {/* Y-axis ticks and labels */}
      {yTicks.map((tick, idx) => {
        // Map tick.value to SVG Y coordinate
        const y = paddingTop + ((yMax - tick.value) / (yMax - yMin)) * (height - paddingTop - paddingBottom);
        return (
          <g key={idx}>
            <line
              x1={paddingLeft - 4}
              x2={paddingLeft}
              y1={y}
              y2={y}
              className="axis-tick"
            />
            <text
              x={paddingLeft - 8}
              y={y + 4} // vertical center adjustment
              textAnchor="end"
              className="chart-label"
            >
              {tick.value.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Time axis (X) */}
      {timeTicks.map((t, idx) => (
        <g key={idx}>
          <line
            x1={t.x}
            y1={height - paddingBottom}
            x2={t.x}
            y2={height - paddingBottom + 5}
            className="axis-tick"
          />
          {idx > 0 && (
            <text
              x={t.x}
              y={height - paddingBottom + 18}
              textAnchor="middle"
              className="chart-label"
            >
              {(t.timestamp / 1000).toFixed(1)}s
            </text>
          )}
        </g>
      ))}
    </>
  );
}
