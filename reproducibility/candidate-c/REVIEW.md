Candidate C is a 26-bar fugue for three voices on one organ manual. The score compiles with LilyPond 2.26.0. `fugue-c.ly`, `fugue-c.pdf`, `fugue-c.midi`, and `events.json` are the score, engraved page, MIDI, and absolute-pitch event data. `compose.py` generates the source and event data.

## Entry map

Every entry preserves the directed semitone sequence −2, −1, −2, +3, +4, −2 and the rhythm eighth–eighth–eighth–eighth–quarter–eighth–eighth. The final eighth is tied into the following bar where indicated in the score.

| Bar | Voice | Starting note | Function |
| --- | --- | --- | --- |
| 1 | Alto | D4 | Tonic subject |
| 3 | Soprano | A4 | Literal dominant answer |
| 5 | Bass | D3 | Tonic subject |
| 9 | Soprano | G4 | Entry on G |
| 11 | Alto | C4 | Entry on C |
| 15 | Bass | F3 | Entry on F |
| 19 | Soprano | D5 | Tonic return |
| 21 | Bass | D3 | Tonic return |

The recurring countersubject is F quarter, G eighth, F eighth, E quarter, C-sharp eighth, D eighth. Its A and G versions are literal transpositions. The C and F versions use a major third above their starting tonic. The subject itself remains literal in those entries.

## Form and harmony

Bars 1–6 contain the exposition. Bars 7–8 sequence a short neighbor-note figure in the soprano. Entries on G and C occupy bars 9–12. Bars 13–14 transfer the episode figure to the alto and continue the descending-fifth progression. The F entry occupies bars 15–16. Prepared dissonances in bars 17–18 lead to the tonic returns in bars 19–22. Bars 23–26 form the coda. No stretto is claimed.

Bar 12 has a prepared G5 that resolves to F5 over A3, with F4 in the middle voice. Bar 17 has a prepared 7–6 suspension over B-flat and a prepared dominant seventh that resolves at bar 18. Bar 18 has a prepared 9–8 suspension over E3. The middle voice's B-flat–B-natural–C-sharp–D motion in bars 17–18 connects the modal material with the D-minor cadence.

The Neapolitan sixth is G2–B-flat3–E-flat4 in bar 24. It proceeds through A2–F3–D4, the cadential 6/4, to A2–E3–C-sharp4 in bar 25. The final sonority is D3–F-sharp3–D4. It contains three notes and uses a Picardy third.

## Verification and hand allocation

`audit.json` was generated from the compiled MIDI. It reports eight literal entries, three monophonic voices, no adjacent or quarter-reduction perfect-interval flags, no voice crossings, and no sonority that requires either hand to exceed an octave. I reviewed the flagged dissonances against the written lines. They consist of passing or neighbor notes, prepared suspensions, dominant sevenths, and diminished harmonies with directed resolutions.

The two upper voices can be farther than an octave apart. The middle voice therefore passes between hands. The intended left-hand passages are bars 3–4, bar 9 from beat 4, bars 11–12, bar 19 from beat 4, and bars 25–26. The right hand resumes the middle voice at bars 5, 10, 13, and 20. Staff changes remain for the final engraving if this candidate is selected; the current voice layout preserves MIDI voice identity.

The reach audit checks simultaneous pitches. It does not replace a performance test. This review used the score and compiled MIDI, without a live keyboard trial or an audio listening comparison. The interval audit checks successive sounding events and a quarter-note reduction; it does not establish style or assess every possible longer harmonic reduction.

The final source SHA-256 is `79360b616d641a39b6c8975254e7b803b61ec2facc8e171d8b1885b85947cfd2`. The final MIDI SHA-256 is `edeb5405dcbf0579a82c6ab03545d0e1f4482d72778acd8de0214a83e1a049e3`.

## Comparison

I recommend candidate B as the strongest final basis. Its two-bar countersubject and descending episodes recur with a clearer shared identity, and bars 14–17 create a distinct high-register climax. Its upper pair stays within an octave throughout the compiled score. Candidate A has a narrower range, but its slower counterpoint and repeated tonic entries give it less contrast. Candidate C changes tonal centers more often and includes several prepared suspensions; its regular phrase lengths and frequent parallel thirds and sixths make it less varied in texture than B.

One refinement to B is the alto at bar 17: replace the initial C5 half note with A4 quarter–C5 quarter. This resolves the preceding G-sharp4 to A4 before continuing the episode. The existing G-sharp4–C5 diminished-fourth leap is a stylistic choice, not an automated interval failure. The proposed replacement needs to pass the same musical and MIDI checks before adoption.

The comparison used A source SHA-256 `6ebc13ad9c2d5c95ca928d3846e9860703fb52923f42c3f4863ee39a7c5d1a05` and B source SHA-256 `02b9252f474eceac6810e46b0e2a86d1e567e9bab8b264c8a8062241ef59bc72`. The compiled comparison files and audit results are `cross-a.*`, `cross-b.*`, `cross-a-audit.json`, and `cross-b-audit.json` in this directory.
