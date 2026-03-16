// ChartGrid.tsx
import { h } from "preact";

interface GridLine {
  x1: number;
  x2: number;
  y: number;
}

interface ChartGridProps {
  horizontalLines: GridLine[];
}

export function ChartGrid({ horizontalLines }: ChartGridProps) {
  return (
    <>
      {horizontalLines.map((line) => (
        <line
          key={`${line.y}-${line.x1}-${line.x2}`}
          x1={line.x1}
          x2={line.x2}
          y1={line.y}
          y2={line.y}
          className="grid-line"
        />
      ))}
    </>
  );
}
