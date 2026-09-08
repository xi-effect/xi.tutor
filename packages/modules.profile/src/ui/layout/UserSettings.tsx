import React, { useCallback, useEffect, useMemo } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { Modal, ModalContent } from '@xipkg/modal';
import { useCurrentUser } from 'common.services';
import { THEME_CUSTOMIZATION_ENABLED } from 'common.theme';
import { SubscriptionHeaderCta } from 'features.subscription';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { Menu } from './Menu';
import { Content } from './Content';

const SECTION_TITLE_KEYS: Record<string, string> = {
  personalInfo: 'menu.personalInfo',
  subscription: 'menu.subscription',
  personalisation: 'menu.personalisation',
  schedule: 'menu.schedule',
  security: 'menu.security',
  notifications: 'menu.notifications',
  soundAndVideo: 'menu.soundAndVideo',
  effects: 'menu.effects',
  board: 'menu.board',
  report: 'menu.report',
};

export const UserSettings = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 719px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [, setActiveContent] = React.useState<number>(0);
  const [showContent, setShowContent] = React.useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false }) as { profile?: string };

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
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

  useEffect(() => {
    if (isTutor || profileType !== 'subscription') return;

    navigate({
      to: pathname,
      search: { profile: 'personalInfo' },
    });
  }, [isTutor, navigate, pathname, profileType]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      document.body.removeAttribute('data-scroll-locked');
    };
  }, []);

  const handleClose = useCallback(() => {
    setShowContent(false);
    setOpen(false);
    navigate({
      to: pathname,
      search: {},
    });
  }, [navigate, pathname, setOpen]);

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
    [navigate, pathname, setOpen],
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

  const sectionTitle = useMemo(() => {
    const key = SECTION_TITLE_KEYS[activeQuery || 'personalInfo'];
    return key ? t(key) : t('settingsTitle');
  }, [activeQuery, t]);

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
            ? '!flex h-[90vh] max-h-[90vh] max-w-[1132px] flex-col overflow-hidden p-6'
            : '!flex max-h-dvh flex-col overflow-hidden p-6'
        }
        aria-describedby={undefined}
      >
        <div className="bg-background-surface flex min-h-0 w-full flex-1 flex-col gap-6">
          <Header
            settingsTitle={t('settingsTitle')}
            sectionTitle={sectionTitle}
            action={
              (activeQuery || 'personalInfo') === 'subscription' ? <SubscriptionHeaderCta /> : null
            }
            showContent={showContent}
            setShowContent={memoizedSetShowContent}
            handleClose={handleClose}
          />
          <div className="flex min-h-0 flex-1 flex-row gap-8">
            {isMobile ? (
              <div className="bg-background-surface flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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
                <div className="flex h-full min-h-0 w-[220px] shrink-0 flex-col">
                  <Menu
                    setActiveQuery={memoizedSetActiveQuery}
                    setActiveContent={memoizedSetActiveContent}
                    setShowContent={memoizedSetShowContent}
                  />
                </div>
                <div className="bg-background-surface min-h-0 min-w-0 flex-1 overflow-hidden">
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
