import { track } from '@ibodr/draw';
import { CommentsOverlay } from '../../../comments';
import { SelectionMenu } from '../toolbar/SelectionMenu';
import { ActivitySideMenu } from '../../../activities/ui/ActivitySideMenu';
import { LinkHoverPreview } from '../../../shapes/text';
import { DiceRerollHint } from '../dice/DiceRerollHint';
import { PolygonDraftOverlay } from '../../../shapes/polygon/PolygonDraftOverlay';

/** Оверлеи поверх канваса (`InFrontOfTheCanvas`): меню выделения + пины комментариев + hover-preview ссылок. */
export const CanvasOverlays = track(function CanvasOverlays() {
  return (
    <>
      <SelectionMenu />
      <ActivitySideMenu />
      <CommentsOverlay />
      <LinkHoverPreview />
      <DiceRerollHint />
      <PolygonDraftOverlay />
    </>
  );
});
