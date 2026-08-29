/**
 * Mirrors strokes drawn in the native always-on-top canvas to the other call
 * participants over the LiveKit data channel.
 *
 * The overlay window is excluded from display capture, so this is the only path
 * by which annotations reach the remote side. No-op in the browser web app.
 */

import { useEffect, useRef } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { RoomEvent, Track, type Participant } from 'livekit-client';
import { isDesktopNative, onShareAnnotation, type AnnotationStroke } from 'common.platform';
import { setLocalAnnotations } from './localAnnotations';
import {
  ANNOTATION_TOPIC,
  encodeAnnotation,
  reduceStrokes,
  type AnnotationSurface,
  type AnnotationWireMessage,
} from './protocol';

export function useShareAnnotationPublisher(): void {
  const room = useRoomContext();
  const { isScreenShareEnabled, localParticipant } = useLocalParticipant();
  const strokesRef = useRef<AnnotationStroke[]>([]);
  const surfaceRef = useRef<AnnotationSurface>('other');

  useEffect(() => {
    if (!isDesktopNative()) return;

    const publication = localParticipant.getTrackPublication(Track.Source.ScreenShare);
    const settings = publication?.track?.mediaStreamTrack?.getSettings() as
      (MediaTrackSettings & { displaySurface?: string }) | undefined;
    surfaceRef.current = settings?.displaySurface === 'monitor' ? 'monitor' : 'other';

    if (!isScreenShareEnabled) {
      strokesRef.current = [];
      setLocalAnnotations([]);
    }
  }, [isScreenShareEnabled, localParticipant]);

  useEffect(() => {
    if (!isDesktopNative()) return;

    let cancelled = false;
    let unlisten: (() => void) | undefined;

    const publish = (payload: AnnotationWireMessage, identities?: string[]) => {
      void localParticipant
        .publishData(encodeAnnotation(payload), {
          reliable: true,
          topic: ANNOTATION_TOPIC,
          destinationIdentities: identities,
        })
        .catch((err) => {
          console.warn('[modules.calls] failed to publish annotation', err);
        });
    };

    // A participant joining mid-stroke would otherwise see an empty canvas.
    const resync = (participant: Participant) => {
      if (strokesRef.current.length === 0) return;
      publish(
        { surface: surfaceRef.current, message: { type: 'sync', strokes: strokesRef.current } },
        [participant.identity],
      );
    };

    room.on(RoomEvent.ParticipantConnected, resync);

    void (async () => {
      try {
        unlisten = await onShareAnnotation((message) => {
          strokesRef.current = reduceStrokes(strokesRef.current, message);
          setLocalAnnotations(surfaceRef.current === 'monitor' ? strokesRef.current : []);
          publish({ surface: surfaceRef.current, message });
        });
      } catch (err) {
        console.warn('[modules.calls] annotation bridge unavailable', err);
      }
      if (cancelled) unlisten?.();
    })();

    return () => {
      cancelled = true;
      unlisten?.();
      room.off(RoomEvent.ParticipantConnected, resync);
    };
  }, [room, localParticipant]);
}

/** Mount-only wrapper for provider trees that cannot call hooks conditionally. */
export function ShareAnnotationPublisher(): null {
  useShareAnnotationPublisher();
  return null;
}
