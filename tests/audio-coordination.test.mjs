import assert from 'node:assert/strict';
import test from 'node:test';
import { coordinateAudio } from '../assets/audio-coordination.mjs';

class Playback extends EventTarget {
  playing = false;
  loading = false;
  pause() { this.playing = false; this.loading = false; }
  start() { this.playing = true; this.dispatchEvent(new Event('play')); }
}

test('enhancement stops native playback started before the modules loaded', () => {
  const player = new Playback();
  const native = new Playback();
  native.start();
  coordinateAudio(player, native, new EventTarget());
  assert.equal(native.playing, false);
});

test('native playback and the score player interrupt each other', () => {
  const player = new Playback();
  const native = new Playback();
  coordinateAudio(player, native, new EventTarget());
  player.playing = true;
  native.start();
  assert.equal(player.playing, false);
  player.loading = true;
  player.dispatchEvent(new Event('change'));
  assert.equal(native.playing, false);
});

test('leaving the page stops playback and cancels pending audio loading', () => {
  const player = new Playback();
  const native = new Playback();
  const page = new EventTarget();
  coordinateAudio(player, native, page);
  player.loading = true;
  native.playing = true;
  page.dispatchEvent(new Event('pagehide'));
  assert.equal(player.loading, false);
  assert.equal(native.playing, false);
});
