import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '@ibodr/draw';
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
  const latestRef = useRef({
    syncPlayback: shape.props.syncPlayback,
    isTutor,
    studentsCanControlPlayback: shape.props.studentsCanControlPlayback,
  });

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(shape.props.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const { syncPlayback, studentsCanControlPlayback } = shape.props;
  const canControl = !syncPlayback || isTutor || studentsCanControlPlayback;
  const effectiveVolume = isMuted ? 0 : volume;

  latestRef.current = { syncPlayback, isTutor, studentsCanControlPlayback };

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

  // Sync mode: observe audioSyncMap for non-controlling clients
  useEffect(() => {
    if (!syncPlayback || !audioSyncMap) return;

    const applySync = () => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;

      // Tutor controls their own playback directly; skip sync unless students
      // are also allowed to control (in which case tutor follows students too).
      const { isTutor: isTutorNow, studentsCanControlPlayback: studCanNow } = latestRef.current;
      if (isTutorNow && !studCanNow) return;

      const playing = audioSyncMap.get(`${shape.id}:playing`) ?? 0;
      const time = audioSyncMap.get(`${shape.id}:time`) ?? 0;
      const ts = audioSyncMap.get(`${shape.id}:ts`) ?? 0;

      if (playing === 1) {
        const elapsed = (Date.now() - ts) / 1000;
        const targetTime = Math.min(time + elapsed, audio.duration);

        // Always seek when resuming from pause, or when continuous drift exceeds threshold.
        // This prevents the student from replaying a section that the tutor already skipped past.
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

    applySync();
    audioSyncMap.observe(applySync);
    return () => audioSyncMap.unobserve(applySync);
  }, [syncPlayback, audioSyncMap, shape.id, blobUrl]);

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

      if (syncPlayback && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:playing`, 0);
          audioSyncMap.set(`${shape.id}:time`, audio.currentTime);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    } else {
      audio.play().catch(() => {});
      setLocalIsPlaying(true);

      if (syncPlayback && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:playing`, 1);
          audioSyncMap.set(`${shape.id}:time`, audio.currentTime);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    }
  }, [canControl, localIsPlaying, syncPlayback, audioSyncMap, shape.id]);

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
          audioSyncMap.set(`${shape.id}:time`, time);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    },
    [canControl, duration, syncPlayback, audioSyncMap, shape.id],
  );

  const seekToTime = useCallback(
    (time: number) => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = time;
      setCurrentTime(time);

      if (syncPlayback && audioSyncMap) {
        audioSyncMap.doc?.transact(() => {
          audioSyncMap.set(`${shape.id}:time`, time);
          audioSyncMap.set(`${shape.id}:ts`, Date.now());
        }, 'audio-sync');
      }
    },
    [syncPlayback, audioSyncMap, shape.id],
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
