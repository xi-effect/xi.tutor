import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../../hooks';
import type { AudioNodeAttrs } from '../audioTypes';

type UpdateAudioAttrs = (attrs: Record<string, unknown>) => void;

export function useAudioPlayback(
  nodeId: string,
  attrs: AudioNodeAttrs,
  blobUrl: string | null,
  updateAttributes: UpdateAudioAttrs,
) {
  const { data: user } = useCurrentUser();
  const { audioSyncMap } = useYjsContext();
  const isTutor = user?.default_layout === 'tutor';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const applySyncRef = useRef<() => void>(() => {});
  const latestRef = useRef({
    syncPlayback: attrs.syncPlayback,
    isTutor,
    studentsCanControlPlayback: attrs.studentsCanControlPlayback,
  });

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(attrs.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const { syncPlayback, studentsCanControlPlayback } = attrs;
  const canControl = !syncPlayback || isTutor || studentsCanControlPlayback;
  const effectiveVolume = isMuted ? 0 : volume;

  latestRef.current = { syncPlayback, isTutor, studentsCanControlPlayback };

  useEffect(() => {
    if (!blobUrl) return;
    let cancelled = false;

    const audio = new Audio(blobUrl);
    audioRef.current = audio;

    const onMeta = () => {
      if (cancelled) return;
      const dur = audio.duration;
      if (isFinite(dur) && dur > 0) {
        setDuration(dur);
        if (attrs.duration === 0) {
          updateAttributes({ duration: dur });
        }
        applySyncRef.current();
      }
    };

    const onEnded = () => {
      if (cancelled) return;
      setLocalIsPlaying(false);
      setCurrentTime(0);
      const { syncPlayback: sp, isTutor: it } = latestRef.current;
      if (sp && it && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${nodeId}:playing`, 0);
          audioSyncMap.set(`${nodeId}:time`, 0);
          audioSyncMap.set(`${nodeId}:ts`, Date.now());
        }, 'audio-sync');
      }
    };

    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [blobUrl, nodeId, attrs.duration, audioSyncMap, updateAttributes]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  useEffect(() => {
    if (!syncPlayback || !audioSyncMap) {
      applySyncRef.current = () => {};
      return;
    }

    const applySync = () => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;

      const { isTutor: isTutorNow, studentsCanControlPlayback: studCanNow } = latestRef.current;
      if (isTutorNow && !studCanNow) return;

      const playing = audioSyncMap.get(`${nodeId}:playing`) ?? 0;
      const time = audioSyncMap.get(`${nodeId}:time`) ?? 0;
      const ts = audioSyncMap.get(`${nodeId}:ts`) ?? 0;

      if (playing === 1) {
        const elapsed = (Date.now() - ts) / 1000;
        const targetTime = Math.min(time + elapsed, audio.duration);

        if (audio.paused || Math.abs(audio.currentTime - targetTime) > 0.3) {
          audio.currentTime = targetTime;
        }
        if (audio.paused) {
          audio.play().catch(() => {
            setLocalIsPlaying(false);
          });
        }
        setLocalIsPlaying(true);
      } else {
        audio.pause();
        audio.currentTime = Math.min(time, audio.duration);
        setCurrentTime(time);
        setLocalIsPlaying(false);
      }
    };

    applySyncRef.current = applySync;
    applySync();
    audioSyncMap.observe(applySync);
    return () => {
      audioSyncMap.unobserve(applySync);
      applySyncRef.current = () => {};
    };
  }, [syncPlayback, audioSyncMap, nodeId, blobUrl]);

  useEffect(() => {
    if (!localIsPlaying || !audioRef.current) return;

    const update = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [localIsPlaying]);

  const togglePlay = useCallback(() => {
    if (!canControl || !audioRef.current) return;

    const audio = audioRef.current;

    if (localIsPlaying) {
      audio.pause();
      setLocalIsPlaying(false);

      if (syncPlayback && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${nodeId}:playing`, 0);
          audioSyncMap.set(`${nodeId}:time`, audio.currentTime);
          audioSyncMap.set(`${nodeId}:ts`, Date.now());
        }, 'audio-sync');
      }
    } else {
      setLocalIsPlaying(true);
      audio.play().catch(() => {
        setLocalIsPlaying(false);
      });

      if (syncPlayback && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${nodeId}:playing`, 1);
          audioSyncMap.set(`${nodeId}:time`, audio.currentTime);
          audioSyncMap.set(`${nodeId}:ts`, Date.now());
        }, 'audio-sync');
      }
    }
  }, [canControl, localIsPlaying, syncPlayback, audioSyncMap, nodeId]);

  const seekTo = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!canControl || !audioRef.current || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const time = ratio * duration;

      audioRef.current.currentTime = time;
      setCurrentTime(time);

      if (syncPlayback && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${nodeId}:time`, time);
          audioSyncMap.set(`${nodeId}:ts`, Date.now());
        }, 'audio-sync');
      }
    },
    [canControl, duration, syncPlayback, audioSyncMap, nodeId],
  );

  const seekToTime = useCallback(
    (time: number) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = time;
      setCurrentTime(time);

      if (syncPlayback && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${nodeId}:time`, time);
          audioSyncMap.set(`${nodeId}:ts`, Date.now());
        }, 'audio-sync');
      }
    },
    [syncPlayback, audioSyncMap, nodeId],
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const onVolumeChange = useCallback((value: number[]) => {
    const val = value[0] ?? 0;
    setVolume(val);
    if (val > 0) setIsMuted(false);
    if (val === 0) setIsMuted(true);
  }, []);

  const progress = duration > 0 ? currentTime / duration : 0;

  return {
    currentTime,
    duration,
    localIsPlaying,
    canControl,
    effectiveVolume,
    progress,
    togglePlay,
    seekTo,
    seekToTime,
    toggleMute,
    onVolumeChange,
  };
}
