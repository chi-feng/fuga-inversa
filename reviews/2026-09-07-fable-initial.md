# Fable initial review

This report records Claude Fable 5.1's initial review on 7 September 2026, using the model identifier `claude-fable-5-1`. The reviewed edition was commit [7a156b0deea04743f2fc06264f6162813388e709](https://github.com/chi-feng/fuga-inversa/commit/7a156b0deea04743f2fc06264f6162813388e709).

The complete final report follows without edits. It includes claims subsequently corrected against the score. See [the response and current review status](../REVIEW.md) for those corrections and the resulting changes. The report's file locations and page numbers refer to the initial edition.

---

I have finished the inspection. My report follows.

I reviewed commit 7a156b0 from the score source outward: the LilyPond score bar by bar, the analysis and appendix prose, the TeX and all fifteen PDF page proofs, the browser sources, the build scripts and tests, the production scripts, and the supplied evidence and screenshots. I found no P1 fault. Every musical claim I tested against the score holds, the site logic is sound in code and in the muted stress evidence, and the paper makes no first-ever or breakthrough claim. I report two P2 items, a set of P3 items, a prose audit, and explicit limits. I did not hear any audio, use the live site, or reach any external citation.

## What I verified in the score and the paper

My own reading of the score agrees with the paper at every point I tested.

| Claim in the paper | Where | My reading of the score source |
| --- | --- | --- |
| Exact inversion D C B♮ A C E D | m. 1, alto | The semitone steps are −2, −1, −2, +3, +4, −2 and mirror the Lick exactly. |
| Nine literal heads | entry table | m. 1 alto D4, m. 3 soprano A4, m. 5 bass D3, m. 9 soprano G4, m. 11 alto C4, m. 15 bass F3, m. 19 soprano D5, m. 19 alto A4 one eighth later, m. 21 bass D3. |
| Real answer with an adjusted tail | mm. 3–4 | The head is an exact transposition at the fifth. The tail ends on A4 where a literal tail ends on B4. |
| Invertible counterpoint at the fifteenth | m. 3 against m. 5 | Paired intervals sum to sixteen at every eighth. The fifth at beat 1½ becomes a fourth over the passing C3. |
| m. 12 suspension and octave doubling | beats 2½–3½ | G5 is consonant over E3, becomes a seventh over A3 and a ninth over F4, and resolves to F5 in octave with F4. |
| mm. 17–18 suspensions | | A4 is a 7–6 over B♭2. G4 becomes the seventh of A7 and resolves to F4 over D3. F4 is a 9–8 over E3. |
| Stretto at one eighth | mm. 19–20 | The alto enters on A4 one eighth after the soprano D5. Both heads complete, and every sonority in the paper's table matches the source. |
| Neapolitan and final cadence | mm. 24–26 | G2–B♭3–E♭4, then A2–F3–D4, then A2–E3–C♯4, then D3–F♯3–D5. |
| Printed hand allocation | whole score | The alto transfers at m. 3, m. 5, m. 9 beat 4, m. 10, m. 11, m. 13, and m. 25 match the staff-change commands, and the stated voice ranges match. |

I also resolved three suspicions in the paper's favor. The claim of a two-octave stretch at the end holds because E5 sounds over E3 at m. 25 beat 4½. The excerpt manifest carries a relative source locator, so the generator's absolute path did not leak. The two copies of the final audit report differ only in their source locator.

**Findings on the music and the paper**

- **P2, edition/analysis.md lines 27–29 and 156, matching TeX lines 121–123 and 323, PDF pages 2 and 8.** The analysis never states that the counterline's second bar moves in unbroken parallel imperfect consonances with the subject's tail. The soprano runs in sixths against the answer through all of m. 4, the counterline runs in tenths against the bass subject through all of m. 6, m. 16, and m. 22, and m. 12 is mostly tenths.
  - Candidate C's review named this weakness and the appendix quotes it as a historical objection, so the analysis proper omits the exposition's most audible contrapuntal limitation. The parent agent adds one sentence in "Counterline and form" that lists those bars and one clause in "Scale and limitations".
