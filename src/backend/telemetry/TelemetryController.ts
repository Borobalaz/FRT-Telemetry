import { appLogger } from "../app-logger/AppLogger";
import { dbcManager } from "../dbc/DBCManager";
import { canSignals } from "../signals/CANsignals";
import { DbcDecodeService } from "./DbcDecodeService";
import { SerialFrameParser } from "./SerialFrameParser";
import { SignalPublishService } from "./SignalPublishService";
import { TelemetryIngestCoordinator } from "./TelemetryIngestCoordinator";
import { TelemetryTransport, WebSocketConfig } from "./TelemetryTypes";

class WebSocketTransport implements TelemetryTransport {
  private socket: WebSocket | null = null;

  private chunkListeners: Set<(chunk: Uint8Array) => void> = new Set();
  private errorListeners: Set<(message: string) => void> = new Set();
  private closedListeners: Set<() => void> = new Set();

  async connect(config: WebSocketConfig): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    await this.disconnect();

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(config.url);
      this.socket = socket;
      socket.binaryType = "arraybuffer";

      const cleanup = () => {
        socket.removeEventListener("open", onOpen);
        socket.removeEventListener("error", onError);
      };

      const onOpen = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        reject(new Error(`Failed to open WebSocket ${config.url}`));
      };

      socket.addEventListener("open", onOpen);
      socket.addEventListener("error", onError);

      socket.addEventListener("message", (event) => {
        if (event.data instanceof ArrayBuffer) {
          const chunk = new Uint8Array(event.data);
          this.chunkListeners.forEach((listener) => listener(chunk));
          return;
        }

        if (typeof event.data === "string") {
          const chunk = new TextEncoder().encode(event.data);
          this.chunkListeners.forEach((listener) => listener(chunk));
          return;
        }

        if (event.data instanceof Blob) {
          event.data.arrayBuffer().then((buffer) => {
            const chunk = new Uint8Array(buffer);
            this.chunkListeners.forEach((listener) => listener(chunk));
          }).catch((error) => {
            const message = error instanceof Error ? error.message : String(error);
            this.errorListeners.forEach((listener) => listener(message));
          });
        }
      });

      socket.addEventListener("error", () => {
        this.errorListeners.forEach((listener) => listener(`WebSocket error on ${config.url}`));
      });

      socket.addEventListener("close", () => {
        if (this.socket === socket) {
          this.socket = null;
        }
        this.closedListeners.forEach((listener) => listener());
      });
    });
  }

  async disconnect(): Promise<void> {
    if (!this.socket) {
      return;
    }

    const target = this.socket;
    this.socket = null;

    if (target.readyState === WebSocket.CLOSING || target.readyState === WebSocket.CLOSED) {
      return;
    }

    await new Promise<void>((resolve) => {
      const onClose = () => {
        target.removeEventListener("close", onClose);
        resolve();
      };

      target.addEventListener("close", onClose);
      target.close();
    });
  }

  onChunk(listener: (chunk: Uint8Array) => void): () => void {
    this.chunkListeners.add(listener);
    return () => {
      this.chunkListeners.delete(listener);
    };
  }

  onError(listener: (message: string) => void): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  onClosed(listener: () => void): () => void {
    this.closedListeners.add(listener);
    return () => {
      this.closedListeners.delete(listener);
    };
  }
}

class TelemetryController {
  private readonly transport = new WebSocketTransport();
  private readonly parser = new SerialFrameParser();
  private readonly decoder = new DbcDecodeService(dbcManager);
  private readonly sink = new SignalPublishService(canSignals);
  private readonly coordinator = new TelemetryIngestCoordinator(
    this.transport,
    this.parser,
    this.decoder,
    this.sink
  );

  constructor() {
    dbcManager.subscribeLoadedDBCs(() => {
      appLogger.info(`Active DBCs: ${dbcManager.getLoadedFileNames().join(", ") || "none"}`);
    });
  }

  subscribe = this.coordinator.subscribe.bind(this.coordinator);
  getStatus = this.coordinator.getStatus.bind(this.coordinator);

  async connect(config: WebSocketConfig) {
    if (!dbcManager.isReady()) {
      appLogger.warning("Connecting without loaded DBCs. Incoming frames will be treated as unknown until DBCs are uploaded.");
    }

    return this.coordinator.connect(config);
  }

  disconnect = this.coordinator.disconnect.bind(this.coordinator);
}

export const telemetryController = new TelemetryController();
