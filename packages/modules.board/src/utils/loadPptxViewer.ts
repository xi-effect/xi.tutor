/**
 * pptxviewjs при инициализации модуля делает `window.FileReader = FileReaderAsync`,
 * затирая нативный FileReader. После этого `new FileReader().readAsDataURL(...)`
 * падает с "readAsDataURL is not a function" (методы только static у их хелпера).
 *
 * Грузим библиотеку лениво и сразу восстанавливаем нативный FileReader.
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