- **P3, edition/analysis.md line 46, entry table row for mm. 9–10.** The G entry's continuation alters its last two notes, D5 and C5 in place of the literal B♭4 and A4, and the table records a tail adjustment only for the answer. I suggest adding "continuation altered in its last two notes" to that row.
- **P3, examiner judgment, assets/score/fugue.ly line 66, m. 25.** The leading tone C♯4 on beat 2 leaves by leap to E4, and the arpeggio's C♯5 rises to E5 before the final D5, so no voice resolves a leading tone directly to the tonic. The final chord also leaves a minor thirteenth between F♯3 and D5.
  - This is a defensible keyboard flourish, but an examiner would mark it. The paper could acknowledge it in "Cadence and keyboard writing"; the score can stay as it is.
- **P3, examiner judgment, mm. 11–14.** The soprano lies up to a minor thirteenth above the alto for two bars at the C entry, and in mm. 13–14 the outer voices meet at the double octave on beats 2 and 4 of both bars. Each octave arrives by contrary motion, so no rule breaks, but the C entry sounds hollow in the middle and the episode's outer frame alternates tenth and octave throughout. The "Scale and limitations" section could name both. Audition would settle the weight of this point.
- **P3, edition/analysis.md line 29, PDF page 2.** The F-major counterline at m. 15, A4–B♭4–A4–G4–E4–F4, also opens with a semitone, but the text credits only the C-major version with that adjustment. I suggest "The C- and F-major versions".
- **P3, assets/figures.json and the annotated figures, PDF pages 2 and 6, site screenshot of Example 2.** Bracket ticks that start on a bar line overprint the bar numbers: "Counterline above" over bar 5, "7–6" over bar 17, and "9–8" over bar 18. The existing `lift` property in figures.json can raise those three brackets, after which the parent agent re-exports the three annotated figures and rebuilds the PDF.
- **P3, PDF layout, pages 5–6 and 9.** Example 6 floats past the heading "The tonic return" and its first paragraph, page 6 ends with a large blank, and page 9 holds three lines before the appendix's page break. A float barrier before each section, or the `H` placement for the examples, keeps each example inside its section.
- **P3, assets/figures.json, the return figure label "Alto · A · +⅛".** The fraction glyph is cryptic in the figure even though the caption explains it. "Alto · A · one eighth later" reads without the caption.
- **P3, optional engraving, assets/score/fugue.ly line 57, m. 17.** The soprano's dotted quarter is written as tied notes. A dotted quarter is the conventional form; the tied quarters in m. 8 are correct because that note crosses beat 3.

**Prose audit of the paper and appendix**

I read the prose against the supplied humanizer checklist in audit mode and propose edits only.

- **Correctio against unstated claims, analysis.md lines 78 and 136.** "Calling the entire passage an exact chain of perfect fifths would conceal this adjustment" and "A reading that treats F♯ as a leading tone resolving to G would contradict the written line" refute positions nobody has taken. Sentence-level repair: "The passage is not an unbroken chain of perfect fifths" and "The F♯ falls to E and does not act as a leading tone to G".
- **Cataphoric announcement, process.md line 33.** "One harmonic qualification matters." announces the next sentence instead of stating it. Delete it and begin with "The alto's F-sharp4".
- **Maxim as closer, analysis.md line 158.** "Such devices are not a checklist for an individual fugue." is a sententia. Fold it into the previous sentence or delete it.
- **Negation skeleton, process.md throughout.** Ten paragraphs end with a "does not" limit, for example lines 17, 33, 39, 41, 49, 51, 59, 63, 65, and 69, and the keyboard-trial limit appears in four documents. The limits are real, so the repair is structural: gather them once in "What the audit tests" and remove the repeated appendages.
- **Clipped fragments, template.html line 9.** The social description "One seven-note cell. Three voices. An annotated edition with organ and piano recordings." is brachylogia. Card copy tolerates it; a full sentence reads better.
- **What need not change.** The pitch-level prose, the three tables, the source list, and the content of every stated limit are accurate and specific.

## What I found in the site, the audio path, and the build

The player code, the timeline mapping, and the coordination logic are correct as written, and the node tests can fail on real regressions. My findings concern resource use, edge behavior, accessibility, and cleanup.

