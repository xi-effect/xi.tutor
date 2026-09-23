import { useEffect, useState } from 'react';
import { containBox, type ContainBox } from './drawAnnotations';

/**
 * Screen-share tiles live in `@xipkg/calls-ui`, so overlays are attached
 * imperatively to the `<video>` element that carries the matching track.
 */
function findVideoElement(mediaStreamTrackId: string): HTMLVideoElement | null {
  const videos = document.querySelectorAll('video');
  for (const video of videos) {
    const stream = video.srcObject;
    if (!(stream instanceof MediaStream)) continue;
    if (stream.getVideoTracks().some((track) => track.id === mediaStreamTrackId)) {
      return video;
    }
  }
  return null;
}

export function useVideoElement(mediaStreamTrackId: string | undefined): HTMLVideoElement | null {
  const [element, setElement] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!mediaStreamTrackId) {
      setElement(null);
      return;
    }
    // The tile can remount on layout changes (grid <-> focus, pin, carousel),
    // so the element is re-resolved instead of being captured once.
    const resolve = () => {
      setElement((current) => {
        const next = findVideoElement(mediaStreamTrackId);
        return next === current ? current : next;
      });
    };
    resolve();
    const interval = window.setInterval(resolve, 500);
    return () => window.clearInterval(interval);
  }, [mediaStreamTrackId]);

  return element;
}

function sameBox(a: ContainBox | null, b: ContainBox): boolean {
  return (
    a !== null &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height
  );
}

/** Area of the element actually covered by the frame (`object-fit: contain`). */
export function useVideoContentBox(video: HTMLVideoElement): ContainBox | null {
  const [box, setBox] = useState<ContainBox | null>(null);

  useEffect(() => {
    const update = () => {
      const width = video.clientWidth;
      const height = video.clientHeight;
      if (width === 0 || height === 0) return;
      const next = containBox(width, height, video.videoWidth, video.videoHeight);
      setBox((current) => (sameBox(current, next) ? current : next));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(video);
    // Intrinsic size only becomes known once the first frames arrive, and it
    // changes whenever the sharer switches monitors or LiveKit re-encodes.
    video.addEventListener('loadedmetadata', update);
    video.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', update);
      video.removeEventListener('resize', update);
    };
  }, [video]);

  return box;
}
