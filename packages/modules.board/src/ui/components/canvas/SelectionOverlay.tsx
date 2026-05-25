import { track } from '@ibodr/draw';
import { SelectionMenu } from '../toolbar/SelectionMenu';

/** Плавающее меню выделения поверх canvas (рамки рисует @ibodr/draw на .dr-canvas-overlays) */
export const SelectionOverlay = track(function SelectionOverlay() {
  return <SelectionMenu />;
});
