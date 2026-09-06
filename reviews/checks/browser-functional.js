(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async (predicate, message) => {
    const deadline = performance.now() + 20000;
    while (!predicate() && performance.now() < deadline) await wait(25);
    assert(predicate(), message);
  };
  const { player, views, failures } = window.fugueEdition;
  assert(views.size === 8 && !failures.length, 'All eight interactive figures must mount.');
  assert(window.fugueAudioTest.sink.gain.value === 0, 'The test output must stay muted.');
  assert(player.context.state === 'running', 'A trusted play click must precede this check.');
  player.pause();
  await wait(50);
  await player.setVoices(['soprano', 'alto', 'bass']);
  await player.setInstrument('organ');
  await player.play();
  assert(player.sources.length === 1 && player.sources[0].buffer === player.buffers.get('organ').mix,
    'All voices must use only the original organ master.');
  const organ = { seconds: player.sources[0].buffer.duration, bytes: player.decodedBytes, gainDb: player.playbackGainDb, sampleRate: player.sources[0].buffer.sampleRate };
  player.seekQuarter(44.5);
  const scorePosition = player.quarter;
  await player.setInstrument('piano');
  await wait(50);
  assert(Math.abs(player.quarter - scorePosition) < .2, 'Instrument switching must preserve score position.');
  assert(player.sources.length === 1 && player.sources[0].buffer === player.buffers.get('piano').mix,
    'All voices must use only the original piano master.');
  assert(player.buffers.size === 1 && player.pending.size === 0, 'The old instrument or a completed decode remains retained.');
  const piano = { seconds: player.sources[0].buffer.duration, bytes: player.decodedBytes, gainDb: player.playbackGainDb, sampleRate: player.sources[0].buffer.sampleRate };
  player.pause();
  document.querySelector('[data-score="head"] [data-annotation-button="inversion"]').click();
  assert(document.querySelectorAll('[data-score="head"] [data-note-id][aria-pressed="true"]').length === 7,
    'The inversion annotation must select seven notes.');
  document.querySelector('[data-score="return"] [data-annotation-button="stretto-a"]').click();
  assert(document.querySelectorAll('[data-score="return"] [data-note-id][aria-pressed="true"]').length === 7,
    'The delayed head must select all seven notes across the bar line.');
  document.querySelector('[data-score="return"] [data-voice-button="a"]').click();
  document.querySelector('[data-listen="return"]').click();
  await until(() => player.playing && !player.loading, 'Alto excerpt playback failed.');
  assert(player.voices.size === 1 && player.voices.has('alto'), 'The excerpt Solo button must select the alto.');
  assert(player.sources.length === 1 && player.sources[0].buffer === player.buffers.get('piano').alto,
    'Alto playback must use the actual alto recording.');
  assert([...views.keys()].every(name => document.querySelector(`[data-score="${name}"]`).dataset.focusVoice === 'a'),
    'Voice selection must stay synchronized across all figures.');
  document.querySelector('[data-context="upper"]').click();
  await until(() => player.playing && !player.loading && player.sources.length === 2, 'The upper-voice comparison did not load.');
  assert(player.voices.has('soprano') && player.voices.has('alto') && !player.voices.has('bass'), 'The comparison must exclude bass.');
  assert(document.querySelector('[data-context="upper"]').getAttribute('aria-pressed') === 'true', 'The comparison must expose its selected state.');
  assert(document.querySelector('[data-context="all"]').getAttribute('aria-pressed') === 'false', 'The opposite comparison must clear its state.');
  const pair = { parts: Object.keys(player.buffers.get('piano')), bytes: player.decodedBytes };
  document.querySelector('[data-loop="return"]').click();
  await until(() => player.playing && !player.loading && player.range?.repeat, 'The repeat control failed.');
  assert(player.range.startQuarter === 72 && player.range.endQuarter === 80, 'The repeated excerpt has the wrong bars.');
  for (const source of player.sources) {
    assert(source.loopStart === 0 && source.loopEnd === source.buffer.duration, 'The private loop buffer has incorrect endpoints.');
    for (let channel = 0; channel < source.buffer.numberOfChannels; channel++) {
      const samples = source.buffer.getChannelData(channel);
      assert(samples[0] === 0 && samples.at(-1) === 0, 'The loop endpoints must taper to zero.');
    }
  }
  const loop = { parts: player.sources.length, bytes: player.decodedBytes, seconds: player.sources[0].buffer.duration };
  player.pause();
  await wait(50);
  assert(!document.querySelector('#mini-clear-excerpt').hidden, 'A paused excerpt must keep its floating exit control.');
  document.querySelector('#mini-clear-excerpt').click();
  assert(player.range === null && player.voices.size === 2, 'Whole piece must clear the range without silently changing voices.');
  document.querySelector('#reset-voices').click();
  await player.play();
  assert(player.sources[0].buffer === player.buffers.get('piano').mix, 'All voices must restore the master.');
  assert(player.sources[0].buffer.duration > player.timing.quarterStarts.at(-1), 'Whole-piece playback must retain the hall tail.');
  player.pause();
  await wait(50);
  await document.fonts.ready;
  await document.fonts.load('16px Inconsolata');
  const code = document.querySelector('pre code');
  assert(getComputedStyle(code).fontFamily.includes('Inconsolata') && document.fonts.check('16px Inconsolata'), 'The code font did not load.');
  const ui = document.querySelectorAll('button, .contents a, .registration, .transport-labels, .edition-data, .player-note, .score-voice-label, .score-scroll-hint');
  const undersized = [...ui].filter(element => getComputedStyle(element).display !== 'none' && parseFloat(getComputedStyle(element).fontSize) < 16);
  assert(!undersized.length, `Small interface text remains: ${undersized.map(element => element.className || element.tagName)}`);
  assert(document.documentElement.scrollWidth === document.documentElement.clientWidth, 'The page overflows its viewport.');
  return { passed: true, figures: views.size, organ, piano, pair, loop,
    realMasterAndStemIdentity: true, synchronizedVoiceState: true, sharedScorePosition: true,
    repeatEndpointsZero: true, floatingRangeExit: true, retainedHallTail: true,
    minimumInterfacePixels: 16, inconsolataLoaded: true, viewport: innerWidth, contextSampleRate: player.context.sampleRate,
    audioAudition: false, method: 'Actual Chrome audio decoding and controls, routed through a separate zero-gain output bus.' };
})()
