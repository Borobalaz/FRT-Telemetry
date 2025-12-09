// FourStateLED.jsx
import { JSX } from "preact/jsx-runtime";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";
import "./FourStateLed.css";

interface FourStateLEDProps {
  signalName: string;
  orientation?: string;
  style?: JSX.IntrinsicElements["div"]["style"];
}

export function FourStateLED({ signalName, orientation = "horizontal", style }: FourStateLEDProps) {
  const val = useCANSignal(signalName);
  let state = "off";

  switch (val) {
    case 1:
      state = "red";
      break;
    case 2:
      state = "green";
      break;
    case 3:
      state = "yellow";
      break;
    default:
      state = "off";
  }

  if (orientation == "vertical")
    return (
      <div className="four-state-led" style={{
        display: "flex",
        flexDirection: "column",
        ...(style as object),
      }} >
        <div className="label">{signalName}</div>
        <div className={`led ${state}`}></div>
      </div>
    );
  else
    return (
      <div className="four-state-led" style={style}>
        <div className={`led ${state}`}></div>
        <div className="label">{signalName}</div>
      </div>
    );
}
