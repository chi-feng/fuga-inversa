"""Inspect LilyPond's exported voices; the flags still require musical review."""

from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import struct
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from statistics import median


@dataclass
class Event:
    tick: int
    status: int
    data: bytes
    meta: int | None = None


@dataclass
class Note:
    start: int
    end: int
    pitch: int
    velocity: int
    track: int
    channel: int


def read_vlq(data, pos):
    value = 0
    while True:
        byte = data[pos]
        pos += 1
        value = (value << 7) | (byte & 127)
        if byte < 128:
            return value, pos


def vlq(value):
    out = [value & 127]
    value >>= 7
    while value:
        out.insert(0, 128 | (value & 127))
        value >>= 7
    return bytes(out)


def read_midi(path):
    data = Path(path).read_bytes()
    if data[:4] != b"MThd":
        raise ValueError("Not a MIDI file")
    header_length = struct.unpack_from(">I", data, 4)[0]
    fmt, count, ppq = struct.unpack_from(">HHH", data, 8)
    if ppq & 32768:
        raise ValueError("SMPTE time division is not supported")
    pos = 8 + header_length
    tracks = []
    for _ in range(count):
        if data[pos : pos + 4] != b"MTrk":
            raise ValueError("Missing MIDI track")
        length = struct.unpack_from(">I", data, pos + 4)[0]
        pos += 8
        end = pos + length
        tick = 0
        running = None
        events = []
        while pos < end:
            delta, pos = read_vlq(data, pos)
            tick += delta
            if data[pos] >= 128:
                status = data[pos]
                pos += 1
                if status < 240:
                    running = status
            elif running is not None:
                status = running
            else:
                raise ValueError("Missing running status")
            if status == 255:
                meta = data[pos]
                length, pos = read_vlq(data, pos + 1)
                events.append(Event(tick, status, data[pos : pos + length], meta))
            elif status in (240, 247):
                length, pos = read_vlq(data, pos)
                events.append(Event(tick, status, data[pos : pos + length]))
            else:
                length = 1 if status & 240 in (192, 208) else 2
                events.append(Event(tick, status, data[pos : pos + length]))
            pos += length
        tracks.append(events)
    return fmt, ppq, tracks


def write_midi(path, fmt, ppq, tracks):
    chunks = [b"MThd" + struct.pack(">IHHH", 6, fmt, len(tracks), ppq)]
    for track in tracks:
        body = bytearray()
        previous = 0
        for event in sorted(track, key=lambda event: event.tick):
            body += vlq(event.tick - previous)
            previous = event.tick
            body.append(event.status)
            if event.status == 255:
                body.append(event.meta)
                body += vlq(len(event.data))
            elif event.status in (240, 247):
                body += vlq(len(event.data))
            body += event.data
        chunks.append(b"MTrk" + struct.pack(">I", len(body)) + body)
    Path(path).write_bytes(b"".join(chunks))


def extract_notes(tracks):
    voices = defaultdict(list)
    names = {}
    for track_number, track in enumerate(tracks):
        active = {}
        for event in track:
            if event.meta == 3:
                names[track_number] = event.data.decode("utf-8", errors="replace")
            kind, channel = event.status & 240, event.status & 15
            if kind not in (128, 144):
                continue
            pitch, velocity = event.data
            key = (channel, pitch)
            if kind == 144 and velocity:
                if key in active:
                    raise ValueError(f"Overlapping identical note in track {track_number}")
                active[key] = (event.tick, velocity)
            else:
                if key not in active:
                    raise ValueError(f"Unmatched note-off in track {track_number}: {key}")
                start, attack_velocity = active.pop(key)
                voices[(track_number, channel)].append(
                    Note(start, event.tick, pitch, attack_velocity, track_number, channel)
                )
        if active:
            raise ValueError(f"Unreleased notes in track {track_number}")
    ordered = sorted(voices, key=lambda key: -median(n.pitch for n in voices[key]))
    result = {}
    for rank, key in enumerate(ordered):
        base = ("Soprano", "Alto", "Bass")[rank] if len(ordered) == 3 else f"Voice {rank + 1}"
        label = f"{base} (track {key[0]}, channel {key[1] + 1})"
        result[label] = sorted(voices[key], key=lambda n: (n.start, n.end))
    return result, names


def pitch_name(pitch):
    names = ("C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B")
    return f"{names[pitch % 12]}{pitch // 12 - 1}"


