/** Регистрируется из колокольчика в шапке (common.ui), чтобы не тянуть common.ui сюда. */

const players = new Set<() => void>();

export function registerNotificationSoundPlayer(play: () => void): () => void {
  players.add(play);
  return () => {
    players.delete(play);
  };
}

export function playIncomingNotificationSound(): void {
  const play = players.values().next().value;
  play?.();
}
