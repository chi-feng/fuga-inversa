# Piano hall rendering

`hall.py` adds a measured stereo hall response to a dry piano recording. The original stereo signal supplies the direct sound. A mono send excites the measured left and right room responses. The processor uses fixed gains and preserves the input timing.

## Required files

The smallest working bundle contains:

- `hall.py`
- `ir/source.json`
- `ir/spokane_womans_club_ir.wav`
- The dry full mix whose filename and SHA-256 appear in `public-provenance.json`.

Include `public-provenance.json` and `CREDITS.txt` with the published audio. The native dry mix is required to reproduce these masters. The performance MIDI documents the performance, but cannot reproduce the Steinway samples by itself. Dry voice stems are optional inputs for rebuilding the separate voice recordings.

## Rebuild

Install [uv](https://docs.astral.sh/uv/) and FFmpeg with its MP3 encoder. The supplied render used Python 3.14.4, NumPy 2.5.2, SciPy 1.18.1 and FFmpeg 8.0. The script pins its Python package versions. The published inputs occupy the adjacent `piano-production/` directory. Run this command from the directory containing `hall.py`:

```sh
uv run --python 3.14.4 hall.py \
  --dry ../piano-production/steinway-concert-dry-native24.wav \
  --out rendered \
  --source-label 'GarageBand Steinway, revised concert performance; unnormalized native 24-bit dry source' \
  --performance-midi ../piano-production/fugue-piano-concert.mid \
  --stem soprano=../piano-production/steinway-concert-dry-native24-soprano.wav \
  --stem alto=../piano-production/steinway-concert-dry-native24-alto.wav \
  --stem bass=../piano-production/steinway-concert-dry-native24-bass.wav \
  --compare-start 35.8 --compare-duration 22
```

This command rebuilds the masters and three voice recordings. Omit the `--stem` arguments for a master-only rebuild. The source mix and stems share a starting time and an unnormalized gain path. All four native sources are stereo 44.1 kHz, 24-bit PCM. The processed delivery is 48 kHz, 24-bit PCM. The source format and hash are recorded separately for each input file.

## Settings and outputs

The `recital` master uses a room-to-dry RMS ratio of −14 dB and 6 ms of added room delay. The `close` alternative uses −18 dB and 12 ms. Only the room return is filtered, at 140 Hz and 8 kHz. The retained response lasts 3.5 seconds, including its final 250 ms fade. The dry piano remains unfiltered.

The script produces `dry`, `close` and `recital` masters as 24-bit WAV and 256 kbit/s MP3. Separate voice outputs use the recital gains by default; `--stem-preset close` selects the closer room. The 22-second excerpts in `comparisons/` receive separate static gains to match their loudness. The full masters retain their own fixed gains throughout.

`report.json` contains detailed processing checks and local input locators. `public-provenance.json` contains source hashes, native formats, software versions, room attribution and output measurements without machine paths. Publish the latter. The processor adds no algorithmic reverb, compression or limiter.

## Hall credit

Hall impulse response: “Spokane Woman’s Club,” James Cadwallader / OpenAIR, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Resampled, trimmed and filtered for this mix. [Original recording](https://webfiles.york.ac.uk/OPENAIR/IRs/spokane-womans-club/stereo/spokane_womans_club_ir.wav).
