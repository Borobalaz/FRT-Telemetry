import { appLogger } from "../app-logger/AppLogger";
import {
  CanFrameDecoder,
  FrameParser,
  TelemetryCounters,
  TelemetrySink,
  TelemetryStatusSnapshot,
  TelemetryTransport,
  WebSocketConfig,
} from "./TelemetryTypes";

const initialCounters: TelemetryCounters = {
  rawBytes: 0,
  framesParsed: 0,
  framesDecoded: 0,
  unknownCanIds: 0,
  droppedFrames: 0,
  decodeErrors: 0,
};

type StatusListener = (status: TelemetryStatusSnapshot) => void;

export class TelemetryIngestCoordinator {
  private status: TelemetryStatusSnapshot = {
    state: "disconnected",
    counters: { ...initialCounters },
  };

  private statusListeners: Set<StatusListener> = new Set();
  private unsubscribeChunk?: () => void;
  private unsubscribeError?: () => void;
  private unsubscribeClosed?: () => void;

  constructor(
    private readonly transport: TelemetryTransport,
    private readonly parser: FrameParser,
    private readonly decoder: CanFrameDecoder,
    private readonly sink: TelemetrySink
  ) {}

  private notifyStatus() {
    const snapshot = this.getStatus();
    this.statusListeners.forEach((listener) => listener(snapshot));
  }

  subscribe(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  getStatus(): TelemetryStatusSnapshot {
    return {
      ...this.status,
      counters: { ...this.status.counters },
    };
  }

  private attachTransportListeners() {
    this.unsubscribeChunk = this.transport.onChunk((chunk) => {
      this.status.counters.rawBytes += chunk.length;
      const frames = this.parser.feed(chunk);
      this.status.counters.framesParsed += frames.length;

      for (const frame of frames) {
        try {
          const decoded = this.decoder.decode(frame);
          if (!decoded) {
            this.status.counters.unknownCanIds += 1;
            continue;
          }

          this.sink.publish(decoded);
          this.status.counters.framesDecoded += 1;
        } catch (error) {
          this.status.counters.decodeErrors += 1;
          const message = error instanceof Error ? error.message : String(error);
          appLogger.error(`CAN decode error (id=${frame.canId}): ${message}`);
        }
      }

      this.notifyStatus();
    });

    this.unsubscribeError = this.transport.onError((message) => {
      this.status.state = "error";
      this.status.lastError = message;
      appLogger.error(`WebSocket transport error: ${message}`);
      this.notifyStatus();
    });

    this.unsubscribeClosed = this.transport.onClosed(() => {
      this.status.state = "disconnected";
      appLogger.info("WebSocket closed.");
      this.notifyStatus();
    });
  }

  async connect(config: WebSocketConfig) {
    if (this.status.state === "connected" || this.status.state === "connecting") {
      return;
    }

    this.status.state = "connecting";
    this.status.lastError = undefined;
    this.status.activeEndpoint = config.url;
    this.notifyStatus();

    if (!this.unsubscribeChunk || !this.unsubscribeError || !this.unsubscribeClosed) {
      this.attachTransportListeners();
    }

    try {
      await this.transport.connect(config);
      this.status.state = "connected";
      appLogger.info(`Connected WebSocket ${config.url}`);
      this.notifyStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.status.state = "error";
      this.status.lastError = message;
      appLogger.error(`Failed to connect WebSocket: ${message}`);
      this.notifyStatus();
      throw error;
    }
  }

  async disconnect() {
    if (this.status.state === "disconnected" || this.status.state === "disconnecting") {
      return;
    }

    this.status.state = "disconnecting";
    this.notifyStatus();

    const droppedTailBytes = this.parser.flushDroppedTail();
    this.status.counters.droppedFrames += droppedTailBytes > 0 ? 1 : 0;

    await this.transport.disconnect();
    this.status.state = "disconnected";
    this.status.activeEndpoint = undefined;
    appLogger.info("Disconnected WebSocket.");
    this.notifyStatus();
  }

  dispose() {
    this.unsubscribeChunk?.();
    this.unsubscribeError?.();
    this.unsubscribeClosed?.();
    this.unsubscribeChunk = undefined;
    this.unsubscribeError = undefined;
    this.unsubscribeClosed = undefined;
  }
}
