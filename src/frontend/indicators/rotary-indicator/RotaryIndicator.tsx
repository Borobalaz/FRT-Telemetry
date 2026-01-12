import { useRef } from "preact/hooks";
import { useRAF } from "../../../backend/time/UseRAF";
import { canSignals } from "../../../backend/signals/CANsignals";
import "./RotaryIndicator.css";

interface RotaryIndicatorProps {
  signalName: string;
  min?: number;
  max?: number;
  divisions?: number;
}

export function RotaryIndicator({
  signalName,
  min = 0,
  max = 100,
  divisions = 10,
}: RotaryIndicatorProps) {
  const valueRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<SVGLineElement>(null);

  // Geometry (static)
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const armLength = radius * 0.92;

  // Arc angles
  const startAngle = 135;
  const endAngle = 405;
  const sweep = endAngle - startAngle;

  // RAF-driven imperative updates
  useRAF(() => {
    const arm = armRef.current;
    const valueEl = valueRef.current;
    if (!arm || !valueEl) return;

    // Read live value from CAN store
    const val = canSignals.get(signalName) ?? 0;
    const clamped = Math.max(min, Math.min(max, val));
    const percent = (clamped - min) / (max - min);
    const angle = startAngle + percent * sweep;
    const rad = (angle * Math.PI) / 180;

    const x = cx + armLength * Math.cos(rad);
    const y = cy + armLength * Math.sin(rad);

    // Imperative DOM updates
    arm.setAttribute("x2", x.toString());
    arm.setAttribute("y2", y.toString());
    valueEl.textContent = val.toFixed(2);
  });

  // Static ticks + labels (rendered once)
  const ticks = [];
  const tickInner = radius - 8;
  const tickOuter = radius + 6;
  const labelRadius = radius + 20;

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
        <text
          className="rotary-label"
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {labelValue}
        </text>
      </g>
    );
  }

  return (
    <div className="rotary-indicator">
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={radius + 28}
          className="rotary-background"
        />

        <g className="rotary-ticks">{ticks}</g>

        <path
          className="rotary-arc"
          d={describeArc(cx, cy, radius, startAngle, endAngle)}
          fill="none"
        />

        {/* Arm rendered once, updated via RAF */}
        <line
          ref={armRef}
          className="rotary-arm"
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy}
        />

        <circle cx={cx} cy={cy} r={6} className="rotary-hub" />
      </svg>

      <div className="rotary-caption">
        <div className="rotary-caption-title">{signalName}</div>
        <div ref={valueRef} className="rotary-caption-value" />
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
