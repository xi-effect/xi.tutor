import type { OcrLanguage } from './types';

/**
 * Группы моделей PaddleOCR.js:
 * - PP-OCRv6_small — единая multilingual-модель (zh/en/ja + латиница).
 * - cyrillic_PP-OCRv5 — отдельная rec-модель для русского.
 *
 * Несколько UI-языков не должны порождать отдельные worker/model, если
 * обслуживаются одной группой.
 */
export type PaddleModelGroup = 'multilingual' | 'cyrillic';

export function getPaddleModelGroup(language: OcrLanguage): PaddleModelGroup {
  return language === 'ru' ? 'cyrillic' : 'multilingual';
}

/** Код `lang` для PaddleOCR.create. Маппинг Sovlium → Paddle держим здесь. */
export function getPaddleLangCode(language: OcrLanguage): string {
  switch (language) {
    case 'ru':
      return 'cyrillic';
    case 'ja':
      return 'japan';
    case 'zh':
      return 'ch';
    default:
      return language;
  }
}

export const CYRILLIC_REC_MODEL_NAME = 'cyrillic_PP-OCRv5_mobile_rec';
export const CYRILLIC_REC_MODEL_URL =
  'https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/cyrillic_PP-OCRv5_mobile_rec_onnx_infer.tar';
export const DEFAULT_DET_MODEL_NAME = 'PP-OCRv5_mobile_det';
