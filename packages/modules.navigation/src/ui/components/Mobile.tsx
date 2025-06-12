/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Sidebar, SidebarInset } from '@xipkg/sidebar';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { useMenuStore } from '../../store';
import { SideBarItems } from './SideBarItems';

// @ts-expect-error
import 'swiper/css';

export const Mobile = ({
  children,
  swiperRef,
}: {
  children: React.ReactNode;
  swiperRef: React.RefObject<SwiperRef | null>;
}) => {
  const { isOpen, toggle } = useMenuStore();

  const onSlideChange = () => {
    toggle();
  };

  return (
    <div className="flex w-full overflow-hidden pt-[64px]">
      <Swiper
        slidesPerView={1}
        initialSlide={Number(!isOpen)}
        ref={swiperRef}
        onSlideChange={onSlideChange}
      >
        <SwiperSlide>
          <div className="h-[calc(100dvh-64px)] p-4">
            <Sidebar collapsible="none" variant="inset" className="w-full">
              <SideBarItems swiperRef={swiperRef} />
            </Sidebar>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <SidebarInset className="overflow-none h-[calc(100dvh-64px)] w-full">
            {children}
          </SidebarInset>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};
