(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async (predicate, message) => {
    const deadline = performance.now() + 10000;
    while (!predicate() && performance.now() < deadline) await wait(20);
    assert(predicate(), message);
  };
  const player = window.fugueEdition.player;
  const native = document.querySelector('#fallback-audio');
  assert(player.context.state === 'running' && window.fugueAudioTest.sink.gain.value === 0 && native.muted, 'Run muted setup and a trusted play click first.');
  const loadBuffer = player.loadBuffer;
  const playExcerpt = player.playExcerpt;
  const cases = [];
  let release = () => {};
  try {
    for (const event of ['native playback', 'pagehide']) {
      player.pause(); native.pause();
      await wait(50);
      player.clearExcerpt();
      await player.setVoices(['soprano', 'alto', 'bass']);
      await player.setInstrument('organ');
      await player.play();
      let excerptStarts = 0;
      const gate = new Promise(resolve => { release = resolve; });
      player.loadBuffer = async (...args) => { await gate; return loadBuffer(...args); };
      player.playExcerpt = async (...args) => { excerptStarts++; return playExcerpt.apply(player, args); };
      document.querySelector('[data-context="upper"]').click();
      await until(() => player.loading && player.pending.size === 2, 'The selected stem loads did not reach the controlled wait.');
      if (event === 'native playback') await native.play();
      else window.dispatchEvent(new Event('pagehide'));
      await until(() => !player.loading && !player.playing, 'The interrupt did not stop the audio request.');
      release();
      await wait(150);
      assert(excerptStarts === 0, 'The cancelled comparison started an excerpt after interruption.');
      assert(!player.playing && !player.loading && !player.sources.length && !player.retiring.size && !player.pending.size, 'Audio work survived the interruption.');
      cases.push({ interruption: event, pendingStemLoads: 2, lateExcerptStarts: excerptStarts, remainingSources: player.sources.length, passed: true });
      player.loadBuffer = loadBuffer;
      player.playExcerpt = playExcerpt;
    }
    return { passed: true, cases, contextSampleRate: player.context.sampleRate, audioAudition: false,
      method: 'Actual Chrome app and playback engine with a controlled wait before real stem fetch/decode. Native media played muted; pagehide was dispatched on the live test page.' };
  } finally {
    release();
    player.loadBuffer = loadBuffer;
    player.playExcerpt = playExcerpt;
    player.pause(); native.pause();
    await wait(50);
    await player.setVoices(['soprano', 'alto', 'bass']);
    player.clearExcerpt();
  }
})()
