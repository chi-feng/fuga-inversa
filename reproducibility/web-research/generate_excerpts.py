"""Engrave analytical excerpts from the final LilyPond score's explicit notes."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
from dataclasses import asdict, dataclass
from fractions import Fraction
from pathlib import Path

VOICES = {"s": "soprano", "a": "alto", "b": "bass"}
CLEFS = {"s": "treble", "a": "alto", "b": "bass"}
RANGES = {
    "head": (1, 2, ["a"]),
    "exposition": (3, 6, ["s", "a", "b"]),
    "episode-one": (7, 8, ["s", "a", "b"]),
    "g-entry": (9, 10, ["s", "a", "b"]),
    "c-entry": (11, 12, ["s", "a", "b"]),
    "episode-two": (13, 14, ["s", "a", "b"]),
    "suspensions": (15, 18, ["s", "a", "b"]),
    "return": (19, 20, ["s", "a", "b"]),
    "coda": (23, 26, ["s", "a", "b"]),
}
TOKEN = re.compile(r"([a-gr](?:isis|eses|is|es)?[',]*)(\d+)(\.*)(~?)")
PITCH = re.compile(r"([a-g])(isis|eses|is|es)?([',]*)\Z")


@dataclass
class Event:
    voice: str
    measure: int
    index: int
    token: str
    pitch: str | None
    midi: int | None
    duration: Fraction
    onset: Fraction
    tie_in: bool = False
    tie_out: bool = False
    fermata: bool = False


def balanced_body(text: str, opening: int) -> tuple[str, int]:
    depth, quoted, comment = 0, False, False
    for position in range(opening, len(text)):
        character = text[position]
        if comment:
            comment = character != "\n"
            continue
        if character == '"' and (position == 0 or text[position - 1] != "\\"):
            quoted = not quoted
        if quoted:
            continue
        if character == "%":
            comment = True
        elif character == "{":
            depth += 1
        elif character == "}":
            depth -= 1
            if depth == 0:
                return text[opening + 1 : position], position + 1
    raise ValueError("Unclosed LilyPond music block")


def remove_layout_tags(body: str) -> str:
    pattern = re.compile(r"\\tag\s+#'layout\s*\{")
    while match := pattern.search(body):
        content, end = balanced_body(body, match.end() - 1)
        # Fail if a future layout tag contains music instead of presentation commands.
        allowed = re.sub(r'\\change\s+Staff\s*=\s*"(?:upper|lower)"', "", content)
        allowed = re.sub(r"\\clef\s+(?:treble|bass|alto)", "", allowed)
        allowed = re.sub(r"\\(?:oneVoice|voiceOne|voiceTwo|hideNotes|unHideNotes)", "", allowed)
        if allowed.strip():
            raise ValueError(f"Unrecognized layout-tag content: {allowed!r}")
        body = body[: match.start()] + " " + body[end:]
    return body


def decode_pitch(spelling: str) -> tuple[str | None, int | None]:
    if spelling == "r":
        return None, None
    match = PITCH.fullmatch(spelling)
    if not match:
        raise ValueError(f"Unsupported pitch {spelling}")
    letter, accidental, marks = match.groups()
    alteration = {None: 0, "is": 1, "isis": 2, "es": -1, "eses": -2}[accidental]
    octave = 3 + marks.count("'") - marks.count(",")
    midi = 12 * (octave + 1) + {"c": 0, "d": 2, "e": 4, "f": 5, "g": 7, "a": 9, "b": 11}[letter] + alteration
    name = letter.upper() + {0: "", 1: "#", 2: "##", -1: "b", -2: "bb"}[alteration] + str(octave)
    return name, midi


def parse_source(text: str) -> dict[str, list[list[Event]]]:
    output = {}
    for short, name in VOICES.items():
        match = re.search(rf"^{name}\s*=\s*\{{", text, re.MULTILINE)
        if not match:
            raise ValueError(f"Missing voice {name}")
        original, _ = balanced_body(text, match.end() - 1)
        numbered_bars = [int(value) for value in re.findall(r"\|\s*%\s*(\d+)", original)]
        if numbered_bars != list(range(1, 27)):
            raise ValueError(f"Unexpected source measure labels in {name}: {numbered_bars}")
        body = re.sub(r"%[^\n]*", "", remove_layout_tags(original))
        bar_texts = body.split("|")
        if bar_texts[-1].strip():
            raise ValueError(f"Unexpected trailing content in {name}")
        bars, previous = [], None
        for measure, bar in enumerate(bar_texts[:-1], 1):
            events, position, onset = [], 0, Fraction(0)
            while position < len(bar):
                if bar[position].isspace():
                    position += 1
                    continue
                if bar.startswith("\\fermata", position):
                    if not events:
                        raise ValueError("Fermata without an event")
                    events[-1].fermata = True
                    position += len("\\fermata")
                    continue
                match = TOKEN.match(bar, position)
                if not match:
                    raise ValueError(f"Unsupported syntax in {name} m.{measure}: {bar[position:position+50]!r}")
                spelling, denominator, dots, tie = match.groups()
                denominator = int(denominator)
                if denominator not in (1, 2, 4, 8, 16, 32, 64, 128):
                    raise ValueError(f"Unsupported duration {denominator}")
                duration = Fraction(4, denominator) * sum((Fraction(1, 2**n) for n in range(len(dots) + 1)), Fraction())
                pitch, midi = decode_pitch(spelling)
                event = Event(short, measure, len(events) + 1, match.group(0).rstrip("~"), pitch, midi, duration, onset, tie_out=bool(tie))
                if previous and previous.tie_out:
                    if previous.midi != midi or midi is None:
                        raise ValueError(f"Invalid source tie in {name} m.{measure}")
                    event.tie_in = True
                events.append(event)
                previous = event
                onset += duration
                position = match.end()
            if onset != 4:
                raise ValueError(f"{name} m.{measure} contains {onset} quarter notes")
            bars.append(events)
        output[short] = bars
    return output


def serialise(event: Event, figure: str | None = None) -> dict:
    result = asdict(event)
    result["duration"] = float(event.duration)
    result["onset"] = float(event.onset)
    if figure:
        result["id"] = f"fig-{figure}-{event.voice}-m{event.measure}-n{event.index}"
    return result


def sounding_events(bars: list[list[Event]], start: int, end: int) -> list[tuple]:
    result = []
    for bar in bars[start - 1 : end]:
        for event in bar:
            if event.midi is None:
                continue
            onset = (event.measure - start) * 4 + event.onset
            if event.tie_in and result and result[-1][2] == onset and result[-1][0] == event.midi:
                result[-1] = (event.midi, result[-1][1], onset + event.duration)
            else:
                result.append((event.midi, onset, onset + event.duration))
    return result


def midi_comparison(path: Path, selected: list[str], bars: dict, start: int, end: int, audit) -> dict:
    _, ppq, tracks = audit.read_midi(path)
    midi_voices, _ = audit.extract_notes(tracks)
    if len(midi_voices) != len(selected):
        raise ValueError(f"Voice count differs in {path}")
    counts = {}
    for voice, notes in zip(selected, midi_voices.values(), strict=True):
        actual = [(note.pitch, Fraction(note.start, ppq), Fraction(note.end, ppq)) for note in notes]
        expected = sounding_events(bars[voice], start, end)
        if actual != expected:
            pairs = list(zip(actual, expected))
            mismatch = next(((a, e) for a, e in pairs if a != e), None)
            raise ValueError(f"MIDI mismatch in {path.name}, {voice}: {mismatch}; actual {len(actual)}, expected {len(expected)}")
        counts[voice] = len(actual)
    return {"passed": True, "sounding_event_counts": counts}


SEMANTIC_FUNCTION = r'''
semanticNote = #(define-music-function (ident voice measure) (string? string? number?)
  #{
    \once \override NoteHead.output-attributes =
      #`((id . ,ident) (data-note-id . ,ident) (data-voice . ,voice) (data-measure . ,measure))
    \once \override Rest.output-attributes =
      #`((id . ,ident) (data-note-id . ,ident) (data-voice . ,voice) (data-measure . ,measure))
  #})
'''


def render_lily(name: str, start: int, end: int, selected: list[str], bars: dict) -> str:
    header = rf'''\version "2.26.0"
\pointAndClickOff
#(set-global-staff-size 18)
\header {{ tagline = ##f }}
\paper {{
  paper-width = 190\mm
  paper-height = {48 if len(selected) == 1 else 94}\mm
  top-margin = 3\mm
  bottom-margin = 3\mm
  left-margin = 3\mm
  right-margin = 3\mm
  ragged-last-bottom = ##t
  print-page-number = ##f
}}
global = {{ \key d \minor \time 4/4 \set Score.currentBarNumber = #{start} }}
'''
    definitions = []
    for voice in selected:
        lines = [rf'{voice}Music = \absolute {{', r'  \global', rf'  \clef {CLEFS[voice]}']
        for grob in ("Stem", "Beam", "Flag", "Accidental", "Tie", "Dots", "LaissezVibrerTie", "RepeatTie"):
            lines.append(f'  \\override {grob}.output-attributes = #\'((data-voice . "{voice}"))')
        for bar in bars[voice][start - 1 : end]:
            lines.append(f"  % Original measure {bar[0].measure}")
            for event in bar:
                ident = f"fig-{name}-{voice}-m{event.measure}-n{event.index}"
                suffix = ""
                if event.tie_in and event.measure == start and event.index == 1:
                    suffix += r"\repeatTie"
                if event.tie_out:
                    is_last = event.measure == end and event is bar[-1]
                    suffix += r"\laissezVibrer" if is_last else "~"
                if event.fermata:
                    suffix += r"\fermata"
                lines.append(rf'  \semanticNote "{ident}" "{voice}" #{event.measure} {event.token}{suffix}')
            if bar[0].measure == end:
                lines.append(r"  \once \omit Score.BarNumber")
            lines.append("  |")
        lines.append("}")
        definitions.append("\n".join(lines))
    staves = []
    for voice in selected:
        staves.append(rf'    \new Staff \with {{ instrumentName = "{voice.upper()}" shortInstrumentName = "{voice.upper()}" }} {{ \{voice}Music }}')
    score = r'''
\score {
  \new StaffGroup <<
STAVES
  >>
  \layout {
    indent = 7\mm
    ragged-right = ##f
    \context {
      \Score
      barNumberVisibility = #all-bar-numbers-visible
      \override BarNumber.break-visibility = ##(#t #t #t)
      \override BarNumber.font-size = #-1
      \override SpacingSpanner.uniform-stretching = ##t
    }
    \context { \Staff \override VerticalAxisGroup.staff-staff-spacing.basic-distance = #16 }
  }
  \midi { \tempo 4 = 92 \context { \Score midiChannelMapping = #'voice } }
}
'''.replace("STAVES", "\n".join(staves))
    return header + SEMANTIC_FUNCTION + "\n".join(definitions) + score


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=Path(__file__).parents[1] / "fugue.ly")
    parser.add_argument("--out", type=Path, default=Path(__file__).parent / "excerpts")
    args = parser.parse_args()
    source = args.source.resolve()
    text = source.read_text()
    source_hash = hashlib.sha256(text.encode()).hexdigest()
    bars = parse_source(text)
    audit_path = source.parent / "audit_midi.py"
    specification = importlib.util.spec_from_file_location("fugue_midi_audit", audit_path)
    audit = importlib.util.module_from_spec(specification)
    sys.modules[specification.name] = audit
    specification.loader.exec_module(audit)
    source_check = midi_comparison(source.with_suffix(".midi"), list(VOICES), bars, 1, 26, audit)
    args.out.mkdir(parents=True, exist_ok=True)
    manifest = {"source": str(source), "source_sha256": source_hash, "source_midi_check": source_check, "key": "D minor", "meter": "4/4", "figures": []}
    for name, (start, end, selected) in RANGES.items():
        stem = args.out.resolve() / name
        lily_path = stem.with_suffix(".ly")
        lily_path.write_text(render_lily(name, start, end, selected, bars))
        logs = []
        for flags in (["-dcrop"], ["--svg"]):
            completed = subprocess.run(["lilypond", *flags, "-o", str(stem), str(lily_path)], text=True, capture_output=True, check=False)
            logs.append(completed.stdout + completed.stderr)
            if completed.returncode:
                raise RuntimeError(logs[-1])
        stem.with_suffix(".log").write_text("\n".join(logs))
        events = [serialise(event, name) for voice in selected for bar in bars[voice][start - 1 : end] for event in bar]
        svg_files = sorted(args.out.glob(name + "*.svg"))
        if len(svg_files) != 1:
            raise ValueError(f"Expected one SVG for {name}: {svg_files}")
        svg = svg_files[0].read_text()
        for event in events:
            if f'id="{event["id"]}"' not in svg:
                raise ValueError(f"Missing semantic SVG ID {event['id']}")
        figure_check = midi_comparison(stem.with_suffix(".midi"), selected, bars, start, end, audit)
        boundary_ties = []
        for voice in selected:
            first, last = bars[voice][start - 1][0], bars[voice][end - 1][-1]
            for event, tied in ((first, first.tie_in), (last, last.tie_out)):
                if tied:
                    boundary_ties.append(f"fig-{name}-{voice}-m{event.measure}-n{event.index}")
        cropped_pdf = stem.with_name(stem.name + ".cropped.pdf")
        if not cropped_pdf.exists():
            raise ValueError(f"Missing cropped PDF for {name}")
        figure = {"name": name, "start_measure": start, "end_measure": end, "voices": selected, "svg": svg_files[0].name, "pdf": cropped_pdf.name, "lilypond": lily_path.name, "midi_check": figure_check, "boundary_ties": boundary_ties, "warnings": [line for log in logs for line in log.splitlines() if "warning:" in line], "events": events}
        manifest["figures"].append(figure)
        print(f"{name}: m.{start}–{end}; {len(events)} notated events; SVG IDs and MIDI match")
    if hashlib.sha256(source.read_bytes()).hexdigest() != source_hash:
        raise RuntimeError("The source changed during generation; regenerate the excerpts")
    (args.out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Source MIDI equivalence passed; manifest: {args.out / 'manifest.json'}")


if __name__ == "__main__":
    main()
