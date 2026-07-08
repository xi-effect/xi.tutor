import type { DrBoardBackgroundType, Editor } from '@ibodr/draw';
import * as Y from 'yjs';
import {
  BOARD_BACKGROUND_COLOR_VALUES,
  DEFAULT_BOARD_BACKGROUND_COLOR,
  DEFAULT_BOARD_BACKGROUND_TYPE,
  isBoardBackgroundColorId,
  normalizeBoardBackgroundType,
  type BoardBackgroundColorId,
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

export function applyBoardBackgroundToEditor(editor: Editor, background: BoardBackgroundState) {
  editor.updateInstanceState({
    backgroundType: normalizeBoardBackgroundType(background.type),
  });
  editor
    .getContainer()
    .style.setProperty('--dr-color-background', BOARD_BACKGROUND_COLOR_VALUES[background.color]);
}
