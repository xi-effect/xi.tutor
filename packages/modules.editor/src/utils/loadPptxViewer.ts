/**
 * pptxviewjs при инициализации модуля затирает нативный FileReader.
 * Грузим библиотеку лениво и сразу восстанавливаем его.
 */
let loadPromise: Promise<typeof import('pptxviewjs')> | null = null;

export function loadPptxViewer(): Promise<typeof import('pptxviewjs')> {
  if (!loadPromise) {
    const NativeFileReader = window.FileReader;
    loadPromise = import('pptxviewjs')
      .then((mod) => {
        window.FileReader = NativeFileReader;
        return mod;
      })
      .catch((err) => {
        window.FileReader = NativeFileReader;
        loadPromise = null;
        throw err;
      });
  }
  return loadPromise;
}
