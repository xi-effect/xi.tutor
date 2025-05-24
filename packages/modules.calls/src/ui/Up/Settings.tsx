import * as React from 'react';

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@xipkg/sheet';
import { Close } from '@xipkg/icons';

type SettingsPropsT = {
  children: React.ReactNode;
};

export const Settings = ({ children }: SettingsPropsT) => (
  <Sheet>
    <SheetTrigger className="ml-2" asChild>
      {children}
    </SheetTrigger>
    <SheetContent className="bg-gray-0 p-4">
      <SheetHeader className="flex h-10 flex-row items-center justify-between space-y-0">
        <SheetTitle className="text-gray-100">Настройки</SheetTitle>
        <SheetClose className="mt-0 bg-transparent pt-0">
          <Close className="fill-gray-100" />
        </SheetClose>
      </SheetHeader>
    </SheetContent>
  </Sheet>
);
