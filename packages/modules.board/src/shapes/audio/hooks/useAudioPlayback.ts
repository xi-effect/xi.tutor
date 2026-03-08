import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from 'tldraw';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../../providers/YjsProvider';
import type { AudioShape } from '../AudioShape';

export function useAudioPlayback(shape: AudioShape, blobUrl: string | null) {
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const { audioSyncMap } = useYjsContext();
  const isTutor = user?.default_layout === 'tutor';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const latestRef = useRef({ syncPlayback: shape.props.syncPlayback, isTutor });

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(shape.props.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const { syncPlayback } = shape.props;
  const canControl = !syncPlayback || isTutor;
  const effectiveVolume = isMuted ? 0 : volume;

  latestRef.current = { syncPlayback, isTutor };

  // Create audio element
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
        if (shape.props.duration === 0) {
          editor.updateShape<AudioShape>({
            id: shape.id,
            type: 'audio',
            props: { duration: dur },
          });
        }
      }
    };

    const onEnded = () => {
      if (cancelled) return;
      setLocalIsPlaying(false);
      setCurrentTime(0);
      const { syncPlayback: sp, isTutor: it } = latestRef.current;
      if (sp && it && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:playing`, 0);
          audioSyncMap.set(`${shape.id}:time`, 0);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
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
  }, [blobUrl, shape.id, shape.props.duration, audioSyncMap, editor]);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // Sync mode: observe audioSyncMap (students only)
  useEffect(() => {
    if (!syncPlayback || isTutor || !audioSyncMap) return;

    const applySync = () => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;

      const playing = audioSyncMap.get(`${shape.id}:playing`) ?? 0;
      const time = audioSyncMap.get(`${shape.id}:time`) ?? 0;
      const ts = audioSyncMap.get(`${shape.id}:ts`) ?? 0;

      if (playing === 1) {
        const elapsed = (Date.now() - ts) / 1000;
        const targetTime = Math.min(time + elapsed, audio.duration);

        if (Math.abs(audio.currentTime - targetTime) > 1.5) {
          audio.currentTime = targetTime;
        }
        if (audio.paused) {
          audio.play().catch(() => {});
        }
        setLocalIsPlaying(true);
      } else {
        audio.pause();
        audio.currentTime = Math.min(time, audio.duration);
        setCurrentTime(time);
        setLocalIsPlaying(false);
      }
    };

    applySync();
    audioSyncMap.observe(applySync);
    return () => audioSyncMap.unobserve(applySync);
  }, [syncPlayback, isTutor, audioSyncMap, shape.id, blobUrl]);

  // Progress animation loop
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

      if (syncPlayback && isTutor && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:playing`, 0);
          audioSyncMap.set(`${shape.id}:time`, audio.currentTime);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    } else {
      audio.play().catch(() => {});
      setLocalIsPlaying(true);

      if (syncPlayback && isTutor && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:playing`, 1);
          audioSyncMap.set(`${shape.id}:time`, audio.currentTime);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    }
  }, [canControl, localIsPlaying, syncPlayback, isTutor, audioSyncMap, shape.id]);

  const seekTo = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!canControl || !audioRef.current || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, x / rect.width));
      const time = ratio * duration;

      audioRef.current.currentTime = time;
      setCurrentTime(time);

      if (syncPlayback && isTutor && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:time`, time);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    },
    [canControl, duration, syncPlayback, isTutor, audioSyncMap, shape.id],
  );

  const seekToTime = useCallback(
    (time: number) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = time;
      setCurrentTime(time);

      if (syncPlayback && isTutor && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:time`, time);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    },
    [syncPlayback, isTutor, audioSyncMap, shape.id],
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
    audioRef,
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
