import { CANFrame, FrameParser } from "./TelemetryTypes";

const FRAME_SIZE_BYTES = 12;

export class SerialFrameParser implements FrameParser {
  private remainder: Uint8Array = new Uint8Array(0);

  feed(chunk: Uint8Array): CANFrame[] {
    if (chunk.length === 0) {
      return [];
    }

    const merged = new Uint8Array(this.remainder.length + chunk.length);
    merged.set(this.remainder, 0);
    merged.set(chunk, this.remainder.length);

    const frames: CANFrame[] = [];
    let offset = 0;

    while (offset + FRAME_SIZE_BYTES <= merged.length) {
      const frameBytes = merged.subarray(offset, offset + FRAME_SIZE_BYTES);
      const view = new DataView(frameBytes.buffer, frameBytes.byteOffset, FRAME_SIZE_BYTES);

      const canId = view.getUint16(0, true);
      const data = frameBytes.subarray(2, 10);
      const timestamp = view.getUint16(10, true);

      frames.push({
        canId,
        data: new Uint8Array(data),
        timestamp,
        receivedAt: performance.now(),
      });

      offset += FRAME_SIZE_BYTES;
    }

    this.remainder = merged.subarray(offset);
    return frames;
  }

  flushDroppedTail(): number {
    const dropped = this.remainder.length;
    this.remainder = new Uint8Array(0);
    return dropped;
  }
}
