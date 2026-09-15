import 'mathlive';
import type { MathfieldElement, VirtualKeyboardInterface } from 'mathlive';

type MathKeyboard = VirtualKeyboardInterface & EventTarget;
const KEYBOARD_HEIGHT_VAR = '--math-vk-height';

export function getMathVirtualKeyboard(): MathKeyboard | null {
  if (typeof window === 'undefined') return null;
  return window.mathVirtualKeyboard ?? null;
}

function setKeyboardHeightVar(height: number): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(KEYBOARD_HEIGHT_VAR, `${Math.max(0, height)}px`);
}

export function configureMathField(field: MathfieldElement): void {
  field.readOnly = false;
  field.smartFence = true;
  field.smartMode = true;
  field.letterShapeStyle = 'tex';
  field.inlineShortcutTimeout = 750;
  field.inlineShortcuts = {
    ...field.inlineShortcuts,
    sqrt: '\\sqrt{#0}',
    infty: '\\infty',
    '<=': '\\le',
    '>=': '\\ge',
    '!=': '\\ne',
    '+-': '\\pm',
  };
  // Только по нашей кнопке: auto после hide() снова открывает клавиатуру на фокусе.
  field.mathVirtualKeyboardPolicy = 'manual';

  const keyboard = getMathVirtualKeyboard();
  if (!keyboard) return;
  try {
    keyboard.layouts = [
      'numeric',
      'alphabetic',
      {
        label: 'Операции',
        rows: [
          ['+', '-', '\\times', '\\div', '\\cdot', '=', '\\ne', '\\le', '\\ge', '\\approx'],
          [
            '\\pm',
            '\\infty',
            '<',
            '>',
            '\\angle',
            '\\perp',
            '\\parallel',
            '^{\\circ}',
            '[hide-keyboard]',
          ],
        ],
      },
      {
        label: 'Формулы',
        rows: [
          ['\\frac{#@}{#?}', '#@^{#?}', '#@_{#?}', '\\sqrt{#0}', '\\sqrt[#?]{#0}'],
          [
            '\\sum_{#?}^{#?}',
            '\\prod_{#?}^{#?}',
            '\\int_{#?}^{#?}',
            '\\lim_{#?}',
            '[hide-keyboard]',
          ],
        ],
      },
      'greek',
    ];
  } catch {
    // Конфигурация layouts не должна блокировать базовый ввод MathLive.
  }
}

export function hideMathVirtualKeyboard(): void {
  const keyboard = getMathVirtualKeyboard();
  if (!keyboard) return;
  try {
    keyboard.executeCommand?.('hideVirtualKeyboard');
  } catch {
    // Команда может быть недоступна до первой отрисовки.
  }
  keyboard.hide?.({ animate: false });
  keyboard.visible = false;
  setKeyboardHeightVar(0);
}

export function toggleMathVirtualKeyboard(): boolean {
  const keyboard = getMathVirtualKeyboard();
  if (!keyboard) return false;
  if (keyboard.visible) {
    hideMathVirtualKeyboard();
    return false;
  }
  keyboard.show?.({ animate: true });
  keyboard.visible = true;
  return true;
}

export function subscribeMathVirtualKeyboard(
  onChange: (visible: boolean, height: number) => void,
): () => void {
  const keyboard = getMathVirtualKeyboard();
  if (!keyboard) return () => {};

  const emit = () => {
    const visible = !!keyboard.visible;
    const height = visible ? Math.round(keyboard.boundingRect?.height ?? 0) : 0;
    setKeyboardHeightVar(height);
    onChange(visible, height);
  };

  keyboard.addEventListener('virtual-keyboard-toggle', emit);
  keyboard.addEventListener('geometrychange', emit);
  emit();
  return () => {
    keyboard.removeEventListener('virtual-keyboard-toggle', emit);
    keyboard.removeEventListener('geometrychange', emit);
  };
}
