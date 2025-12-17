import { useEffect, useState } from "preact/hooks";
import "../main-screen/Mainscreen.css";
import { Tab, tabManager } from "./TabManager";
import { TabCard } from "./TabCard";

export function TabListView() {

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  useEffect(() => {
    setTabs(tabManager.getTabs());
    setActiveTab(tabManager.getActiveTab());
  }, []);

  const handleSelect = (tab: Tab) => {
    tabManager.setActiveTab(tab);
    setActiveTab(tab);
  };

  return (
    <div className="tab-list-view">
      {tabs.map(tab => (
        <TabCard
          key={tab.name}
          name={tab.name}
          Icon={tab.icon}
          active={activeTab?.name === tab.name}
          onClick={() => handleSelect(tab)}
        />
      ))}
    </div>
  );
}
