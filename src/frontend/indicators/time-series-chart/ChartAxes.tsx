import { useRef } from "preact/hooks";
import { computeYTicks, TimeTick } from "./ChartHelpers";
import { useRAF } from "../../../backend/time/UseRAF";

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
}: ChartAxesProps) {
  const groupRef = useRef<SVGGElement>(null);
  const numTicks = 5;

  // Refs for tick text elements
  const yTickTexts = Array.from({ length: numTicks }, () => useRef<SVGTextElement>(null!));
  const xTickTexts = Array.from({ length: numTicks }, () => useRef<SVGTextElement>(null!));

  // Update tick labels every animation frame
  useRAF(() => {
    const yTicks = computeYTicks(yMin, yMax, numTicks);

    // Y-axis ticks
    yTicks.forEach((tick, idx) => {
      const y = paddingTop + ((yMax - tick.value) / (yMax - yMin)) * (height - paddingTop - paddingBottom);
      const text = yTickTexts[idx].current;
      if (text) {
        text.setAttribute("x", (paddingLeft - 8).toString());
        text.setAttribute("y", (y + 4).toString());
        text.textContent = tick.value.toFixed(1);
      }
    });

    // X-axis ticks: pick 5 evenly spaced timeTicks
    if (timeTicks.length) {
      const step = Math.floor(timeTicks.length / numTicks);
      for (let i = 0; i < numTicks; i++) {
        const idx = Math.min(i * step, timeTicks.length - 1);
        const t = timeTicks[idx];
        const text = xTickTexts[i].current;
        if (text) {
          text.setAttribute("x", t.x.toString());
          text.setAttribute("y", (height - paddingBottom + 18).toString());
          text.textContent = (t.timestamp / 1000).toFixed(1) + "s";
        }
      }
    }
  });

  return (
    <g ref={groupRef}>
      {/* Y ticks */}
      {Array.from({ length: numTicks }, (_, i) => (
        <g key={`y-${i}`}>
          <line
            x1={paddingLeft - 4}
            x2={paddingLeft}
            y1={0} // lines are static; label positions handled imperatively
            y2={0}
            class="axis-tick"
          />
          <text ref={yTickTexts[i]} class="chart-label" text-anchor="end" />
        </g>
      ))}

      {/* X ticks */}
      {Array.from({ length: numTicks }, (_, i) => (
        <g key={`x-${i}`}>
          <line
            x1={0} // line position static; tick label moves imperatively
            x2={0}
            y1={height - paddingBottom}
            y2={height - paddingBottom + 5}
            class="axis-tick"
          />
          <text ref={xTickTexts[i]} class="chart-label" text-anchor="middle" />
        </g>
      ))}

      {/* Axis lines */}
      <line
        x1={paddingLeft}
        y1={height - paddingBottom}
        x2={width - paddingRight}
        y2={height - paddingBottom}
        class="axis"
      />
      <line
        x1={paddingLeft}
        y1={paddingTop}
        x2={paddingLeft}
        y2={height - paddingBottom}
        class="axis"
      />
    </g>
  );
}
