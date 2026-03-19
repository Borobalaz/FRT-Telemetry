import argparse
import asyncio
import importlib
from math import sin
from typing import Any

try:
    websockets = importlib.import_module("websockets")
except ImportError:
    print("Missing dependency: websockets")
    print("Install with: python -m pip install websockets")
    raise SystemExit(1)


def parse_args():
    parser = argparse.ArgumentParser(description="WebSocket CAN frame broadcaster")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host for LAN clients")
    parser.add_argument("--port", type=int, default=8998, help="WebSocket server port")
    parser.add_argument(
        "--can-id",
        type=lambda value: int(value, 0),
        default=664,
        help="CAN ID to publish (decimal or hex, e.g. 664 or 0x298)",
    )
    parser.add_argument(
        "--signal",
        choices=["sf_errst_1", "legacy_bytes_2_3"],
        default="sf_errst_1",
        help=(
            "Payload generator: sf_errst_1 drives CAN1 signal SF_ErrSt_1 on id 664; "
            "legacy_bytes_2_3 keeps the old raw byte packing"
        ),
    )
    parser.add_argument("--frequency", type=float, default=0.5, help="Wave frequency in Hz")
    parser.add_argument("--interval", type=float, default=0.02, help="Seconds between frames")
    return parser.parse_args()


def build_frame(can_id: int, wave_value: int, timestamp: int, signal_mode: str) -> bytes:
    data = bytearray(8)

    if signal_mode == "sf_errst_1":
        # CAN1.dbc: BO_ 664 CAESAR_1_info1, SG_ SF_ErrSt_1 : 8|8@1+
        # This maps to byte index 1 (0..255), giving a clean sine-like chart.
        data[1] = wave_value & 0xFF
    else:
        # Legacy payload mode used during earlier debugging.
        data[2] = wave_value & 0xFF
        data[3] = (wave_value >> 8) & 0xFF

    return bytes(
        [can_id & 0xFF, (can_id >> 8) & 0xFF]
        + list(data)
        + [timestamp & 0xFF, (timestamp >> 8) & 0xFF]
    )


args = parse_args()

CLIENTS: set[Any] = set()


async def client_handler(websocket: Any):
    CLIENTS.add(websocket)
    print(f"Client connected: {websocket.remote_address}")
    try:
        await websocket.wait_closed()
    finally:
        CLIENTS.discard(websocket)
        print(f"Client disconnected: {websocket.remote_address}")


async def broadcaster():
    phase = 0.0
    timestamp = 0

    while True:
        wave = int(sin(phase) * 127 + 128)
        phase = asyncio.get_event_loop().time()  # current time
        timestamp = (timestamp + 1) & 0xFFFF

        frame = build_frame(args.can_id, wave, timestamp, args.signal)

        if CLIENTS:
            disconnected = []
            # Iterate a snapshot because client connect/disconnect callbacks mutate CLIENTS.
            for client in tuple(CLIENTS):
                try:
                    await client.send(frame)
                except websockets.ConnectionClosed:
                    disconnected.append(client)

            for client in disconnected:
                CLIENTS.discard(client)

        print(f"wave={wave} clients={len(CLIENTS)} frame={list(frame)}")
        await asyncio.sleep(args.interval)


async def main():
    async with websockets.serve(client_handler, args.host, args.port):
        print(f"WebSocket CAN broadcaster listening on ws://{args.host}:{args.port}")
        await broadcaster()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Stopped.")