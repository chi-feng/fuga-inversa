# Instrument and recording credits

*Fuga inversa* was composed, analyzed and produced by GPT-6 Astra agents under the direction of chi-feng. The final score is a 26-measure fugue for three voices and one manual. The paper records the revisions, disagreements and limits of the checks.

## Piano

The piano recording uses the installed **Steinway Grand Piano in Apple GarageBand**, driven by the edition's expressive MIDI. It uses one piano track with a common damper pedal. The instrument's reverb, echo and compressor were disabled for the dry export. The score's 382 pitches remain in the same order within each voice; tempo, velocity, attack timing, releases and pedal were shaped for this realization.

The complete native performance is the source of the main recording. The separate voice renders support analytical listening. They do not replace that master when all three voices are enabled.

The native piano exports are stereo, 44.1 kHz, 24-bit PCM. The processed delivery is stereo, 48 kHz, 24-bit PCM, with a 256 kbit/s MP3 listening copy. [The production provenance](reproducibility/hall-production/public-provenance.json) records the input and output formats. No Apple instrument sample library or GarageBand project is included in this repository.

The earlier piano realization used Alexander Holm's **Salamander Grand Piano**, distributed by FreePats under CC BY 3.0. The user's listening feedback prompted the subsequent performance and instrument revisions. That earlier recording is not the edition's final piano master. [FreePats instrument page](https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html).

## Hall response

The piano's measured room response is **“Spokane Woman's Club,” by James Cadwallader / OpenAIR**, licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). The recording uses the stereo X/Y response captured with a Rode NT4 microphone at the rear of the hall, 24 metres from the source.

- [OpenAIR dataset and attribution](https://www.openair.hosted.york.ac.uk/?page_id=659)
- [Original stereo impulse response](https://webfiles.york.ac.uk/OPENAIR/IRs/spokane-womans-club/stereo/spokane_womans_club_ir.wav)
- [Original recording notes](https://webfiles.york.ac.uk/OPENAIR/IRs/spokane-womans-club/Read%20Me.txt)

The original response is included in `reproducibility/hall-production/ir/` under its CC BY 4.0 license. The processor resamples it to 48 kHz, aligns it to the direct impulse, removes that impulse with a 3–8 ms fade, and filters the room return at 140 Hz and 8 kHz. It retains 3.5 seconds with a 250 ms end fade. The original stereo piano remains the direct signal; a mono send drives the two measured room channels.

The recital mix uses a room-to-dry RMS ratio of −14 dB and 6 ms of added delay. The closer alternative uses −18 dB and 12 ms. Their integrated loudness is matched with static gain. No compressor, limiter or additional algorithmic reverberator is used in these piano masters. The result is a rendered performance with a measured room response, not a recording of a pianist at that venue.

The dataset page returned an availability error during production. Its indexed primary metadata supplied the attribution and license; the university's original audio and recording notes remained accessible. The preserved source record identifies both.

## Organ

The organ realization uses **Jeux d'orgues 2.1**, Joseph Basquin's samples of the **Stiehr–Mockers organ at Romanswiller**. All three voices use the same principal 8′ + 4′ registration, identified by the soundfont preset “I Principaux 8 4” (bank 1, program 0). No pedal division or registration changes are used. [Instrument and sample source](https://www.jeuxdorgues.com/jeux-d-orgues-2-stiehr-mockers/).

FluidSynth renders the prepared MIDI with modest reverberation. The delivery uses fixed gain, stereo 48 kHz, 24-bit PCM and an MP3 listening copy. The sample library is not included. The preparation and rendering scripts record the settings.

The interactive web player applies −2.01 dB to the organ master and its voice stems to match the piano's integrated listening level. The downloadable recordings retain their published levels. Repeated excerpts have 5 ms tapers at their boundaries, and pausing uses a 10 ms fade; whole-piece playback retains the recorded resonance.

## Engraving and edition

LilyPond **2.26.0** engraves the performing score and every musical excerpt. The webpage attaches annotations to LilyPond's note identifiers. The PDF uses the same annotated vector excerpts and XeLaTeX. Its body text uses Libertinus; code and file paths use **Inconsolata**, designed by Raph Levien, with Michael Sharpe's TeX adaptation. The mono face is `Inconsolatazi4-Regular.otf` from TeX Live's `inconsolata` package. The [package documentation](https://ctan.org/pkg/inconsolata) identifies its font variants and licenses. [The edition build instructions](edition/README.md) record the exact font settings.

The website serves the same regular Inconsolata face locally, with upright code quotes and disabled text ligatures. Its [font notice and SIL Open Font License](assets/fonts/README.md) accompany the unmodified font file.

Matplotlib draws the performance figure from the actual piano MIDI and its note data.

The webpage's notation is supplied as LilyPond SVG. The repository does not bundle Verovio, OpenSheetMusicDisplay or VexFlow. The process appendix explains the renderer evaluation and the decision to retain the score's engraving source.

The instrument recordings, room response, original prose, notation and software do not share a single blanket license. The specific third-party attribution above applies to the identified material. Publishing the rendered music does not redistribute the instrument sample libraries.
