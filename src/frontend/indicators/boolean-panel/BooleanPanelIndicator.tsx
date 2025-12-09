import "./BooleanPanelIndicator.css";
import { BooleanIndicator } from "../boolean-indicator/BooleanIndicator";
import { JSX } from "preact/jsx-runtime";

interface BooleanPanelIndicatorProps {
  signalNames: string[];
  style?: JSX.IntrinsicElements["div"]["style"];
}

export function BooleanPanelIndicator({ signalNames, style }: BooleanPanelIndicatorProps) {
  return (
    <div className="boolean-panel-indicator" style={style}>
      {signalNames.map((name) => (
        <BooleanIndicator key={name} signalName={name} />
      ))}
    </div>
  );
}
