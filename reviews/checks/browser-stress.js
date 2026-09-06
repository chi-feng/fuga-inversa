(async () => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async (predicate, message) => {
    const deadline = performance.now() + 20000;
    while (!predicate() && performance.now() < deadline) await wait(25);
    assert(predicate(), message);
  };
  const player = window.fugueEdition.player;
  const context = player.context;
  assert(context.state === 'running' && window.fugueAudioTest.sink.gain.value === 0, 'Run the muted setup and trusted play click first.');
  player.pause();
  await wait(50);
  const originalCreate = context.createBufferSource.bind(context);
  const scheduled = [];
  context.createBufferSource = () => {
    const source = originalCreate();
    const start = source.start.bind(source);
    const stop = source.stop.bind(source);
    let record;
    source.start = (when, offset, duration) => {
      const part = Object.entries(player.buffers.get(player.instrument) ?? {}).find(([, buffer]) => buffer === source.buffer)?.[0];
      record = { instrument: player.instrument, part: part ?? 'private-loop', start: Math.max(when, context.currentTime), offset,
        end: source.loop ? Infinity : Math.max(when, context.currentTime) + (duration ?? source.buffer.duration - offset) };
      scheduled.push(record);
      return duration === undefined ? start(when, offset) : start(when, offset, duration);
    };
    source.stop = (when = 0) => {
      if (record) record.end = Math.min(record.end, Math.max(when, context.currentTime));
      return stop(when);
    };
    return source;
  };
  const native = document.querySelector('#fallback-audio');
  native.muted = true;
  try {
    await player.setVoices(['soprano', 'alto', 'bass']);
    await player.setInstrument('organ');
    await player.play();
    await Promise.all([
      player.playExcerpt(1, 2), player.setInstrument('piano'),
      player.playExcerpt(19, 20, true), player.setInstrument('organ'),
      player.playExcerpt(11, 12),
    ]);
    assert(player.playing && player.instrument === 'organ', 'The last instrument request did not win.');
    assert(player.range.startQuarter === 40 && player.range.endQuarter === 48, 'The last excerpt request did not win.');
    assert(player.sources.length === 1 && player.sources[0].buffer === player.buffers.get('organ').mix, 'A stale source survived rapid requests.');
    await player.setVoices(['soprano', 'alto']);
    const pair = scheduled.slice(-2);
    assert(pair.map(row => row.part).join(',') === 'soprano,alto', 'The actual pair buffers have the wrong voice identity.');
    assert(pair[0].start === pair[1].start && pair[0].offset === pair[1].offset, 'The stems did not share one clock and offset.');
    await wait(60);
    document.querySelector('[data-score="return"] [data-voice-button="a"]').click();
    await until(() => player.playing && !player.loading && player.voices.size === 1, 'Excerpt alto selection failed.');
    assert(player.sources[0].buffer === player.buffers.get('organ').alto, 'The solo does not play the alto file.');
    document.querySelector('[data-score="exposition"] [data-note-id="fig-exposition-s-m3-n1"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await until(() => player.playing && !player.loading, 'Note seeking failed.');
    assert(player.voices.size === 1 && player.voices.has('alto'), 'Clicking a soprano note changed the chosen audible voice.');
    document.querySelector('.licc-reference [data-listen="head"]').click();
    await until(() => player.playing && !player.loading && player.range?.startQuarter === 0, 'The LICC reference did not use the shared player.');
    assert(player.range.endQuarter === 8 && player.sources.length === 1, 'The reference selected the wrong range or added another player.');
    await native.play();
    await wait(50);
    assert(!player.playing && !player.loading && !player.sources.length && !player.retiring.size, 'The native player left score audio running.');
    document.querySelector('#play').click();
    await until(() => player.playing && !player.loading, 'The main player failed to resume.');
    assert(native.paused && player.sources.length === 1, 'The main player did not pause the native recording.');
    player.pause();
    await wait(50);
    assert(!player.sources.length && !player.retiring.size && !player.pending.size, 'Pause left sources, retiring graphs, or decode requests active.');
    const events = scheduled.filter(row => row.end > row.start).flatMap(row => [
      { time: row.start, delta: 1, row }, { time: row.end, delta: -1, row },
    ]).sort((a, b) => a.time - b.time || a.delta - b.delta);
    const active = new Set();
    let maximum = 0;
    for (const event of events) {
      if (event.delta > 0) active.add(event.row); else active.delete(event.row);
      maximum = Math.max(maximum, active.size);
      assert(new Set([...active].map(row => row.instrument)).size <= 1, 'Different instrument recordings overlap on the audio clock.');
      assert(!(active.size > 1 && [...active].some(row => row.part === 'mix')), 'The full master overlaps a second master or a voice stem.');
    }
    assert(maximum === 2, 'The scheduled overlap must consist of exactly the selected pair.');
    return { passed: true, latestRequestWins: true, actualPair: pair.map(row => row.part), alignedStarts: true,
      maximumConcurrentScheduledSources: maximum, masterStemAndInstrumentExclusive: true,
      nativeAndScoreExclusiveAfterPauseFade: true, pauseFadeMilliseconds: 10,
      noteClickPreservesVoice: true, liccUsesSharedPlayer: true,
      contextSampleRate: context.sampleRate, audioAudition: false,
      method: 'Actual source start/stop intervals and UI behavior, routed through a muted output bus.' };
  } finally {
    player.pause();
    native.pause();
    await wait(50);
    context.createBufferSource = originalCreate;
    await player.setVoices(['soprano', 'alto', 'bass']);
    player.clearExcerpt();
  }
})()
