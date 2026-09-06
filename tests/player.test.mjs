import test from 'node:test';
import assert from 'node:assert/strict';
import { ScorePlayer } from '../assets/player.mjs';

class Parameter {
  value = 1;
  cancelScheduledValues() {}
  setValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  setTargetAtTime(value) { this.value = value; }
}

class Context {
  currentTime = 0;
  destination = {};
  sources = [];
  resume() { return Promise.resolve(); }
  createGain() { return { gain: new Parameter(), connect() {}, disconnect() {} }; }
  createBufferSource() {
    const source = { connect() {}, disconnect() {}, stop() { this.stopped = true; }, start(when, offset) { this.when = when; this.offset = offset; } };
    this.sources.push(source);
    return source;
  }
}

const timing = factor => ({ bars: 2, quarterStarts: Array.from({ length: 9 }, (_, index) => index * factor) });
function fixture(loader) {
  const context = new Context();
  const timings = { organ: timing(.5), piano: timing(.75) };
  const player = new ScorePlayer({
    timings,
    createContext: () => context,
    loadBuffer: loader ?? (async (_context, _url) => ({ duration: 10 })),
  });
  return { player, context };
}

test('master and all stems start on the same audio clock and offset', async () => {
  const { player, context } = fixture();
  player.seekQuarter(2);
  await player.play();
  assert.equal(context.sources.length, 4);
  assert.deepEqual(context.sources.map(source => source.offset), [1, 1, 1, 1]);
  assert.equal(new Set(context.sources.map(source => source.when)).size, 1);
  assert.deepEqual(player.gainValues(), { mix: 1, soprano: 0, alto: 0, bass: 0 });
});

test('instrument change preserves the score position through different tempo maps', async () => {
  const { player, context } = fixture();
  await player.play();
  context.currentTime = context.sources[0].when + 1.5;
  assert.equal(player.quarter, 3);
  await player.setInstrument('piano');
  assert.equal(player.instrument, 'piano');
  assert.equal(player.quarter, 3);
  assert.equal(context.sources.at(-1).offset, 2.25);
  assert.ok(context.sources.slice(0, 4).every(source => source.stopped));
});

test('voice isolation replaces the master without boosting the remaining voice', async () => {
  const { player } = fixture();
  await player.play();
  player.setVoices(['alto']);
  assert.deepEqual(player.gainValues(), { mix: 0, soprano: 0, alto: 1, bass: 0 });
  player.setVoices([]);
  assert.deepEqual(player.gainValues(), { mix: 0, soprano: 0, alto: 0, bass: 0 });
  player.setVoices(['soprano', 'alto', 'bass']);
  assert.equal(player.gainValues().mix, 1);
});

test('pause cancels an unfinished asynchronous play request', async () => {
  let finish;
  const ready = new Promise(resolve => { finish = resolve; });
  const { player, context } = fixture(async () => { await ready; return { duration: 10 }; });
  const pending = player.play();
  player.pause();
  finish();
  await pending;
  assert.equal(player.playing, false);
  assert.equal(context.sources.length, 0);
});

test('excerpt loop uses score boundaries and wraps the reported position', async () => {
  const { player, context } = fixture();
  await player.playExcerpt(2, 2, true);
  assert.ok(context.sources.every(source => source.loop && source.loopStart === 2 && source.loopEnd === 4));
  context.currentTime = context.sources[0].when + 2.5;
  assert.equal(player.position, 2.5);
  assert.equal(player.quarter, 5);
  player.clearExcerpt();
  assert.equal(player.range, null);
});

test('normal end includes the recorded hall tail and then stops', async () => {
  const { player, context } = fixture();
  await player.play();
  context.currentTime = context.sources[0].when + 9;
  player.poll();
  assert.equal(player.playing, true);
  assert.equal(player.quarter, 8);
  context.currentTime += 1.1;
  player.poll();
  assert.equal(player.playing, false);
  assert.equal(player.position, 10);
});
