import unittest

import numpy as np
from hall import convolve_room, estimate_decay, mix_room, prepare_ir


class HallProcessingTests(unittest.TestCase):
    def test_dry_sound_is_preserved_with_zero_room_level(self):
        dry = np.array([[0.4, -0.2], [0.1, 0.3], [-0.5, 0.7]])
        room = np.full((7, 2), 0.25)
        mixed = mix_room(dry, room, 0)
        np.testing.assert_array_equal(mixed[: len(dry)], dry)
        np.testing.assert_array_equal(mixed[len(dry) :], 0)

    def test_impulse_retains_stereo_reflection_positions(self):
        dry = np.array([[1.0, 1.0], [0.0, 0.0]])
        impulse = np.array([[0.0, 0.0], [0.5, -0.2], [0.0, 0.3]])
        expected = np.vstack([impulse, [[0.0, 0.0]]])
        np.testing.assert_allclose(convolve_room(dry, impulse), expected, atol=1e-14)

    def test_direct_impulse_is_removed_but_early_reflection_remains(self):
        rate = 48000
        impulse = np.zeros((rate // 2, 2))
        impulse[240] = 1.0
        impulse[1200] = [0.25, 0.2]
        processed, information = prepare_ir(impulse, rate, highpass_hz=0, lowpass_hz=0, tail_seconds=0.4)
        self.assertEqual(information['direct_index'], 240)
        np.testing.assert_array_equal(processed[:960], 0)
        self.assertGreater(processed[960, 0], 0)
        self.assertGreater(processed[960, 1], 0)

    def test_decay_fit_recovers_a_known_exponential(self):
        rate = 12000
        seconds = np.arange(rate * 6) / rate
        expected_t60 = 1.8
        amplitude = np.exp(-np.log(1000) * seconds / expected_t60)
        result = estimate_decay(np.column_stack([amplitude, amplitude]), rate)
        self.assertAlmostEqual(result['t20_extrapolated_seconds'], expected_t60, delta=0.01)
        self.assertGreater(result['t20_r_squared'], 0.999)

    def test_shared_room_and_master_gains_preserve_stem_additivity(self):
        generator = np.random.default_rng(26)
        stems = [generator.normal(0, .05, (180, 2)) for _ in range(3)]
        impulse = generator.normal(0, .01, (23, 2))
        master_gain, room_gain = 0.4, 0.2
        master = mix_room(sum(stems), convolve_room(sum(stems), impulse), room_gain) * master_gain
        combined = sum(mix_room(stem, convolve_room(stem, impulse), room_gain) * master_gain for stem in stems)
        np.testing.assert_allclose(master, combined, atol=1e-14)


if __name__ == '__main__':
    unittest.main()
