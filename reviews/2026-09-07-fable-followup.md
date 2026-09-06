# Fable follow-up review

Claude Fable 5.1 (`claude-fable-5-1`) reviewed a frozen copy of the corrections to commit [7a156b0](https://github.com/chi-feng/fuga-inversa/commit/7a156b0deea04743f2fc06264f6162813388e709) on 7 September 2026. This was a read-only review across model families. The [snapshot inventory](evidence/fable-followup-snapshot.json) identifies the exact files; [execution metadata](evidence/fable-followup-metadata.json) records the model and snapshot checks.

The final report follows without edits. Its file locations refer to that snapshot. [The response](../REVIEW.md) records the later corrections, retained choices, and evidence that the reviewer did not receive.

---

I found no material regression in the correction delta. The revised player, the fallback path, the corrected analytical statements, and the re-exported figures hold up against the source and the supplied evidence. I report four confirmed low-severity items, two hypotheses, and one optional cleanup. My earlier minor-thirteenth and all-contrary-motion claims were wrong, and the paper's corrections match the score.

## What I found in the correction delta

- **P3, confirmed, paper layout.** Printed page 6 of the analytical PDF still ends with roughly its lower third empty. The proof image page-07.png shows the two "tonic return" paragraphs followed by blank space, because Example 7 and its sonority table both move to page 7. The validation record in reviews/evidence/paper-validation.json checks the closing page and Example 6, but it does not assess this page, so the review text is accurate while the prior blank-page finding is only partly resolved. I propose either moving the sonority table ahead of Example 7 in edition/fuga-inversa-analysis.tex so the table fills page 6, or accepting the gap as the cost of keeping each example inside its section.

- **P3, confirmed, no-script presentation.** The instrument tabs now ship with the disabled attribute in template.html and rely on script to enable them. The reset layer in assets/site.css styles disabled buttons with a wait cursor and reduced opacity. Without JavaScript, a reader therefore sees two permanently dimmed tabs whose hover cursor promises loading that never finishes, although the status sentence correctly directs them to the native controls and links. I propose a noscript style that hides the tab group, or a default cursor for disabled instrument tabs.

- **P3, confirmed, prose in the appendix.** The new "Evidence and limits" section in edition/process.md closes with two "neither ... nor" sentences that reject a conservatory grade, model superiority, and a benchmark result. No reader of the paper has seen those claims, so the sentences rebut positions that exist only in the production session. The same text appears on printed page 14. I propose one positive sentence in their place: "The checks establish pitch, interval, timing, reach, and level facts; musical quality and human resemblance remain unassessed."

- **P3, confirmed, evidence wording.** REVIEW.md states that sample checks found "zero endpoint discontinuity in the checked loops." The check in reviews/checks/browser-functional.js asserts only that the first and last samples of each private loop copy equal zero, which the taper guarantees by construction. The sentence dresses a designed property as a measurement. I propose: "The loop copies' first and last samples are zero, as the taper requires; audibility was not tested."

- **P3, hypothesis, loop boundary.** The private loop copy in source/player.ts fades the last five milliseconds out and the first five milliseconds in, so every repeat produces a ten-millisecond level dip rather than a step. On a sustained organ tone that dip may register as a soft tick once per iteration. Nobody has listened to it. If a listening check confirms the tick, I propose an overlap crossfade inside the copy, blending the frames just before the excerpt start into the copy's tail, in place of the two tapers.

- **P3, hypothesis, visible selection.** The "With bass" comparison button shows a pressed state and a check mark whenever all three voices are selected, which is the default. A reader who reaches the callout for the first time sees a comparison already marked before pressing anything, and the meaning of that mark is ambiguous. The behaviour comes from the update function in source/app.ts and the check-mark rule in assets/site.css. I propose showing the pressed state only while measures 19 to 20 form the active range, or dropping the check-mark glyph and keeping the background change.

- **Optional cleanup.** The pending-load record in source/player.ts stores an instrument and a part that no code reads; only the map key is used. Removing the two fields shortens the type without changing behaviour.

I also checked the items that could have regressed silently and found them sound. The cancellation path aborts fetches, discards late decodes, and swallows superseded rejections without unhandled promises. The master and stem identity follows the voice set exactly, and an empty selection plays a silent clock without allocating buffers. The pause fade computes the current level from the attack and end ramps and releases nodes through both an ended callback and a timer, so a suspended context cannot leak a graph. The stylesheet consolidation preserved precedence: the reduced-motion override sits after the smooth-scroll rule in the same layer, and the print rules still win by order or importance. The contrast figure for inactive voices is correct by my own computation of the two colours. The web code font requests the same stylistic set that the TeX build uses, so the upright quotes are consistent between the two artifacts. I found no new security surface.

## Which prior findings are resolved and which disagreements I rechecked

The following prior findings are resolved in the delta, and I verified each against the source or the proofs: the parallel-motion sentence and limitation clause; the G-entry tail and F-major counterline text; the three lifted brackets, which now clear the bar numbers in both the PDF and the desktop screenshot; the spelled-out stretto label; Example 6 placement and the former near-empty page; the Lick explanation and citation; the callout note and pressed states; the floating "Whole piece" control; the enlarged interface text; the group roles and PDF label names; the load-failure message and native fallback; the organ level offset in code; the removed excerpt, duplicate document, and trimmed timelines; the hidden phone hero and the high-density score image.

I rechecked the two disputed descriptions directly in assets/score/fugue.ly, and the paper's corrections are right.

| Passage | My initial claim | Score reading |
| --- | --- | --- |
| M. 11, beat 2½, soprano E5 over alto G3 | minor thirteenth | 21 semitones, a major thirteenth |
| Mm. 13–14, double octaves on beats 2 and 4 | all by contrary motion | contrary, then similar three times, each with a soprano step |

I also confirmed the other changed analytical statements: the sixths throughout m. 4, the tenths throughout mm. 6, 16, and 22, the mostly tenths in m. 12 with the 9–8, the alternation of compound thirds and double octaves, the two-octave E3–E5 at m. 25, the C♯ motions in m. 25, the final minor thirteenth F♯3–D5, the D5–C5 tail in m. 10, and the semitone openings of both major-mode counterline versions. The declined tie respelling at m. 17 and the acknowledged cadence interpretation are reasonable decisions, and I do not press them.

## What I could not inspect

I did not hear any audio, load the live site, or run the tests, so the loudness measurements, the perceived smoothness of the fades, and the deployed behaviour rest on the parent's records. I could not reach the Judd article or confirm the Heitlinger 2011 date beyond its agreement with my background knowledge. The claim that the two cancellation tests failed before the fix has no failing run in the evidence bundle, although the code makes the claim plausible. Safari and iPhone behaviour, decoder scratch memory, and the encoder-delay hypothesis remain open, as REVIEW.md states. I excluded the intentionally stale manifests from this pass.
