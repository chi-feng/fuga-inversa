"""Render full mixes and synchronized voice stems without dynamic compression."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from pathlib import Path

FONTS = {
    "organ": Path("soundfont/jeuxdorgues21.SF2"),
    "piano": Path("soundfont/SalamanderGrandPiano-SF2-V3+20200602/SalamanderGrandPiano-V3+20200602.sf2"),
}


def run(command, log):
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    log.write_text(result.stdout + result.stderr)
    if result.returncode:
        raise RuntimeError(f"Command failed; see {log}: {command[0]}")
    return result.stdout + result.stderr


def measure(path, log):
    result = run(["ffmpeg", "-hide_banner", "-i", str(path), "-af",
                  "loudnorm=I=-18:TP=-2:LRA=11:print_format=json", "-f", "null", "-"], log)
    return json.loads(re.search(r'\{\s*"input_i".*?\}', result, re.DOTALL)[0])


def render(instrument, output):
    timing = json.loads(Path(f"render/timeline-{instrument}.json").read_text())
    duration = timing["duration"] + 5.0
    reports = {}
    for voice in ("mix", "soprano", "alto", "bass"):
        suffix = "" if voice == "mix" else f"-{voice}"
        midi = Path(f"render/fugue-{instrument}{suffix}.midi")
        raw = Path(f"render/{instrument}{suffix}-raw.wav")
        command = ["fluidsynth", "-ni", "-F", str(raw), "-T", "wav", "-O", "float",
                   "-r", "48000", "-g", "0.5", "-C", "0", "-R", "1",
                   "-o", "synth.midi-bank-select=mma"]
        values = {"room-size": 0.64, "damp": 0.35, "level": 0.22, "width": 8}
        if instrument == "piano":
            values = {"room-size": 0.46, "damp": 0.5, "level": 0.12, "width": 8}
        for key, value in values.items():
            command.extend(["-o", f"synth.reverb.{key}={value}"])
        command.extend([str(FONTS[instrument]), str(midi)])
        run(command, Path(f"render/{instrument}{suffix}-synthesis.log"))
        if voice == "mix":
            before = measure(raw, Path(f"render/{instrument}-loudness-input.log"))
            gain = min(-18 - float(before["input_i"]), -2 - float(before["input_tp"]))
            reports["input"] = before
            reports["gainDb"] = gain
        filters = f"volume={gain:.6f}dB,apad,atrim=duration={duration:.6f},afade=t=out:st={duration-0.35:.6f}:d=0.35"
        prefix = ["ffmpeg", "-y", "-hide_banner", "-i", str(raw), "-af", filters]
        if voice == "mix":
            wav = output / f"fugue-{instrument}.wav"
            run(prefix + ["-c:a", "pcm_s24le", "-ar", "48000", str(wav)],
                Path(f"render/{instrument}-wav.log"))
            reports["output"] = measure(wav, Path(f"render/{instrument}-loudness-output.log"))
            assert float(reports["output"]["input_tp"]) <= -1.9
        mp3 = output / f"{instrument}{suffix}.mp3"
        run(prefix + ["-c:a", "libmp3lame", "-b:a", "256k" if voice == "mix" else "192k",
                      "-ar", "48000", "-metadata", "title=Fuga inversa",
                      "-metadata", "artist=GPT-6 Astra", str(mp3)],
            Path(f"render/{instrument}{suffix}-mp3.log"))
        print(f"Rendered {instrument} {voice}: {duration:.2f} seconds", flush=True)
    reports["duration"] = duration
    reports["compression"] = "none; one static gain per instrument, shared by its stems"
    reports["soundfont"] = FONTS[instrument].name
    return reports


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--instrument", choices=("organ", "piano", "both"), default="both")
    parser.add_argument("--out", type=Path, default=Path("site/assets/audio"))
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    instruments = ("organ", "piano") if args.instrument == "both" else (args.instrument,)
    for instrument in instruments:
        report = render(instrument, args.out)
        Path(f"render/audio-{instrument}.json").write_text(json.dumps(report, indent=2) + "\n")
