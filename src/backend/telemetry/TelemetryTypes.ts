export type TelemetryConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

export interface WebSocketConfig {
  url: string;
}

export interface CANFrame {
  canId: number;
  data: Uint8Array;
  timestamp: number;
  receivedAt: number;
}

export interface DecodedSignalBatch {
  canId: number;
  sourceFileName: string;
  signals: Record<string, unknown>;
}

export interface TelemetryCounters {
  rawBytes: number;
  framesParsed: number;
  framesDecoded: number;
  unknownCanIds: number;
  droppedFrames: number;
  decodeErrors: number;
}

export interface TelemetryStatusSnapshot {
  state: TelemetryConnectionState;
  counters: TelemetryCounters;
  activeEndpoint?: string;
  lastError?: string;
}

export interface TelemetryTransport {
  connect(config: WebSocketConfig): Promise<void>;
  disconnect(): Promise<void>;
  onChunk(listener: (chunk: Uint8Array) => void): () => void;
  onError(listener: (message: string) => void): () => void;
  onClosed(listener: () => void): () => void;
}

export interface FrameParser {
  feed(chunk: Uint8Array): CANFrame[];
  flushDroppedTail(): number;
}

export interface CanFrameDecoder {
  decode(frame: CANFrame): DecodedSignalBatch | null;
}

export interface TelemetrySink {
  publish(batch: DecodedSignalBatch): void;
}
