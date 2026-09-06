# Fuga inversa

[Open the annotated edition](https://chi-feng.github.io/fuga-inversa/).

A three-voice fugue in D minor on the exact interval inversion of the Lick, engraved in LilyPond 2.26 for one manual. The edition includes an organ realization, a phrased Steinway piano realization with measured hall reverberation, and an analytical paper with eight annotated score excerpts. The appendix records the agentic compositional process and the limits of its evaluation.

## Score and recordings

- [Performing score](assets/score/fugue.pdf) · [LilyPond source](assets/score/fugue.ly) · [symbolic MIDI](assets/score/fugue.midi)
- [Analysis and process PDF](assets/pdf/fuga-inversa-analysis.pdf)
- [Piano MP3](assets/audio/piano.mp3) · [piano WAV](assets/audio/fugue-piano.wav) · [closer room MP3](assets/audio/piano-close.mp3)
- [Dry Steinway WAV](reproducibility/piano-production/steinway-concert-dry-native24.wav) · [expressive piano MIDI](assets/score/fugue-piano.midi)
- [Organ MP3](assets/audio/organ.mp3) · [organ WAV](assets/audio/fugue-organ.wav)

The expressive MIDI contains the tempo map, note velocities, release timing and damper pedal. It can drive another piano instrument, including Pianoteq. The resulting sound and pedal response will depend on that instrument. The dry WAV provides the native piano without the added hall.

## Reproduction and evidence

[The composition bundle](reproducibility/README.md) contains the final source, three candidate scores, historical review evidence, interval auditor and printed-hand checker. [The edition sources](edition/README.md) contain the paper and vector figures. [The recording credits](CREDITS.md) identify instruments, room data and processing changes. [The reconstructed brief](PROMPT.md) condenses the final requirements into one prompt.

The interval checks find no flags in their specified passes. They do not certify every stylistic judgment. A separate source-aware check bounds the printed simultaneous reach to an octave in each hand. The paper distinguishes those results from artistic quality, fluent fingering and a human performance.

## Web development

The page is static and has no runtime package dependencies. Node 24.7 or later builds the TypeScript browser modules. Pandoc rebuilds the page from its editorial sources.

```sh
npm ci
npm run build
npm run lint
npm run typecheck
npm test
uv run --no-project python build_edition.py
uv run --no-project python -m http.server 8768
```

Open `http://127.0.0.1:8768/`. The player loads a complete master and three synchronized voice recordings for each instrument. It uses the full master when all voices are enabled, and the separate voice renders for isolation. Both recordings follow the score through their own tempo maps.

The `publication` branch is served from its root by GitHub Pages. `.nojekyll` preserves the static assets without a Jekyll build.
