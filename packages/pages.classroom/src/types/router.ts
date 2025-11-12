// Расширяем параметры поиска для всех маршрутов
export interface SearchParams {
  redirect?: string;
  profile?: string;
  carouselType?: 'horizontal' | 'vertical';
  tab?: string;
  call?: string;
  classroom?: string;
}
