export function secondsForQuarter(quarter, timing) {
  const ticks = timing.gridStarts ?? timing.quarterStarts;
  const step = timing.gridStarts ? timing.gridStep : 1;
  const q = Math.max(0, Math.min(ticks.length - 1, quarter / step));
  const index = Math.floor(q);
  if (index === ticks.length - 1) return ticks[index];
  return ticks[index] + (ticks[index + 1] - ticks[index]) * (q - index);
}

export function quarterAtTime(seconds, timing) {
  const ticks = timing.gridStarts ?? timing.quarterStarts;
  const step = timing.gridStarts ? timing.gridStep : 1;
  if (seconds <= 0) return 0;
  if (seconds >= ticks.at(-1)) return (ticks.length - 1) * step;
  let low = 0;
  let high = ticks.length - 1;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (ticks[middle] <= seconds) low = middle;
    else high = middle;
  }
  return (low + (seconds - ticks[low]) / (ticks[high] - ticks[low])) * step;
}

export function excerptRange(first, last, timing) {
  if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last < first || last > timing.bars) {
    throw new RangeError('The excerpt must lie within the score.');
  }
  const startQuarter = (first - 1) * 4;
  const endQuarter = last * 4;
  return { start: secondsForQuarter(startQuarter, timing), end: secondsForQuarter(endQuarter, timing), startQuarter, endQuarter };
}

export function formatTime(seconds) {
  const whole = Math.floor(Math.max(0, seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
