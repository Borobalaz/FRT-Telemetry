import { NumericIndicator } from "../numeric-indicator/NumericIndicator";

interface NumericPanelIndicatorProps {
  signalNames: string[];
}

export function NumericPanelIndicator({ signalNames }: NumericPanelIndicatorProps) {
  return (
    <div className="numeric-panel-indicator">
      {signalNames.map((name) => (
        <NumericIndicator key={name} signalName={name} />
      ))}
    </div>
  );
}
