import { DefaultDashStyle, type Editor } from '@ibodr/draw';

type DashValue = (typeof DefaultDashStyle)['defaultValue'];

/** Стиль линии из меню стрелок. Карандаш его не использует. */
let arrowDash: DashValue | null = null;

export function rememberArrowDash(style: string) {
  arrowDash = style as DashValue;
}

export function applyPenDash(editor: Editor) {
  editor.setStyleForNextShapes(DefaultDashStyle, 'draw' as DashValue);
}

export function applyRememberedArrowDash(editor: Editor) {
  if (!arrowDash) return;
  editor.setStyleForNextShapes(DefaultDashStyle, arrowDash);
}
