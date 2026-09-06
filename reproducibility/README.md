# Fuga inversa source bundle

This bundle contains the 26-bar final score, its symbolic MIDI, the three candidate scores, saved revision evidence, and the scripts used to inspect and prepare the music. `fugue.ly` is the final score. The candidate directories and `history/` preserve earlier work.

The final MIDI has nine occurrences of the specified seven-note cell. The printed hand allocation has a maximum span of 12 semitones in each hand. [The hand report](reports/printed-hands.md) explains the check and its limits. `provenance.json` identifies copied artifacts; `MANIFEST.json` records the bundled file hashes.

## Reproduction

Run these commands from this directory. The score requires LilyPond 2.26.0. The composition-checking scripts use the standard library and require Python 3.10 or later; they were run with Python 3.14.4 and uv 0.11.2. Rebuilt scores and reports go in `rebuilt/`.

```sh
mkdir -p rebuilt
lilypond --output=rebuilt/fugue fugue.ly
uv run --no-project python audit_midi.py --self-test
uv run --no-project python audit_midi.py rebuilt/fugue.midi --output rebuilt/final-audit.json --ledger rebuilt/final-ledger.txt
uv run --no-project python check_hands.py fugue.ly rebuilt/fugue.midi --output rebuilt/printed-hands.json
uv run --no-project python -m unittest -v test_check_hands.py
```

The hand check compares every voice's pitches, onsets, and tied durations with the MIDI before it reports reach. Its parser accepts the notation used in the final score and rejects unsupported syntax. It is not a general LilyPond interpreter. The following command must write a failing report and exit with status 1:

```sh
uv run --no-project python check_hands.py fixtures/missing-alto-transfer.ly fugue.midi --output rebuilt/missing-transfer.json
```

The fixture removes the alto's transfer to the lower staff at m.11. The notes remain unchanged. The first right-hand violation is C4–E5 at m.11, beat 1; the widest is G3–E5 at beat 2½.

Each candidate and the stretto study can be compiled separately:

```sh
lilypond --output=rebuilt/fugue-a candidate-a/fugue-a.ly
lilypond --output=rebuilt/fugue-b candidate-b/fugue-b.ly
lilypond --output=rebuilt/fugue-c candidate-c/fugue-c.ly
lilypond --output=rebuilt/stretto-study paper-process/stretto-study.ly
lilypond --output=rebuilt/channel-fixture fixtures/channel-fixture.ly
uv run --no-project python prepare_organ_midi.py rebuilt/channel-fixture.midi rebuilt/channel-fixture-organ.midi --bank 1 --preset 0 --gap-ms 0
```

`reports/reproduction.json` records the compilation and audit comparisons. The retained MIDI files rebuilt from these six sources matched byte for byte. Saved audit comparisons ignore only the `source` locator, which is relative in this public bundle. A newly generated audit records the local absolute path supplied to the auditor.

## Historical evidence

`history/index.json` distinguishes first and revised snapshots. The first MIDI files for A, B, and C were not retained. Their reports and sampled pitch ledgers preserve the recorded findings, but those first drafts cannot be rebuilt from the retained artifacts. The revised A report matches candidate A's retained final MIDI. A separate revised C MIDI survives in `history/`; its exact source snapshot does not. The corrected B result is in `candidate-b/fugue-b-audit.json`.

The candidate reviews predate the final stretto, closing arpeggio, and printed staff transfers. Their recommendations and concerns remain historical judgments. Some reviews refer to working PDFs, event files, and generators omitted here; the self-contained candidate LilyPond sources can generate new PDFs. The four bars of `stretto-study.ly` correspond to final mm.18–21. Its last note ends at the excerpt boundary; the complete score continues that tie into m.22.

## Performance scripts

```sh
uv run --no-project python prepare_performance.py fugue.midi --out render
uv run --no-project python render_audio.py --instrument organ --out rebuilt/audio
```

Preparation creates separate channels, complete mixes, voice stems, and timing data for the organ and piano. The organ version uses one registration and an 18 ms release gap. The piano version applies deterministic timing and dynamics specific to this score. The symbolic MIDI remains the input to the counterpoint and hand checks.

Audio rendering additionally requires FluidSynth, FFmpeg, and separately supplied soundfonts at the relative paths in `render_audio.py`. This bundle contains no soundfonts. The included renderer recreates the soundfont production stage; it does not recreate later external piano or hall processing.

## Limits

The interval auditor flags selected successive perfect intervals, dissonances, and a quarter-beat reduction. Its cell matcher tests pitches and attack positions; it does not certify the complete subject's durations or continuation. MIDI cannot establish spelling, harmonic function, stylistic quality, or the proper treatment of every nonchord tone. The pitch ledger samples eighth-note positions and omits intervening sixteenth-note attacks. The hand check establishes instantaneous span under the printed allocation. A keyboard trial is still needed to assess fingering, legato, and comfort.

## Final piano and room

The original performance commands above reproduce the soundfont production stage. The final Steinway performance is generated by [piano-production/shape_performance.py](piano-production/shape_performance.py), with native source recordings and import evidence documented in [the piano production notes](piano-production/PRODUCTION.md). [The hall instructions](hall-production/REPRODUCE.md) rebuild the final convolution masters from those supplied 24-bit inputs.
