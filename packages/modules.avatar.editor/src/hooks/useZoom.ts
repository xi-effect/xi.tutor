import { useState } from 'react';

const MAX_ZOOM = 3;
const MIN_ZOOM = 0.8;
const ZOOM_STEP = 0.01;

export const useZoom = () => {
  const [zoom, setZoom] = useState(1);

  const onZoomChange = (zooms: number) => {
    if (zooms < MIN_ZOOM) {
      setZoom(MIN_ZOOM);
      return;
    }

    if (zooms > MAX_ZOOM) {
      setZoom(MAX_ZOOM);
      return;
    }
    setZoom(zooms);
  };

  const increaseZoom = () => {
    setZoom((prev) => (prev < MAX_ZOOM ? prev + ZOOM_STEP : MAX_ZOOM));
  };

  const decreaseZoom = () => {
    setZoom((prev) => (prev > MIN_ZOOM ? prev - ZOOM_STEP : MIN_ZOOM));
  };

  return {
    zoom,
    onZoomChange,
    increaseZoom,
    decreaseZoom,
    MAX_ZOOM,
    MIN_ZOOM,
    ZOOM_STEP,
  };
};
