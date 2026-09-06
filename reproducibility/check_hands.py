"""Check the final score's printed hand allocation against its symbolic MIDI.

The parser accepts the restricted, absolute-pitch notation used in fugue.ly.
Unsupported music syntax fails explicitly instead of receiving a reach verdict.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from fractions import Fraction
from itertools import pairwise
from pathlib import Path

from audit_midi import extract_notes, pitch_name, read_midi

HANDS = {"upper": "RH", "lower": "LH"}
VOICES = ("Soprano", "Alto", "Bass")
NOTE = re.compile(r"([a-gr])((?:isis|eses|is|es)?)([',]*)(1|2|4|8|16|32|64)(\.*)(~?)(?=$|[\s|\\}])")


def block(text, start, opening="{", closing="}"):
    if not text.startswith(opening, start):
        raise ValueError("Expected a delimited block")
    pattern = re.compile(r'"(?:\\.|[^"\\])*"|' + re.escape(opening) + "|" + re.escape(closing))
    depth = 0
    for match in pattern.finditer(text, start):
        token = match.group()
        if token == opening:
            depth += 1
        elif token == closing:
            depth -= 1
            if depth == 0:
                return text[start + len(opening):match.start()], match.end()
    raise ValueError("Unclosed source block")


def printed_assignments(text):
    score_match = re.search(r"\\score\s*\{", text)
    if score_match is None:
        raise ValueError("The printed score is missing")
    score_start = score_match.end() - 1
    score, _ = block(text, score_start)
    if "\\removeWithTag #'midi" not in score:
        raise ValueError("Unsupported printed score tag selection")
    assignments = {}
    staff_matches = list(re.finditer(r'\\new\s+Staff\s*=\s*"([^"]+)"\s*<<', score))
    if {m[1] for m in staff_matches} != set(HANDS) or len(staff_matches) != 2:
        raise ValueError("Unsupported printed staff declarations")
    for staff_match in staff_matches:
        staff, _ = block(score, staff_match.end() - 2, "<<", ">>")
        for voice_match in re.finditer(r'\\new\s+Voice\s*=\s*"([^"]+)"\s*\{', staff):
            voice = voice_match[1]
            body, _ = block(staff, voice_match.end() - 1)
            allowed = rf'\s*\\{voice.lower()}\s*(?:\\bar\s*"\|\."\s*)?'
            if voice not in VOICES or not re.fullmatch(allowed, body):
                raise ValueError("Unsupported printed voice declaration")
            if voice in assignments:
                raise ValueError("A printed voice is declared twice")
            assignments[voice] = staff_match[1]
    if set(assignments) != set(VOICES):
        raise ValueError("The printed score must declare all three voices")
    return assignments


def parse_voice(text, voice, initial_staff):
    variable = re.search(rf"(?m)^{voice.lower()}\s*=\s*\{{", text)
    if variable is None:
        raise ValueError(f"Unsupported or missing {voice} definition")
    body_start = variable.end()
    body, _ = block(text, body_start - 1)
    time = Fraction(0)
    notes, transfers = [], []

    def parse(fragment, offset):
        nonlocal time
        pos = 0
        while pos < len(fragment):
            if fragment[pos].isspace():
                pos += 1
                continue
            line = text.count("\n", 0, offset + pos) + 1
            if fragment[pos] == "|":
                if time % 4:
                    raise ValueError(f"Incomplete bar in {voice}, source line {line}")
                pos += 1
                continue
            tag = re.match(r"\\tag\s+#'([A-Za-z]+)\s*\{", fragment[pos:])
            if tag:
                if tag[1] != "layout":
                    raise ValueError(f"Unsupported voice tag on source line {line}")
                opening = pos + tag.end() - 1
                nested, end = block(fragment, opening)
                parse(nested, offset + opening + 1)
                pos = end
                continue
            change = re.match(r'\\change\s+Staff\s*=\s*"([^"]+)"', fragment[pos:])
            if change:
                if change[1] not in HANDS:
                    raise ValueError(f"Unsupported staff on source line {line}")
                transfers.append({"time": time, "staff": change[1], "line": line})
                pos += change.end()
                continue
            command = re.match(r"\\(?:oneVoice|voiceOne|voiceTwo|hideNotes|unHideNotes|fermata)\b|\\clef\s+(?:bass|treble)\b", fragment[pos:])
            if command:
                pos += command.end()
                continue
            note = NOTE.match(fragment, pos)
            if note:
                letter, accidental, octave, denominator, dots, tied = note.groups()
                duration = Fraction(4, int(denominator)) * sum(Fraction(1, 2**n) for n in range(len(dots) + 1))
                pitch = None
                if letter != "r":
                    pitch = 48 + {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}[letter]
                    pitch += {"": 0, "is": 1, "es": -1, "isis": 2, "eses": -2}[accidental]
                    pitch += 12 * (octave.count("'") - octave.count(","))
                elif accidental or octave or tied:
                    raise ValueError(f"Malformed rest on source line {line}")
                notes.append({"start": time, "end": time + duration, "pitch": pitch, "tie": bool(tied), "line": line, "token": note[0]})
                time += duration
                pos = note.end()
                continue
            raise ValueError(f"Unsupported {voice} syntax on source line {line}: {fragment[pos:pos + 30]!r}")

    parse(body, body_start)
    merged, tied = [], False
    for note in notes:
        if note["pitch"] is None:
            if tied:
                raise ValueError(f"A tie in {voice} ends in a rest")
            continue
        if tied:
            previous = merged[-1]
            if previous["pitch"] != note["pitch"] or previous["end"] != note["start"]:
                raise ValueError(f"A tie in {voice} changes pitch or has a gap")
            previous["end"] = note["end"]
        else:
            merged.append(dict(note))
        tied = note["tie"]
    if tied:
        raise ValueError(f"An unfinished tie ends {voice}")
    for transfer in transfers:
        if any(n["start"] < transfer["time"] < n["end"] for n in merged):
            raise ValueError("Unsupported staff transfer inside a sustained note")
    return {"notes": merged, "transfers": transfers, "initial_staff": initial_staff, "duration": time}


def location(time):
    return {"bar": int(time // 4) + 1, "beat": float(time % 4 + 1)}


def check_hands(source_path, midi_path, limit=12):
    source_path, midi_path = Path(source_path), Path(midi_path)
    raw = source_path.read_text()
    text = re.sub(r"%[^\n]*", lambda match: " " * len(match[0]), raw)
    global_match = re.search(r"(?m)^global\s*=\s*\{", text)
    if global_match is None:
        raise ValueError("The global definition is missing")
    global_body, _ = block(text, global_match.end() - 1)
    if not re.fullmatch(r"\s*\\key d \\minor\s+\\time 4/4\s*", global_body):
        raise ValueError("Unsupported meter or global music syntax")
    initial = printed_assignments(text)
    parsed = {voice: parse_voice(text, voice, initial[voice]) for voice in VOICES}
    durations = {data["duration"] for data in parsed.values()}
    if len(durations) != 1 or next(iter(durations)) % 4:
        raise ValueError("The voice durations do not form the same complete bars")
    duration = next(iter(durations))
    _, ppq, tracks = read_midi(midi_path)
    midi_voices, _ = extract_notes(tracks)
    if len(midi_voices) != 3:
        raise ValueError("The symbolic MIDI must contain three voices")
    available, voice_map = dict(midi_voices), {}
    for voice, data in parsed.items():
        expected = [(n["start"] * ppq, n["end"] * ppq, n["pitch"]) for n in data["notes"]]
        matches = [label for label, notes in available.items() if expected == [(n.start, n.end, n.pitch) for n in notes]]
        if len(matches) != 1:
            raise ValueError(f"MIDI does not match {voice}'s pitches, onsets, and tied durations")
        label = matches[0]
        notes = available.pop(label)
        if any(a.end > b.start for a, b in pairwise(notes)):
            raise ValueError(f"{voice} is not monophonic")
        voice_map[voice] = {"track": notes[0].track, "channel": notes[0].channel + 1, "notes": len(notes)}
    boundaries = {Fraction(0), duration}
    for data in parsed.values():
        boundaries.update(t for n in data["notes"] for t in (n["start"], n["end"]))
        boundaries.update(change["time"] for change in data["transfers"])
    boundaries = sorted(boundaries)
    frames, violations = [], []
    maximum = {"RH": 0, "LH": 0}
    for start, end in pairwise(boundaries):
        hands = {"RH": [], "LH": []}
        for voice, data in parsed.items():
            staff = data["initial_staff"]
            for change in data["transfers"]:
                if change["time"] <= start:
                    staff = change["staff"]
            for note in data["notes"]:
                if note["start"] <= start < note["end"]:
                    hands[HANDS[staff]].append({"voice": voice, "pitch": pitch_name(note["pitch"]), "midi_pitch": note["pitch"], "source_line": note["line"]})
        frame = {**location(start), "start_quarters": float(start), "end_quarters": float(end), "hands": {}}
        for hand, notes in hands.items():
            notes.sort(key=lambda n: n["midi_pitch"])
            span = notes[-1]["midi_pitch"] - notes[0]["midi_pitch"] if len(notes) > 1 else 0
            maximum[hand] = max(maximum[hand], span)
            frame["hands"][hand] = {"span_semitones": span, "notes": notes}
            if span > limit:
                violations.append({**location(start), "start_quarters": float(start), "end_quarters": float(end), "hand": hand, "span_semitones": span, "notes": notes})
        frames.append(frame)
    transfers = []
    for voice, data in parsed.items():
        for change in data["transfers"]:
            transfers.append({"voice": voice, **location(change["time"]), "quarter": float(change["time"]), "staff": change["staff"], "hand": HANDS[change["staff"]], "source_line": change["line"]})
    transfers.sort(key=lambda row: (row["quarter"], row["voice"]))
    return {
        "source": source_path.name,
        "source_sha256": hashlib.sha256(source_path.read_bytes()).hexdigest(),
        "midi": midi_path.name,
        "midi_sha256": hashlib.sha256(midi_path.read_bytes()).hexdigest(),
        "source_midi_agreement": {"method": "Exact pitch, onset, and tied duration matching for each complete voice", "matched_notes": sum(v["notes"] for v in voice_map.values()), "voices": voice_map},
        "duration_quarters": float(duration),
        "limit_semitones": limit,
        "initial_staff_assignment": initial,
        "staff_hand_convention": HANDS,
        "written_staff_transfers": transfers,
        "maximum_span_semitones": maximum,
        "passes": not violations,
        "violations": violations,
        "interval_count": len(frames),
        "sounding_intervals": frames,
        "limits": [
            "Upper staff means right hand; lower staff means left hand. This reads the printed score's explicit transfers.",
            "Every note start, note end, and staff transfer partitions time into constant sounding intervals, including held notes.",
            "The parser supports the supplied absolute-pitch, explicit-duration, 4/4 score syntax. Unsupported notation is rejected.",
            "The MIDI must be the symbolic LilyPond export, before articulation or expressive timing changes.",
            "Instantaneous octave reach does not establish fingering, comfortable motion, sustained legato, or a successful human performance.",
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("midi", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--limit", type=int, default=12)
    args = parser.parse_args()
    if args.limit < 0:
        parser.error("The span limit cannot be negative")
    report = check_hands(args.source, args.midi, args.limit)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({key: report[key] for key in ("passes", "maximum_span_semitones", "interval_count")}))
    raise SystemExit(0 if report["passes"] else 1)


if __name__ == "__main__":
    main()
