import type { RemoteInput, RemoteModifiers, RemoteOrigin } from 'common.platform';

/** robotjs key names by `KeyboardEvent.code`; letters are layout-independent this way. */
const CODE_KEYS: Record<string, string> = {
  Backspace: 'backspace',
  Delete: 'delete',
  Enter: 'enter',
  NumpadEnter: 'enter',
  Tab: 'tab',
  Escape: 'escape',
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Home: 'home',
  End: 'end',
  PageUp: 'pageup',
  PageDown: 'pagedown',
  Space: 'space',
  Insert: 'insert',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backquote: '`',
};

function keyNameForCode(code: string): string | null {
  if (code in CODE_KEYS) return CODE_KEYS[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  if (/^F([1-9]|1[0-2])$/.test(code)) return code.toLowerCase();
  return null;
}

export function remoteOrigin(): RemoteOrigin {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
    navigator.platform;
  return /mac|iphone|ipad/i.test(platform) ? 'mac' : 'other';
}

export function modifiersOf(event: KeyboardEvent | MouseEvent): RemoteModifiers {
  return {
    shift: event.shiftKey,
    ctrl: event.ctrlKey,
    alt: event.altKey,
    meta: event.metaKey,
  };
}

/** A single user-perceived character (surrogate pairs included), not a named key. */
function isCharacter(key: string): boolean {
  return [...key].length === 1 && key !== ' ';
}

/**
 * Typed characters travel as text so any layout (Cyrillic included) arrives
 * as the user sees it; shortcuts and navigation keys travel as key taps.
 */
export function keyboardEventToInput(
  event: KeyboardEvent,
  origin: RemoteOrigin,
): RemoteInput | null {
  if (event.isComposing || event.key === 'Dead') return null;

  const altGraph = event.getModifierState('AltGraph');
  // macOS Option produces characters (ø, «, …); elsewhere Alt is a shortcut modifier.
  const shortcut = event.ctrlKey || event.metaKey || (event.altKey && origin !== 'mac');
  if (isCharacter(event.key) && (!shortcut || altGraph)) {
    return { type: 'text', text: event.key };
  }

  const key = keyNameForCode(event.code);
  if (!key) return null;
  return { type: 'key', key, mods: modifiersOf(event), origin };
}
