import fs from 'node:fs';
import { createRequire } from 'node:module';
import type { Plugin } from 'vite';

const require = createRequire(import.meta.url);

const CLIPPER_VIRTUAL = '\0paddleocr-clipper-lib';
const OPENCV_VIRTUAL = '\0paddleocr-opencv-js';

function wrapCjsIife(filePath: string): string {
  const source = fs.readFileSync(filePath, 'utf8');
  return `
const module = { exports: {} };
const exports = module.exports;
${source}
export default module.exports;
`;
}

/**
 * clipper-lib и @techstark/opencv-js — UMD/IIFE: `module.exports` внутри функции,
 * Vite не видит CJS и отдаёт файл без `export default`.
 * PaddleOCR.js делает `import ClipperLib from 'clipper-lib'`.
 */
export function paddleOcrCjsInteropPlugin(): Plugin {
  const clipperPath = require.resolve('clipper-lib/clipper.js');
  const opencvPath = require.resolve('@techstark/opencv-js');

  return {
    name: 'paddleocr-cjs-interop',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'clipper-lib' || source === 'clipper-lib/clipper.js') {
        return CLIPPER_VIRTUAL;
      }
      if (source === '@techstark/opencv-js') {
        return OPENCV_VIRTUAL;
      }
      return null;
    },
    load(id) {
      if (id === CLIPPER_VIRTUAL) return wrapCjsIife(clipperPath);
      if (id === OPENCV_VIRTUAL) return wrapCjsIife(opencvPath);
      return null;
    },
  };
}
