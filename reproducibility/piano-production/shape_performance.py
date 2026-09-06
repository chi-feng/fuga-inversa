"""Prepare a phrased piano realization and explicit GarageBand import files."""

from __future__ import annotations

import hashlib
import json
import sys
from collections import Counter
from itertools import pairwise
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from audit_midi import Event, extract_notes, read_midi, write_midi
from prepare_performance import seconds_at, timeline

OUT = Path(__file__).resolve().parent

# The curve follows entries, sequential growth, suspensions, and cadences.
TEMPO_ANCHORS = [
    (0, 90),
    (1, 93),
    (2, 91),
    (3, 87),
    (4, 91),
    (5.5, 94),
    (7, 85),
    (7.75, 84),
    (8, 89),
    (9.5, 94),
    (10, 92),
    (11, 88),
    (12, 92),
    (13.5, 95),
    (15.5, 85),
    (16, 92),
    (17.5, 96),
    (18, 93),
    (19, 90),
    (20, 94),
    (21.5, 98),
    (23.5, 88),
    (24, 94),
    (26, 98),
    (28, 95),
    (29.5, 91),
    (31, 85),
    (31.75, 83),
    (32, 92),
    (33.5, 94),
    (34, 92),
    (35, 86),
    (36, 93),
    (38, 96),
    (39.5, 88),
    (40, 94),
    (42, 96),
    (43, 90),
    (44, 93),
    (45.5, 89),
    (46, 85),
    (46.5, 90),
    (47.5, 88),
    (48, 96),
    (50, 100),
    (52, 97),
    (54, 98),
    (55.5, 90),
    (56, 93),
    (57.5, 96),
    (58, 94),
    (59, 88),
    (60, 92),
    (61.5, 94),
    (62.5, 90),
    (63.5, 85),
    (64, 85),
    (65, 81),
    (65.5, 86),
    (66, 84),
    (67, 81),
    (68, 86),
    (69, 81),
    (69.5, 87),
    (70, 91),
    (71, 89),
    (71.5, 86),
    (72, 93),
    (73.5, 97),
    (74, 95),
    (75.5, 89),
    (76, 91),
    (77.5, 87),
    (78, 90),
    (79, 84),
    (80, 92),
    (81.5, 95),
    (82, 92),
    (83, 88),
    (84, 91),
    (85.5, 94),
    (86, 90),
    (87.5, 85),
    (88, 89),
    (90, 92),
    (91.5, 87),
    (92, 85),
    (94, 80),
    (95.75, 77),
    (96, 80),
    (97, 78),
    (98, 83),
    (99, 86),
    (99.5, 79),
    (100, 54),
    (104, 54),
]
DYNAMIC_ANCHORS = [
    (0, 65),
    (8, 69),
    (16, 73),
    (24, 70),
    (32, 74),
    (40, 77),
    (46, 80),
    (48, 75),
    (56, 73),
    (64, 69),
    (69, 66),
    (72, 79),
    (80, 75),
    (88, 69),
    (94, 63),
    (96, 72),
    (99, 81),
    (100, 72),
    (104, 72),
]
ENTRIES = {
    "Soprano": [8, 32, 72],
    "Alto": [0, 40, 72.5],
    "Bass": [16, 56, 80],
}
HEAD_SHAPE = {0: 3, 0.5: -2, 1: 0, 1.5: -5, 2: 1, 3: 6, 3.5: -3}
PHRASE_ENDS = {8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96}
PEDAL_SPANS = [
    (31.125, 31.875),
    (70.125, 71.875),
    (79.125, 79.875),
    (94.125, 95.875),
    (96.125, 96.875),
    (97.125, 99.875),
    (100.125, 104),
]


def curve(points, quarter):
    for (left, a), (right, b) in pairwise(points):
        if left <= quarter <= right:
            t = (quarter - left) / (right - left)
            return a + (b - a) * t * t * (3 - 2 * t)
    return points[0][1] if quarter < points[0][0] else points[-1][1]


def role_at(voice, quarter):
    matches = [start for start in ENTRIES[voice] if 0 <= quarter - start < 8]
    if matches:
        start = max(matches)
        return ("head" if quarter - start < 4 else "tail"), quarter - start
    if (voice == "Soprano" and 24 <= quarter < 32) or (
        voice == "Alto" and 48 <= quarter < 56
    ):
        return "episode", None
    return "counterpoint", None


