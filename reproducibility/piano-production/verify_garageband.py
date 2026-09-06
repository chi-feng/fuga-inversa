"""Compare saved native piano-roll observations and WAVE markers with the MIDI."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import wave
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from audit_midi import extract_notes, read_midi
from prepare_performance import seconds_at

OUT = Path(__file__).resolve().parent
PITCH_CLASSES = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def read_native_notes(path):
    observed = json.loads(path.read_text())
    by_pitch = defaultdict(list)
    for row in observed["notes"]:
        match = re.search(r"Description: Note at (.*), ([A-G])([♯♭]?)(-?\d+)$", row)
        if match is None:
            raise ValueError(row)
        position, letter, accidental, octave = match.groups()

        def number(word, default, position=position):
            found = re.search(r"(\d+) " + word, position)
            return int(found[1]) if found else default

        bar, beat = number("bar", 1), number("beat", 1)
        division, tick = number("division", 1), number("tick", 0)
        native_tick = ((bar - 1) * 4 + beat - 1) * 960 + (division - 1) * 240 + tick
        # GarageBand labels MIDI 60 as C3; the score audit labels it as C4.
        pitch = (int(octave) + 2) * 12 + PITCH_CLASSES[letter]
        pitch += {"": 0, "♯": 1, "♭": -1}[accidental]
        by_pitch[pitch].append(native_tick)
    return observed, by_pitch


def verify_part(part, native24=False):
    observed, actual = read_native_notes(OUT / f"garageband-{part}-ax-notes.json")
    midi_path = OUT / f"garageband-concert-{part}.mid"
    _, ppq, tracks = read_midi(midi_path)
    voices, _ = extract_notes(tracks)
    expected = defaultdict(list)
    for notes in voices.values():
        for note in notes:
            expected[note.pitch].append(note.start * 960 / ppq)
    assert {k: len(v) for k, v in actual.items()} == {
        k: len(v) for k, v in expected.items()
    }
    errors = [
        abs(a - b)
        for pitch in actual
        for a, b in zip(sorted(actual[pitch]), sorted(expected[pitch]))
    ]
    assert observed["timeQuantizeOff"] and max(errors) <= 1
    suffix = "" if part == "mix" else "-" + part
    precision = "-native24" if native24 else ""
    wav_path = OUT / f"steinway-concert-dry{precision}{suffix}.wav"
    with wave.open(str(wav_path), "rb") as audio:
        frames = audio.getnframes()
        channels, width, rate = (
            audio.getnchannels(),
            audio.getsampwidth(),
            audio.getframerate(),
        )
        actual_frames = len(audio.readframes(frames)) // (channels * width)
    assert frames == actual_frames == 3145728, (
        "Wait for the native export to finish writing"
    )
    assert rate == 44100 and channels == 2 and width == (3 if native24 else 2)
    probe = json.loads(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_chapters", "-of", "json", str(wav_path)],
            text=True,
        )
    )
    chapters = probe["chapters"]
    tempos = sorted(
        (e.tick, int.from_bytes(e.data, "big"))
        for track in tracks
        for e in track
        if e.meta == 81
    )
    unique = []
    for tick, tempo in tempos:
        if not unique or tempo != unique[-1][1]:
            unique.append((tick, tempo))
    assert len(chapters) == len(unique)
    time_errors, bpm_errors = [], []
    for chapter, (tick, tempo) in zip(chapters, unique):
        native_bpm = float(chapter["tags"]["title"].removeprefix("Tempo: "))
        bpm_errors.append(abs(native_bpm - 60_000_000 / tempo))
        time_errors.append(
            abs(float(chapter["start_time"]) - seconds_at(tick, ppq, tempos))
        )
    assert max(bpm_errors) < 0.001 and max(time_errors) < 0.01
    report = {
        "sourceMidi": midi_path.name,
        "nativeProject": observed["project"],
        "noteCount": len(errors),
        "pitchMultisetMatches": True,
        "timeQuantizeOff": True,
        "maximumOnsetDifferenceNativeTicks": max(errors),
        "nativeTicksPerQuarter": 960,
        "wav": wav_path.name,
        "wavSha256": hashlib.sha256(wav_path.read_bytes()).hexdigest(),
        "frames": frames,
        "sampleRate": rate,
        "channels": channels,
        "bitsPerSample": 8 * width,
        "durationSeconds": frames / rate,
        "tempoMarkers": len(chapters),
        "maximumTempoDifferenceBpm": max(bpm_errors),
        "maximumTempoMarkerTimeDifferenceSeconds": max(time_errors),
    }
    marker_signature = [(c["start"], c["tags"]["title"]) for c in chapters]
    return report, marker_signature


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--native24",
        action="store_true",
        help="Check the separate native 24-bit exports",
    )
    args = parser.parse_args()
    reports, signatures = {}, []
    for part in ("mix", "soprano", "alto", "bass"):
        report, signature = verify_part(part, native24=args.native24)
        reports[part] = report
        signatures.append(signature)
    assert all(signature == signatures[0] for signature in signatures[1:])
    output = {
        "parts": reports,
        "commonNativeTempoMarkerTimeline": True,
        "commonFrameCount": True,
        "normalization": "Disabled in GarageBand Advanced settings for these exports",
        "gain": "All instrument tracks and the master remained at 0 dB",
        "limits": "Native accessibility exposes pitches and attacks here. Durations and velocities were checked in the imported MIDI; they were not round-tripped from the native project. The shared gain and disabled effects are observations of the UI settings, not inferred from audio peaks.",
    }
    filename = (
        "native24-render-checks.json" if args.native24 else "native-render-checks.json"
    )
    (OUT / filename).write_text(json.dumps(output, indent=2) + "\n")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
