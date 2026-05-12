import { useRef } from 'react';
import { useInfiniteQuery } from '../../../hooks';
import { CardsGrid } from './CardsGrid';

export const CardsGridTutor = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Используем бесконечный запрос с реальным API для репетитора
  const { items, isLoading, isError, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery(parentRef);

  return (
    <CardsGrid
      items={items}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      parentRef={parentRef}
      emptyText="Здесь будут ваши ученики и группы"
      inviteText="Пригласите кого-нибудь"
      withHelpLink
    />
  );
};
