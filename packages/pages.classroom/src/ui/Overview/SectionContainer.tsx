import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';

type SectionContainerPropsT = {
  title: string;
  tabLink: string;
  children: ReactNode;
  actions?: ReactNode;
};

export const SectionContainer = ({ title, tabLink, children, actions }: SectionContainerPropsT) => (
  <div className="flex flex-col gap-4">
    <div className={galleryShadowHeaderInsetClass}>
      <SectionHeader title={title} tabLink={tabLink} actions={actions} />
    </div>
    {children}
  </div>
);
