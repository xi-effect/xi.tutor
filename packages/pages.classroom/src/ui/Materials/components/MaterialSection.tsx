import type { ReactNode } from 'react';
import { MaterialHeader } from './MaterialHeader';
import { galleryShadowHeaderInsetClass } from '../../galleryShadowClass';

type MaterialsHorizontalSectionPropsT = {
  children: ReactNode;
  headerTitle: string;
};

export const MaterialSection = ({ headerTitle, children }: MaterialsHorizontalSectionPropsT) => {
  return (
    <div className="flex flex-col gap-4">
      <div className={galleryShadowHeaderInsetClass}>
        <MaterialHeader title={headerTitle} />
      </div>
      {children}
    </div>
  );
};
