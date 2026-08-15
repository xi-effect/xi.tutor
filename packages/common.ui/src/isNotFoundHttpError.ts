/** 404 и 403 для страниц ресурса показываем одинаково — как «не найдено». */
export const isNotFoundHttpError = (error: unknown): boolean => {
  if (error == null || typeof error !== 'object') return false;
  const status = (error as { response?: { status?: number } }).response?.status;
  return status === 404 || status === 403;
};
