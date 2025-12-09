import { FPSIndicator } from "../indicators/FPSIndicator";
import "./MainScreenHeader.css"

export function MainScreenHeader() {

  return (
    <div className="main-screen-header">
      BME Formula Racing Team
      <FPSIndicator />
    </div>
  );
}