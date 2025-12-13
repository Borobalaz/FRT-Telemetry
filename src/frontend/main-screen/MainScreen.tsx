import { useEffect, useState } from "preact/hooks";
import { Tab, tabManager } from "../tabs/TabManager";
import "./Mainscreen.css"
import { MainScreenHeader } from "./MainScreenHeader";
import { MainScreenFooter } from "./MainScreenFooter";
import { TabListView } from "../tabs/TabListView";
import { canSignals } from "../../backend/signals/CANsignals";

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

  useEffect(() => {
    canSignals.set("APPS_position", 0);
    canSignals.set("MCU_state", 2);
    canSignals.set("SC_ENDLINE", 1);
    canSignals.set("APPS_position", 0);

    const interval = setInterval(() => {
      canSignals.set("APPS_position", 50 * (Math.sin(Date.now() / 1000) + 1));
      canSignals.set("MCU_state", (canSignals.get("MCU_state") + 1) % 4);
      canSignals.set("SC_ENDLINE", !(canSignals.get("SC_ENDLINE")));
    }, 100); // update every 50ms
    return () => clearInterval(interval);
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