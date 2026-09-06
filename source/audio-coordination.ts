import type { ScorePlayer } from './player.ts';

export function coordinateAudio(player: ScorePlayer, native: HTMLMediaElement, page: EventTarget = window) {
  native.pause();
  player.addEventListener('change', () => {
    if (player.playing || player.loading) native.pause();
  });
  native.addEventListener('play', () => player.pause());
  page.addEventListener('pagehide', () => { player.pause(); native.pause(); });
}
