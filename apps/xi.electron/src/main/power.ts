import { powerSaveBlocker } from 'electron';

let blockerId: number | null = null;

export function setDisplaySleepBlocked(enabled: boolean): void {
  if (enabled) {
    if (blockerId != null && powerSaveBlocker.isStarted(blockerId)) return;
    blockerId = powerSaveBlocker.start('prevent-display-sleep');
    return;
  }

  if (blockerId == null) return;
  if (powerSaveBlocker.isStarted(blockerId)) {
    powerSaveBlocker.stop(blockerId);
  }
  blockerId = null;
}
