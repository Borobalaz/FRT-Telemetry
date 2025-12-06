import "./TabCard.css";

interface TabCardProps {
  Icon: React.ElementType;
  name: string;
  onClick?: () => void;
  active?: boolean;
}

export function TabCard({ Icon, name, active, onClick }: TabCardProps) {
  return (
    <div 
      className={`tab-card ${active ? "active" : ""}`} 
      onClick={onClick}
    >
      <div className="tab-card-icon">
        {Icon && <Icon />}
      </div>
      <div className="tab-card-name">{name}</div>
    </div>
  );
}
