# Printed hand allocation

The final score fits a 12-semitone maximum span in each hand at every sounding interval under its printed staff allocation. The checker matches all 382 MIDI notes to the source by pitch, onset, and tied duration. It then checks the 177 intervals bounded by note starts, note endings, and staff transfers, including notes held across other voices' attacks.

`check_hands.py` reads the first score block's initial staff assignments and every `\change Staff` in the voice definitions. It treats the upper staff as the right hand and the lower staff as the left hand. The soprano stays in the right hand; the bass stays in the left hand. The alto follows these transfers:

| Position | Alto assignment |
|---|---|
| Opening | Right hand |
| m.3, beat 1 | Left hand |
| m.5, beat 1 | Right hand |
| m.9, beat 4 | Left hand |
| m.10, beat 1 | Right hand |
| m.11, beat 1 | Left hand |
| m.13, beat 1 | Right hand |
| m.25, beat 1 | Left hand |

The complete interval data and source line references are in `printed-hands.json`. The source and MIDI SHA-256 hashes bind the report to the supplied files. A stale MIDI file causes the checker to stop before a reach result is produced.

## Falsification example

`fixtures/missing-alto-transfer.ly` omits only the alto's lower-staff transfer before m.11. It has the same pitches and durations as the final score and uses the same symbolic MIDI for this check. The checker rejects its printed allocation.

| Position | Right-hand notes | Span |
|---|---|---|
| m.11, beat 1 | Alto C4; soprano E5 | 16 semitones |
| m.11, beat 2½ | Alto G3; soprano E5 | 21 semitones |

The existing abstract reach calculation still passes that MIDI because another hand assignment is possible. The printed-hand check catches the missing instruction. Its saved failing report is `fixtures/missing-alto-transfer-report.json`.

The check covers instantaneous reach. It does not establish fingering, easy motion between positions, sustained legato, or a successful human performance. It accepts the final score's restricted absolute-pitch notation and explicitly rejects unsupported notation or staff transfers within sustained notes.
