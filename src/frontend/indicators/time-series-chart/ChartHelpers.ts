import { HistoryEntry } from "../../../backend/signals/SignalHistory";

// Compute time ticks for the X-axis
export function computeTimeTicks(drawableWidth, paddingLeft, currentTime, chartTime) {
  const minTs = currentTime - chartTime;
  const maxTs = currentTime;
  const range = maxTs - minTs || 1;

  const targetTicks = 5;
  const ticks = [];

  for (let i = 0; i <= targetTicks; i++) {
    const ratio = i / targetTicks;
    const ts = minTs + ratio * range;
    const x = paddingLeft + ratio * drawableWidth;

    ticks.push({ timestamp: ts, x });
  }

  return ticks;
}

export function computeYTicks(
  minY: number,
  maxY: number,
  numTicks: number = 5
): { y: number; value: number }[] {
  const ticks: { y: number; value: number }[] = [];
  const step = (maxY - minY) / (numTicks - 1);

  for (let i = 0; i < numTicks; i++) {
    ticks.push({ value: minY + i * step, y: i }); // y will be mapped later in SVG coords
  }
  return ticks;
}

// Format timestamps as seconds since first entry
export function formatTimeLabel(ms: number) {
  return (ms / 1000).toFixed(1) + "s";
}

export interface TimeTick {
  x: number;        // X coordinate in SVG
  timestamp: number; // Actual timestamp value
}
export interface Point {
  x: number;
  y: number;
}

/**
 * Normalized point mapping:
 * Evenly spaces points regardless of timestamp.
 */
export function computeNormalizedPoints(
  data,
  width,
  height,
  paddingLeft,
  paddingTop,
  minY,
  maxY,
  currentTime,
  chartTime
) {
  const rangeY = maxY - minY || 1;

  return data.map((d, i) => {
    const x = paddingLeft + ((d.timestamp - currentTime + chartTime) / chartTime) * width;
    const y =
      paddingTop +
      (1 - (d.value - minY) / rangeY) * height;

    return { x, y };
  });
}


/**
 * Timestamp-scaled mapping (optional).
 * Older points cluster, newer spread out proportionally to real time.
 */
export function computeTimestampScaledPoints(
  data: HistoryEntry<any>[],
  width: number,
  height: number,
  padding: number,
  minY: number,
  maxY: number
): Point[] {

  if (data.length < 2) return [];

  const first = data[0].timestamp;
  const last = data[data.length - 1].timestamp;
  const totalTime = last - first || 1;

  const rangeY = maxY - minY || 1;

  return data.map(entry => {
    const tNorm = (entry.timestamp - first) / totalTime;

    const x = tNorm * (width - padding * 2) + padding;
    const y = height - padding - ((entry.value - minY) / rangeY) * (height - padding * 2);

    return { x, y };
  });
}


/** Convert to the SVG polyline "x,y x,y" string */
export function pointsToSvg(points: Point[]): string {
  return points.map(p => `${p.x},${p.y}`).join(" ");
}
export function computeHorizontalGridLines(
  count: number,
  height: number,
  paddingTop: number,
  paddingBottom: number,
  xLeft: number,
  xRight: number
) {
  const lines = [];
  const usableHeight = height - paddingTop - paddingBottom;

  for (let i = 0; i <= count; i++) {
    const ratio = i / count;
    const y = paddingTop + ratio * usableHeight;

    lines.push({ y, x1: xLeft, x2: xRight });
  }

  return lines;
}

