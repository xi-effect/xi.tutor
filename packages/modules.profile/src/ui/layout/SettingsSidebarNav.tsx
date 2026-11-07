import { ProfileRoleSwitcher } from './ProfileRoleSwitcher';
import { SettingsNav } from './SettingsNav';

export const SettingsSidebarNav = () => (
  <div className="flex min-h-0 flex-1 flex-col">
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <SettingsNav />
    </div>
    <div className="mb-3 shrink-0 pt-2 group-data-[collapsible=icon]:hidden">
      <ProfileRoleSwitcher />
    </div>
  </div>
);
