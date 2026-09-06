import tempfile
import unittest
from pathlib import Path

from check_hands import check_hands

ROOT = Path(__file__).resolve().parent


class PrintedHandsTest(unittest.TestCase):
    def check_variant(self, source):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "variant.ly"
            path.write_text(source)
            return check_hands(path, ROOT / "fugue.midi")

    def test_final_printed_allocation_fits_an_octave(self):
        report = check_hands(ROOT / "fugue.ly", ROOT / "fugue.midi")
        self.assertTrue(report["passes"])
        self.assertEqual(report["maximum_span_semitones"], {"RH": 12, "LH": 12})
        self.assertEqual(report["duration_quarters"], 104)
        self.assertEqual(report["source_midi_agreement"]["matched_notes"], 382)
        self.assertEqual(report["violations"], [])

    def test_missing_alto_transfer_is_detected_with_unchanged_midi(self):
        source = (ROOT / "fugue.ly").read_text()
        target = '\\tag #\'layout { \\change Staff = "lower" \\voiceOne }\n  c\'8 bes8 a8 g8 bes4 d\'8 c\'8~ | % 11'
        self.assertEqual(source.count(target), 1)
        broken = source.replace(target, "c'8 bes8 a8 g8 bes4 d'8 c'8~ | % 11")
        report = self.check_variant(broken)
        self.assertFalse(report["passes"])
        first = report["violations"][0]
        self.assertEqual((first["bar"], first["beat"], first["hand"]), (11, 1, "RH"))
        self.assertEqual(first["span_semitones"], 16)
        self.assertEqual([n["pitch"] for n in first["notes"]], ["C4", "E5"])
        self.assertEqual(report["maximum_span_semitones"]["RH"], 21)
        self.assertEqual(report["source_midi_agreement"]["matched_notes"], 382)

    def test_changed_pitch_cannot_be_checked_against_stale_midi(self):
        source = (ROOT / "fugue.ly").read_text()
        target = "d'8 c'8 b8 a8 c'4 e'8 d'8~ | % 1"
        self.assertEqual(source.count(target), 1)
        broken = source.replace(target, "dis'8 c'8 b8 a8 c'4 e'8 d'8~ | % 1")
        with self.assertRaisesRegex(ValueError, "MIDI does not match"):
            self.check_variant(broken)

    def test_unsupported_voice_syntax_is_rejected(self):
        source = (ROOT / "fugue.ly").read_text()
        with self.assertRaisesRegex(ValueError, "Unsupported"):
            self.check_variant(source.replace("soprano = {", "soprano = { \\relative c' "))


if __name__ == "__main__":
    unittest.main()
