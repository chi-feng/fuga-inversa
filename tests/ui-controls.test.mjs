import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const template = await readFile(new URL('../template.html', import.meta.url), 'utf8');
const recordings = JSON.parse(await readFile(new URL('../assets/recordings.json', import.meta.url), 'utf8'));
const nextTurn = () => new Promise(resolve => setImmediate(resolve));
let instance = 0;

class Element extends EventTarget {
  dataset = {};
  attributes = new Map();
  hidden = false;
  disabled = false;
  textContent = '';
  value = '0';
  classes = new Set();
  classList = {
    add: name => this.classes.add(name),
    toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name),
    contains: name => this.classes.has(name),
  };
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  pause() {}
  click() { this.dispatchEvent(new Event('click')); }
}

async function fixture(t) {
  const nodes = new Map([...template.matchAll(/<[a-z]+\b[^>]*\bid="([^"]+)"[^>]*>/g)]
    .map(([markup, id]) => {
      const element = new Element();
      if (/\bdata-clear-excerpt\b/.test(markup)) element.dataset.clearExcerpt = '';
      return [id, element];
    }));
  const instruments = Object.entries(recordings).map(([instrument, recording]) => {
    const button = new Element();
    button.dataset = { instrument, recordingLabel: recording.label };
    button.setAttribute('aria-pressed', String(instrument === 'organ'));
    return button;
  });
  const voices = ['soprano', 'alto', 'bass'].map(voice => {
    const button = new Element();
    button.dataset.voice = voice;
    return button;
  });
  const contexts = ['upper', 'all'].map(context => {
    const button = new Element();
    button.dataset.context = context;
    return button;
  });
  const page = new EventTarget();
  page.AudioContext = class {};
  const document = {
    body: new Element(),
    querySelector: selector => selector === '.player' ? nodes.get('listen') : nodes.get(selector.slice(1)),
    querySelectorAll: selector => {
      if (selector === '[data-instrument]') return instruments;
      if (selector === '.voice-controls [data-voice]') return voices;
      if (selector === '[data-context]') return contexts;
      if (selector === '[data-clear-excerpt]') return [...nodes.values()].filter(node => node.dataset.clearExcerpt !== undefined);
      return [];
    },
  };
  const globals = {
    window: page, document, requestAnimationFrame: () => 0,
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() { this.callback([{ isIntersecting: false }]); }
    },
    fetch: async url => ({ ok: true, json: async () => {
      if (url.endsWith('manifest.json')) return { figures: [] };
      if (url.endsWith('figures.json')) return {};
      if (url.endsWith('recordings.json')) return recordings;
      return { bars: 26, quarterStarts: Array.from({ length: 105 }, (_, index) => index * .5) };
    } }),
  };
  for (const [name, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name]);
  }
  await import(`../assets/app.mjs?ui-contract=${++instance}`);
  for (let attempt = 0; !page.fugueEdition?.ready && attempt < 10; attempt++) await nextTurn();
  assert.equal(page.fugueEdition?.ready, true);
  return { nodes, contexts, page, player: page.fugueEdition.player };
}

test('stretto comparison waits for voice loading and displays the persistent voice selection', async t => {
  const { contexts, nodes, player } = await fixture(t);
  let release;
  const loaded = new Promise(resolve => { release = resolve; });
  player.setVoices = async voices => {
    player.voices = new Set(voices);
    player.changed();
    await loaded;
  };
  const excerpts = [];
  player.playExcerpt = async (...args) => { excerpts.push(args); };
  contexts[0].click();
  await nextTurn();
  assert.equal(contexts[0].getAttribute('aria-pressed'), 'true');
  assert.equal(contexts[1].getAttribute('aria-pressed'), 'false');
  assert.equal(excerpts.length, 0);
  release();
  await nextTurn();
  assert.deepEqual(excerpts, [[19, 20]]);
  player.range = { startQuarter: 72, endQuarter: 80, repeat: false };
  player.clearExcerpt();
  assert.equal(contexts[0].getAttribute('aria-pressed'), 'true');
  assert.match(nodes.get('player-status').textContent, /soprano and alto/);
});

test('the floating player keeps Whole piece reachable when an excerpt is paused or finished', async t => {
  const { nodes, player } = await fixture(t);
  const floatingExit = nodes.get('mini-clear-excerpt');
  assert.ok(floatingExit, 'The template must supply the floating Whole piece button.');
  player.range = { startQuarter: 72, endQuarter: 80, repeat: false };
  player.playing = false;
  player.changed();
  assert.equal(floatingExit.hidden, false);
  assert.equal(nodes.get('clear-excerpt').hidden, false);
  assert.equal(nodes.get('floating-player').classList.contains('visible'), true);
  floatingExit.click();
  assert.equal(player.range, null);
  assert.equal(floatingExit.hidden, true);
  assert.equal(nodes.get('clear-excerpt').hidden, true);
  assert.equal(nodes.get('floating-player').classList.contains('visible'), false);
});

test('a superseded stretto preset cannot restart playback after a later choice', async t => {
  const { contexts, player } = await fixture(t);
  const finish = [];
  player.setVoices = async voices => {
    player.voices = new Set(voices);
    player.changed();
    await new Promise(resolve => { finish.push(resolve); });
  };
  let plays = 0;
  player.playExcerpt = async () => { plays++; };
  contexts[0].click();
  contexts[1].click();
  finish[1]();
  await nextTurn();
  finish[0]();
  await nextTurn();
  assert.equal(plays, 1);
  assert.equal(contexts[1].getAttribute('aria-pressed'), 'true');
});

test('cancelling a pending comparison prevents its later playback continuation', async t => {
  const { nodes, contexts, player } = await fixture(t);
  let release;
  player.setVoices = async voices => {
    player.voices = new Set(voices);
    player.loading = true;
    player.changed();
    await new Promise(resolve => { release = resolve; });
  };
  let plays = 0;
  player.playExcerpt = async () => { plays++; };
  contexts[0].click();
  nodes.get('play').click();
  release();
  await nextTurn();
  assert.equal(plays, 0);
});

for (const interruption of ['native playback', 'page hide']) {
  test(`${interruption} cancels a pending comparison before its continuation`, async t => {
    const { nodes, contexts, page, player } = await fixture(t);
    let release;
    player.setVoices = async voices => {
      player.voices = new Set(voices);
      player.loading = true;
      player.changed();
      await new Promise(resolve => { release = resolve; });
    };
    let plays = 0;
    player.playExcerpt = async () => { plays++; };
    contexts[0].click();
    if (interruption === 'native playback') nodes.get('fallback-audio').dispatchEvent(new Event('play'));
    else page.dispatchEvent(new Event('pagehide'));
    assert.equal(player.loading, false, 'The interrupt must already have cancelled the audio request.');
    release();
    await nextTurn();
    assert.equal(plays, 0, 'The cancelled comparison must not schedule another excerpt.');
  });
}
