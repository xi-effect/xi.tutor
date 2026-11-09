import type { ReactNode } from 'react';

export const settingsPageClass = 'flex w-full flex-col gap-10';

export const settingsSectionTitleClass = 'text-text-primary text-lg leading-6 font-medium';

export const settingsRowTitleClass = 'text-text-primary text-base leading-6 font-medium';

type SettingsGroupProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const SettingsGroup = ({ title, description, children }: SettingsGroupProps) => (
  <section className="border-border-strong flex flex-col gap-4 rounded-2xl border p-4 md:p-5">
    <div className="flex flex-col gap-1">
      <h2 className={settingsSectionTitleClass}>{title}</h2>
      {description ? <p className="text-text-secondary text-sm leading-5">{description}</p> : null}
    </div>
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);
