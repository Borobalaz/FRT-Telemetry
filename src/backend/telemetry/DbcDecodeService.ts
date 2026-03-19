import { DBCManager } from "../dbc/DBCManager";
import { CANFrame, CanFrameDecoder, DecodedSignalBatch } from "./TelemetryTypes";

export class DbcDecodeService implements CanFrameDecoder {
  constructor(private readonly dbcManager: DBCManager) {}

  decode(frame: CANFrame): DecodedSignalBatch | null {
    const decodedFrame = this.dbcManager.decodeCANFrame(frame.canId, frame.data);
    if (!decodedFrame) {
      return null;
    }

    return {
      canId: frame.canId,
      sourceFileName: decodedFrame.fileName,
      signals: decodedFrame.decodedSignals,
    };
  }
}
