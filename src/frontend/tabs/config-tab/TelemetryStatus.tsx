import { useEffect, useMemo, useState } from "preact/hooks";
import { telemetryController } from "../../../backend/telemetry/TelemetryController";
import { TelemetryStatusSnapshot, WebSocketConfig } from "../../../backend/telemetry/TelemetryTypes";
import "./TelemetryStatus.css";

const defaultStatus: TelemetryStatusSnapshot = {
  state: "disconnected",
  counters: {
    rawBytes: 0,
    framesParsed: 0,
    framesDecoded: 0,
    unknownCanIds: 0,
    droppedFrames: 0,
    decodeErrors: 0,
  },
};

const defaultSocketUrl = "ws://127.0.0.1:8998";

export function TelemetryStatus() {
  const [status, setStatus] = useState<TelemetryStatusSnapshot>(telemetryController.getStatus());
  const [socketUrl, setSocketUrl] = useState<string>(defaultSocketUrl);

  const isBusy = status.state === "connecting" || status.state === "disconnecting";
  const canConnect = !isBusy && status.state !== "connected" && socketUrl.trim().length > 0;
  const canDisconnect = !isBusy && status.state === "connected";

  useEffect(() => {
    const unsubscribeStatus = telemetryController.subscribe((nextStatus) => {
      setStatus(nextStatus);
    });

    return unsubscribeStatus;
  }, []);

  async function handleConnect() {
    const config: WebSocketConfig = {
      url: socketUrl,
    };

    await telemetryController.connect(config);
  }

  async function handleDisconnect() {
    await telemetryController.disconnect();
  }

  const counters = useMemo(() => status?.counters ?? defaultStatus.counters, [status]);

  return (
    <div className="telemetry-status">
      <div className="telemetry-controls">
        <input
          type="text"
          value={socketUrl}
          onInput={(event) => setSocketUrl((event.currentTarget as HTMLInputElement).value)}
          disabled={isBusy || status.state === "connected"}
        />

        <button
          type="button"
          onClick={() => {
            void handleConnect().catch(() => {
              // Errors are already logged by the coordinator.
            });
          }}
          disabled={!canConnect}
        >
          Connect
        </button>

        <button
          type="button"
          onClick={() => {
            void handleDisconnect().catch(() => {
              // Errors are already logged by the coordinator.
            });
          }}
          disabled={!canDisconnect}
        >
          Disconnect
        </button>
      </div>

      <div className="telemetry-state">State: {status.state}</div>
      {status.activeEndpoint && <div className="telemetry-meta">Endpoint: {status.activeEndpoint}</div>}
      {status.lastError && <div className="telemetry-error">Last error: {status.lastError}</div>}

      <div className="telemetry-counters">
        <div>Raw bytes: {counters.rawBytes}</div>
        <div>Frames parsed: {counters.framesParsed}</div>
        <div>Frames decoded: {counters.framesDecoded}</div>
        <div>Unknown CAN IDs: {counters.unknownCanIds}</div>
        <div>Dropped frames: {counters.droppedFrames}</div>
        <div>Decode errors: {counters.decodeErrors}</div>
      </div>
    </div>
  );
}