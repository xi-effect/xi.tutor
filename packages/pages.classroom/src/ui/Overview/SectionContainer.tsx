import { ReactNode } from 'react';
import { SectionHeader } from './SectionHeader';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';

type SectionContainerPropsT = {
  title: string;
  tabLink: string;
  children: ReactNode;
  actions?: ReactNode;
  stepAnchor?: string;
};

export const SectionContainer = ({
  title,
  tabLink,
  children,
  actions,
  stepAnchor,
}: SectionContainerPropsT) => (
  <div className="flex flex-col gap-4" data-first-step={stepAnchor}>
    <div className={galleryShadowHeaderInsetClass}>
      <SectionHeader title={title} tabLink={tabLink} actions={actions} />
    </div>
    {children}
  </div>
);
