(async () => {
  const player = window.fugueEdition.player;
  player.pause();
  await new Promise(resolve => setTimeout(resolve, 50));
  const context = player.context ??= player.createContext();
  const createGain = context.createGain.bind(context);
  const sink = createGain();
  sink.gain.value = 0;
  sink.connect(context.destination);
  context.createGain = () => {
    const gain = createGain();
    const connect = gain.connect.bind(gain);
    gain.connect = (destination, ...args) => connect(destination === context.destination ? sink : destination, ...args);
    return gain;
  };
  const native = document.querySelector('#fallback-audio');
  native.muted = true;
  window.fugueAudioTest = { context, sink, createGain };
  return { ready: true, outputMuted: sink.gain.value === 0, contextState: context.state };
})()
