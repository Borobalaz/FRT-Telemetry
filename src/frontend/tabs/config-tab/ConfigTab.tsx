import { Grid } from "../Grid";
import { Section } from "../Section";
import "./ConfigTab.css"
import { DBCMenu } from "./DBCMenu";
import { Settings } from "./Settings";
import { TelemetryLog } from "./TelemetryLog";
import { TelemetryStatus } from "./TelemetryStatus";

export function ConfigTab() {

  return (
    <div className="tab config-tab">
      <Grid cols={2} rows={2}>
        <Section title="Telemetry log" orientation="vertical" style={{
          gridRow: 1,
          gridColumn: 1
        }}>
          <TelemetryLog />
        </Section>
        <Section title="DBC Menu" orientation="vertical" style={{
          gridRow: 2,
          gridColumn: 1
        }}>
          <DBCMenu />
        </Section>
        <Section title="Settings" style={{
          gridRow: 1,
          gridColumn: 2
        }}>
          <Settings />
        </Section>
        <Section title="Telemetry Status" style={{
          gridRow: 2,
          gridColumn: 2
        }}>
          <TelemetryStatus />
        </Section>
      </Grid>
    </div>
  );
}