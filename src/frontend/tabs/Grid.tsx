import { TabSectionTitle } from "../indicators/TabSectionTitle";

interface GridProps {
  children: preact.ComponentChildren;
  title?: string;
  cols?: number;
  rows?: number;
}

export function Grid({ children, title = "", cols = 1, rows = 1 }: GridProps) {
  return (
    <>
      {title !== "" && <TabSectionTitle text={title} />}
      <div
        className="section"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {children}
      </div>
    </>
  );
}
