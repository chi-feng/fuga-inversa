import { mountAnnotatedScore } from '../assets/annotated-score.js';
import { ScorePlayer, type Timing } from './player.ts';
import { coordinateAudio } from './audio-coordination.ts';
import { formatTime } from '../assets/timeline.mjs';

type Instrument = 'organ' | 'piano';
type Voice = 'soprano' | 'alto' | 'bass';
type ShortVoice = 's' | 'a' | 'b';
type ScoreEvent = { id: string; midi: number | null; measure: number; onset: number; duration: number; voice: ShortVoice };
type Figure = { name: string; start_measure: number; end_measure: number; events: ScoreEvent[] };
type Manifest = { figures: Figure[] };
type View = Awaited<ReturnType<typeof mountAnnotatedScore>>;
type Configs = Record<string, Record<string, unknown>>;
type Recording = { label: string; description: string };
declare global {
  interface Window {
    fugueEdition: { ready: boolean; manifest: Manifest; configs: Configs; views: Map<string, View>; player: ScorePlayer; failures: string[] };
  }
}
const VOICES: Voice[] = ['soprano', 'alto', 'bass'];
const SHORT_VOICES: Record<ShortVoice, Voice> = { s: 'soprano', a: 'alto', b: 'bass' };
const VOICE_SHORT: Record<Voice, ShortVoice> = { soprano: 's', alto: 'a', bass: 'b' };
const $ = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const $$ = <T extends Element = HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];
const json = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`The edition file ${url} could not load.`);
  return response.json();
};
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l14-8z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>';

const [manifest, configs, organ, piano, recordings] = await Promise.all([
  json<Manifest>('./assets/excerpts/manifest.json'), json<Configs>('./assets/figures.json'),
  json<Timing>('./assets/timeline-organ.json'), json<Timing>('./assets/timeline-piano.json'),
  json<Record<Instrument, Recording>>('./assets/recordings.json'),
]);
const figures = new Map(manifest.figures.map(figure => [figure.name, figure]));
const views = new Map<string, View>();
const failures: string[] = [];
await Promise.all($$('[data-score]').map(async host => {
  const name = host.dataset.score!;
  try {
    const view = await mountAnnotatedScore(host, {
      figure: figures.get(name)!, assetBase: './assets/excerpts/', ...configs[name],
      voiceControlLabel: 'AudioContext' in window ? 'Solo' : 'Highlight',
    });
    views.set(name, view);
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    const message = document.createElement('p');
    message.className = 'lab-note';
    message.textContent = 'Interactive notes are unavailable. The engraved excerpt and its PDF remain readable.';
    host.append(message);
    console.error(error);
  }
}));

