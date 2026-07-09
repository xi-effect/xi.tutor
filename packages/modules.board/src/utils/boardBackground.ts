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
  editor.updateInstanceState({
    backgroundType: normalizeBoardBackgroundType(background.type),
  });
  editor
    .getContainer()
    .style.setProperty(
      '--dr-color-background',
      getBoardBackgroundColorValue(background.color, appearance),
    );
}
