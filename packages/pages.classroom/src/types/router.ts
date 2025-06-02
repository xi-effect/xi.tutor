// Расширяем параметры поиска для всех маршрутов
export interface SearchParams {
  redirect?: string;
  iid?: string;
  community?: string;
  carouselType?: 'horizontal' | 'vertical';
  tab?: string;
}
