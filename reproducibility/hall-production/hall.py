# /// script
# requires-python = ">=3.12"
# dependencies = ["numpy==2.5.2", "scipy==1.18.1"]
# ///
"""Add measured stereo room sound while retaining the original direct piano."""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
import re
import subprocess
from pathlib import Path

import numpy as np
import scipy
from scipy import signal
from scipy.io import wavfile
from scipy.ndimage import uniform_filter1d

RATE = 48000
PRESETS = {
    "close": {"room_to_dry_rms_db": -18.0, "predelay_ms": 12.0},
    "recital": {"room_to_dry_rms_db": -14.0, "predelay_ms": 6.0},
}


def command(arguments: list[str]) -> subprocess.CompletedProcess:
    result = subprocess.run(arguments, capture_output=True, check=False)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors="replace"))
    return result


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_audio(path: Path, rate: int = RATE) -> tuple[np.ndarray, dict]:
    probe = json.loads(command(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path)]).stdout)
    stream = next(stream for stream in probe["streams"] if stream["codec_type"] == "audio")
    if stream["channels"] not in (1, 2):
        raise ValueError(f"Expected mono or stereo audio, received {stream['channels']} channels: {path}")
    decoded = command(["ffmpeg", "-v", "error", "-i", str(path), "-map", "0:a:0", "-ac", "2", "-ar", str(rate), "-f", "f32le", "-"]).stdout
    audio = np.frombuffer(decoded, dtype="<f4").reshape(-1, 2).astype(np.float64)
    if not np.isfinite(audio).all():
        raise ValueError(f"Non-finite audio samples: {path}")
    metadata = {"path": str(path.resolve()), "sha256": file_hash(path), "channels": stream["channels"], "sample_rate": int(stream["sample_rate"]), "codec": stream["codec_name"], "bits_per_sample": int(stream.get("bits_per_raw_sample") or stream.get("bits_per_sample") or 0) or None, "duration_seconds": len(audio) / rate}
    return audio, metadata


def public_audio_format(metadata: dict) -> dict:
    return {"sample_rate_hz": metadata["sample_rate"], "channels": metadata["channels"], "codec": metadata["codec"], "bits_per_sample": metadata["bits_per_sample"]}


def direct_index(impulse: np.ndarray, rate: int) -> int:
    energy = np.mean(impulse * impulse, axis=1)
    smoothed = uniform_filter1d(energy, size=max(1, round(rate * 0.0005)))
    if smoothed.max() <= 0:
        raise ValueError("The impulse response is silent.")
    candidate = int(np.flatnonzero(smoothed > smoothed.max() * 0.01)[0])
    stop = min(len(energy), candidate + round(rate * 0.003))
    return candidate + int(np.argmax(energy[candidate:stop]))


def estimate_decay(impulse: np.ndarray, rate: int) -> dict:
    energy = np.mean(impulse * impulse, axis=1)
    if energy.sum() == 0:
        raise ValueError("Cannot estimate decay from silence.")
    integrated = np.cumsum(energy[::-1])[::-1]
    decay_db = 10 * np.log10(np.maximum(integrated / integrated[0], 1e-15))
    seconds = np.arange(len(energy)) / rate
    selected = (decay_db <= -5) & (decay_db >= -25)
    if np.count_nonzero(selected) < 10:
        return {"t20_extrapolated_seconds": None, "t20_r_squared": None}
    slope, intercept = np.polyfit(seconds[selected], decay_db[selected], 1)
    fitted = slope * seconds[selected] + intercept
    residual = np.sum((decay_db[selected] - fitted) ** 2)
    total = np.sum((decay_db[selected] - np.mean(decay_db[selected])) ** 2)
    split = round(rate * 0.08)
    late = max(float(energy[split:].sum()), 1e-30)
    return {
        "t20_extrapolated_seconds": float(-60 / slope),
        "t20_r_squared": float(1 - residual / total),
        "fit_start_seconds": float(seconds[selected][0]),
        "fit_end_seconds": float(seconds[selected][-1]),
        "c80_db": float(10 * np.log10(energy[:split].sum() / late)),
    }


