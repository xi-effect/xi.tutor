import { screen, shell, systemPreferences } from 'electron';
import { createRequire as createModuleRequire } from 'node:module';
import type {
  RemoteControlStatus,
  RemoteInput,
  RemoteModifiers,
  RemoteMouseButton,
  RemoteOrigin,
} from '../shared/types';
import { asBoolean, asNumber, asRecord, asString } from './ipc/validate';
import { sharedDisplay } from './share-annotations';

/**
 * AnyDesk-like remote control of the shared screen.
 *
 * The call renderer receives input from the participant it granted control to
 * (LiveKit data channel) and forwards it here; `@jitsi/robotjs` injects it
 * into the OS. Coordinates arrive normalized to the shared display.
 */

type Robot = typeof import('@jitsi/robotjs');

const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';

const ACCESSIBILITY_SETTINGS_URL =
  'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility';

/** Browser wheel deltas are ~100 px per notch; Windows expects 120 per notch. */
const WHEEL_SCALE = isWindows ? 1.2 : 1;
const MAX_WHEEL = 2000;
const MAX_TEXT_LENGTH = 32;

const BUTTONS: readonly RemoteMouseButton[] = ['left', 'right', 'middle'];

const NAMED_KEYS = new Set([
  'backspace',
  'delete',
  'enter',
  'tab',
  'escape',
  'up',
  'down',
  'left',
  'right',
  'home',
  'end',
  'pageup',
  'pagedown',
  'space',
  'insert',
  ...Array.from({ length: 12 }, (_, i) => `f${i + 1}`),
]);
const CHAR_KEYS = /^[a-z0-9\-=[\]\\;',./`]$/;

let robot: Robot | null | undefined;
let active = false;
const held = new Set<RemoteMouseButton>();

function loadRobot(): Robot | null {
  if (robot === undefined) {
    try {
      // Native addon: loaded lazily so a missing prebuild only disables remote control.
      robot = createModuleRequire(import.meta.url)('@jitsi/robotjs') as Robot;
      // Defaults sleep 10 ms after every injected event.
      robot.setMouseDelay(0);
      robot.setKeyboardDelay(0);
    } catch (error) {
      console.warn('[xi.electron] remote control input is unavailable', error);
      robot = null;
    }
  }
  return robot;
}

export function remoteControlStatus(prompt = false): RemoteControlStatus {
  const supported = (isMac || isWindows) && loadRobot() !== null;
  const trusted = !isMac || systemPreferences.isTrustedAccessibilityClient(prompt);
  return { supported, trusted };
}

export async function requestRemoteControlAccess(): Promise<RemoteControlStatus> {
  // Prompting also adds the app to the Accessibility list, so the user only has to flip the switch.
  const status = remoteControlStatus(true);
  if (isMac && !status.trusted) await shell.openExternal(ACCESSIBILITY_SETTINGS_URL);
  return status;
}

function releaseAll(): void {
  const r = robot;
  if (!r) {
    held.clear();
    return;
  }
  for (const button of held) {
    try {
      r.mouseToggle('up', button);
    } catch {
      // nothing to release
    }
  }
  held.clear();
}

export function setRemoteControlActive(enabled: boolean): void {
  active = enabled && loadRobot() !== null;
  if (!active) releaseAll();
}

function toScreen(x: number, y: number): { x: number; y: number } {
  const { bounds } = sharedDisplay();
  const point = {
    x: Math.round(bounds.x + x * (bounds.width - 1)),
    y: Math.round(bounds.y + y * (bounds.height - 1)),
  };
  // robotjs takes physical pixels on Windows and points (= DIP) on macOS.
  return isWindows ? screen.dipToScreenPoint(point) : point;
}

function modifierKeys(mods: RemoteModifiers, origin: RemoteOrigin): string[] {
  const keys = new Set<string>();
  if (mods.shift) keys.add('shift');
  if (mods.alt) keys.add('alt');
  // Cmd+C from a Mac must copy on Windows and vice versa.
  const shortcut = origin === 'mac' ? mods.meta : mods.ctrl;
  const other = origin === 'mac' ? mods.ctrl : mods.meta;
  if (shortcut) keys.add(isMac ? 'command' : 'control');
  if (other) keys.add(isMac || origin === 'mac' ? 'control' : 'command');
  return [...keys];
}

function toggleModifiers(r: Robot, keys: string[], down: boolean): void {
  for (const key of keys) r.keyToggle(key, down ? 'down' : 'up');
}

function moveTo(r: Robot, point: { x: number; y: number }): void {
  // macOS apps only see a drag in "dragged" events, not in plain moves.
  if (held.has('left')) r.dragMouse(point.x, point.y);
  else r.moveMouse(point.x, point.y);
}

function inject(r: Robot, input: RemoteInput): void {
  switch (input.type) {
    case 'move':
      moveTo(r, toScreen(input.x, input.y));
      return;
    case 'button': {
      moveTo(r, toScreen(input.x, input.y));
      // macOS needs the click count on the event itself; robotjs only sets it in its double click.
      const macDouble = isMac && input.button === 'left' && input.clicks >= 2;
      if (input.down) {
        if (macDouble) return;
        const keys = modifierKeys(input.mods, input.origin);
        toggleModifiers(r, keys, true);
        r.mouseToggle('down', input.button);
        held.add(input.button);
        toggleModifiers(r, keys, false);
        return;
      }
      if (macDouble && !held.has(input.button)) {
        r.mouseClick(input.button, true);
        return;
      }
      r.mouseToggle('up', input.button);
      held.delete(input.button);
      return;
    }
    case 'wheel':
      r.scrollMouse(Math.round(-input.dx * WHEEL_SCALE), Math.round(-input.dy * WHEEL_SCALE));
      return;
    case 'text':
      r.typeString(input.text);
      return;
    case 'key':
      r.keyTap(input.key, modifierKeys(input.mods, input.origin));
      return;
  }
}

export function injectRemoteInput(input: RemoteInput): void {
  if (!active) return;
  const r = loadRobot();
  if (!r) return;
  try {
    inject(r, input);
  } catch (error) {
    console.warn('[xi.electron] remote input failed', input.type, error);
  }
}

function unit(value: unknown): number | null {
  const n = asNumber(value, Number.NaN);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : null;
}

function parseMods(value: unknown): RemoteModifiers {
  const record = asRecord(value);
  return {
    shift: asBoolean(record.shift),
    ctrl: asBoolean(record.ctrl),
    alt: asBoolean(record.alt),
    meta: asBoolean(record.meta),
  };
}

function parseOrigin(value: unknown): RemoteOrigin {
  return value === 'mac' ? 'mac' : 'other';
}

function clampWheel(value: unknown): number {
  return Math.min(MAX_WHEEL, Math.max(-MAX_WHEEL, asNumber(value)));
}

export function parseRemoteInput(value: unknown): RemoteInput | null {
  const record = asRecord(value);
  switch (record.type) {
    case 'move': {
      const x = unit(record.x);
      const y = unit(record.y);
      return x === null || y === null ? null : { type: 'move', x, y };
    }
    case 'button': {
      const x = unit(record.x);
      const y = unit(record.y);
      const button = BUTTONS.find((item) => item === record.button);
      if (x === null || y === null || !button) return null;
      return {
        type: 'button',
        x,
        y,
        button,
        down: asBoolean(record.down),
        clicks: Math.max(1, Math.min(3, Math.round(asNumber(record.clicks, 1)))),
        mods: parseMods(record.mods),
        origin: parseOrigin(record.origin),
      };
    }
    case 'wheel': {
      const dx = clampWheel(record.dx);
      const dy = clampWheel(record.dy);
      return dx === 0 && dy === 0 ? null : { type: 'wheel', dx, dy };
    }
    case 'text': {
      const text = asString(record.text);
      return text && text.length <= MAX_TEXT_LENGTH ? { type: 'text', text } : null;
    }
    case 'key': {
      const key = asString(record.key);
      if (!NAMED_KEYS.has(key) && !CHAR_KEYS.test(key)) return null;
      return { type: 'key', key, mods: parseMods(record.mods), origin: parseOrigin(record.origin) };
    }
    default:
      return null;
  }
}
