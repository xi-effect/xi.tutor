import { track } from '@ibodr/draw';
import { CommentsOverlay } from '../../../comments';
import { SelectionMenu } from '../toolbar/SelectionMenu';
import { LinkHoverPreview } from './LinkHoverPreview';

/** Оверлеи поверх канваса (`InFrontOfTheCanvas`): меню выделения + пины комментариев + hover-preview ссылок. */
export const CanvasOverlays = track(function CanvasOverlays() {
  return (
    <>
      <SelectionMenu />
      <CommentsOverlay />
      <LinkHoverPreview />
    </>
  );
});
