import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { FreeMode } from 'swiper/modules';

import 'swiper/css';

type ToolbarSlide = {
  key: string;
  node: React.ReactNode;
};

type NavbarMobileSwiperProps = {
  activeIndex: number;
  slides: ToolbarSlide[];
};

export const NavbarMobileSwiper = ({ activeIndex, slides }: NavbarMobileSwiperProps) => {
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || activeIndex < 0 || swiper.activeIndex === activeIndex) return;
    swiper.slideTo(activeIndex, 280);
  }, [activeIndex]);

  return (
    <Swiper
      modules={[FreeMode]}
      slidesPerView="auto"
      spaceBetween={6}
      freeMode={{ enabled: true, momentumRatio: 0.35 }}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
        if (activeIndex >= 0) swiper.slideTo(activeIndex, 0);
      }}
      className="board-toolbar-swiper pointer-events-auto w-full"
      wrapperClass="items-center"
    >
      {slides.map(({ key, node }) => (
        <SwiperSlide key={key} className="!w-auto">
          {node}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
