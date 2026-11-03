import {
  Account,
  Calendar,
  File,
  Flag,
  Key,
  Music,
  Notification,
  Palette,
  SoundOn,
  Star,
  WhiteBoard,
} from '@xipkg/icons';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@xipkg/sidebar';
import { useLocation, useNavigate, useSearch } from '@tanstack/react-router';
import { useCurrentUser } from 'common.services';
import { useSubscriptionUiStore } from 'common.subscription';
import { THEME_CUSTOMIZATION_ENABLED } from 'common.theme';
import { useTranslation } from 'react-i18next';
import {
  pickSettingsSearch,
  settingsSectionFromPath,
  visibleSettingsSections,
  type SettingsSectionId,
} from '../../model/settingsSections';

const SectionIcon = ({ id }: { id: SettingsSectionId }) => {
  const className = 'text-text-muted h-6 w-6';

  switch (id) {
    case 'personalInfo':
      return <Account className={className} />;
    case 'subscription':
      return <Star className={className} />;
    case 'personalisation':
      return <Palette className={className} />;
    case 'schedule':
      return <Calendar className={className} />;
    case 'security':
      return <Key className={className} />;
    case 'notifications':
      return <Notification className={className} />;
    case 'soundAndVideo':
      return <SoundOn className={className} />;
    case 'effects':
      return <Music className={className} />;
    case 'tags':
      return <Flag className={className} />;
    case 'board':
      return <WhiteBoard className={className} />;
    case 'report':
      return <File className={className} />;
    default:
      return null;
  }
};

export const SettingsNav = () => {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const search = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const active = settingsSectionFromPath(pathname);
  const sections = visibleSettingsSections({
    isTutor: Boolean(isTutor),
    themeEnabled: THEME_CUSTOMIZATION_ENABLED,
  });

  return (
    <SidebarMenu aria-label={t('settingsTitle')}>
      {sections.map((section) => {
        const isActive = active?.id === section.id;

        return (
          <SidebarMenuItem key={section.slug} className="cursor-pointer">
            <SidebarMenuButton
              isActive={isActive}
              className="group gap-5 rounded-lg!"
              data-umami-event={`settings-open-${section.slug}`}
              onClick={() => {
                if (section.id === 'subscription') {
                  useSubscriptionUiStore.getState().setAnalyticsSource('settings');
                  useSubscriptionUiStore.getState().openOverview();
                }

                void navigate({
                  to: '/settings/$section',
                  params: { section: section.slug },
                  search: pickSettingsSearch(search),
                });
              }}
            >
              <SectionIcon id={section.id} />
              <span className="text-s-base group-data-[active=true]:font-medium">
                {t(section.titleKey)}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};