def acoustic_measurements(impulse: np.ndarray, rate: int) -> dict:
    position = direct_index(impulse, rate)
    aligned = impulse[position:]
    report = {"direct_index": position, "direct_seconds": position / rate, "broadband": estimate_decay(aligned, rate), "octave_bands": {}}
    for centre in (125, 250, 500, 1000, 2000, 4000):
        band = signal.butter(4, [centre / np.sqrt(2), centre * np.sqrt(2)], btype="bandpass", fs=rate, output="sos")
        filtered = signal.sosfilt(band, aligned, axis=0)
        report["octave_bands"][str(centre)] = estimate_decay(filtered, rate)
    return report


def prepare_ir(impulse: np.ndarray, rate: int, *, highpass_hz: float = 140, lowpass_hz: float = 8000, tail_seconds: float = 3.5) -> tuple[np.ndarray, dict]:
    position = direct_index(impulse, rate)
    room = impulse[position : position + round(tail_seconds * rate)].copy()
    seconds = np.arange(len(room)) / rate
    # Keep the dry recording's direct path; admit measured reflections after 3–8 ms.
    arrival_fade = np.clip((seconds - 0.003) / 0.005, 0, 1)
    room *= (0.5 - 0.5 * np.cos(np.pi * arrival_fade))[:, None]
    if highpass_hz:
        room = signal.sosfilt(signal.butter(2, highpass_hz, btype="highpass", fs=rate, output="sos"), room, axis=0)
    if lowpass_hz:
        room = signal.sosfilt(signal.butter(2, lowpass_hz, btype="lowpass", fs=rate, output="sos"), room, axis=0)
    fade_length = min(round(rate * 0.25), len(room) // 4)
    room[-fade_length:] *= (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, fade_length)))[:, None]
    energy_scale = float(np.sqrt(np.sum(room * room) / 2))
    if energy_scale <= 0:
        raise ValueError("No reflected sound remains after removing the direct impulse.")
    room /= energy_scale
    return room, {
        "direct_index": position, "removed_leading_seconds": position / rate,
        "direct_gate_ms": [3, 8], "highpass_hz": highpass_hz, "lowpass_hz": lowpass_hz,
        "filter_order_per_cutoff": 2, "retained_seconds": len(room) / rate,
        "tail_fade_seconds": fade_length / rate, "energy_normalisation_divisor": energy_scale,
    }


def convolve_room(dry: np.ndarray, impulse: np.ndarray) -> np.ndarray:
    mono_send = np.mean(dry, axis=1)
    return np.column_stack([signal.oaconvolve(mono_send, impulse[:, channel], mode="full") for channel in range(2)])


def mix_room(dry: np.ndarray, room: np.ndarray, room_gain: float) -> np.ndarray:
    mixed = room * room_gain
    if len(mixed) < len(dry):
        mixed = np.pad(mixed, ((0, len(dry) - len(mixed)), (0, 0)))
    mixed[: len(dry)] += dry
    return mixed


def rms(audio: np.ndarray) -> float:
    return float(np.sqrt(np.mean(audio * audio)))


def measure_loudness(path: Path, log: Path) -> dict:
    result = command(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "loudnorm=I=-20:TP=-1.5:LRA=50:print_format=json", "-f", "null", "-"])
    text = result.stderr.decode(errors="replace")
    log.write_text(text)
    match = re.search(r'\{\s*"input_i".*?\}', text, re.DOTALL)
    if not match:
        raise ValueError(f"Could not read loudness measurement for {path}")
    values = json.loads(match.group(0))
    return {"integrated_lufs": float(values["input_i"]), "true_peak_dbtp": float(values["input_tp"]), "loudness_range_lu": float(values["input_lra"])}


def write_float(path: Path, audio: np.ndarray):
    wavfile.write(path, RATE, audio.astype(np.float32))


