import { mountAnnotatedScore } from '../assets/annotated-score.js';
import { ScorePlayer,             } from './player.mjs';
import { coordinateAudio } from './audio-coordination.mjs';
import { initializeNativePlayback } from './native-playback.mjs';
import { formatTime } from '../assets/timeline.mjs';

                                    
                                         
                                  
                                                                                                                           
                                                                                                 
                                      
                                                            
                                                       
                                                        
                
                    
                                                                                                                                              
   
 
const VOICES          = ['soprano', 'alto', 'bass'];
const SHORT_VOICES                            = { s: 'soprano', a: 'alto', b: 'bass' };
const VOICE_SHORT                            = { soprano: 's', alto: 'a', bass: 'b' };
const $ =                                  (selector        ) => document.querySelector   (selector) ;
const $$ =                                  (selector        ) => [...document.querySelectorAll   (selector)];
const json = async    (url        )             => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`The edition file ${url} could not load.`);
  return response.json();
};
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l14-8z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>';

const fallback = $                  ('#fallback-audio');
const nativePlayback = initializeNativePlayback({
  audio: fallback, buttons: $$                   ('[data-instrument]'),
  registration: $('#registration'), status: $('#player-status'),
});
async function enhanceEdition() {
  const [manifest, configs, organ, piano, recordings] = await Promise.all([
    json          ('./assets/excerpts/manifest.json'), json         ('./assets/figures.json'),
    json        ('./assets/timeline-organ.json'), json        ('./assets/timeline-piano.json'),
    json                               ('./assets/recordings.json'),
  ]);
  const canEnhanceAudio = typeof window.AudioContext === 'function';
  const figures = new Map(manifest.figures.map(figure => [figure.name, figure]));
  const views = new Map              ();
  const failures           = [];
  await Promise.all($$('[data-score]').map(async host => {
    const name = host.dataset.score ;
    try {
      const view = await mountAnnotatedScore(host, {
        figure: figures.get(name) , assetBase: './assets/excerpts/', ...configs[name],
        voiceControlLabel: canEnhanceAudio ? 'Solo' : 'Highlight',
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
  if (!canEnhanceAudio) return;
  const player = new ScorePlayer({ timings: { organ, piano } });
  await player.setInstrument(nativePlayback.instrument);
  let contextRequest = 0;
  const cancelComparison = () => { contextRequest++; };
  fallback.addEventListener('play', cancelComparison);
  window.addEventListener('pagehide', cancelComparison);
  coordinateAudio(player, fallback);
  for (const host of $$('[data-score]')) host.addEventListener('voicefocus', event => {
    contextRequest++;
    const voice = (event                                            ).detail.voice;
    player.setVoices(voice === 'all' ? VOICES : [SHORT_VOICES[voice]]).catch(report);
  });
  const position = $                  ('#position');
  let seeking = false;
  let playerVisible = true;
  let lastState = '';
  const noteElements                                                                          = [];
  for (const [name, view] of views) {
    const figure = figures.get(name) ;
    for (const event of figure.events) {
      if (event.midi === null) continue;
      const start = (event.measure - 1) * 4 + event.onset;
      noteElements.push({ element: view.svg.querySelector(`[data-note-id="${event.id}"]`),
        start, end: start + event.duration, voice: SHORT_VOICES[event.voice] });
    }
  }

  function report(error       ) {
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
    for (const button of $$('.voice-controls [data-voice]')) button.setAttribute('aria-pressed', String(player.voices.has(button.dataset.voice         )));
    const selected = [...player.voices].map(voice => VOICE_SHORT[voice]);
    for (const view of views.values()) view.focusVoices(selected);
    for (const button of $$('[data-clear-excerpt]')) button.hidden = player.range === null;
    for (const button of $$('[data-context]')) {
      const expected          = button.dataset.context === 'upper' ? ['soprano', 'alto'] : VOICES;
      button.setAttribute('aria-pressed', String(player.voices.size === expected.length && expected.every(voice => player.voices.has(voice))));
    }
    for (const button of $$('[data-loop]')) {
      const figure = figures.get(button.dataset.loop ) ;
      button.setAttribute('aria-pressed', String(Boolean(player.range?.repeat && player.range.startQuarter === (figure.start_measure - 1) * 4)));
    }
    const voiceNames = VOICES.filter(voice => player.voices.has(voice));
    const voiceSummary = voiceNames.length ? `Hearing ${voiceNames.length === 3 ? 'all voices' : voiceNames.join(' and ')}.` : 'No voices selected.';
    if (player.loading) $('#player-status').textContent = `Loading the ${player.instrument} ${player.voices.size === 3 ? 'recording' : 'selected voices'}…`;
    else if (player.range) {
      const first = player.range.startQuarter / 4 + 1;
      const last = player.range.endQuarter / 4;
      $('#player-status').textContent = `${player.range.repeat ? 'Repeating' : 'Excerpt'} · measures ${first}–${last}. ${voiceSummary} Choose “Whole piece” to leave the excerpt; the voice selection stays active.`;
    } else $('#player-status').textContent = player.voices.size === 3 ? record.description : player.voices.size === 0 ? 'No voices selected. Turn on a voice or choose All voices.' : `${voiceSummary} Choose All voices to restore the complete texture. The selected voices use the full recording’s gain.`;
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
    $('#floating-player').classList.toggle('visible', !playerVisible && (player.playing || player.loading || player.range !== null));
    const state = `${player.playing}:${Math.floor(q * 20)}:${[...player.voices].join()}`;
    if (state !== lastState) {
      for (const note of noteElements) note.element?.classList.toggle('is-sounding',
        player.playing && player.voices.has(note.voice) && q >= note.start && q < note.end);
      lastState = state;
    }
  }

  const toggle = () => {
    contextRequest++;
    if (player.playing || player.loading) player.pause();
    else player.play().catch(report);
  };
  $('#play').addEventListener('click', toggle);
  $('#mini-play').addEventListener('click', toggle);
  for (const button of $$('[data-instrument]')) button.addEventListener('click', () => {
    contextRequest++;
    player.setInstrument(button.dataset.instrument              ).catch(report);
  });
  for (const button of $$('.voice-controls [data-voice]')) button.addEventListener('click', () => {
    contextRequest++;
    const voice = button.dataset.voice         ;
    const enabled = new Set(player.voices);
    if (enabled.has(voice)) enabled.delete(voice); else enabled.add(voice);
    player.setVoices([...enabled]).catch(report);
  });
  $('#reset-voices').addEventListener('click', () => {
    contextRequest++;
    player.setVoices(VOICES).catch(report);
  });
  for (const button of $$('[data-clear-excerpt]')) button.addEventListener('click', () => {
    contextRequest++;
    player.clearExcerpt();
  });
  position.addEventListener('input', () => { seeking = true; });
  position.addEventListener('change', () => { contextRequest++; seeking = false; player.seekQuarter(Number(position.value)); });
  for (const button of $$('[data-listen], [data-loop]')) button.addEventListener('click', () => {
    contextRequest++;
    const name = button.dataset.listen ?? button.dataset.loop;
    const figure = figures.get(name ) ;
    if (button.dataset.loop && button.getAttribute('aria-pressed') === 'true') {
      player.clearExcerpt();
      return;
    }
    player.playExcerpt(figure.start_measure, figure.end_measure, Boolean(button.dataset.loop)).catch(report);
  });
  for (const button of $$('[data-context]')) button.addEventListener('click', async () => {
    const request = ++contextRequest;
    try {
      await player.setVoices(button.dataset.context === 'upper' ? ['soprano', 'alto'] : VOICES);
      if (request !== contextRequest) return;
      await player.playExcerpt(19, 20);
    } catch (error) {
      if (request === contextRequest) report(error         );
    }
  });
  player.addEventListener('change', update);
  new IntersectionObserver(entries => { playerVisible = entries[0].isIntersecting; tickUI(); }).observe($('.player'));
  function frame() { player.poll(); tickUI(); requestAnimationFrame(frame); }
  update();
  nativePlayback.dispose();
  $('.player').classList.add('enhanced');
  document.body.classList.add('audio-enhanced');
  requestAnimationFrame(frame);
  window.fugueEdition = { ready: true, manifest, configs, views, player, failures };
}
enhanceEdition().catch(error => {
  $('#player-status').textContent = `The interactive player could not load. Use the audio controls to play the ${nativePlayback.instrument} recording. The engraved scores and recording links remain available.`;
  console.error(error);
});

const links = $$('.contents a[href^="#"]');
const targets = links.map(link => document.querySelector(link.getAttribute('href') )).filter((target)                    => target !== null);
function updateContents() {
  const current = targets.map(target => ({ target, top: target.getBoundingClientRect().top }))
    .filter(item => item.top <= window.innerHeight * .22).sort((a, b) => b.top - a.top)[0];
  const id = current?.target.id ?? 'analysis';
  for (const link of links) link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
}
let contentsPending = false;
window.addEventListener('scroll', () => {
  if (contentsPending) return;
  contentsPending = true;
  requestAnimationFrame(() => { updateContents(); contentsPending = false; });
}, { passive: true });
updateContents();
