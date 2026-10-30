import { describe, expect, it } from 'vitest';
import {
  BOARD_CHAT_LEFT_EXTRA_PX,
  BOARD_CHROME_EDGE_PX,
  BOARD_CHROME_TOP_PX,
  BOARD_TOOLBAR_CLEARANCE_PX,
  BOARD_ZOOM_CLEARANCE_PX,
  boardChatTop,
  boardToolbarPopupSide,
  compactChromeOverrides,
  isVerticalToolbarDock,
  normalizeBoardToolbarDock,
  resolveBoardChrome,
  resolveEffectiveToolbarDock,
} from '../boardToolbarDock';

describe('boardToolbarDock', () => {
  it('оставляет неизвестное положение снизу', () => {
    expect(normalizeBoardToolbarDock('sideways')).toBe('bottom');
    expect(normalizeBoardToolbarDock('left')).toBe('left');
  });

  it('на узком экране всегда прижимает панель снизу', () => {
    expect(resolveEffectiveToolbarDock('left', false)).toBe('bottom');
    expect(resolveEffectiveToolbarDock('top', true)).toBe('top');
  });

  it('снизу оставляет прежний отступ звонка 72px', () => {
    const layout = resolveBoardChrome({ dock: 'bottom', toolbarVisible: true, wide: true });
    expect(layout.insets).toEqual({
      top: BOARD_CHROME_TOP_PX,
      right: BOARD_CHROME_EDGE_PX,
      bottom: BOARD_TOOLBAR_CLEARANCE_PX,
      left: BOARD_CHROME_EDGE_PX,
    });
    expect(layout.mirrored).toBe(false);
    expect(layout.headerOffset).toBe(BOARD_CHROME_EDGE_PX);
    expect(layout.zoomRight).toBe(BOARD_CHROME_EDGE_PX);
  });

  it('слева освобождает низ до запаса зума и резервирует левый край', () => {
    const layout = resolveBoardChrome({ dock: 'left', toolbarVisible: true, wide: true });
    expect(layout.insets.left).toBe(BOARD_TOOLBAR_CLEARANCE_PX);
    expect(layout.insets.bottom).toBe(BOARD_ZOOM_CLEARANCE_PX);
    expect(layout.insets.top).toBe(BOARD_CHROME_TOP_PX);
    expect(layout.zoomRight).toBe(BOARD_CHROME_EDGE_PX);
  });

  it('сверху зеркалит хром: панель и зум наверху, шапка снизу', () => {
    const layout = resolveBoardChrome({ dock: 'top', toolbarVisible: true, wide: true });
    expect(layout.mirrored).toBe(true);
    expect(layout.insets.top).toBe(BOARD_TOOLBAR_CLEARANCE_PX);
    expect(layout.insets.bottom).toBe(BOARD_CHROME_TOP_PX);
    expect(layout.headerOffset).toBe(BOARD_CHROME_EDGE_PX);
    expect(layout.toastBottom).toBe(BOARD_CHROME_TOP_PX);
  });

  it('справа сдвигает зум и тосты вместе с панелью', () => {
    const layout = resolveBoardChrome({ dock: 'right', toolbarVisible: true, wide: true });
    expect(layout.insets.right).toBe(BOARD_TOOLBAR_CLEARANCE_PX);
    expect(layout.zoomRight).toBe(BOARD_TOOLBAR_CLEARANCE_PX);
    expect(layout.toastRight).toBe(BOARD_TOOLBAR_CLEARANCE_PX);
  });

  it('без тулбара не резервирует край панели', () => {
    const layout = resolveBoardChrome({ dock: 'left', toolbarVisible: false, wide: true });
    expect(layout.dock).toBe('bottom');
    expect(layout.insets.left).toBe(BOARD_CHROME_EDGE_PX);
    expect(layout.insets.bottom).toBe(BOARD_ZOOM_CLEARANCE_PX);
    expect(layout.mirrored).toBe(false);
    expect(layout.headerOffset).toBe(BOARD_CHROME_EDGE_PX);
  });

  it('открывает меню в сторону от боковой панели', () => {
    expect(isVerticalToolbarDock('left')).toBe(true);
    expect(isVerticalToolbarDock('right')).toBe(true);
    expect(isVerticalToolbarDock('bottom')).toBe(false);
    expect(boardToolbarPopupSide('left')).toBe('right');
    expect(boardToolbarPopupSide('right')).toBe('left');
    expect(boardToolbarPopupSide('top')).toBe('bottom');
    expect(boardToolbarPopupSide('bottom')).toBe('top');
  });

  it('сдвигает чат и углы звонка по классам текущего CompactView', () => {
    const insets = resolveBoardChrome({
      dock: 'left',
      toolbarVisible: true,
      wide: true,
    }).insets;

    expect(
      compactChromeOverrides('absolute z-100 bottom-[72px] left-4 transition-all', insets),
    ).toEqual({
      left: `${insets.left}px`,
      bottom: `${insets.bottom}px`,
    });

    expect(compactChromeOverrides('fixed z-100 top-32 bottom-[72px] right-4', insets)).toEqual({
      top: `${boardChatTop(insets)}px`,
      right: `${insets.right}px`,
      bottom: `${insets.bottom}px`,
    });

    expect(compactChromeOverrides('fixed z-100 top-32 bottom-[72px] left-22', insets)?.left).toBe(
      `${insets.left + BOARD_CHAT_LEFT_EXTRA_PX}px`,
    );

    expect(compactChromeOverrides('absolute z-40 left-4 bottom-4', insets)).toBeNull();
  });
});
