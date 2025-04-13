import { useMediaQuery } from '@xipkg/utils';
import { Desktop, Header, Mobile } from './components';
import { SidebarProvider } from '@xipkg/sidebar';
import { useMenuStore } from '../store';
import { useRef } from 'react';
import { SwiperRef } from 'swiper/react';

const NavigationLayout = ({
  children,
  swiperRef,
}: {
  children: React.ReactNode;
  swiperRef: React.RefObject<SwiperRef | null>;
}) => {
  const isMobile = useMediaQuery('(max-width: 960px)');

  if (isMobile) {
    return <Mobile swiperRef={swiperRef}>{children}</Mobile>;
  }

  return <Desktop>{children}</Desktop>;
};

export const Navigation = ({ children }: { children: React.ReactNode }) => {
  const swiperRef = useRef<SwiperRef | null>(null);

  const { isOpen, toggle } = useMenuStore();

  console.log('isOpen', isOpen);

  return (
    <SidebarProvider open={isOpen} onOpenChange={toggle}>
      <Header toggle={toggle} swiperRef={swiperRef} />
      <NavigationLayout swiperRef={swiperRef}>{children}</NavigationLayout>
    </SidebarProvider>
  );
};
