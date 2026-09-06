import test from 'node:test';
import assert from 'node:assert/strict';
import { ScorePlayer } from '../source/player.ts';

class Parameter {
  value = 1;
  commands = [];
  cancelScheduledValues(when) { this.commands.push(['cancel', when]); }
  setValueAtTime(value, when) { this.value = value; this.commands.push(['set', value, when]); }
  linearRampToValueAtTime(value, when) { this.value = value; this.commands.push(['ramp', value, when]); }
  setTargetAtTime(value, when) { this.value = value; this.commands.push(['target', value, when]); }
}

class Buffer {
  constructor(duration = 10, sampleRate = 1000, numberOfChannels = 2) {
    this.sampleRate = sampleRate;
    this.numberOfChannels = numberOfChannels;
    this.length = Math.round(duration * sampleRate);
    this.duration = this.length / sampleRate;
    this.channels = Array.from({ length: numberOfChannels }, () => new Float32Array(this.length).fill(.5));
  }
  getChannelData(channel) { return this.channels[channel]; }
}

class Context {
  currentTime = 0;
  destination = {};
  sources = [];
  copyDelay = 0;
  resume() { return Promise.resolve(); }
  createGain() { return { gain: new Parameter(), connect() {}, disconnect() { this.disconnected = true; } }; }
  createBuffer(channels, length, rate) { this.currentTime += this.copyDelay; return new Buffer(length / rate, rate, channels); }
  createBufferSource() {
    const context = this;
    let buffer = null;
    let assigned = false;
    const source = {
      get buffer() { return buffer; },
      set buffer(value) {
        if (value !== null && assigned) throw new DOMException('A source accepts one non-null buffer assignment.', 'InvalidStateError');
        if (value !== null) assigned = true;
        buffer = value;
      },
      connect() {}, disconnect() { this.disconnected = true; },
      stop(when = 0) { this.stopped = true; this.stopAt = when; },
      start(when, offset, duration) { this.when = when; this.effectiveWhen = Math.max(when, context.currentTime); this.offset = offset; this.playDuration = duration; },
      finish() { this.onended?.(); },
    };
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
    loadBuffer: loader ?? (async (_context, _url) => new Buffer()),
  });
  return { player, context };
}

function defaultContextPlayer(t, construct) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: construct });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'AudioContext', original);
    else delete globalThis.AudioContext;
  });
  return new ScorePlayer({
    timings: { organ: timing(.5), piano: timing(.75) },
    loadBuffer: async () => new Buffer(),
  });
}

test('the default context requests the delivered 48 kHz rate instead of the device default', async t => {
  const calls = [];
  const context = new Context();
  const player = defaultContextPlayer(t, function (options) { calls.push(options); return context; });
  await player.play();
  assert.deepEqual(calls, [{ sampleRate: 48000 }]);
  assert.equal(player.context, context);
  assert.equal(player.playing, true);
});

test('an unsupported requested sample rate falls back to the device rate and plays', async t => {
  const calls = [];
  const context = new Context();
  const player = defaultContextPlayer(t, function (options) {
    calls.push(options);
    if (options) throw new DOMException('This rate is unsupported.', 'NotSupportedError');
    return context;
  });
  await player.play();
  assert.deepEqual(calls, [{ sampleRate: 48000 }, undefined]);
  assert.equal(player.context, context);
  assert.equal(player.playing, true);
});

test('an unrelated context failure is reported without a second constructor attempt', async t => {
  let calls = 0;
  const error = new DOMException('The context cannot start.', 'InvalidStateError');
  const player = defaultContextPlayer(t, function () { calls++; throw error; });
  await assert.rejects(player.play(), candidate => candidate === error);
  assert.equal(calls, 1);
  assert.equal(player.playing, false);
  assert.equal(player.loading, false);
  assert.equal(player.context, null);
});

