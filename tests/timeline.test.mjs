import test from 'node:test';
import assert from 'node:assert/strict';
import { secondsForQuarter, quarterAtTime, excerptRange, formatTime } from '../assets/timeline.mjs';

test('retains tempo changes within a beat when a finer grid is supplied', () => {
  const timing = { bars: 1, quarterStarts: [0, 1, 3], gridStep: .5, gridStarts: [0, .25, 1, 1.75, 3] };
  assert.equal(secondsForQuarter(.5, timing), .25);
  assert.equal(quarterAtTime(.25, timing), .5);
  assert.equal(secondsForQuarter(1.5, timing), 1.75);
  assert.equal(quarterAtTime(3, timing), 2);
});

const timing = { quarterStarts: [0, .5, 1, 1.6, 2.2, 3.2, 4.2, 5.2, 6.2], duration: 6.2, bars: 2 };

test('maps score beats through tempo changes and back', () => {
  assert.ok(Math.abs(secondsForQuarter(3.5, timing) - 1.9) < 1e-9);
  assert.equal(secondsForQuarter(4, timing), 2.2);
  for (let quarter = 0; quarter <= 8; quarter += .125) {
    assert.ok(Math.abs(quarterAtTime(secondsForQuarter(quarter, timing), timing) - quarter) < 1e-9);
  }
});

test('clamps a ringing tail to the final notated position', () => {
  assert.equal(quarterAtTime(10, timing), 8);
  assert.equal(secondsForQuarter(-2, timing), 0);
  assert.equal(secondsForQuarter(20, timing), 6.2);
});

test('includes every beat of an inclusive measure range', () => {
  assert.deepEqual(excerptRange(2, 2, timing), { start: 2.2, end: 6.2, startQuarter: 4, endQuarter: 8 });
  assert.throws(() => excerptRange(0, 1, timing), RangeError);
  assert.throws(() => excerptRange(2, 3, timing), RangeError);
});

test('formats transport time without rounding over a boundary', () => {
  assert.equal(formatTime(59.99), '0:59');
  assert.equal(formatTime(74.2), '1:14');
});
