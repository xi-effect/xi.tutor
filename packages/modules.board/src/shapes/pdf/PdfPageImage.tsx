import { useEffect, useRef, useState } from 'react';
import { acquirePdfPageImage, type PageImage } from './pdfPageImages';

type Props = Parameters<typeof acquirePdfPageImage>[0] & {
  onReady: () => void;
  onError: (error: unknown) => void;
};
/** Keep the old resolution visible until its replacement has decoded. */
export function PdfPageImage({ source, page, width, height, zoom, dpr, onReady, onError }: Props) {
  const [image, setImage] = useState<PageImage | null>(null);
  const visible = useRef<ReturnType<typeof acquirePdfPageImage> | null>(null);
  const retired = useRef<Array<ReturnType<typeof acquirePdfPageImage>>>([]);
  useEffect(() => {
    retired.current.splice(0).forEach((lease) => lease.release());
  }, [image]);
  const callbacks = useRef({ onReady, onError });
  callbacks.current = { onReady, onError };
  useEffect(() => {
    if (width <= 0 || height <= 0) return;
    let cancelled = false;
    const lease = acquirePdfPageImage({ source, page, width, height, zoom, dpr });
    void lease.promise
      .then(async (next) => {
        if (cancelled) return;
        const decoded = new Image();
        decoded.src = next.url;
        await decoded.decode();
        if (cancelled) return;
        const previous = visible.current;
        visible.current = lease;
        setImage(next);
        if (previous) retired.current.push(previous);
        callbacks.current.onReady();
      })
      .catch((error) => {
        if (!cancelled) {
          lease.release();
          callbacks.current.onError(error);
        }
      });
    return () => {
      cancelled = true;
      if (visible.current !== lease) lease.release();
    };
  }, [source, page, width, height, zoom, dpr]);
  useEffect(
    () => () => {
      retired.current.splice(0).forEach((lease) => lease.release());
      visible.current?.release();
      visible.current = null;
    },
    [],
  );
  return image ? (
    <img
      src={image.url}
      alt=""
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  ) : null;
}
