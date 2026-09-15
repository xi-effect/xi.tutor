import { PRODUCT_ANALYTICS_EVENTS, trackProductEvent } from 'common.utils';

export type MathTelemetryEvent =
  | 'math_element_created'
  | 'math_element_edited'
  | 'math_toolbar_used'
  | 'math_latex_mode_opened'
  | 'math_virtual_keyboard_opened';

/** Содержимое формулы намеренно не является аргументом telemetry. */
export function trackMathEvent(event: MathTelemetryEvent, action?: string): void {
  const name = {
    math_element_created: PRODUCT_ANALYTICS_EVENTS.MATH_ELEMENT_CREATED,
    math_element_edited: PRODUCT_ANALYTICS_EVENTS.MATH_ELEMENT_EDITED,
    math_toolbar_used: PRODUCT_ANALYTICS_EVENTS.MATH_TOOLBAR_USED,
    math_latex_mode_opened: PRODUCT_ANALYTICS_EVENTS.MATH_LATEX_MODE_OPENED,
    math_virtual_keyboard_opened: PRODUCT_ANALYTICS_EVENTS.MATH_VIRTUAL_KEYBOARD_OPENED,
  }[event];
  trackProductEvent(name, action ? { action } : {});
}
