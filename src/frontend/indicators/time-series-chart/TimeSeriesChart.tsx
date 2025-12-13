import { useEffect, useRef, useState, useMemo } from "preact/hooks";
import { useCANSignalHistory } from "../../../backend/signals/UseCANSignalHistory";
import {
  computeNormalizedPoints,
  computeTimeTicks,
  pointsToSvg,
  computeHorizontalGridLines,
  downsamplePoints
} from "./ChartHelpers";

import { ChartAxes } from "./ChartAxes";
import { ChartGrid } from "./ChartGrid";
import { ChartLegend } from "./ChartLegend";

import "./TimeSeriesChart.css";
import { useTick } from "../../../backend/time/UseTick";
import { Slider } from "@mui/material";

interface TimeSeriesChartProps {
  signalNames: string[];
  title?: string;
  defaultChartTime?: number; // ms
  yRange?: [number, number];
  colors?: string[];
  height?: number;
  downsampledSignals?: string[]; // Array of signal names to downsample

  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

export function TimeSeriesChart({
  signalNames,
  title = "",
  defaultChartTime = 30000,
  yRange = [-100, 100],
  colors,
  height = 300,
  downsampledSignals = [],

  paddingLeft = 70,
  paddingRight = 20,
  paddingTop = 20,
  paddingBottom = 20,
}: TimeSeriesChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Track container width
  const [chartWidth, setChartWidth] = useState(400);
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setChartWidth(containerRef.current.clientWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Track active signals
  const [activeSignals, setActiveSignals] = useState(
    Object.fromEntries(signalNames.map((s) => [s, true]))
  );
  const toggleSignal = (sig: string) =>
    setActiveSignals((prev) => ({ ...prev, [sig]: !prev[sig] }));

  // Time
  const currentTime = useTick();
  const [chartTime, setChartTime] = useState(defaultChartTime); // max delta time
  const [sliderValue, setSliderValue] = useState(100); // percent 0-100

  // Determine virtual current time for plotting
  const displayTime = useMemo(() => {
    if (sliderValue === 100) return currentTime;
    return currentTime - (100 - sliderValue) * 600; // freeze/rewind
  }, [currentTime, sliderValue]);

  // Collect histories for all signals
  const histories = signalNames.map((sig) => ({
    sig,
    hist: useCANSignalHistory(sig, displayTime - chartTime, displayTime)
  }));

  // Y-axis zoom
  const [yRangeState, setYRange] = useState<[number, number]>(yRange);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const rect = svg.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const [minY, maxY] = yRangeState;
      const axisHeight = rect.height - paddingTop - paddingBottom;

      const valueAtCursor = maxY - ((mouseY - paddingTop) / axisHeight) * (maxY - minY);
      const zoomFactor = 1 + (e.deltaY > 0 ? 0.1 : -0.1);

      const newMinY = valueAtCursor - (valueAtCursor - minY) * zoomFactor;
      const newMaxY = valueAtCursor + (maxY - valueAtCursor) * zoomFactor;

      setYRange([newMinY, newMaxY]);
    };

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [yRangeState]);

  // Misc
  const colorsToUse = colors || ["#4af", "#fa4", "#4fa", "#f4a", "#af4", "#44f"];
  const drawableWidth = chartWidth - paddingLeft - paddingRight;

  // Gridlines
  const gridLines = useMemo(
    () =>
      computeHorizontalGridLines(
        4,
        height,
        paddingTop,
        paddingBottom,
        paddingLeft,
        chartWidth - paddingRight
      ),
    [height, paddingTop, paddingBottom, paddingLeft, paddingRight, chartWidth]
  );

  // Time axis
  const timeTicks = useMemo(
    () => computeTimeTicks(drawableWidth, paddingLeft, displayTime, chartTime),
    [drawableWidth, paddingLeft, displayTime, chartTime]
  );

  return (
    <div className="time-series-chart" ref={containerRef}>
      <div className="chart-header">
        <div className="chart-title">{title === "" ? "Chart" : title}</div>
        <Slider
          min={0}
          max={100}
          value={sliderValue}
          onChange={(_, val) => setSliderValue(val as number)}
        />
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${height + paddingBottom}`}
        className="chart-svg"
      >
        <ChartGrid horizontalLines={gridLines} />
        <ChartAxes
          width={chartWidth}
          height={height}
          paddingLeft={paddingLeft}
          paddingRight={paddingRight}
          paddingTop={paddingTop}
          paddingBottom={paddingBottom}
          yMin={yRangeState[0]}
          yMax={yRangeState[1]}
          timeTicks={timeTicks}
        />

        {histories.map(({ sig, hist }, idx) => {
          if (!activeSignals[sig]) return null;

          const points = computeNormalizedPoints(
            hist,
            drawableWidth,
            height - paddingTop - paddingBottom,
            paddingLeft,
            paddingTop,
            yRangeState[0],
            yRangeState[1],
            displayTime,
            chartTime
          );

          // Apply downsampling if enabled for this signal
          const finalPoints = downsampledSignals.includes(sig) ? downsamplePoints(points, 200) : points;

          return (
            <polyline
              key={sig}
              points={pointsToSvg(finalPoints)}
              className="chart-line"
              style={{ stroke: colorsToUse[idx % colorsToUse.length] }}
            />
          );
        })}
      </svg>

      <ChartLegend
        signalNames={signalNames}
        colors={colorsToUse}
        activeSignals={activeSignals}
        onToggleSignal={toggleSignal}
      />
    </div>
  );
}
