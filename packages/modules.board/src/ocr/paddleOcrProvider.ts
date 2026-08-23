import {
  CYRILLIC_REC_MODEL_NAME,
  CYRILLIC_REC_MODEL_URL,
  DEFAULT_DET_MODEL_NAME,
  getPaddleLangCode,
  getPaddleModelGroup,
  type PaddleModelGroup,
} from './languageMap';
import { textFromOcrItems } from './textFromOcrItems';
import { OcrNoTextError, type OcrInput, type OcrLanguage, type OcrProvider } from './types';

type PaddleOcrSdk = typeof import('@paddleocr/paddleocr-js');
type PaddleOcrEngine = Awaited<ReturnType<PaddleOcrSdk['PaddleOCR']['create']>>;
type PaddleCreateOptions = Parameters<PaddleOcrSdk['PaddleOCR']['create']>[0];

let sdkPromise: Promise<PaddleOcrSdk> | null = null;
const engines = new Map<PaddleModelGroup, Promise<PaddleOcrEngine>>();

function loadPaddleOcrSdk(): Promise<PaddleOcrSdk> {
  if (!sdkPromise) {
    sdkPromise = import('@paddleocr/paddleocr-js').catch((error) => {
      sdkPromise = null;
      throw error;
    });
  }
  return sdkPromise;
}

const ORT_OPTIONS: NonNullable<PaddleCreateOptions>['ortOptions'] = {
  backend: 'wasm',
  wasmPaths: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/',
  numThreads: 1,
  simd: true,
};

function createOptionsForGroup(
  group: PaddleModelGroup,
  language: OcrLanguage,
): NonNullable<PaddleCreateOptions> {
  if (group === 'cyrillic') {
    return {
      textDetectionModelName: DEFAULT_DET_MODEL_NAME,
      textRecognitionModelName: CYRILLIC_REC_MODEL_NAME,
      textRecognitionModelAsset: { url: CYRILLIC_REC_MODEL_URL },
      ortOptions: ORT_OPTIONS,
    };
  }

  return {
    lang: getPaddleLangCode(language),
    ocrVersion: 'PP-OCRv6',
    ortOptions: ORT_OPTIONS,
  };
}

async function createEngine(
  sdk: PaddleOcrSdk,
  options: NonNullable<PaddleCreateOptions>,
): Promise<PaddleOcrEngine> {
  try {
    return await sdk.PaddleOCR.create({ ...options, worker: true });
  } catch (workerError) {
    console.warn('[ocr] worker init failed, falling back to main thread', workerError);
    return sdk.PaddleOCR.create({ ...options, worker: false });
  }
}

function getEngine(group: PaddleModelGroup, language: OcrLanguage): Promise<PaddleOcrEngine> {
  const existing = engines.get(group);
  if (existing) return existing;

  const created = (async () => {
    const sdk = await loadPaddleOcrSdk();
    return createEngine(sdk, createOptionsForGroup(group, language));
  })().catch((error) => {
    engines.delete(group);
    throw error;
  });

  engines.set(group, created);
  return created;
}

export async function disposePaddleOcrEngines(): Promise<void> {
  const pending = [...engines.values()];
  engines.clear();
  await Promise.allSettled(
    pending.map(async (enginePromise) => {
      const engine = await enginePromise;
      await engine.dispose();
    }),
  );
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    void disposePaddleOcrEngines();
  });
}

export const paddleOcrProvider: OcrProvider = {
  async recognizeImageText(input: OcrInput, options: { language: OcrLanguage }) {
    const group = getPaddleModelGroup(options.language);
    const engine = await getEngine(group, options.language);
    const [result] = await engine.predict(input);
    const recognized = textFromOcrItems(result?.items);

    if (!recognized.text) {
      throw new OcrNoTextError();
    }

    return recognized;
  },
};