test('all voices load and play only the original master, without fulfilled promises retaining buffers', async () => {
  const loaded = [];
  const { player, context } = fixture(async (_context, url) => { loaded.push(url); return new Buffer(); });
  player.seekQuarter(2);
  await player.play();
  assert.deepEqual(loaded, ['./assets/audio/organ.mp3']);
  assert.equal(context.sources.length, 1);
  assert.equal(context.sources[0].offset, 1);
  assert.equal(player.pending.size, 0);
  assert.deepEqual(player.gainValues(), { mix: 1, soprano: 0, alto: 0, bass: 0 });
});

test('a selected pair loads only its stems and starts them on one clock and offset', async () => {
  const loaded = [];
  const { player, context } = fixture(async (_context, url) => { loaded.push(url); return new Buffer(); });
  await player.setVoices(['soprano', 'alto']);
  player.seekQuarter(2);
  await player.play();
  assert.deepEqual(loaded.sort(), ['./assets/audio/organ-alto.mp3', './assets/audio/organ-soprano.mp3']);
  assert.equal(context.sources.length, 2);
  assert.deepEqual(context.sources.map(source => source.offset), [1, 1]);
  assert.equal(new Set(context.sources.map(source => source.when)).size, 1);
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
  assert.ok(context.sources[0].stopped);
  assert.deepEqual([...player.buffers.keys()], ['piano']);
  assert.equal(player.pending.size, 0);
});

test('voice isolation replaces the master without boosting the remaining voice', async () => {
  const { player, context } = fixture();
  await player.play();
  await player.setVoices(['alto']);
  assert.deepEqual(player.gainValues(), { mix: 0, soprano: 0, alto: 1, bass: 0 });
  assert.deepEqual(Object.keys(player.buffers.get('organ')), ['alto']);
  assert.equal(player.sources.length, 1);
  assert.equal(player.gains.get('alto').gain.value, 1);
  await player.setVoices([]);
  assert.deepEqual(player.gainValues(), { mix: 0, soprano: 0, alto: 0, bass: 0 });
  assert.equal(player.sources.length, 0);
  await player.setVoices(['soprano', 'alto', 'bass']);
  assert.equal(player.gainValues().mix, 1);
  assert.deepEqual(Object.keys(player.buffers.get('organ')), ['mix']);
  assert.ok(context.sources.slice(0, -1).every(source => source.stopped));
});

test('pause cancels an unfinished asynchronous play request', async () => {
  let finish;
  let began;
  let signal;
  const ready = new Promise(resolve => { finish = resolve; });
  const loading = new Promise(resolve => { began = resolve; });
  const { player, context } = fixture(async (_context, _url, abortSignal) => {
    signal = abortSignal;
    began();
    await ready;
    return new Buffer();
  });
  const pending = player.play();
  await loading;
  player.pause();
  finish();
  await pending;
  assert.equal(signal?.aborted, true);
  assert.equal(player.playing, false);
  assert.equal(context.sources.length, 0);
  assert.equal(player.buffers.size, 0);
  assert.equal(player.pending.size, 0);
});

test('excerpt loop tapers a private excerpt copy and keeps the original recording intact', async () => {
  const original = new Buffer();
  const { player, context } = fixture(async () => original);
  await player.playExcerpt(2, 2, true);
  const source = context.sources[0];
  assert.equal(source.loop, true);
  assert.equal(source.loopStart, 0);
  assert.equal(source.loopEnd, 2);
  assert.equal(source.buffer.duration, 2);
  assert.equal(source.buffer.getChannelData(0)[0], 0);
  assert.equal(source.buffer.getChannelData(0).at(-1), 0);
  assert.equal(source.buffer.getChannelData(0)[500], .5);
  assert.equal(original.getChannelData(0)[2000], .5);
  assert.equal(original.duration, 10);
});

test('excerpt loop wraps the clock and clearing it restores the complete recording tail', async () => {
  const { player, context } = fixture();
  await player.playExcerpt(2, 2, true);
  context.currentTime = context.sources[0].when + 2.5;
  assert.equal(player.position, 2.5);
  assert.equal(player.quarter, 5);
  player.clearExcerpt();
  assert.equal(player.range, null);
  assert.equal(player.sources[0].buffer.duration, 10);
  assert.equal(player.sources[0].playDuration, undefined);
});

