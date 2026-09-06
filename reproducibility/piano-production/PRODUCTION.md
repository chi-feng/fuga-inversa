# Piano production

The revised performance uses GarageBand 10.4.14's installed Steinway Grand Piano. The full mix and three voice stems were exported directly as stereo, 44.1 kHz, 24-bit PCM WAVE files. The files share the same time origin, tempo map, project length, instrument settings, and gain. They are dry sources for the separate concert-hall convolution stage.

## Delivery files

| File | Use |
| --- | --- |
| `steinway-concert-dry-native24.wav` | Complete dry piano master |
| `steinway-concert-dry-native24-soprano.wav` | Soprano stem at the master gain |
| `steinway-concert-dry-native24-alto.wav` | Alto stem at the master gain |
| `steinway-concert-dry-native24-bass.wav` | Bass stem at the master gain |
| `fugue-piano-concert.mid` | Revised performance with separate musical voices |
| `garageband-concert-mix.mid` | The same events on one piano track and MIDI channel |
| `garageband-concert-{soprano,alto,bass}.mid` | Matching one-track stem imports |
| `timeline-concert.json` | Score-beat timing derived from the revised MIDI |

The saved GarageBand projects and earlier 16-bit fallbacks remain local. This public bundle supplies the native 24-bit recordings, their MIDI inputs, and the observations used for verification. The earlier baseline used a different performance and Auto Normalize; it is not a gain-matched source for these stems.

## Performance decisions

`shape_performance.py` starts from the canonical `../fugue.midi`. It changes performance parameters while retaining all 382 note pitches, their order within each voice, and the 26-bar form. It uses no random timing or velocity noise.

The tempo curve gives entries a measured opening, moves through the sequential episodes, and allows more time for the suspension passages and final cadence. Most of the piece lies between quarter note = 81 and 100. The final preparation reaches 77, and the last bar uses 54. Smooth interpolation joins the chosen phrase points. This is a more pronounced interpretation than the previous narrow tempo range.

Velocity weighting follows the active subject rather than a fixed hierarchy of soprano, alto, and bass. The descending head relaxes toward its low note; its later ascent gains weight. Accompanying notes sit below the active line. Suspension preparations receive more weight and their resolutions less. The resulting velocities range from 50 to 89. Note releases distinguish connected subject notes, shorter accompaniment, repeated notes, and phrase ends. A few structural arrivals receive small, deliberate offsets of up to 17 ms. Seven short pedal spans support cadential sonorities; the remaining passagework uses finger articulation without continuous pedal.

The full GarageBand import places all notes on one Steinway track. This also puts the common pedal events on that track. It avoids the initial multi-track import's automatic assignment of different instruments to the musical voices.

## Native rendering

Channel EQ, Compressor, Tape Delay, Master Echo, and Master Reverb were disabled. The sampler remained enabled. Track and master faders stayed at 0 dB. Auto Normalize was disabled for every revised mix and stem export. Its original enabled preference was restored after the final exports; a future export must disable it again to retain the documented gain.

The 24-bit setting was confirmed in GarageBand's export panel and then checked in the resulting PCM headers. These files are native 24-bit exports, not conversions of the fallback files. Each contains 3,145,728 stereo frames, or 71.331700680 seconds. The modeled MIDI duration is 70.976576375 seconds; the native exports include the same short ending allowance. The existing unrelated GarageBand project was preserved.

## Evidence and limits

`performance-checks.json` records every original score position, performed onset and release, pitch, velocity, and phrase role. MIDI round trips check the voice pitch sequences, all 382 note identities, positive durations, and monophony. Separate checks confirm that each flattened GarageBand import retains its intended onset, release, pitch, and velocity events.

`garageband-{mix,soprano,alto,bass}-ax-notes.json` preserves the native piano-roll observations. `verify_garageband.py` compares their pitches and attacks with the import files. All notes match within one native tick at 960 ticks per quarter, with quantization off. GarageBand's octave labels differ from scientific pitch notation by one octave; the parser accounts for that display convention.

`native24-render-checks.json` records the four audio hashes, formats, frame counts, and 797 embedded tempo markers. The marker timelines match across the files. Their maximum difference from MIDI-derived timing is 8.69 ms. The native observations expose note pitches and attacks; they do not independently round-trip every velocity and note release from the saved project. Those parameters are checked in the import MIDI. These checks do not establish the success of the musical interpretation. A listening comparison and a live keyboard trial remain separate evaluations.

## Reproduction

Run the following from the directory containing this file. The parent directory must contain `fugue.midi`, `audit_midi.py`, and `prepare_performance.py`; `ffprobe` must be available for the native audio checks.

```sh
uv run --no-project python shape_performance.py
uv run --no-project python verify_garageband.py --native24
```

The performance script does not automate GarageBand. Import the generated one-track MIDI files, retain the dry settings above, disable Auto Normalize, and select WAVE with Uncompressed 24-bit quality. The unchanged revised MIDI SHA256 is `6dd6be494175c197a7347acd04fe50573f6efff430884560b8167455f9aa5363`.
