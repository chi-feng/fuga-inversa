## Process and evaluation

This appendix records how the 26-bar *Fuga inversa* was composed, revised, and checked. The final score derives from candidate C, with a later stretto, a revised closing register, and explicit transfers of the middle voice between hands. The evidence consists of the LilyPond sources, compiled MIDI files, saved audit reports, candidate reviews, and performance scripts. The project records describe work undertaken on 7 September 2026.

### Musical constraint and proposals

The user approved an exact inversion of the seven-note Lick, D–E–F–G–E–C–D. Reflection about its initial D gives D–C–B-natural–A–C–E–D. Its directed semitone intervals are −2, −1, −2, +3, +4, −2. The rhythm remains four eighth notes, a quarter note, and two eighth notes; the last note can be tied into the following bar. A diatonic adjustment from B-natural to B-flat would change the required interval sequence. This distinction affected the harmony throughout the composition.

The compositional working brief specified three monophonic voices on one organ manual, a literal tonic–dominant–tonic exposition, recurring counterpoint, episodes, and a credible return and cadence. The dominant answer therefore transposes the complete cell to A–G–F-sharp–E–G–B–A. Harmonic adjustments belong in the accompanying voices or continuation, while the recurring seven-note cell retains its pitches and rhythm under transposition.

At the user's request, three GPT-6 Astra composing agents worked at maximum reasoning effort. Each produced a separate candidate, compiled a score, and supplied notes for review. Their initial proposals were separate assignments, but the later revisions shared a brief, an auditor, coordinator feedback, and cross-reviews. This was a comparison of compositions produced under a common method.

The recommendation was not unanimous. A and C recommended B. Both valued B's recurring two-bar countermelody, high-register entry, and clear rise and return. B recommended C because its episodes move between voices and its middle section travels through G, C, and F. The coordinator retained C. C's own review identified its regular phrase lengths and frequent parallel thirds and sixths as limitations relative to B. That objection remains relevant to the comparison; passing an interval audit does not settle it. The reviews also predate the final stretto and expanded closing register, so they should not be presented as votes on the finished version.

### Revisions that changed the score

The saved reports contain failures as well as successful revisions. An early A audit found parallel octaves in bar 6: soprano C-sharp5–D5 above bass C-sharp3–D3, from the second half of beat 2 to beat 3. Later A files contain revised notes. These snapshots establish a correction history; they do not show that the present A source still contains those octaves.

C's first saved audit covered only ten bars. Its adjacent-event scan found no perfect-interval flag, yet bar 10 contained two problems. On the quarter-note grid, alto C4 above bass F2 moved to E4 above A2, producing successive fifths. The intervening eighth-note sonority prompted a review of the underlying motion. At beat 4, G2–B3–D5 also exceeded the intended hand reach: either adjacent pair required more than an octave. The final version revises both the approach and the sonority, reaching B2–G4–D5 at that beat. The upper pair then fits comfortably within an octave. Unequal draft lengths make the first audit reports unsuitable for ranking the agents by failure count.

The closing revision changes musical direction without adding a voice. The final soprano reads:

```lilypond
d'4 cis'4 e'8 a'8 cis''8 e''8 | d''1
```

The line rises through the dominant arpeggio to the final D5. Below it, F3 moves to E3 over A2 in bar 25, then to F-sharp3 over D3 in bar 26. The cadential six-four resolves before the arpeggio; the final chord contains exactly D3, F-sharp3, and D5. The wider register therefore comes from a single melodic line and an open three-note ending.

A later request for greater ambition led to a separate stretto study. The earlier C review correctly stated that its version contained no stretto. The new study tested a D entry in the soprano against a complete A answer beginning one eighth note later in the alto. Both heads retain the prescribed intervals and rhythm. They overlap for the remaining three and a half beats of bar 19, with the alto's final A4 falling on the first eighth of bar 20.

The study included unchanged bars 18 and 21 so that the approach and exit could be examined. It was engraved, compiled, and audited before the coordinator adopted its replacement for bars 19–20. The complete score was then compiled and audited again. This adds a ninth literal head within the existing 26 bars. The return now layers a tonic subject and dominant answer over an independent bass.

One harmonic qualification matters. The alto's F-sharp4 on the second half of beat 2 in bar 19 belongs to the exact G4–F-sharp4–E4 descent. It is consonant above D3, and the next sonority is C major. The D-major sonority colors the line; it does not produce a dominant resolution into G. A modal and linear reading is therefore more precise than an unqualified “V of G” label.

### What the audit tests

