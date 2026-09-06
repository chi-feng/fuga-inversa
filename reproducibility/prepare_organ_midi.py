"""Select one Jeux d'orgues manual registration while preserving score pitches."""

import argparse
from pathlib import Path

from audit_midi import Event, extract_notes, read_midi, write_midi


def prepare(source, target, bank, preset, gap_ms):
    fmt, ppq, tracks = read_midi(source)
    voices, _ = extract_notes(tracks)
    channel_map = {
        (notes[0].track, notes[0].channel): index
        for index, notes in enumerate(voices.values())
    }
    tempos = sorted(
        (e.tick, int.from_bytes(e.data, "big"))
        for track in tracks for e in track if e.meta == 81
    ) or [(0, 500000)]
    output = []
    for track_number, track in enumerate(tracks):
        events = []
        for event in track:
            kind, channel = event.status & 240, event.status & 15
            key = (track_number, channel)
            if event.status < 240 and key in channel_map:
                if kind == 192 or (kind == 176 and event.data[0] in (0, 32)):
                    continue
                event = Event(event.tick, kind + channel_map[key], event.data)
                if kind in (128, 144):
                    is_off = kind == 128 or event.data[1] == 0
                    if is_off and gap_ms:
                        tempo = next(value for tick, value in reversed(tempos) if tick <= event.tick)
                        gap = round(gap_ms * 1000 * ppq / tempo)
                        event = Event(max(0, event.tick - gap), event.status, event.data)
            events.append(event)
        output.append(events)
    control = []
    for channel in channel_map.values():
        control.extend([
            Event(0, 176 + channel, bytes([0, bank // 128])),
            Event(0, 176 + channel, bytes([32, bank % 128])),
            Event(0, 192 + channel, bytes([preset])),
        ])
    # Put registration events before score events at the same tick.
    output[0] = control + output[0]
    write_midi(target, fmt, ppq, output)
    _, _, copied_tracks = read_midi(target)
    copied, _ = extract_notes(copied_tracks)
    original_rows = sorted(
        (n.start, n.pitch, channel_map[(n.track, n.channel)])
        for ns in voices.values() for n in ns
    )
    copied_rows = sorted((n.start, n.pitch, n.channel) for ns in copied.values() for n in ns)
    assert original_rows == copied_rows, "Registration must not alter notes or their attack times"
    print(f"Prepared {len(original_rows)} notes on {len(channel_map)} channels; bank {bank}, preset {preset}, release gap {gap_ms:g} ms.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("target", type=Path)
    parser.add_argument("--bank", type=int, default=1)
    parser.add_argument("--preset", type=int, default=0)
    parser.add_argument("--gap-ms", type=float, default=18)
    args = parser.parse_args()
    prepare(args.source, args.target, args.bank, args.preset, args.gap_ms)
