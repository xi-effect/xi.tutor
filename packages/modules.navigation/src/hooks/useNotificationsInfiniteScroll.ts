import { useEffect } from 'react';

export const useNotificationsInfiniteScroll = ({
  scrollAreaRef,
  hasMore,
  isFetchingNextPage,
  loadMore,
}: {
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  isFetchingNextPage?: boolean;
  loadMore: () => void;
}) => {
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollAreaRef.current;
      if (!el) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (isFetchingNextPage || !hasMore) {
        return;
      }

      // Загружаем следующую страницу, когда до конца осталось меньше 100px
      if (distanceToBottom < 100) {
        loadMore();
      }
    };

    let currentElement: HTMLDivElement | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let observer: MutationObserver | null = null;

    const attachScrollListener = () => {
      const el = scrollAreaRef.current;
      if (!el) {
        return false;
      }

      currentElement = el;
      el.addEventListener('scroll', handleScroll);

      // Также проверяем сразу, может быть уже нужно загрузить
      handleScroll();

      return true;
    };

    if (!attachScrollListener()) {
      let attempts = 0;
      const maxAttempts = 10;
      intervalId = setInterval(() => {
        attempts++;
        if (attachScrollListener() || attempts >= maxAttempts) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      }, 100);

      observer = new MutationObserver(() => {
        if (attachScrollListener()) {
          if (observer) {
            observer.disconnect();
            observer = null;
          }
        }
      });

      // DropdownMenuContent рендерится через портал
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (observer) {
        observer.disconnect();
      }
      if (currentElement) {
        currentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, isFetchingNextPage, loadMore, scrollAreaRef]);
};