def export_audio(path: Path, output: Path, gain_db: float, *, start: float | None = None, duration: float | None = None):
    filters = [f"volume={gain_db:.8f}dB"]
    if start is not None and duration is not None:
        filters.extend([f"atrim=start={start:.8f}:duration={duration:.8f}", "asetpts=PTS-STARTPTS", "afade=t=in:d=0.02", f"afade=t=out:st={duration - 0.1:.8f}:d=0.1"])
    codec = ["-c:a", "libmp3lame", "-b:a", "256k"] if output.suffix == ".mp3" else ["-c:a", "pcm_s24le"]
    command(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-af", ",".join(filters), *codec, "-ar", str(RATE), str(output)])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry", type=Path, required=True)
    parser.add_argument("--ir", type=Path, default=Path(__file__).parent / "ir/spokane_womans_club_ir.wav")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--source-label", required=True)
    parser.add_argument("--performance-midi", type=Path)
    parser.add_argument("--stem", action="append", default=[], help="Optional dry stem NAME=PATH, using the full mix's room and master gains")
    parser.add_argument("--stem-preset", choices=tuple(PRESETS), default="recital")
    parser.add_argument("--compare-start", type=float, default=35.8)
    parser.add_argument("--compare-duration", type=float, default=22.0)
    parser.add_argument("--target-lufs", type=float, default=-20.0)
    parser.add_argument("--peak-ceiling", type=float, default=-1.5)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    comparison_directory = args.out / "comparisons"
    comparison_directory.mkdir(exist_ok=True)
    dry, dry_metadata = read_audio(args.dry)
    impulse, ir_metadata = read_audio(args.ir)
    ir_source = json.loads((Path(__file__).parent / "ir/source.json").read_text())
    if ir_source["sha256"] != ir_metadata["sha256"]:
        raise ValueError("The IR differs from its documented source; update ir/source.json before using another recording.")
    if ir_metadata["channels"] != 2:
        raise ValueError("The chosen room IR must contain measured stereo channels.")
    if rms(dry) <= 0:
        raise ValueError("The dry source is silent.")
    room, preparation = prepare_ir(impulse, RATE)
    write_float(args.out / "prepared-room-ir.wav", room)
    wet = convolve_room(dry, room)
    dry_rms = rms(dry)
    records = {}
    raw_paths = {}
    for name, parameters in {"dry": None, **PRESETS}.items():
        if parameters is None:
            rendered = np.pad(dry, ((0, len(wet) - len(dry)), (0, 0)))
            room_gain = 0.0
            delay = 0
        else:
            delay = round(parameters["predelay_ms"] * RATE / 1000)
            delayed_wet = np.pad(wet, ((delay, 0), (0, 0)))
            room_gain = dry_rms * 10 ** (parameters["room_to_dry_rms_db"] / 20) / rms(delayed_wet[: len(dry)])
            rendered = mix_room(dry, delayed_wet, room_gain)
        raw_path = args.out / f"{name}-float.wav"
        write_float(raw_path, rendered)
        raw_paths[name] = raw_path
        before = measure_loudness(raw_path, args.out / f"{name}-input-loudness.log")
        records[name] = {"parameters": parameters, "room_gain": room_gain, "delay_samples": delay, "before": before, "rendered_seconds": len(rendered) / RATE}
        print(f"Prepared {name}: {before['integrated_lufs']:.2f} LUFS; {before['true_peak_dbtp']:.2f} dBTP", flush=True)
    # One static gain per comparison keeps the existing performance dynamics intact.
    common_target = min(args.target_lufs, *(record["before"]["integrated_lufs"] + args.peak_ceiling - record["before"]["true_peak_dbtp"] for record in records.values()))
    for name, record in records.items():
        gain = common_target - record["before"]["integrated_lufs"]
        record["master_gain_db"] = gain
        final_path = args.out / f"{name}.wav"
        export_audio(raw_paths[name], final_path, gain)
        export_audio(raw_paths[name], args.out / f"{name}.mp3", gain)
        record["after"] = measure_loudness(final_path, args.out / f"{name}-output-loudness.log")
        record["mp3_after"] = measure_loudness(args.out / f"{name}.mp3", args.out / f"{name}-mp3-loudness.log")
        if record["after"]["true_peak_dbtp"] > args.peak_ceiling + 0.1:
            raise ValueError(f"The {name} output exceeds its true-peak ceiling.")
        if record["mp3_after"]["true_peak_dbtp"] >= 0:
            raise ValueError(f"The encoded {name} MP3 clips.")
        preview_path = comparison_directory / f"{name}-preview-unmatched.wav"
        export_audio(raw_paths[name], preview_path, 0, start=args.compare_start, duration=args.compare_duration)
        preview_measurement = measure_loudness(preview_path, comparison_directory / f"{name}-input-loudness.log")
        record["preview_before"] = preview_measurement
        print(f"Exported {name}: {record['after']['integrated_lufs']:.2f} LUFS", flush=True)
    preview_target = min(args.target_lufs, *(record["preview_before"]["integrated_lufs"] + args.peak_ceiling - record["preview_before"]["true_peak_dbtp"] for record in records.values()))
    for name, record in records.items():
        preview_gain = preview_target - record["preview_before"]["integrated_lufs"]
        preview_path = comparison_directory / f"{name}-preview-unmatched.wav"
        final_preview = comparison_directory / f"{name}.wav"
        export_audio(preview_path, final_preview, preview_gain)
        export_audio(preview_path, comparison_directory / f"{name}.mp3", preview_gain)
        record["preview_gain_db"] = preview_gain
        record["preview_after"] = measure_loudness(final_preview, comparison_directory / f"{name}-output-loudness.log")
    loudness = [record["preview_after"]["integrated_lufs"] for record in records.values()]
    if max(loudness) - min(loudness) > 0.1:
        raise ValueError("The short comparisons differ by more than 0.1 LU.")
    stems = {}
    source_stem_sum = np.zeros_like(dry) if args.stem else None
    processed_stem_sum = None
    for specification in args.stem:
        name, path = specification.split("=", 1)
        if not re.fullmatch(r"[a-z][a-z0-9_-]*", name):
            raise ValueError(f"Invalid stem name: {name}")
        stem, metadata = read_audio(Path(path))
        if len(stem) > len(dry):
            raise ValueError(f"Dry stem {name} extends beyond the dry full mix.")
        source_stem_sum[: len(stem)] += stem
        stem_wet = convolve_room(stem, room)
        record = records[args.stem_preset]
        stem_wet = np.pad(stem_wet, ((record["delay_samples"], 0), (0, 0)))
        mixed = mix_room(stem, stem_wet, record["room_gain"])
        target_length = round(record["rendered_seconds"] * RATE)
        if len(mixed) > target_length:
            raise ValueError(f"Stem {name} extends beyond the dry full mix.")
        mixed = np.pad(mixed, ((0, target_length - len(mixed)), (0, 0)))
        float_path = args.out / f"{args.stem_preset}-{name}-float.wav"
        write_float(float_path, mixed)
        export_audio(float_path, args.out / f"{args.stem_preset}-{name}.wav", record["master_gain_db"])
        export_audio(float_path, args.out / f"{args.stem_preset}-{name}.mp3", record["master_gain_db"])
        output_measurement = measure_loudness(args.out / f"{args.stem_preset}-{name}.wav", args.out / f"{args.stem_preset}-{name}-loudness.log")
        if output_measurement["true_peak_dbtp"] >= 0:
            raise ValueError(f"The processed {name} stem clips.")
        if processed_stem_sum is None:
            processed_stem_sum = np.zeros_like(mixed)
        processed_stem_sum += mixed
        stems[name] = {"source": metadata, "master_gain_db": record["master_gain_db"], "room_gain": record["room_gain"], "after": output_measurement}
        if file_hash(Path(path)) != metadata["sha256"]:
            raise ValueError(f"Dry stem {name} changed during processing.")
    versions = {"python": platform.python_version(), "numpy": np.__version__, "scipy": scipy.__version__, "ffmpeg": command(["ffmpeg", "-version"]).stdout.decode().splitlines()[0].split()[2]}
    report = {
        "source_label": args.source_label, "source": dry_metadata, "impulse_response": ir_metadata,
        "sample_rate": RATE, "tool_versions": versions, "acoustic_measurements": acoustic_measurements(impulse, RATE),
        "room_preparation": preparation, "presets": records, "stems": stems,
        "comparison": {"start_seconds": args.compare_start, "duration_seconds": args.compare_duration, "target_lufs": preview_target, "maximum_loudness_difference_lu": max(loudness) - min(loudness)},
        "processing": "Measured stereo convolution of a mono room send; unfiltered stereo direct signal; static gains only. No algorithmic reverb, compression or limiting.",
        "audition_status": "Measurements and source checks only; this script does not establish a listening judgment.",
    }
    if source_stem_sum is not None:
        source_difference = source_stem_sum - dry
        selected_raw, _ = read_audio(raw_paths[args.stem_preset])
        processed_difference = processed_stem_sum - selected_raw
        report["stem_sum_check"] = {
            "source_residual_rms_relative_db": float(20 * np.log10(max(rms(source_difference) / rms(dry), 1e-15))),
            "source_residual_peak_dbfs": float(20 * np.log10(max(np.max(np.abs(source_difference)), 1e-15))),
            "processed_residual_rms_relative_db": float(20 * np.log10(max(rms(processed_difference) / rms(selected_raw), 1e-15))),
            "interpretation": "Source stem differences are measured separately from the linear hall processing; separate instrument renders can differ before convolution.",
        }
    if file_hash(args.dry) != dry_metadata["sha256"]:
        raise ValueError("The dry source changed during processing.")
    (args.out / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    public = {
        "title": "Fuga inversa — piano rendering",
        "source_description": args.source_label,
        "source_file": args.dry.name,
        "source_sha256": dry_metadata["sha256"],
        "source_format": public_audio_format(dry_metadata),
        "tool_versions": versions,
        "output": {"sample_rate_hz": RATE, "pcm_bits": 24, "mp3_bitrate_kbps": 256},
        "recommended_preset": args.stem_preset,
        "masters": {name: {"wav": f"{name}.wav", "mp3": f"{name}.mp3", "settings": record["parameters"], "measurements": record["after"], "mp3_measurements": record["mp3_after"]} for name, record in records.items()},
        "stems": {name: {"wav": f"{args.stem_preset}-{name}.wav", "mp3": f"{args.stem_preset}-{name}.mp3", "source_file": Path(stem["source"]["path"]).name, "source_sha256": stem["source"]["sha256"], "source_format": public_audio_format(stem["source"]), "measurements": stem["after"]} for name, stem in stems.items()},
        "hall": {
            "title": ir_source["title"], "creators": ir_source["measurement_credit"],
            "license": ir_source["license"]["name"], "license_url": ir_source["license"]["url"],
            "source_url": ir_source["archive_url"], "dataset_url": ir_source["dataset_url"],
            "source_sha256": ir_metadata["sha256"], "changes": ir_source["derivative_changes"],
        },
        "processing": report["processing"],
    }
    if args.performance_midi:
        public["performance_midi"] = {"file": args.performance_midi.name, "sha256": file_hash(args.performance_midi)}
    (args.out / "public-provenance.json").write_text(json.dumps(public, indent=2) + "\n")
    (args.out / "CREDITS.txt").write_text(
        'Hall impulse response: "Spokane Woman\'s Club," James Cadwallader / OpenAIR.\n'
        'Creative Commons Attribution 4.0 International: https://creativecommons.org/licenses/by/4.0/\n'
        f'Source: {ir_source["archive_url"]}\n'
        'Resampled, trimmed and filtered for this mix.\n'
    )
    print(f"Matched comparisons and report: {args.out}", flush=True)


if __name__ == "__main__":
    main()
