import { useEffect, useState } from "preact/hooks";
import { Tab, tabManager } from "../tabs/TabManager";
import "./Mainscreen.css"
import { MainScreenHeader } from "./MainScreenHeader";
import { MainScreenFooter } from "./MainScreenFooter";
import { TabListView } from "../tabs/TabListView";

export function MainScreen() {

  let [activeTab, setActiveTab] = useState<Tab | null>(null);

  useEffect(() => {    
    const handleActiveTabChange = () => setActiveTab(tabManager.getActiveTab());
    
    handleActiveTabChange();
    tabManager.on("activeTabChange", handleActiveTabChange);

    return () => {
      tabManager.off("activeTabChange", handleActiveTabChange);
    };
  }, []);

  return (
    <div className="main-screen">
      <MainScreenHeader />
      <div className="main-screen-tabview">
        <TabListView />
        <div className="main-screen-content">
          {activeTab && <activeTab.component />}
        </div>
      </div>
      <MainScreenFooter />
    </div>
  );
}