// FourStateLED.tsx
import { JSX } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { useCANSignal } from "../../../backend/signals/UseCANSignal";
import { useRAF } from "../../../backend/time/UseRAF";
import "./FourStateLed.css";
import { canSignals } from "../../../backend/signals/CANsignals";

interface FourStateLEDProps {
  signalName: string;
  orientation?: "horizontal" | "vertical";
  style?: JSX.IntrinsicElements["div"]["style"];
}

export function FourStateLED({
  signalName,
  orientation = "horizontal",
  style,
}: FourStateLEDProps) {
  const ledRef = useRef<HTMLDivElement>(null);

  useRAF(() => {
    const el = ledRef.current;
    if (!el) return;

    // Remove previous state classes
    el.classList.remove("off", "red", "green", "yellow");

    switch (canSignals.get(signalName)) {
      case 1:
        el.classList.add("red");
        break;
      case 2:
        el.classList.add("green");
        break;
      case 3:
        el.classList.add("yellow");
        break;
      default:
        el.classList.add("off");
    }
  });

  if (orientation === "vertical") {
    return (
      <div
        className="four-state-led"
        style={{
          display: "flex",
          flexDirection: "column",
          ...(style as object),
        }}
      >
        <div className="label">{signalName}</div>
        <div ref={ledRef} className="led off" />
      </div>
    );
  }

  return (
    <div className="four-state-led" style={style}>
      <div ref={ledRef} className="led off" />
      <div className="label">{signalName}</div>
    </div>
  );
}
