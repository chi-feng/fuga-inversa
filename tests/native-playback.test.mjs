import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { initializeNativePlayback } from '../assets/native-playback.mjs';

const template = await readFile(new URL('../template.html', import.meta.url), 'utf8');
const recordings = JSON.parse(await readFile(new URL('../assets/recordings.json', import.meta.url), 'utf8'));

class Button extends EventTarget {
  disabled = true;
  constructor(instrument, label) {
    super();
    this.dataset = { instrument, recordingLabel: label };
    this.attributes = new Map([['aria-pressed', String(instrument === 'organ')]]);
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  click() { if (!this.disabled) this.dispatchEvent(new Event('click')); }
}

function fixture() {
  const buttons = [...template.matchAll(/<button\b([^>]*\bdata-instrument="([^"]+)"[^>]*)>/g)]
    .map(([, attributes, instrument]) => new Button(instrument, attributes.match(/data-recording-label="([^"]+)"/)?.[1]));
  const audio = { src: './assets/audio/organ.mp3', pauseCount: 0, pause() { this.pauseCount++; } };
  const registration = { textContent: '' };
  const status = { textContent: '' };
  const native = initializeNativePlayback({ audio, buttons, registration, status });
  return { audio, buttons, registration, status, native };
}

test('native instrument changes keep the source, registration, status and pressed state together', () => {
  const { audio, buttons, registration, status, native } = fixture();
  assert.equal(buttons.length, 2);
  for (const instrument of ['piano', 'organ']) {
    const selected = buttons.find(button => button.dataset.instrument === instrument);
    selected.click();
    assert.equal(audio.src, `./assets/audio/${instrument}.mp3`);
    assert.equal(registration.textContent, recordings[instrument].label);
    assert.match(status.textContent, new RegExp(`${instrument} recording`));
    assert.match(status.textContent, /Excerpt playback and voice isolation are unavailable/);
    assert.equal(native.instrument, instrument);
    for (const button of buttons) assert.equal(button.getAttribute('aria-pressed'), String(button === selected));
  }
  assert.equal(audio.pauseCount, 2);
});

test('selecting the active native instrument leaves its playback uninterrupted', () => {
  const { audio, buttons, registration, native } = fixture();
  buttons[0].click();
  assert.equal(audio.pauseCount, 0);
  assert.equal(registration.textContent, recordings.organ.label);
  assert.equal(native.instrument, 'organ');
});

test('enhancement can remove native selectors before attaching score playback', () => {
  const { audio, buttons, registration, native } = fixture();
  native.dispose();
  buttons[1].click();
  assert.equal(audio.src, './assets/audio/organ.mp3');
  assert.equal(audio.pauseCount, 0);
  assert.equal(registration.textContent, recordings.organ.label);
});