- **P2 hypothesis, source/player.ts lines 63–82.** `load()` decodes the master and all three stems for an instrument and retains both instruments' buffers for the session.

  | Quantity | Estimate |
  | --- | --- |
  | One decoded stereo buffer, 48 kHz, 74 s | about 28 MB |
  | Four parts for one instrument | about 114 MB |
  | Both instruments retained | about 228 MB |

  - Mobile Safari limits decoded audio memory, and the evidence contains no phone audio test, so a real device could fail to decode or evict the tab. The parent agent tests an iPhone with organ, then piano, then a solo; if it fails, the player decodes stems only when a voice is first soloed or frees the inactive instrument's buffers on switch.
- **P3, edition/includes/stretto-callout.html and source/app.ts lines 161–164.** "Upper voices" sets the global voice set to soprano and alto and leaves it there after the excerpt ends, and neither button shows a pressed state. A reader who then presses Play hears no bass. The player should restore the previous voices when that excerpt ends, or the buttons should show state.
- **P3, assets/site.css lines 92 and 17 of annotated-score.css.** The status line, the scroll hint, and the "Solo" label are 14 px muted text, while the user asked for larger readable controls. The status line also tells readers to choose "Whole piece", a button that sits in the top player and not in the floating player. I suggest 16 px for the status line and a "Whole piece" control in the floating player when a range is active.
- **P3 accessibility, assets/site.css line 89.** A switched-off voice button renders at 0.4 opacity with a strike-through, which I compute at about 2.3 to 1 against the player background, below the 4.5 to 1 text minimum. A muted color that meets the ratio plus the strike-through keeps the cue.
- **P3 accessibility, assets/annotated-score.js lines 70 and 115, and analysis.md figure markup.** The toolbar and annotation `div`s carry `aria-label` without a role, so assistive technology ignores the label; `role="group"` fixes it. The figure PDF links expose "Download Example 1" while showing "PDF ↗", which fails label-in-name, and the site uses ↗ for figure PDFs but ↓ for the main PDFs. One label form and one arrow convention resolve both.
- **P3, source/app.ts lines 33–37.** If any of the five JSON fetches fails, the top-level await aborts the module. The native audio element stays visible, which is a good fallback, but every Listen, Repeat, and Solo button is inert with no message. A try block that writes the status text and hides the figure buttons would complete the fallback.
- **P3 hypothesis, reproducibility/render_audio.py line 51 and hall-production/hall.py line 180.** The organ render normalizes to −18 LUFS or a −2 dBTP ceiling, while the piano masters deliver at −20 LUFS. Switching instruments mid-playback may step about 2 LU. Measuring organ.mp3 settles it; a static −2 dB on the organ render or a per-instrument gain in the player would match them.
- **P3, source/player.ts lines 148–159 and 129–133.** `pause()` stops sources instantly with no ramp, and a repeating excerpt jumps from loop end to loop start with no crossfade. Sustained organ tones will click at pause and at each loop. A 10 ms ramp on the bus before stopping removes the first; the second is a design limit worth one sentence in the status text.
- **P3 maintainability, assets/excerpts/g-entry.ly, .svg, .cropped.pdf, and edition/classical-analysis.md.** The generator emits a mm. 9–10 excerpt that no figure, specification, or example uses, and the G entry is the only entry without an example. Either the paper gains a ninth example or the range leaves generate_excerpts.py. The classical-analysis.md copy duplicates analysis.md and will drift.
- **P3 maintainability, assets/site.css lines 184–193.** Unlayered minified overrides follow the layered stylesheet, the first `.licc-reference` button rule is fully overridden by the next, and the phone block declares the heading letter-spacing twice. Folding the overrides into the components layer removes the dead rules.
- **P3 performance, assets/timeline-organ.json and timeline-piano.json.** Both files ship a per-note array the app never reads, which is most of their 85 to 95 KB, and the excerpt manifest is 127 KB. Stripping the note arrays from the web copies shortens the wait before the Listen buttons work.
- **P3 design, assets/site.css line 143, phone hero screenshot.** The hero excerpt renders at about 340 px wide on a phone and is illegible. Hiding it below 760 px, or letting it scroll like the figures, keeps the pitch-name line as the readable element.
- **P3 design, assets/score/fugue.png.** The full-score image is 1241 px wide and displays at about 1000 CSS px, so it is soft on high-density screens. A 2× PNG or an SVG render fixes it; the aspect ratio and lack of stretching are correct.
- **P3, template.html and site.css line 62.** The page's one code block uses a system monospace stack, not Inconsolata. If the request covered the site, a self-hosted Inconsolata face is a small addition; if it covered only the PDF, nothing changes.
- **P3 hypothesis, browser evidence.** In Chrome the decoded MP3 durations equal the WAV frame counts exactly, so note highlighting aligns there. Safari may not trim the encoder delay, which would shift highlighting by tens of milliseconds; a Safari check settles it.
- **Repository weight, note only.** The four dry 24-bit stems add about 76 MB and the two delivery WAVs about 43 MB. GitHub Pages serves them, but clones are heavy, and Pages cannot serve LFS objects, so the files must stay in Git if they stay at all.