def location(tick, ppq):
    return {"bar": tick // (4 * ppq) + 1, "beat": (tick % (4 * ppq)) / ppq + 1}


def sounding(notes, tick):
    return [n for n in notes if n.start <= tick < n.end]


def scan_parallels(voices, ppq, grid=None):
    names = list(voices)
    times = sorted({t for ns in voices.values() for n in ns for t in (n.start, n.end)})
    if grid is not None:
        times = list(range(0, max(times) + 1, grid))
    flags = []
    for upper, lower in itertools.combinations(names, 2):
        last = None
        for tick in times:
            u, l = sounding(voices[upper], tick), sounding(voices[lower], tick)
            if len(u) != 1 or len(l) != 1:
                last = None
                continue
            pair = (u[0].pitch, l[0].pitch)
            if last:
                old_tick, old = last
                du, dl = pair[0] - old[0], pair[1] - old[1]
                old_class, new_class = (old[0] - old[1]) % 12, (pair[0] - pair[1]) % 12
                flag = None
                if du and dl and old_class == new_class and new_class in (0, 7):
                    flag = "parallel" if du * dl > 0 else "contrary perfects"
                elif du * dl > 0 and abs(du) > 2 and new_class in (0, 7) and upper == names[0] and lower == names[-1]:
                    flag = "direct outer perfect with upper leap"
                if flag:
                    flags.append({
                        **location(tick, ppq), "kind": flag,
                        "interval": "octave/unison" if new_class == 0 else "fifth",
                        "voices": [upper, lower], "from": location(old_tick, ppq),
                        "pitches": [[pitch_name(p) for p in old], [pitch_name(p) for p in pair]],
                    })
            last = (tick, pair)
    return flags


def ornament_shape(notes, note):
    index = notes.index(note)
    if index == 0 or index == len(notes) - 1:
        return None
    previous, following = notes[index - 1], notes[index + 1]
    a, b = note.pitch - previous.pitch, following.pitch - note.pitch
    if abs(a) in (1, 2) and abs(b) in (1, 2):
        return "stepwise passing shape" if a * b > 0 else "neighbor shape"
    return None


def audit(path):
    fmt, ppq, tracks = read_midi(path)
    voices, track_names = extract_notes(tracks)
    names = list(voices)
    all_times = sorted({t for ns in voices.values() for n in ns for t in (n.start, n.end)})
    issues, dissonances, fourths, wide_spans = [], [], [], []
    entries, passing_shapes = [], []
    for label, notes in voices.items():
        for left, right in itertools.pairwise(notes):
            if left.end > right.start:
                issues.append({**location(right.start, ppq), "kind": "polyphonic voice", "voice": label})
        for index, note in enumerate(notes):
            shape = ornament_shape(notes, note)
            if shape and note.end - note.start <= ppq / 2:
                passing_shapes.append({**location(note.start, ppq), "voice": label, "note": pitch_name(note.pitch), "shape": shape})
            group = notes[index:index + 7]
            if len(group) != 7:
                continue
            steps = [b.pitch - a.pitch for a, b in itertools.pairwise(group)]
            onsets = [(n.start - group[0].start) / ppq for n in group]
            if steps == [-2, -1, -2, 3, 4, -2] and onsets == [0, 0.5, 1, 1.5, 2, 3, 3.5]:
                entries.append({**location(note.start, ppq), "voice": label, "start_pitch": pitch_name(note.pitch)})
    max_rh_span, max_reach, max_sounding = 0, 0, 0
    for tick in all_times:
        active = {label: sounding(notes, tick) for label, notes in voices.items()}
        count = sum(len(ns) for ns in active.values())
        max_sounding = max(max_sounding, count)
        selected = {label: ns[0] for label, ns in active.items() if len(ns) == 1}
        pitches = sorted(n.pitch for n in selected.values())
        if len(pitches) == 3:
            max_rh_span = max(max_rh_span, pitches[2] - pitches[1])
            reach = min(pitches[2] - pitches[1], pitches[1] - pitches[0])
            max_reach = max(max_reach, reach)
            if reach > 12:
                wide_spans.append({**location(tick, ppq), "pitches": [pitch_name(p) for p in pitches], "required_pair_span": reach})
        for upper, lower in itertools.combinations(names, 2):
            if upper not in selected or lower not in selected:
                continue
            u, l = selected[upper], selected[lower]
            if u.pitch < l.pitch:
                issues.append({**location(tick, ppq), "kind": "voice crossing", "voices": [upper, lower]})
            interval = (u.pitch - l.pitch) % 12
            bass_fourth = interval == 5 and l.pitch == min(pitches)
            if interval in (1, 2, 6, 10, 11) or bass_fourth:
                row = {
                    **location(tick, ppq), "voices": [upper, lower],
                    "pitches": [pitch_name(u.pitch), pitch_name(l.pitch)],
                    "interval_class": interval, "on_quarter_beat": tick % ppq == 0,
                    "upper_sustained": u.start < tick, "lower_sustained": l.start < tick,
                    "upper_shape": ornament_shape(voices[upper], u),
                    "lower_shape": ornament_shape(voices[lower], l),
                }
                (fourths if bass_fourth else dissonances).append(row)
    return {
        "source": str(Path(path).resolve()), "sha256": hashlib.sha256(Path(path).read_bytes()).hexdigest(),
        "midi_format": fmt, "ticks_per_quarter": ppq, "track_names": track_names,
        "voice_count": len(voices), "duration_quarters": max(all_times) / ppq,
        "voice_ranges": {name: [pitch_name(min(n.pitch for n in ns)), pitch_name(max(n.pitch for n in ns))] for name, ns in voices.items()},
        "voice_note_counts": {name: len(ns) for name, ns in voices.items()},
        "maximum_simultaneous_notes": max_sounding,
        "maximum_upper_pair_span_semitones": max_rh_span,
        "maximum_minimum_two_hand_pair_span_semitones": max_reach,
        "literal_inverted_lick_entries": entries,
        "adjacent_sonority_perfect_interval_flags": scan_parallels(voices, ppq),
        "quarter_beat_reduction_flags": scan_parallels(voices, ppq, ppq),
        "structural_issues": issues, "unreachable_sonorities": wide_spans,
        "dissonant_intervals_for_review": dissonances, "bass_fourths_for_review": fourths,
        "short_passing_or_neighbor_shapes": passing_shapes,
        "limits": "MIDI loses spelling. Dissonance and reduction flags need harmonic/rhythmic judgment. An octave reach check does not establish full keyboard fingering. Passing shapes are not automatically non-chord tones. No claim of complete stylistic correctness is implied.",
    }


def self_test():
    def ns(pitches, octave=0):
        return [Note(i * 480, (i + 1) * 480, p + octave, 80, 0, 0) for i, p in enumerate(pitches)]
    assert scan_parallels({"upper": ns([67, 69]), "lower": ns([60, 62])}, 480)[0]["kind"] == "parallel"
    assert scan_parallels({"upper": ns([72, 74]), "lower": ns([60, 62])}, 480)[0]["interval"] == "octave/unison"
    assert not scan_parallels({"upper": ns([64, 65]), "lower": ns([60, 62])}, 480)
    assert not scan_parallels({"upper": ns([67, 67]), "lower": ns([60, 62])}, 480)
    assert scan_parallels({"upper": ns([64, 69]), "lower": ns([60, 62])}, 480)[0]["kind"] == "direct outer perfect with upper leap"
    for value in (0, 1, 127, 128, 16383, 16384, 0x0FFFFFFF):
        encoded = vlq(value)
        assert read_vlq(encoded, 0) == (value, len(encoded))
    print("Fixtures detect parallel fifths/octaves and direct outer fifths; thirds and oblique motion are unflagged.")


def ledger(path, target):
    _, ppq, tracks = read_midi(path)
    voices, _ = extract_notes(tracks)
    end = max(n.end for ns in voices.values() for n in ns)
    lines = ["Pitch names are inferred from MIDI; consult LilyPond for enharmonic spelling."]
    for bar in range((end + 4 * ppq - 1) // (4 * ppq)):
        lines.append(f"\nBar {bar + 1}        1       &       2       &       3       &       4       &")
        for name, notes in voices.items():
            cells = []
            for eighth in range(8):
                tick = bar * 4 * ppq + eighth * ppq // 2
                active = sounding(notes, tick)
                cells.append("/".join(pitch_name(n.pitch) + ("~" if n.start < tick else "") for n in active) or "rest")
            lines.append(f"{name.split(' (')[0]:12}" + "".join(f"{cell:8}" for cell in cells))
    Path(target).write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("midi", nargs="?")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--ledger", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    if args.midi:
        report = audit(args.midi)
        if args.ledger:
            ledger(args.midi, args.ledger)
        if args.output:
            args.output.write_text(json.dumps(report, indent=2) + "\n")
        summary = {key: report[key] for key in (
            "source", "voice_count", "duration_quarters", "voice_ranges", "maximum_simultaneous_notes",
            "maximum_upper_pair_span_semitones", "literal_inverted_lick_entries",
            "adjacent_sonority_perfect_interval_flags", "structural_issues", "unreachable_sonorities",
        )}
        summary["quarter_beat_reduction_flag_count"] = len(report["quarter_beat_reduction_flags"])
        summary["dissonance_review_count"] = len(report["dissonant_intervals_for_review"]) + len(report["bass_fourths_for_review"])
        print(json.dumps(summary, indent=2))
