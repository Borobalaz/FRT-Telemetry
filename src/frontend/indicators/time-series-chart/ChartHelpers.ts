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


/**
 * Downsample points using Largest-Triangle-Three-Buckets (LTTB) algorithm
 * Reduces rendering complexity while preserving visual fidelity
 * @param points - Original points
 * @param threshold - Maximum number of points to keep (lower = more aggressive downsampling)
 */
export function downsamplePoints(points: Point[], threshold: number = 100): Point[] {
  if (points.length <= threshold) return points;

  const bucketSize = (points.length - 2) / (threshold - 2);
  const downsampled: Point[] = [points[0]];

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.floor((i + 2) * bucketSize) + 1;
    const avgRangeLength = avgRangeEnd - avgRangeStart;

    let avgX = 0;
    let avgY = 0;

    for (let j = avgRangeStart; j < avgRangeEnd && j < points.length; j++) {
      avgX += points[j].x;
      avgY += points[j].y;
    }

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.floor((i + 1) * bucketSize) + 1;

    let maxArea = -1;
    let maxAreaPoint = -1;

    for (let j = rangeStart; j < rangeEnd && j < points.length; j++) {
      const area = Math.abs(
        (downsampled[downsampled.length - 1].x - avgX) *
        (points[j].y - downsampled[downsampled.length - 1].y) -
        (downsampled[downsampled.length - 1].x - points[j].x) *
        (avgY - downsampled[downsampled.length - 1].y)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = j;
      }
    }

    if (maxAreaPoint >= 0) {
      downsampled.push(points[maxAreaPoint]);
    }
  }

  downsampled.push(points[points.length - 1]);
  return downsampled;
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

