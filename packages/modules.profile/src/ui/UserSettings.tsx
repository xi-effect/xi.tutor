import React, { useCallback } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { Header } from './Header';
import { Menu } from './Menu';
import { Content } from './Content';

export const UserSettings = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const isMobile = useMediaQuery('(max-width: 719px)');
  const [activeContent, setActiveContent] = React.useState<number>(0);
  const [showContent, setShowContent] = React.useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });

  const profileType = search.profile || '';

  const [activeQuery, setActiveQuery] = React.useState<string>(profileType);

  const handleClose = useCallback(() => {
    setShowContent(false);
    // Просто удаляем параметр из URL, а модалка закроется автоматически через useEffect
    navigate({
      to: pathname,
      search: {},
    });
  }, [navigate, pathname]);

  // Обработчик для управления открытием/закрытием модалки
  const handleOpenChange = useCallback(
    (openState: boolean) => {
      if (!openState) {
        // Если модалку нужно закрыть, удаляем параметр из URL
        navigate({
          to: pathname,
          search: {},
        });
      }

      setOpen(openState);
    },
    [navigate, pathname],
  );

  const memoizedSetActiveQuery = useCallback((query: React.SetStateAction<string>) => {
    setActiveQuery(query);
  }, []);

  const memoizedSetActiveContent = useCallback((content: React.SetStateAction<number>) => {
    setActiveContent(content);
  }, []);

  const memoizedSetShowContent = useCallback((show: React.SetStateAction<boolean>) => {
    setShowContent(show);
  }, []);

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.body.style.pointerEvents = '';
        }}
        variant="full"
        className="p-4 lg:p-6"
      >
        <ModalTitle className="hidden"> Настройки пользователя </ModalTitle>
        <div className="flex w-full items-center justify-center">
          <div className="flex h-full min-h-full w-full max-w-[1132px] flex-col">
            <Header
              activeItem={activeContent}
              showContent={showContent}
              setShowContent={memoizedSetShowContent}
              handleClose={handleClose}
            />
            <div className="mt-4 flex h-full flex-row gap-8">
              {isMobile ? (
                <div className="flex-1">
                  {showContent ? (
                    <Content activeQuery={activeQuery} />
                  ) : (
                    <Menu
                      setActiveQuery={memoizedSetActiveQuery}
                      setActiveContent={memoizedSetActiveContent}
                      setShowContent={memoizedSetShowContent}
                    />
                  )}
                </div>
              ) : (
                <>
                  <Menu
                    setActiveQuery={memoizedSetActiveQuery}
                    setActiveContent={memoizedSetActiveContent}
                    setShowContent={memoizedSetShowContent}
                  />
                  <Content activeQuery={activeQuery} />
                </>
              )}
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