**Guest-reader walkthrough**

I base this on the eight screenshots, the template, and the built page, not on live interaction.

- **Landing.** A reader sees the masthead, the title, the deck "A fugue on the exact inversion of the LICC.", the head excerpt with its pitch names and semitone steps, and a metadata row. The player follows with the organ selected, a large play button, a scrubber that reports the measure, three voice toggles, and a status sentence.
- **Downloads.** The download row wraps cleanly on desktop and phone with no overlapping text, and a second line names the closer room mix and the dry Steinway file.
- **Reading.** A sticky contents list tracks the section in view. The abstract leads, the reference figure compares the Lick with its inversion and offers "Hear the subject", and each example offers a filled Listen button, a Repeat toggle, a PDF link, a Solo row, colored brackets, annotation buttons, and a readout line.
- **Orientation gap.** The page never says what the Lick is beyond its seven pitches or why the spelling LICC appears. A reader who does not know the phrase gets no cultural anchor; one sourced sentence would supply it.
- **Phone.** Sections stack, excerpts scroll horizontally with a visible hint, and the Solo row wraps to two lines. The hero excerpt is a thin illegible strip.
- **End of page.** The full score appears as one page in a white frame, the appendix follows with its figure, and the footer credits the agents and the direction.

## What I did not inspect and the triage order

**Limits of this review**

- I did not listen to any recording, perform a keyboard trial, or load the live site, and I make no claim about musical expressivity or deployed behavior.
- I could not reach any external source. The Prout, Hutchinson, Gran, and UCSB section numbers, the OpenAIR license text, and the Jeux d'orgues attribution remain verified only by the parent. The description of the BWV 847 tonal answer is correct from my own knowledge.
- I did not execute any script, decode any MIDI, WAV, or MP3, or open the SVG and PDF figure bytes; I judged the figures from the PDF page renders and the screenshots.
- I sampled the timeline, manifest, and audit JSON with pattern searches rather than reading every array, and I did not read the candidate ledgers, the historical audits, or package-lock.json in detail.

**Triage order**

1. The parent agent adds the parallel-motion sentence and clause to the analysis, applies the prose edits in the same pass, and rebuilds the TeX and PDF.
2. The parent agent runs the iPhone audio test and, if it fails, changes stem loading before any other player work.
3. The parent agent raises the three overlapping brackets in figures.json, re-exports the annotated figures, and fixes the example float placement in the same PDF rebuild.
4. The parent agent restores the voice state after the callout excerpts, enlarges the status text, and adds "Whole piece" to the floating player.
5. The parent agent fixes the voice-button contrast, the group roles, and the PDF link labels.
6. The parent agent measures the organ loudness against the piano and matches them if the step is confirmed.
7. The parent agent adds the pause ramp and the load-failure message.
8. The parent agent removes the unused G-entry excerpt or adds its example, deletes or regenerates the duplicate analysis copy, consolidates the stylesheet overrides, and trims the timeline payloads.
9. The parent agent makes the remaining text corrections for the m. 10 tail, the F-major counterline, and the stretto label.
