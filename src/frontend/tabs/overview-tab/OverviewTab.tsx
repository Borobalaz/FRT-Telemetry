import { Plot2D } from "../../indicators/2d-plot/Plot2D";
import { BooleanIndicator } from "../../indicators/boolean-indicator/BooleanIndicator";
import { BooleanPanelIndicator } from "../../indicators/boolean-panel/BooleanPanelIndicator";
import { FourStateLED } from "../../indicators/four-state-led/FourStateLED";
import { NumericIndicator } from "../../indicators/numeric-indicator/NumericIndicator";
import { NumericPanelIndicator } from "../../indicators/numeric-panel-indicator/NumericPanelIndicator";
import { RotaryIndicator } from "../../indicators/rotary-indicator/RotaryIndicator";
import { ScaleIndicator } from "../../indicators/scale-indicator/ScaleIndicator";
import { TimeSeriesChart } from "../../indicators/time-series-chart/TimeSeriesChart";
import { Grid } from "../Grid";
import { Section } from "../Section";
import "./OverviewTab.css"

export function OverviewTab() {

  return (
    <div className="tab overview-tab">

      <Grid title="System and Sensor checks" cols={4} rows={2}>
        <ScaleIndicator signalName="APPS_position" />
        <FourStateLED signalName="MCU_state" />
        <FourStateLED signalName="MCU_state" orientation="vertical" />
        <BooleanPanelIndicator
          signalNames={["SC_ENDLINE", "MCU_state", "APPS_position"]}
          style={{
            gridRow: 2,
            gridColumn: 3
          }} />
        <Plot2D
          xSignalName="APPS_position"
          ySignalName="MCU_state"
          minX={0}
          maxX={100}
          minY={-1}
          maxY={4}
          style={{
            gridRowStart: 1,
            gridRowEnd: 3,
            gridColumn: 4
          }} />
      </Grid>

      <Grid title="Dynamics and control" cols={3} rows={1}>
        <RotaryIndicator signalName="APPS_position" />
        <NumericIndicator signalName="MCU_state" />
        <Section orientation="vertical">
          <BooleanIndicator signalName="SC_ENDLINE" />
          <NumericPanelIndicator signalNames={["APPS_position", "MCU_state"]} />
        </Section>
      </Grid>
      <Section title="Charts">
        <TimeSeriesChart
          signalNames={["APPS_position", "MCU_state"]}
          title="Very interesting chart" />
        <TimeSeriesChart signalNames={["APPS_position", "MCU_state"]} />
      </Section>
      <Section title="Charts">
        <TimeSeriesChart signalNames={["APPS_position", "MCU_state"]} />
      </Section>

    </div>
  );
}