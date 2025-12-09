interface ChartLegendProps {
  signalNames: string[];
  colors: string[];
  activeSignals: Record<string, boolean>;
  onToggleSignal: (sig: string) => void;
}

export function ChartLegend({
  signalNames,
  colors,
  activeSignals,
  onToggleSignal,
}: ChartLegendProps) {
  return (
    <div className="chart-legend">
      {signalNames.map((sig, idx) => {
        const active = activeSignals[sig];
        return (
          <span
            key={sig}
            className={`legend-item ${active ? "active" : "inactive"}`}
            onClick={() => onToggleSignal(sig)}
            style={{ cursor: "pointer" }}
          >
            <span
              className="legend-color"
              style={{
                background: colors[idx % colors.length],
                opacity: active ? 1 : 0.3,
              }}
            />
            {sig}
          </span>
        );
      })}
    </div>
  );
}
