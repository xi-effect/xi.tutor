import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '@xipkg/utils';
import { NAV_DRAWER_Z_CLASS } from './constants';

type NavigationDrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content>;

/**
 * Drawer с z-index выше UI доски (z-260).
 * @xipkg/drawer использует z-50 — на странице доски тулбар перекрывает меню.
 */
export function NavigationDrawerContent({
  className,
  children,
  ...props
}: NavigationDrawerContentProps) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className={cn('fixed inset-0 bg-gray-100/40', NAV_DRAWER_Z_CLASS)} />
      <DrawerPrimitive.Content
        className={cn(
          'bg-gray-0 fixed inset-x-0 bottom-0 flex h-auto flex-col gap-4 rounded-t-4xl p-4 pt-0',
          NAV_DRAWER_Z_CLASS,
          className,
        )}
        {...props}
      >
        <div className="bg-gray-20 mx-auto mt-2 h-1 w-[80px] rounded-full" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}