const fallback = $<HTMLAudioElement>('#fallback-audio');
if (!('AudioContext' in window)) {
  for (const button of $$<HTMLButtonElement>('[data-instrument]')) button.addEventListener('click', () => {
    const instrument = button.dataset.instrument!;
    fallback.src = `./assets/audio/${instrument}.mp3`;
    for (const tab of $$('[data-instrument]')) tab.setAttribute('aria-pressed', String(tab === button));
  });
} else {
  const player = new ScorePlayer({ timings: { organ, piano } });
  coordinateAudio(player, fallback);
  for (const host of $$('[data-score]')) host.addEventListener('voicefocus', event => {
    const voice = (event as CustomEvent<{voice: ShortVoice | 'all'}>).detail.voice;
    player.setVoices(voice === 'all' ? VOICES : [SHORT_VOICES[voice]]);
  });
  $('.player').classList.add('enhanced');
  const position = $<HTMLInputElement>('#position');
  let seeking = false;
  let playerVisible = true;
  let lastState = '';
  const noteElements: { element: Element | null; start: number; end: number; voice: Voice }[] = [];
  for (const [name, view] of views) {
    const figure = figures.get(name)!;
    for (const event of figure.events) {
      if (event.midi === null) continue;
      const start = (event.measure - 1) * 4 + event.onset;
      noteElements.push({ element: view.svg.querySelector(`[data-note-id="${event.id}"]`),
        start, end: start + event.duration, voice: SHORT_VOICES[event.voice] });
    }
  }

  function report(error: Error) {
    $('#player-status').textContent = `${error.message} The direct recording links remain available.`;
    console.error(error);
  }

  function update() {
    const record = recordings[player.instrument];
    const active = player.playing || player.loading;
    $('#play').innerHTML = player.loading ? '<span aria-hidden="true">…</span>' : active ? pauseIcon : playIcon;
    $('#play').setAttribute('aria-label', player.loading ? 'Cancel audio loading' : player.playing ? 'Pause recording' : 'Play recording');
    $('#mini-play').textContent = player.playing ? 'Pause' : 'Play';
    $('#mini-play').setAttribute('aria-label', player.playing ? 'Pause recording' : 'Play recording');
    $('#registration').textContent = record.label;
    for (const button of $$('[data-instrument]')) button.setAttribute('aria-pressed', String(button.dataset.instrument === player.instrument));
    for (const button of $$('.voice-controls [data-voice]')) button.setAttribute('aria-pressed', String(player.voices.has(button.dataset.voice as Voice)));
    const selected = [...player.voices].map(voice => VOICE_SHORT[voice]);
    for (const view of views.values()) view.focusVoices(selected);
    $('#clear-excerpt').hidden = player.range === null;
    for (const button of $$('[data-loop]')) {
      const figure = figures.get(button.dataset.loop!)!;
      button.setAttribute('aria-pressed', String(Boolean(player.range?.repeat && player.range.startQuarter === (figure.start_measure - 1) * 4)));
    }
    if (player.loading) $('#player-status').textContent = `Loading the ${player.instrument} recording and voice parts…`;
    else if (player.range) {
      const first = player.range.startQuarter / 4 + 1;
      const last = player.range.endQuarter / 4;
      $('#player-status').textContent = `${player.range.repeat ? 'Repeating' : 'Excerpt'} · measures ${first}–${last}. Choose “Whole piece” to continue beyond the excerpt.`;
    } else $('#player-status').textContent = player.voices.size === 3 ? record.description : player.voices.size === 0 ? 'No voices selected. Choose a voice or All voices.' : 'Voice study uses separate renders at the full recording’s gain. The selected voices are not made louder.';
    tickUI();
  }

  function tickUI() {
    const q = player.quarter;
    const measure = Math.min(26, Math.floor(q / 4) + 1);
    if (!seeking) position.value = String(q);
    position.setAttribute('aria-valuetext', `Measure ${measure}, beat ${Math.min(4, Math.floor(q % 4) + 1)}`);
    $('#elapsed').textContent = formatTime(player.position);
    $('#duration').textContent = formatTime(player.duration);
    $('#measure').textContent = q >= 104 ? 'Final resonance' : `Measure ${measure} of 26`;
    $('#mini-label').textContent = `${player.instrument === 'organ' ? 'Organ' : 'Piano'} · ${q >= 104 ? 'final resonance' : `measure ${measure}`}`;
    $('#floating-player').classList.toggle('visible', player.playing && !playerVisible);
    const state = `${player.playing}:${Math.floor(q * 20)}:${[...player.voices].join()}`;
    if (state !== lastState) {
      for (const note of noteElements) note.element?.classList.toggle('is-sounding',
        player.playing && player.voices.has(note.voice) && q >= note.start && q < note.end);
      lastState = state;
    }
  }

  const toggle = () => player.playing || player.loading ? player.pause() : player.play().catch(report);
  $('#play').addEventListener('click', toggle);
  $('#mini-play').addEventListener('click', toggle);
  for (const button of $$('[data-instrument]')) button.addEventListener('click', () => player.setInstrument(button.dataset.instrument as Instrument).catch(report));
  for (const button of $$('.voice-controls [data-voice]')) button.addEventListener('click', () => {
    const voice = button.dataset.voice as Voice;
    const enabled = new Set(player.voices);
    if (enabled.has(voice)) enabled.delete(voice); else enabled.add(voice);
    player.setVoices([...enabled]);
  });
  $('#reset-voices').addEventListener('click', () => player.setVoices(VOICES));
  $('#clear-excerpt').addEventListener('click', () => player.clearExcerpt());
  position.addEventListener('input', () => { seeking = true; });
  position.addEventListener('change', () => { seeking = false; player.seekQuarter(Number(position.value)); });
  for (const button of $$('[data-listen], [data-loop]')) button.addEventListener('click', () => {
    const name = button.dataset.listen ?? button.dataset.loop;
    const figure = figures.get(name!)!;
    if (button.dataset.loop && button.getAttribute('aria-pressed') === 'true') {
      player.clearExcerpt();
      return;
    }
    player.playExcerpt(figure.start_measure, figure.end_measure, Boolean(button.dataset.loop)).catch(report);
  });
  for (const button of $$('[data-context]')) button.addEventListener('click', () => {
    player.setVoices(button.dataset.context === 'upper' ? ['soprano', 'alto'] : VOICES);
    player.playExcerpt(19, 20).catch(report);
  });
  player.addEventListener('change', update);
  new IntersectionObserver(entries => { playerVisible = entries[0].isIntersecting; tickUI(); }).observe($('.player'));
  function frame() { player.poll(); tickUI(); requestAnimationFrame(frame); }
  update();
  requestAnimationFrame(frame);
  window.fugueEdition = { ready: true, manifest, configs, views, player, failures };
}

const links = $$('.contents a[href^="#"]');
const targets = links.map(link => document.querySelector(link.getAttribute('href')!)).filter((target): target is Element => target !== null);
function updateContents() {
  const current = targets.map(target => ({ target, top: target.getBoundingClientRect().top }))
    .filter(item => item.top <= window.innerHeight * .22).sort((a, b) => b.top - a.top)[0];
  if (!current) return;
  const id = current.target.id;
  for (const link of links) link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
}
let contentsPending = false;
window.addEventListener('scroll', () => {
  if (contentsPending) return;
  contentsPending = true;
  requestAnimationFrame(() => { updateContents(); contentsPending = false; });
}, { passive: true });
updateContents();
