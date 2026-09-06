                                               

export function coordinateAudio(player             , native                  , page              = window) {
  native.pause();
  player.addEventListener('change', () => {
    if (player.playing || player.loading) native.pause();
  });
  native.addEventListener('play', () => player.pause());
  page.addEventListener('pagehide', () => { player.pause(); native.pause(); });
}
