import { CANSignals } from "../signals/CANsignals";
import { DecodedSignalBatch, TelemetrySink } from "./TelemetryTypes";

export class SignalPublishService implements TelemetrySink {
  constructor(private readonly canSignals: CANSignals<Record<string, unknown>>) {}

  publish(batch: DecodedSignalBatch): void {
    Object.entries(batch.signals).forEach(([signalName, value]) => {
      this.canSignals.set(signalName, value);
    });
  }
}
