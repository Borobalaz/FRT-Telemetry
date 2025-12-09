import "../tabs/Tab.css"

export function TabSectionTitle({ text }: { text?: string }) {
  return text ? <span className="section-title">{text}</span> : null;
}
