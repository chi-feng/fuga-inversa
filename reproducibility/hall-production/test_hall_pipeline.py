import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import hall
import numpy as np
from scipy.io import wavfile


class PipelineContractTest(unittest.TestCase):
    def test_master_stems_loudness_and_public_metadata(self):
        with tempfile.TemporaryDirectory(prefix="hall-contract-", dir=Path(__file__).parent) as temporary:
            directory = Path(temporary)
            rate = 48000
            seconds = np.arange(4 * rate) / rate
            envelope = np.minimum(seconds / .1, 1) * np.minimum((4 - seconds) / .2, 1)
            stems = []
            paths = []
            for name, frequency in zip(("soprano", "alto", "bass"), (440, 330, 147), strict=True):
                signal = .035 * envelope * np.sin(2 * np.pi * frequency * seconds)
                stereo = np.column_stack([signal, signal * .92])
                stems.append(stereo)
                path = directory / f"{name}.wav"
                wavfile.write(path, rate, stereo.astype(np.float32))
                paths.append(f"{name}={path}")
            dry_path = directory / "dry-source.wav"
            wavfile.write(dry_path, rate, sum(stems).astype(np.float32))
            output = directory / "output"
            arguments = ["hall.py", "--dry", str(dry_path), "--out", str(output), "--source-label", "Synthetic contract fixture", "--compare-start", "0.5", "--compare-duration", "3"]
            for path in paths:
                arguments.extend(["--stem", path])
            with patch("sys.argv", arguments):
                hall.main()
            report = json.loads((output / "report.json").read_text())
            self.assertLess(report["stem_sum_check"]["source_residual_rms_relative_db"], -100)
            self.assertLess(report["stem_sum_check"]["processed_residual_rms_relative_db"], -100)
            self.assertLessEqual(report["comparison"]["maximum_loudness_difference_lu"], .1)
            for name, stem in report["stems"].items():
                self.assertEqual(stem["room_gain"], report["presets"]["recital"]["room_gain"])
                self.assertEqual(stem["master_gain_db"], report["presets"]["recital"]["master_gain_db"])
                self.assertLess(stem["after"]["true_peak_dbtp"], 0)
                self.assertTrue((output / f"recital-{name}.mp3").exists())
            public_text = (output / "public-provenance.json").read_text()
            self.assertNotIn(temporary, public_text)
            self.assertNotIn("/Users/", public_text)
            public = json.loads(public_text)
            self.assertEqual(set(public["stems"]), {"soprano", "alto", "bass"})
            self.assertEqual(public["source_format"]["bits_per_sample"], 32)
            self.assertEqual(public["source_format"]["codec"], "pcm_f32le")
            self.assertEqual(public["stems"]["alto"]["source_format"]["bits_per_sample"], 32)
            self.assertIn("ffmpeg", public["tool_versions"])


if __name__ == "__main__":
    unittest.main()
