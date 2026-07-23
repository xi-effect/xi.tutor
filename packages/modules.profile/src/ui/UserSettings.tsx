import React, { useCallback, useEffect } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { Modal, ModalContent, ModalTitle } from '@xipkg/modal';
import { THEME_CUSTOMIZATION_ENABLED } from 'common.theme';
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
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [activeContent, setActiveContent] = React.useState<number>(0);
  const [showContent, setShowContent] = React.useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });

  const profileType = search.profile || '';

  const [activeQuery, setActiveQuery] = React.useState<string>(profileType);

  useEffect(() => {
    setActiveQuery(profileType);
  }, [profileType]);

  useEffect(() => {
    if (THEME_CUSTOMIZATION_ENABLED || profileType !== 'personalisation') return;

    navigate({
      to: pathname,
      search: { profile: 'personalInfo' },
    });
  }, [navigate, pathname, profileType]);

  const handleClose = useCallback(() => {
    setShowContent(false);
    navigate({
      to: pathname,
      search: {},
    });
  }, [navigate, pathname]);

  const handleOpenChange = useCallback(
    (openState: boolean) => {
      if (!openState) {
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
        variant={isDesktop ? 'default' : 'full'}
        className={
          isDesktop
            ? '!flex h-[90vh] max-h-[90vh] max-w-[1132px] flex-col overflow-hidden p-4 lg:p-6'
            : '!flex max-h-dvh flex-col overflow-hidden p-4 lg:p-6'
        }
        aria-describedby={undefined}
      >
        <ModalTitle className="hidden"> Настройки пользователя </ModalTitle>
        <div className="bg-gray-0 flex min-h-0 w-full flex-1 flex-col">
          <Header
            activeItem={activeContent}
            showContent={showContent}
            setShowContent={memoizedSetShowContent}
            handleClose={handleClose}
          />
          <div className={`flex min-h-0 flex-1 flex-row gap-8 ${isDesktop ? '' : 'mt-4'}`}>
            {isMobile ? (
              <div className="bg-gray-0 min-h-0 min-w-0 flex-1 overflow-hidden">
                {showContent ? (
                  <Content activeQuery={activeQuery} />
                ) : (
                  <div className="h-full min-h-0 overflow-y-auto overscroll-contain pr-4">
                    <Menu
                      setActiveQuery={memoizedSetActiveQuery}
                      setActiveContent={memoizedSetActiveContent}
                      setShowContent={memoizedSetShowContent}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="shrink-0 self-start">
                  <Menu
                    setActiveQuery={memoizedSetActiveQuery}
                    setActiveContent={memoizedSetActiveContent}
                    setShowContent={memoizedSetShowContent}
                  />
                </div>
                <div className="bg-gray-0 min-h-0 min-w-0 flex-1 overflow-hidden">
                  <Content activeQuery={activeQuery} />
                </div>
              </>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
