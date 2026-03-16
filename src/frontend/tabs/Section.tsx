import { JSX } from "preact/jsx-runtime";
import { TabSectionTitle } from "../indicators/TabSectionTitle";

interface SectionProps {
  children?;
  title?: string;
  orientation?: string;
  style?: JSX.IntrinsicElements["div"]["style"];
}

export function Section({ children, title = "", orientation = "horizontal", style = {} }: SectionProps) {

  return (
    <div style={style}>
      {title !== "" && <TabSectionTitle text={title} />}
      <div
        className="section"
        style={{
          display: "flex",
          flexDirection: orientation === "vertical" ? "column" : "row",
        }}
      >
        {children}
      </div>
    </div>
  );
}