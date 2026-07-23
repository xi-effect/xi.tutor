import type { DrBoardBackgroundType, Editor } from '@ibodr/draw';
import * as Y from 'yjs';
import {
  DEFAULT_BOARD_BACKGROUND_COLOR,
  DEFAULT_BOARD_BACKGROUND_TYPE,
  getBoardBackgroundColorValue,
  isBoardBackgroundColorId,
  normalizeBoardBackgroundType,
  type BoardBackgroundColorId,
  type BoardColorAppearance,
} from '../config';

export type BoardBackgroundState = {
  type: DrBoardBackgroundType;
  color: BoardBackgroundColorId;
};

export const DEFAULT_BOARD_BACKGROUND: BoardBackgroundState = {
  type: DEFAULT_BOARD_BACKGROUND_TYPE,
  color: DEFAULT_BOARD_BACKGROUND_COLOR,
};

export function parseBoardBackgroundFromYMap(map: Y.Map<string>): BoardBackgroundState {
  const type = map.get('type');
  const color = map.get('color');

  return {
    type: normalizeBoardBackgroundType(type),
    color: isBoardBackgroundColorId(color) ? color : DEFAULT_BOARD_BACKGROUND.color,
  };
}

export function applyBoardBackgroundToEditor(
  editor: Editor,
  background: BoardBackgroundState,
  appearance: BoardColorAppearance = 'light',
) {
  const type = normalizeBoardBackgroundType(background.type);

  // При backgroundType === 'none' draw показывает DefaultGrid, если isGridMode включён.
  editor.updateInstanceState({
    backgroundType: type,
    isGridMode: type !== 'none',
  });

  const backgroundColor = getBoardBackgroundColorValue(background.color, appearance);

  editor.getContainer().style.setProperty('--dr-color-background', backgroundColor);
}
