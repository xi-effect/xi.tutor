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
import { cn } from '@xipkg/utils';
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

const iconClassName = (active: boolean) =>
  cn('size-5 shrink-0', active ? 'fill-icon-brand' : 'fill-icon-secondary');

const SectionIcon = ({ id, active }: { id: SettingsSectionId; active: boolean }) => {
  const className = iconClassName(active);

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
    <nav className="flex flex-col gap-0.5" aria-label={t('settingsTitle')}>
      {sections.map((section) => {
        const isActive = active?.id === section.id;

        return (
          <button
            key={section.slug}
            type="button"
            aria-current={isActive ? 'page' : undefined}
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
            className={cn(
              'flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2 text-left transition-colors',
              'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
              isActive
                ? 'bg-selection-background text-text-link'
                : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary',
            )}
          >
            <SectionIcon id={section.id} active={isActive} />
            <span className="truncate text-sm group-data-[collapsible=icon]:hidden">
              {t(section.titleKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
