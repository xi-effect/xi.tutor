export const OCR_LANGUAGES = ['ru', 'en', 'de', 'fr', 'es', 'it', 'ja', 'zh'] as const;

export type OcrLanguage = (typeof OCR_LANGUAGES)[number];

export type OcrLanguageChoice = 'auto' | OcrLanguage;

export type OcrInput = Blob | File | ImageBitmap | ImageData | HTMLCanvasElement;

export type OcrRecognizeResult = {
  text: string;
  confidence?: number;
};

export interface OcrProvider {
  recognizeImageText(
    input: OcrInput,
    options: {
      language: OcrLanguage;
    },
  ): Promise<OcrRecognizeResult>;
}

export class OcrNoTextError extends Error {
  constructor(message = 'No text recognized') {
    super(message);
    this.name = 'OcrNoTextError';
  }
}

export class OcrImageLoadError extends Error {
  constructor(message = 'Failed to load image pixels') {
    super(message);
    this.name = 'OcrImageLoadError';
  }
}
