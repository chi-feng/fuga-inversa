"""Create deterministic organ and piano realizations from the engraved MIDI."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from audit_midi import Event, audit, extract_notes, read_midi, write_midi
from prepare_organ_midi import prepare


def seconds_at(tick, ppq, tempos):
    total = 0.0
    previous = 0
    tempo = 500000
    for position, value in tempos:
        if position > tick:
            break
        total += (position - previous) * tempo / (ppq * 1_000_000)
        previous, tempo = position, value
    return total + (tick - previous) * tempo / (ppq * 1_000_000)


def make_performance(source, target, instrument):
    bank = 1 if instrument == "organ" else 0
    prepare(source, target, bank, 0, 18 if instrument == "organ" else 0)
    fmt, ppq, tracks = read_midi(target)
    voices, _ = extract_notes(tracks)
    source_report = audit(source)
    entries = {
        ((row["bar"] - 1) * 4 + row["beat"] - 1, row["voice"].split(" (")[0])
        for row in source_report["literal_inverted_lick_entries"]
    }
    voice_by_channel = {
        ns[0].channel: label.split(" (")[0] for label, ns in voices.items()
    }
    if instrument == "piano":
        apply_piano_touch(tracks, voices, entries, ppq)
    write_midi(target, fmt, ppq, tracks)
    _, _, checked = read_midi(target)
    output_voices, _ = extract_notes(checked)
    # Pitch order and voice membership survive the separate performance layer.
    for original, performed in zip(voices.values(), output_voices.values()):
        assert [n.pitch for n in original] == [n.pitch for n in performed]
        if instrument == "organ":
            assert [n.start for n in original] == [n.start for n in performed]
        else:
            assert max(abs(a.start - b.start) for a, b in zip(original, performed)) <= 5
    assert all(n.end > n.start for ns in output_voices.values() for n in ns)
    stem_paths = {}
    for channel, label in voice_by_channel.items():
        stem_tracks = [
            [e for e in track if e.status >= 240 or (e.status & 15) == channel]
            for track in tracks
        ]
        stem = target.with_name(f"{target.stem}-{label.lower()}.midi")
        write_midi(stem, fmt, ppq, stem_tracks)
        stem_paths[label.lower()] = str(stem)
    return stem_paths


def apply_piano_touch(tracks, voices, entries, ppq):
    # Tempo moves at phrase scale; note timing is never randomized.
    bar_tempos = [92, 91, 93, 92, 93, 92, 94, 90, 93, 92, 94, 92,
                  94, 93, 93, 91, 89, 88, 94, 90, 93, 91, 90, 87, 90, 60]
    cadences = {1, 3, 7, 9, 11, 15, 17, 19, 21, 23, 24}
    tempo_events = []
    for bar, base in enumerate(bar_tempos):
        for beat, contour in enumerate((0, 0.6, 1.0, -0.6)):
            bpm = base if bar == 25 else base + contour
            if beat == 3 and bar in cadences:
                bpm -= 2.2
            if bar == 24:
                bpm = (87, 89, 92, 86)[beat]
            tempo_events.append(Event((bar * 4 + beat) * ppq, 255,
                                      round(60_000_000 / bpm).to_bytes(3, "big"), 81))
    for index, track in enumerate(tracks):
        tracks[index] = [e for e in track if e.meta != 81]
    tracks[0] = tempo_events + tracks[0]
    shapes = {0: 0, 0.5: -2, 1: -4, 1.5: -5, 2: 1, 3: 4, 3.5: -2}
    events_by_key = {
        (track_index, e.tick, e.status & 15, e.data[0],
         e.status & 240 == 144 and e.data[1] > 0): e
        for track_index, track in enumerate(tracks)
        for e in track if e.status & 240 in (128, 144)
    }
    for label, notes in voices.items():
        voice = label.split(" (")[0]
        for index, note in enumerate(notes):
            quarter = note.start / ppq
            bar, beat = int(quarter // 4), quarter % 4
            length = (note.end - note.start) / ppq
            matching = [start for start, part in entries
                        if part == voice and 0 <= quarter - start < 8]
            head_offset = quarter - max(matching) if matching else None
            level = 62 + (3 if beat in (0, 2) else -2)
            if head_offset is not None:
                level = 76 + shapes.get(head_offset, 1 if beat == 2 else -3)
            if (voice == "Soprano" and bar in (6, 7)) or (voice == "Alto" and bar in (12, 13)):
                level = 72 + (3 if beat % 1 == 0 else -3)
            if 8 <= bar < 16:
                level += 3
            # Weight a prepared dissonance, then release its resolution.
            if voice == "Soprano" and (bar, beat) in {(11, 1.5), (16, 0), (17, 0)}:
                level += 4
            if voice == "Soprano" and (bar, beat) in {(11, 2.5), (16, 1.5), (17, 1.5)}:
                level -= 4
            if bar in (16, 17):
                level -= 2
            if bar == 24 and voice == "Soprano":
                level = round(69 + beat * 2)
            if bar == 25:
                level = {"Soprano": 68, "Alto": 57, "Bass": 60}[voice]
            # Bass attacks arrive fractionally early; resolutions settle later.
            shift = -3 if voice == "Bass" else (2 if voice == "Alto" else 0)
            if beat % 1 and voice != "Bass":
                shift += 1
            on = events_by_key[(note.track, note.start, note.channel, note.pitch, True)]
            off = events_by_key[(note.track, note.end, note.channel, note.pitch, False)]
            on.tick = max(0, note.start + shift)
            on.data = bytes([note.pitch, max(48, min(86, level))])
            tied = int(quarter // 4) != int(((note.end - 1) / ppq) // 4)
            gap_ms = 7 if length <= 0.25 else (11 if length <= 0.5 else 26)
            if head_offset is not None or tied:
                gap_ms = 6
            if voice == "Bass" and length >= 1:
                gap_ms = 42
            if bar in cadences and beat >= 3 and not tied:
                gap_ms += 18
            if bar == 25:
                gap_ms = 0
            gap_ticks = round(gap_ms * ppq * bar_tempos[bar] / 60000)
            off.tick = max(on.tick + 1, note.end - gap_ticks)
    # Pedal is reserved for the final arpeggio and tonic, with a clean change.
    pedal = []
    channels = {notes[0].channel for notes in voices.values()}
    for channel in channels:
        for quarter, value in ((98.125, 95), (100, 0), (100.125, 95), (104, 0)):
            pedal.append(Event(round(quarter * ppq), 176 + channel, bytes([64, value])))
    tracks[0] = pedal + tracks[0]


def timeline(source):
    _, ppq, tracks = read_midi(source)
    voices, _ = extract_notes(tracks)
    tempos = sorted({
        (e.tick, int.from_bytes(e.data, "big"))
        for track in tracks for e in track if e.meta == 81
    })
    end = max(
        max(n.end for ns in voices.values() for n in ns),
        max(e.tick for track in tracks for e in track if e.meta == 47),
    )
    bars = end // (4 * ppq)
    data = {
        "bars": bars,
        "beatsPerBar": 4,
        "barStarts": [seconds_at(bar * 4 * ppq, ppq, tempos) for bar in range(bars + 1)],
        "quarterStarts": [seconds_at(quarter * ppq, ppq, tempos) for quarter in range(bars * 4 + 1)],
        "gridStep": 0.125,
        "gridStarts": [seconds_at(index * ppq / 8, ppq, tempos) for index in range(bars * 32 + 1)],
        "duration": seconds_at(end, ppq, tempos),
        "notes": [
            {
                "voice": label.split(" (")[0].lower(), "pitch": n.pitch,
                "quarter": n.start / ppq, "durationQuarters": (n.end - n.start) / ppq,
                "start": seconds_at(n.start, ppq, tempos),
                "end": seconds_at(n.end, ppq, tempos),
            }
            for label, ns in voices.items() for n in ns
        ],
    }
    return data


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--out", type=Path, default=Path("render"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    for instrument in ("organ", "piano"):
        target = args.out / f"fugue-{instrument}.midi"
        make_performance(args.source, target, instrument)
        (args.out / f"timeline-{instrument}.json").write_text(
            json.dumps(timeline(target), indent=2) + "\n")
    (args.out / "timeline.json").write_text(json.dumps(timeline(args.source), indent=2) + "\n")
