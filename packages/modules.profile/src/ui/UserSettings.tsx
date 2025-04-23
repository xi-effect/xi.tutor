import React, { useEffect } from 'react';
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

  // Извлекаем информацию о профиле из параметра iid
  const profileParam = search.iid || '';
  const isProfileOpen = profileParam.startsWith('profile:');
  const profileType = isProfileOpen ? profileParam.split(':')[1] : '';

  // Управляем состоянием модалки через URL
  useEffect(() => {
    // Если в URL есть profile, модалка должна быть открыта
    if (isProfileOpen && !open) {
      setOpen(true);
    }

    // Если в URL нет profile, модалка должна быть закрыта
    if (!isProfileOpen && open) {
      setOpen(false);
    }

    // Устанавливаем активный пункт меню в соответствии с параметром profile
    if (isProfileOpen && profileType) {
      const profileIndex = options.findIndex((item) => item.query === profileType);
      if (profileIndex !== -1) {
        setActiveContent(profileIndex);
        setActiveQuery(profileType);
      }
    }
  }, [profileParam, open, setOpen, isProfileOpen, profileType]);

  const handleClose = () => {
    setShowContent(false);
    // Просто удаляем параметр из URL, а модалка закроется автоматически через useEffect
    navigate({
      to: pathname,
      search: {},
    });
  };

  // Обработчик для управления открытием/закрытием модалки
  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      // Если модалку нужно закрыть, удаляем параметр из URL
      navigate({
        to: pathname,
        search: {},
      });
    }
    // Мы не устанавливаем setOpen(openState) напрямую,
    // так как это будет сделано через useEffect при изменении URL
  };

  const [activeQuery, setActiveQuery] = React.useState<string>('home');

  // Список опций меню для поиска индекса по query
  const options = [
    { query: 'home' },
    { query: 'personalInfo' },
    { query: 'personalisation' },
    { query: 'security' },
  ];

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
              setShowContent={setShowContent}
              handleClose={handleClose}
            />
            <div className="mt-4 flex h-full flex-row">
              {isMobile ? (
                <div className="flex-1">
                  {showContent ? (
                    <Content activeQuery={activeQuery} />
                  ) : (
                    <Menu
                      setActiveQuery={setActiveQuery}
                      setActiveContent={setActiveContent}
                      setShowContent={setShowContent}
                    />
                  )}
                </div>
              ) : (
                <>
                  <Menu
                    setActiveQuery={setActiveQuery}
                    setActiveContent={setActiveContent}
                    setShowContent={setShowContent}
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
