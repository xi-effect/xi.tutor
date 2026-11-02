import { useEffect } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentUser } from 'common.services';
import { THEME_CUSTOMIZATION_ENABLED } from 'common.theme';
import { SubscriptionHeaderCta } from 'features.subscription';
import { useTranslation } from 'react-i18next';
import { pickSettingsSearch, resolveVisibleSection } from '../../model/settingsSections';
import { Content } from './Content';
import { DesktopAbout } from './DesktopAbout';
import { Header } from './Header';

type SettingsSectionProps = {
  slug: string;
};

export const SettingsSection = ({ slug }: SettingsSectionProps) => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const section = resolveVisibleSection(slug, {
    isTutor: user?.default_layout === 'tutor',
    themeEnabled: THEME_CUSTOMIZATION_ENABLED,
  });

  useEffect(() => {
    if (!user || section.slug === slug) return;

    void navigate({
      to: '/settings/$section',
      params: { section: section.slug },
      search: pickSettingsSearch(search),
      replace: true,
    });
  }, [navigate, search, section.slug, slug, user]);

  if (!user || section.slug !== slug) return null;

  const title = t(section.titleKey);

  return (
    <div className="bg-background-page flex h-full min-h-0 w-full flex-col">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col px-4 py-4 md:px-8 md:py-6">
        <Header
          title={title}
          action={section.id === 'subscription' ? <SubscriptionHeaderCta /> : null}
          onBack={
            isMobile
              ? () => {
                  void navigate({
                    to: '/settings',
                    search: pickSettingsSearch(search),
                  });
                }
              : undefined
          }
        />
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <Content activeQuery={section.id} />
          <div className="pt-8">
            <DesktopAbout />
          </div>
        </div>
      </div>
    </div>
  );
};