The auditor uses the actual LilyPond MIDI as its input. It groups notes by MIDI track and channel, checks monophony and crossings, and examines every voice pair at successive note events. It flags successive perfect fifths and octaves, distinguishes similar from contrary motion, and reports direct outer perfect intervals when the upper voice leaps by more than a whole tone. A second pass samples quarter-note positions. The two resolutions caught different problems in the drafts.

The final report identifies three monophonic voices and nine literal heads, with no flags from either perfect-interval pass and no crossings. In every three-note sonority, at least one adjacent pitch pair lies within an octave; the remaining note can go to the other hand. These results apply to the compiled symbolic MIDI identified by the report's SHA-256 digest. They do not prove the absence of every objection a contrapuntal analyst could raise. A quarter-note grid is only one possible reduction; it cannot determine which notes carry harmonic weight across a longer phrase.

The subject matcher checks directed pitch intervals and relative attack times: 0, ½, 1, 1½, 2, 3, and 3½ quarter-note units. It does not independently establish every written duration or tie. Those require source inspection. MIDI also loses enharmonic spelling. The auditor cannot decide whether a pitch functions as a suspension, chord member, modal inflection, or harmonic goal.

Dissonance reports were therefore reviewed against the score. In bar 17, for example, the soprano A4 is prepared over F3, held while the bass moves to B-flat2, and resolved to G4 halfway through beat 2. The preparation and resolution explain the flagged seventh as a 7–6 suspension. Likewise, diminished sonorities need their resolutions examined. A stepwise melodic shape alone does not establish that a note is a permissible passing tone.

The auditor's fixtures include deliberate parallel fifths and octaves, a direct outer perfect interval, and examples of thirds and oblique motion that should pass. These tests passed and cover those specific program behaviors. The agents and coordinator also used the same auditor, which leaves a shared source of possible error despite their separate score readings.

### Notation and performance

The reach check asks whether one adjacent pair of the three sounding pitches can fit within an octave, leaving the other pitch to the other hand. This is an instantaneous condition. It does not supply fingering or establish that successive allocations preserve legato comfortably. The final score explicitly puts the alto in the left hand at bars 3–4, the end of bar 9, bars 11–12, and bars 25–26. At bar 9 beat 4, the low F-sharp3–G3 belongs with the left hand; at bar 11, C4 above bass C3 gives an octave. The closing F3–E3–F-sharp3 remains below the rising soprano. A separate check against the actual printed hand transfers found no simultaneous span above an octave in either hand. No live keyboard trial forms part of the evidence recorded here.

A MIDI fixture exposed a separate technical issue. LilyPond's voice channel setting still reused channel numbers across different staves. The audit could distinguish those notes by track and channel, but rendering required globally distinct voice channels. The preparation script remaps them and asserts that pitches and attack times survive. All organ voices then use the same registration. This finding concerns channel identity; it is not evidence that an audible note cutoff was heard in the candidate recordings.

The printed score and the MIDI export also serve different purposes. The printed score has two staves with hand transfers. A separate MIDI score keeps each contrapuntal voice on its own staff, preventing those printed transfers from splitting its identity. The symbolic MIDI remains the authority for interval analysis. Performance changes belong in derived files.

