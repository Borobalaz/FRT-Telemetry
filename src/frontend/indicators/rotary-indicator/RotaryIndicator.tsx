import "./RotaryIndicator.css";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";

interface RotaryIndicatorProps {
  signalName: string;
  min?: number;
  max?: number;
  divisions?: number; // number of segments (labels will be divisions+1)
}

export function RotaryIndicator({
  signalName,
  min = 0,
  max = 100,
  divisions = 10,
}: RotaryIndicatorProps) {
  const val = useCANSignal(signalName);

  const clamped = Math.max(min, Math.min(max, val));
  const percent = (clamped - min) / (max - min);

  // Arc angles for opening at the bottom
  const startAngle = 135;
  const endAngle = 405;
  const sweep = endAngle - startAngle;

  const armAngle = startAngle + percent * sweep;

  // Base geometry
  const size = 300; // internal coordinate system
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const tickInner = radius - 8;
  const tickOuter = radius + 6;
  const labelRadius = radius + 20;
  const armLength = radius * 0.92;

  // ticks + labels
  const ticks = [];
  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions;
    const ang = startAngle + t * sweep;
    const rad = (ang * Math.PI) / 180;
    const x1 = cx + tickInner * Math.cos(rad);
    const y1 = cy + tickInner * Math.sin(rad);
    const x2 = cx + tickOuter * Math.cos(rad);
    const y2 = cy + tickOuter * Math.sin(rad);

    const lx = cx + labelRadius * Math.cos(rad);
    const ly = cy + labelRadius * Math.sin(rad);

    const labelValue = Math.round(min + t * (max - min));

    ticks.push(
      <g key={i} className="rotary-tick-group">
        <line className="rotary-tick" x1={x1} y1={y1} x2={x2} y2={y2} />
        <text className="rotary-label" x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">
          {labelValue}
        </text>
      </g>
    );
  }

  // arm end coordinates
  const armRad = (armAngle * Math.PI) / 180;
  const armX = cx + armLength * Math.cos(armRad);
  const armY = cy + armLength * Math.sin(armRad);

  return (
    <div className="rotary-indicator">
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={radius + 28} className="rotary-background" />

        <g className="rotary-ticks">{ticks}</g>

        <path className="rotary-arc" d={describeArc(cx, cy, radius, startAngle, endAngle)} fill="none" />

        <line className="rotary-arm" x1={cx} y1={cy} x2={armX} y2={armY} />

        <circle cx={cx} cy={cy} r={6} className="rotary-hub" />
      </svg>

      <div className="rotary-caption">
        <div className="rotary-caption-title">{signalName}</div>
        <div className="rotary-caption-value">{val.toFixed(2)}</div>
      </div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angleInRadians), y: cy + r * Math.sin(angleInRadians) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}