def touch(voice, note, previous, following, ppq):
    q = note.start / ppq
    duration = (note.end - note.start) / ppq
    role, offset = role_at(voice, q)
    dynamic = curve(DYNAMIC_ANCHORS, q)
    weight = {"Soprano": -5, "Alto": -12, "Bass": -10}[voice]
    if role == "head":
        weight = 4 + HEAD_SHAPE.get(offset, 0)
        if voice == "Alto" and 72.5 <= q < 76.5:
            weight -= 3
    elif role == "tail":
        weight = 1 if q % 1 == 0 else -3
    elif role == "episode":
        weight = 1 if duration >= 0.5 else -5
    elif q % 1:
        weight -= 3
    if voice == "Bass" and note.pitch < 48 and role != "head":
        weight -= 2
    if (
        previous
        and following
        and duration >= 0.5
        and previous.pitch < note.pitch > following.pitch
    ):
        weight += 2
    if voice == "Soprano" and q in (45.5, 64, 68):
        weight += 4
    if voice == "Soprano" and q in (46.5, 65.5, 69.5):
        weight -= 5
    velocity = round(max(43, min(89, dynamic + weight)))
    if q >= 100:
        velocity = {"Soprano": 76, "Alto": 55, "Bass": 65}[voice]

    # Arrival asynchrony belongs to phrase and harmonic events, not random jitter.
    shift_ms = 0.0
    if role == "counterpoint" and voice == "Bass" and q % 1 == 0:
        shift_ms = -7
    if voice == "Soprano" and q in (36, 44, 64, 68, 76, 92, 94, 96):
        shift_ms = 12
    if voice == "Soprano" and q in (46.5, 65.5, 69.5):
        shift_ms = 17
    if voice == "Alto" and role == "counterpoint" and duration >= 1:
        shift_ms = 5
    if q == 100:
        shift_ms = {"Soprano": 11, "Alto": 4, "Bass": 0}[voice]

    if duration <= 0.25:
        gap_ms = 7
    elif role in ("head", "tail"):
        gap_ms = 12 if duration <= 0.5 else 18
    elif role == "episode":
        gap_ms = 10
    else:
        gap_ms = {"Soprano": 24, "Alto": 38, "Bass": 54}[voice]
    if following:
        leap = abs(following.pitch - note.pitch)
        if leap == 0:
            gap_ms = max(gap_ms, 40)
        elif leap >= 5 and role != "head":
            gap_ms = max(gap_ms, 34)
    if note.end / ppq in PHRASE_ENDS:
        gap_ms = max(gap_ms, 64 if voice != "Bass" else 78)
    if duration > 1.0 and note.end % (4 * ppq):
        gap_ms = min(gap_ms, 18)
    if q >= 100:
        gap_ms = 0
    return velocity, shift_ms, gap_ms, role


def score_signature(voices):
    return {
        label.split(" (")[0]: [n.pitch for n in notes]
        for label, notes in voices.items()
    }


def export(voices, ppq, tempos, performed, suffix, pedal_spans):
    conductor = [
        Event(0, 255, b"Fuga inversa - concert piano", 3),
        Event(0, 255, bytes([4, 2, 24, 8]), 88),
        Event(0, 255, bytes([255, 1]), 89),
        *tempos,
        Event(104 * ppq, 255, b"", 47),
    ]
    tracks = [conductor]
    for channel, (voice, notes) in enumerate(performed.items()):
        track = [
            Event(0, 255, voice.encode(), 3),
            Event(0, 176 + channel, bytes([0, 0])),
            Event(0, 176 + channel, bytes([32, 0])),
            Event(0, 192 + channel, bytes([0])),
        ]
        for start, end in pedal_spans:
            track += [
                Event(round(start * ppq), 176 + channel, bytes([64, 80])),
                Event(round(end * ppq), 176 + channel, bytes([64, 0])),
            ]
        for n in notes:
            track.extend(
                [
                    Event(
                        n["startTick"],
                        144 + channel,
                        bytes([n["pitch"], n["velocity"]]),
                    ),
                    Event(n["endTick"], 128 + channel, bytes([n["pitch"], 0])),
                ]
            )
        track.append(Event(104 * ppq, 255, b"", 47))
        tracks.append(sorted(track, key=lambda e: (e.tick, e.status & 240 != 128)))
    output = OUT / f"fugue-piano-{suffix}.mid"
    write_midi(output, 1, ppq, tracks)
    _, _, checked = read_midi(output)
    checked_voices, _ = extract_notes(checked)
    assert score_signature(voices) == score_signature(checked_voices)
    assert sum(map(len, checked_voices.values())) == 382
    assert all(n.end > n.start for ns in checked_voices.values() for n in ns)
    assert all(
        a.end <= b.start for ns in checked_voices.values() for a, b in pairwise(ns)
    )

    # GarageBand gets one physical piano track. Voice stems retain the same pedal.
    for stem in ("mix", "soprano", "alto", "bass"):
        flat = [e for e in conductor if e.meta != 3]
        flat.insert(0, Event(0, 255, f"Steinway {stem}".encode(), 3))
        flat += [
            Event(0, 176, bytes([0, 0])),
            Event(0, 176, bytes([32, 0])),
            Event(0, 192, bytes([0])),
        ]
        for start, end in pedal_spans:
            flat += [
                Event(round(start * ppq), 176, bytes([64, 80])),
                Event(round(end * ppq), 176, bytes([64, 0])),
            ]
        for voice, notes in performed.items():
            if stem != "mix" and voice.lower() != stem:
                continue
            for n in notes:
                flat += [
                    Event(n["startTick"], 144, bytes([n["pitch"], n["velocity"]])),
                    Event(n["endTick"], 128, bytes([n["pitch"], 0])),
                ]
        flat.sort(key=lambda e: (e.tick, e.status & 240 != 128, e.meta == 47))
        target = OUT / f"garageband-{suffix}-{stem}.mid"
        write_midi(target, 0, ppq, [flat])
        _, _, roundtrip = read_midi(target)
        flat_voices, _ = extract_notes(roundtrip)
        actual = Counter(
            (n.start, n.end, n.pitch, n.velocity)
            for ns in flat_voices.values()
            for n in ns
        )
        expected = Counter(
            (n["startTick"], n["endTick"], n["pitch"], n["velocity"])
            for voice, notes in performed.items()
            if stem == "mix" or voice.lower() == stem
            for n in notes
        )
        assert actual == expected
    (OUT / f"timeline-{suffix}.json").write_text(
        json.dumps(timeline(output), indent=2) + "\n"
    )
    return output