test('loop copies are prepared before either stem receives its shared start time', async () => {
  const { player, context } = fixture();
  context.copyDelay = .02;
  await player.setVoices(['soprano', 'alto']);
  await player.playExcerpt(2, 2, true);
  assert.equal(player.sources.length, 2);
  assert.equal(new Set(player.sources.map(source => source.effectiveWhen)).size, 1);
  assert.ok(player.sources[0].when > context.currentTime);
});

test('pause ramps the current bus for ten milliseconds before stopping and disconnecting', async () => {
  const { player, context } = fixture();
  await player.play();
  context.currentTime = player.started + 1;
  const source = player.sources[0];
  const bus = player.bus;
  const now = context.currentTime;
  player.pause();
  assert.equal(player.playing, false);
  assert.ok(Math.abs(player.position - 1) < 1e-12);
  assert.equal(source.stopAt, now + .01);
  assert.ok(bus.gain.commands.some(command => command[0] === 'ramp' && command[1] === 0 && command[2] === now + .01));
  assert.notEqual(source.disconnected, true);
  source.finish();
  assert.equal(source.disconnected, true);
});

test('organ playback uses the measured correction for master and stems, without changing piano', async () => {
  const { player } = fixture();
  await player.play();
  const organGain = 10 ** (-2.01 / 20);
  assert.ok(Math.abs(player.bus.gain.value - organGain) < 1e-12);
  await player.setVoices(['soprano', 'alto']);
  assert.ok(Math.abs(player.bus.gain.value - organGain) < 1e-12);
  assert.ok([...player.gains.values()].every(node => node.gain.value === 1));
  await player.setInstrument('piano');
  assert.equal(player.bus.gain.value, 1);
});

test('late decode results from a cancelled instrument cannot re-enter the cache or start playback', async () => {
  const resolvers = {};
  const waiting = Object.fromEntries(['organ', 'piano'].map(name => [name, new Promise(resolve => { resolvers[name] = resolve; })]));
  const called = {};
  const started = Object.fromEntries(['organ', 'piano'].map(name => [name, new Promise(resolve => { called[name] = resolve; })]));
  const { player } = fixture(async (_context, url) => {
    const instrument = url.includes('organ') ? 'organ' : 'piano';
    called[instrument]();
    await waiting[instrument];
    return new Buffer();
  });
  const organ = player.play();
  await started.organ;
  const piano = player.setInstrument('piano');
  await started.piano;
  resolvers.piano();
  await piano;
  resolvers.organ();
  await organ;
  assert.equal(player.instrument, 'piano');
  assert.equal(player.playing, true);
  assert.deepEqual([...player.buffers.keys()], ['piano']);
  assert.equal(player.pending.size, 0);
  assert.equal(player.sources.length, 1);
});

test('a failed selected stem can be retried without retaining the failed promise', async () => {
  let attempts = 0;
  const { player } = fixture(async () => {
    if (++attempts === 1) throw new Error('test network failure');
    return new Buffer();
  });
  await player.setVoices(['bass']);
  await assert.rejects(player.play(), /test network failure/);
  assert.equal(player.pending.size, 0);
  assert.equal(player.loading, false);
  await player.play();
  assert.equal(player.sources.length, 1);
  assert.equal(attempts, 2);
});

test('retained PCM counts exclude the inactive instrument after its stop completes', async () => {
  const { player, context } = fixture();
  await player.play();
  assert.equal(player.decodedBytes, 10 * 1000 * 2 * 4);
  const first = context.sources[0];
  await player.setInstrument('piano');
  first.finish();
  assert.equal(player.decodedBytes, 10 * 1000 * 2 * 4);
  await player.setVoices(['soprano', 'alto']);
  for (const source of context.sources.slice(0, -2)) source.finish();
  assert.equal(player.decodedBytes, 2 * 10 * 1000 * 2 * 4);
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
