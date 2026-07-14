import { track } from '@ibodr/draw';
import { CommentsOverlay } from '../../../comments';
import { SelectionMenu } from '../toolbar/SelectionMenu';

/** Оверлеи поверх канваса (`InFrontOfTheCanvas`): меню выделения + пины комментариев. */
export const CanvasOverlays = track(function CanvasOverlays() {
  return (
    <>
      <SelectionMenu />
      <CommentsOverlay />
    </>
  );
});
