/**
 * Renders annotations drawn by a remote screen sharer on top of their video.
 *
 * The screen-share tile lives in `@xipkg/calls-ui`, so the canvas is attached
 * imperatively to the `<video>` element that carries the matching track.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRoomContext, useTracks } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { RoomEvent, Track, type Participant } from 'livekit-client';
import type { AnnotationStroke } from 'common.platform';
import { ANNOTATION_TOPIC, decodeAnnotation, reduceStrokes } from './protocol';
import { containBox, drawAnnotations } from './drawAnnotations';
import { useLocalAnnotations } from './localAnnotations';

type StrokesByIdentity = Record<string, AnnotationStroke[]>;

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

function useVideoElement(mediaStreamTrackId: string | undefined): HTMLVideoElement | null {
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

type LayerProps = {
  video: HTMLVideoElement;
  strokes: AnnotationStroke[];
};

const AnnotationLayer = ({ video, strokes }: LayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = video.clientWidth;
      const height = video.clientHeight;
      if (width === 0 || height === 0) return;

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      const box = containBox(width, height, video.videoWidth, video.videoHeight);
      drawAnnotations(ctx, strokes, box, dpr);
    };

    render();

    const observer = new ResizeObserver(render);
    observer.observe(video);
    // Intrinsic size only becomes known once the first frames arrive, and it
    // changes whenever the sharer switches monitors or LiveKit re-encodes.
    video.addEventListener('loadedmetadata', render);
    video.addEventListener('resize', render);

    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', render);
      video.removeEventListener('resize', render);
    };
  }, [video, strokes]);

  const parent = video.parentElement;
  if (!parent) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />,
    parent,
  );
};

type SharerProps = {
  trackReference: TrackReferenceOrPlaceholder;
  strokes: AnnotationStroke[];
};

const SharerAnnotations = ({ trackReference, strokes }: SharerProps) => {
  const mediaStreamTrackId = trackReference.publication?.track?.mediaStreamTrack?.id;
  const video = useVideoElement(mediaStreamTrackId);
  if (!video || strokes.length === 0) return null;
  return <AnnotationLayer video={video} strokes={strokes} />;
};

export const ShareAnnotationsOverlay = () => {
  const room = useRoomContext();
  const [strokesByIdentity, setStrokesByIdentity] = useState<StrokesByIdentity>({});
  const localStrokes = useLocalAnnotations();
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
    onlySubscribed: false,
  });

  useEffect(() => {
    const onData = (
      payload: Uint8Array,
      participant?: Participant,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== ANNOTATION_TOPIC || !participant) return;
      const decoded = decodeAnnotation(payload);
      // Surface-relative coordinates only match when a whole display is shared.
      if (!decoded || decoded.surface !== 'monitor') return;

      const identity = participant.identity;
      setStrokesByIdentity((current) => ({
        ...current,
        [identity]: reduceStrokes(current[identity] ?? [], decoded.message),
      }));
    };

    const onParticipantLeft = (participant: Participant) => {
      setStrokesByIdentity((current) => {
        if (!(participant.identity in current)) return current;
        const next = { ...current };
        delete next[participant.identity];
        return next;
      });
    };

    room.on(RoomEvent.DataReceived, onData);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantLeft);

    return () => {
      room.off(RoomEvent.DataReceived, onData);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantLeft);
    };
  }, [room]);

  return (
    <>
      {tracks.map((trackReference) => {
        const identity = trackReference.participant.identity;
        const strokes = trackReference.participant.isLocal
          ? localStrokes
          : strokesByIdentity[identity];
        if (!strokes || strokes.length === 0) return null;
        return (
          <SharerAnnotations
            key={trackReference.publication?.trackSid ?? identity}
            trackReference={trackReference}
            strokes={strokes}
          />
        );
      })}
    </>
  );
};
