import HomeIcon from '@mui/icons-material/Home';
import { OverviewTab } from './OverviewTab';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import BathtubIcon from '@mui/icons-material/Bathtub';
import { MCUTab } from './MCUTab';


export interface Tab {
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

type Listener = () => void;

class TabManager {

  tabs: Tab[];
  activeTab: Tab | null;

    // Event subscribers
  private listeners = {
    activeTabChange: [] as Listener[],
  };

  constructor() {
    this.tabs = [
      { name: "Overview", icon: HomeIcon, component: OverviewTab },
      { name: "MCU", icon: TwoWheelerIcon, component: MCUTab },

    ];

    this.activeTab = this.tabs[0];
  }

  getActiveTab() {
    return this.activeTab;
  }

  setActiveTab(tab: Tab) {
    this.activeTab = tab;
    this.notify("activeTabChange");
  }

  getTabs() {
    return this.tabs;
  }

  on(event: keyof typeof this.listeners, cb: Listener) {
    this.listeners[event].push(cb);
  }

  private async notify(event: keyof typeof this.listeners) {
    this.listeners[event].forEach(cb => cb());
  }

  off(event: keyof typeof this.listeners, callback: Listener) {
    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback
    );
  }
}

export const tabManager: TabManager = new TabManager();