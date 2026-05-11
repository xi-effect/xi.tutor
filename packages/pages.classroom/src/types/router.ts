// Расширяем параметры поиска для всех маршрутов
export interface SearchParams {
  redirect?: string;
  profile?: string;
  carouselType?: 'horizontal' | 'vertical';
  tab?: string;
  call?: string;
  classroom?: string;
  focused_at?: string;
  event_instance_id?: string;
}