def main():
    source = ROOT / "fugue.midi"
    _, ppq, tracks = read_midi(source)
    voices, _ = extract_notes(tracks)
    assert sum(map(len, voices.values())) == 382
    tempos = [
        Event(
            round(q * ppq),
            255,
            round(60_000_000 / curve(TEMPO_ANCHORS, q)).to_bytes(3, "big"),
            81,
        )
        for q in (x / 8 for x in range(833))
    ]
    time_pairs = [(e.tick, int.from_bytes(e.data, "big")) for e in tempos]
    performed = {}
    for label, notes in voices.items():
        voice = label.split(" (")[0]
        rows = []
        for index, n in enumerate(notes):
            before = notes[index - 1] if index else None
            after = notes[index + 1] if index + 1 < len(notes) else None
            velocity, shift_ms, gap_ms, role = touch(voice, n, before, after, ppq)
            ticks_per_ms = ppq * curve(TEMPO_ANCHORS, n.start / ppq) / 60_000
            rows.append(
                {
                    "pitch": n.pitch,
                    "scoreQuarter": n.start / ppq,
                    "scoreDurationQuarters": (n.end - n.start) / ppq,
                    "startTick": max(0, n.start + round(shift_ms * ticks_per_ms)),
                    "endTick": n.end - round(gap_ms * ticks_per_ms),
                    "velocity": velocity,
                    "role": role,
                    "attackShiftMs": shift_ms,
                    "releaseGapMs": gap_ms,
                }
            )
        for a, b in pairwise(rows):
            a["endTick"] = min(a["endTick"], b["startTick"] - 1)
        for row in rows:
            assert row["endTick"] > row["startTick"]
            row["startSeconds"] = seconds_at(row["startTick"], ppq, time_pairs)
            row["endSeconds"] = seconds_at(row["endTick"], ppq, time_pairs)
        performed[voice] = rows
    output = export(voices, ppq, tempos, performed, "concert", PEDAL_SPANS)
    report = {
        "source": "fugue.midi",
        "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "output": output.name,
        "outputSha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "bars": 26,
        "ticksPerQuarter": ppq,
        "noteCount": 382,
        "pitchSequenceByVoiceUnchanged": True,
        "performedVoicesMonophonic": True,
        "randomization": "none",
        "tempoAnchors": TEMPO_ANCHORS,
        "pedalSpansQuarters": PEDAL_SPANS,
        "notes": performed,
        "durationSeconds": seconds_at(104 * ppq, ppq, time_pairs),
        "velocityRange": [
            min(n["velocity"] for ns in performed.values() for n in ns),
            max(n["velocity"] for ns in performed.values() for n in ns),
        ],
    }
    (OUT / "performance-checks.json").write_text(json.dumps(report, indent=2) + "\n")
    print(
        json.dumps(
            {k: v for k, v in report.items() if k not in {"notes", "tempoAnchors"}},
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