The organ realization uses Joseph Basquin's Jeux d'orgues 2.1 samples of the Stiehr–Mockers organ at Romanswiller. All three voices share the principal 8′ + 4′ registration. An 18-millisecond release gap supplies modest separation, while the tempo remains quarter note = 92 until the final bar slows to 60. The registration belongs to one manual; no pedal division is used. [Instrument and samples](https://www.jeuxdorgues.com/jeux-d-orgues-2-stiehr-mockers/).

The first piano realization used the Salamander Grand Piano SoundFont. The user found it too mechanical, despite its existing tempo, velocity, and articulation changes. That feedback prompted two separate revisions: a more pronounced interpretation and a different piano instrument. The final piano MIDI follows a smooth tempo curve, with the episodes approaching quarter note = 98–100, relaxation around the suspensions, and a broader cadential approach. The last whole note is held at quarter note = 54. The curve follows formal and harmonic events rather than random timing variation.

Note-on velocities range from 50 to 89. The entering head receives prominence even when it lies in the bass or alto; accompanying voices remain quieter. The descending head, local peaks, prepared dissonances, and resolutions have distinct attack weights. Releases vary with note length, melodic role, repetition, leap, and phrase boundary. Selected arrivals have small offsets, up to 17 milliseconds. Seven short harmonic spans use the damper pedal, with the remaining counterpoint kept clear of sustained pedal. The source and derived MIDI retain the same 382 pitches in the same order within each voice. These checks establish the interpretation's relation to the score; they do not measure its resemblance to a human pianist.

<!-- PERFORMANCE FIGURE -->

The revised MIDI drives GarageBand's installed Steinway Grand Piano. The complete performance uses one piano track, which gives the instrument a common pedal and acoustic identity. The native export disables the patch's reverb, echo, and compressor. The full mix and three separate voices were exported at 44.1 kHz and 24-bit PCM, with automatic normalization disabled. Their frame counts and embedded tempo markers agree. Native piano-roll observations preserve all pitches and place attacks within one native tick of the imported MIDI. The native project did not provide a round-trip check of note lengths or velocities; those were checked in the imported MIDI. Separate voice renders use the same performance times and gain for analytical listening. The complete master remains the default recording; isolated voices are study aids.

The room treatment convolves a mono send with James Cadwallader's measured stereo response from Spokane Woman's Club, while retaining the original stereo piano as the direct signal. The OpenAIR metadata identifies an X/Y microphone at the rear of the hall, 24 metres from the stage source. Blending that capture with a dry piano creates a room perspective; it does not reconstruct a documented seat or a live concert. [OpenAIR dataset](https://www.openair.hosted.york.ac.uk/?page_id=659).

The processor removes the response's direct impulse, admits the measured reflections through a short fade, and filters only the room signal below 140 Hz and above 8 kHz. The retained response lasts 3.5 seconds. Its original broadband decay yields a 2.23-second T60 estimate from a fit over the −5 to −25 dB interval; this is an extrapolated acoustic measurement. The principal mix adds the room at −14 dB relative to the dry signal's RMS level, with 6 milliseconds of extra delay. A closer alternative uses −18 dB and 12 milliseconds. The alternatives are matched for integrated loudness, using static gain. No compressor or limiter is added to the piano master. The response is credited to James Cadwallader and OpenAIR under CC BY 4.0, with the processing changes identified in the edition's credits.

The initial candidate recommendations came from score and MIDI inspection. The production agents used source checks, render settings, waveform measurements, and loudness comparisons; they did not supply an auditory evaluation of the final recordings. The user's listening feedback changed the production plan. A pianist's performance of the engraved score, and a listening comparison with the rendered interpretation, would provide evidence beyond the symbolic checks recorded here.

### Digital edition

The musical examples are regenerated from the authoritative LilyPond source. A strict parser retains pitches, spellings, durations, rests, and ties; each compiled excerpt is compared with the corresponding full-score MIDI range. LilyPond 2.26's SVG output attaches source note identifiers to the engraving. The webpage uses those identifiers for analytical brackets, note explanations, and voice focus. It follows the selected recording through a time map that retains tempo changes within a beat. The organ and piano can therefore switch at the same score position.

Verovio was tested as a JavaScript notation renderer, including its semantic note identifiers. The final edition uses LilyPond SVG because the performing score was already authoritative and the paper needed short excerpts with matching printed figures. This choice preserves one engraving source. It gives up live musical reflow: phone readers scroll the fixed excerpts horizontally. The PDF uses the same annotated vector figures, typeset with XeLaTeX. [LilyPond SVG output](https://lilypond.org/doc/v2.26/Documentation/notation/alternative-output-formats), [Verovio semantic SVG](https://book.verovio.org/interactive-notation/css-and-svg.html).

### Primary artifacts

Paths are relative to the edition's [reproducibility directory](reproducibility/README.md). The first-draft MIDI files were not retained; their saved reports preserve historical findings without making those drafts rebuildable.

| Artifact | Evidence |
|---|---|
| `fugue.ly`; `fugue.midi`; `reports/final-audit.json` | Final notation, compiled notes, and interval findings tied to a MIDI digest |
| `candidate-a/NOTES.md`; `candidate-b/candidate-notes.json`; `candidate-c/REVIEW.md` | Candidate forms, limitations, and differing recommendations |
| `history/index.json`; `history/candidate-*-*-audit.json` | Saved draft findings, with retained-file limits recorded separately |
| `paper-process/stretto-study.ly`; `paper-process/stretto-study-audit.json` | The adopted overlap with its approach and exit |
| `audit_midi.py`; `fixtures/channel-fixture.ly` | Check definitions and the channel example |
| `check_hands.py`; `reports/printed-hands.json`; `fixtures/missing-alto-transfer.ly` | Printed hand allocation and a failing transfer example |
| `piano-production/shape_performance.py`; `piano-production/performance-checks.json` | Tempo, articulation, dynamics, pedal and the source-to-performance comparison |
| `piano-production/garageband-import-checks.json` | Native pitch and onset checks, with round-trip limits stated |
| `hall-production/hall.py`; `hall-production/public-provenance.json` | Measured room processing, source hashes, native formats and delivery measurements |

The complete file manifest accompanies this edition. The musical claims above should be read together with the checks' stated limits.
