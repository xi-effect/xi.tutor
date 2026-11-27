import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '@ibodr/draw';
import { useCurrentUser } from 'common.services';
import {
  getBoardAudioOutputDeviceId,
  useBoardAudioOutputDeviceId,
} from '../../../audioOutput/boardAudioOutput';
import { useYjsContext } from '../../../providers/YjsContext';
import { runWithoutHistory } from '../../../utils/runWithoutHistory';
import { isNotAllowedError, registerBoardAudio } from '../boardAudioGesture';
import type { AudioShape } from '../AudioShape';
import { setAudioOutputSink } from '../utils/setAudioOutputSink';
import { seekMediaElement } from '../utils/seekMediaElement';
import {
  planRemoteSync,
  SYNC_HARD_SEEK_SEC,
  SYNC_HEARTBEAT_MS,
  SYNC_STALE_MS,
  updateClockOffset,
} from '../utils/syncPlayback';

const SEEK_COOLDOWN_MS = 700;
const SCRUB_SEEK_MS = 200;
const SCRUB_PUBLISH_MS = 350;

type MapObserver = (event: unknown, transaction: { local: boolean }) => void;

function mountBoardAudioElement(audio: HTMLAudioElement) {
  audio.preload = 'auto';
  audio.controls = false;
  audio.playbackRate = 1;
  // В DOM, но не display:none: иначе iOS не играет и не перематывает.
  audio.setAttribute('playsinline', 'true');
  audio.setAttribute('webkit-playsinline', 'true');
  audio.style.cssText =
    'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;';
  document.body.append(audio);
}

export function useAudioPlayback(shape: AudioShape, blobUrl: string | null) {
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const { audioSyncMap } = useYjsContext();
  const isTutor = user?.default_layout === 'tutor';
  const audioOutputDeviceId = useBoardAudioOutputDeviceId();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef(0);
  const seekTimerRef = useRef(0);
  const publishTimerRef = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const scrubbingRef = useRef(false);
  const playGenerationRef = useRef(0);
  const wantsPlayRef = useRef(false);
  const isDriverRef = useRef(false);
  const clockOffsetRef = useRef<number | null>(null);
  const lastSignatureRef = useRef('');
  const lastSeekAtRef = useRef(0);
  const lastSeekTargetRef = useRef<number | null>(null);
  const pendingAlignRef = useRef<number | null>(null);
  const uiTimeRef = useRef(0);
  const durationPropRef = useRef(shape.props.duration);
  const editorRef = useRef(editor);
  const shapeIdRef = useRef(shape.id);
  const audioSyncMapRef = useRef(audioSyncMap);

  const { syncPlayback, studentsCanControlPlayback } = shape.props;
  const canControl = !syncPlayback || isTutor || studentsCanControlPlayback;

  const latestRef = useRef({
    syncPlayback,
    isTutor,
    studentsCanControlPlayback,
    canControl,
    localIsPlaying: false,
  });

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(shape.props.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);

  const effectiveVolume = isMuted ? 0 : volume;
  durationPropRef.current = shape.props.duration;
  editorRef.current = editor;
  shapeIdRef.current = shape.id;
  audioSyncMapRef.current = audioSyncMap;
  latestRef.current = {
    syncPlayback,
    isTutor,
    studentsCanControlPlayback,
    canControl,
    localIsPlaying,
  };

  const rememberTime = useCallback((time: number) => {
    const next = Number.isFinite(time) ? Math.max(0, time) : 0;
    uiTimeRef.current = next;
    setCurrentTime(next);
  }, []);

  const publishSync = useCallback((playing: boolean, time: number) => {
    const map = audioSyncMapRef.current;
    if (!latestRef.current.syncPlayback || !map) return;
    isDriverRef.current = true;
    const safeTime = Number.isFinite(time) ? Math.max(0, time) : 0;
    map.doc?.transact(() => {
      map.set(`${shapeIdRef.current}:playing`, playing ? 1 : 0);
      map.set(`${shapeIdRef.current}:time`, safeTime);
      map.set(`${shapeIdRef.current}:ts`, Date.now());
    }, 'audio-sync');
  }, []);

  const stopPlayback = useCallback((audio: HTMLAudioElement) => {
    playGenerationRef.current += 1;
    wantsPlayRef.current = false;
    isDriverRef.current = true;
    audio.pause();
    setLocalIsPlaying(false);
    setSoundBlocked(false);
  }, []);

  const startPlayback = useCallback((audio: HTMLAudioElement) => {
    const generation = ++playGenerationRef.current;
    const target = pendingAlignRef.current;
    wantsPlayRef.current = true;
    setLocalIsPlaying(true);

    const align = () => {
      if (playGenerationRef.current !== generation || target == null) return;
      pendingAlignRef.current = null;
      if (target < 0.05 || Math.abs(audio.currentTime - target) < 0.35) return;
      seekMediaElement(audio, target);
      lastSeekAtRef.current = performance.now();
    };

    const onPlaying = () => align();
    audio.addEventListener('playing', onPlaying, { once: true });

    const pending = audio.play();
    void pending
      ?.then(() => {
        if (playGenerationRef.current !== generation) return;
        align();
        setSoundBlocked(false);
        setLocalIsPlaying(true);
      })
      .catch((error: unknown) => {
        audio.removeEventListener('playing', onPlaying);
        if (playGenerationRef.current !== generation) return;
        setLocalIsPlaying(false);
        if (isNotAllowedError(error)) setSoundBlocked(true);
      });
  }, []);

  const seekToPosition = useCallback((audio: HTMLAudioElement, time: number) => {
    seekMediaElement(audio, time);
    pendingAlignRef.current = time;
    lastSeekAtRef.current = performance.now();
    lastSeekTargetRef.current = time;
    window.setTimeout(() => {
      const current = audioRef.current;
      if (!current || current !== audio || pendingAlignRef.current !== time) return;
      if (Math.abs(current.currentTime - time) < 0.35) return;
      seekMediaElement(current, time);
    }, 80);
  }, []);

  const followRemote = useCallback(
    (force: boolean, autoplay: boolean) => {
      const audio = audioRef.current;
      const map = audioSyncMapRef.current;
      if (!audio || !map) return;
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

      const { isTutor: tutorNow, studentsCanControlPlayback: studentsCan } = latestRef.current;
      if (tutorNow && !studentsCan) return;

      const id = shapeIdRef.current;
      const playing = map.get(`${id}:playing`) ?? 0;
      const time = map.get(`${id}:time`) ?? 0;
      const ts = map.get(`${id}:ts`) ?? 0;
      const signature = `${playing}:${time}:${ts}`;
      if (!force && signature === lastSignatureRef.current) return;
      lastSignatureRef.current = signature;

      const now = Date.now();
      const age = now - ts;
      if (ts > 0 && Math.abs(age) <= SYNC_STALE_MS) {
        clockOffsetRef.current = updateClockOffset(clockOffsetRef.current, now, ts);
      }

      const plan = planRemoteSync(
        { playing: playing === 1, time, ts },
        {
          currentTime: audio.currentTime,
          duration: audio.duration,
          paused: audio.paused || audio.ended,
        },
        now,
        clockOffsetRef.current ?? 0,
      );

      isDriverRef.current = false;

      if (plan.kind === 'pause') {
        wantsPlayRef.current = false;
        playGenerationRef.current += 1;
        audio.pause();
        seekToPosition(audio, plan.time);
        rememberTime(plan.time);
        setLocalIsPlaying(false);
        setSoundBlocked(false);
        return;
      }

      if (plan.seekTo != null) {
        const sinceSeek = performance.now() - lastSeekAtRef.current;
        const closeEnough = Math.abs(audio.currentTime - plan.seekTo) < 0.08;
        const targetMoved =
          lastSeekTargetRef.current == null ||
          Math.abs(lastSeekTargetRef.current - plan.seekTo) >= SYNC_HARD_SEEK_SEC;
        if (!closeEnough && (audio.paused || sinceSeek > SEEK_COOLDOWN_MS || targetMoved)) {
          seekToPosition(audio, plan.seekTo);
          rememberTime(plan.seekTo);
        }
      }

      wantsPlayRef.current = true;
      if (!autoplay) return;

      if (audio.paused || audio.ended) startPlayback(audio);
      else {
        setSoundBlocked(false);
        setLocalIsPlaying(true);
      }
    },
    [rememberTime, seekToPosition, startPlayback],
  );

  const followRemoteRef = useRef(followRemote);
  const publishSyncRef = useRef(publishSync);
  const startPlaybackRef = useRef(startPlayback);
  followRemoteRef.current = followRemote;
  publishSyncRef.current = publishSync;
  startPlaybackRef.current = startPlayback;

  useEffect(() => {
    if (!blobUrl) return;
    let cancelled = false;

    const audio = document.createElement('audio');
    mountBoardAudioElement(audio);
    setAudioOutputSink(audio, getBoardAudioOutputDeviceId());
    audio.src = blobUrl;
    audioRef.current = audio;

    const detachGesture = registerBoardAudio({
      audio,
      wantsPlay: () => wantsPlayRef.current,
      onStarted: () => {
        if (cancelled || !wantsPlayRef.current) return;
        setSoundBlocked(false);
        setLocalIsPlaying(true);
      },
      onBlocked: () => {
        if (cancelled) return;
        setSoundBlocked(true);
        setLocalIsPlaying(false);
      },
    });

    const onMeta = () => {
      if (cancelled) return;
      const dur = audio.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      setDuration(dur);
      if (durationPropRef.current === 0) {
        runWithoutHistory(editorRef.current, () => {
          editorRef.current.updateShape<AudioShape>({
            id: shapeIdRef.current,
            type: 'audio',
            props: { duration: dur },
          });
        });
      }
      followRemoteRef.current(true, true);
    };

    const onEnded = () => {
      if (cancelled) return;
      setLocalIsPlaying(false);
      if (!isDriverRef.current) return;
      wantsPlayRef.current = false;
      rememberTime(0);
      publishSyncRef.current(false, 0);
    };

    const onVisible = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      const current = audioRef.current;
      if (!current || !wantsPlayRef.current || !current.paused || current.ended) return;
      startPlaybackRef.current(current);
    };

    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      detachGesture();
      document.removeEventListener('visibilitychange', onVisible);
      cancelAnimationFrame(animFrameRef.current);
      window.clearTimeout(seekTimerRef.current);
      window.clearTimeout(publishTimerRef.current);
      audio.pause();
      audio.src = '';
      audio.remove();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [blobUrl, rememberTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioOutputSink(audio, audioOutputDeviceId);
  }, [audioOutputDeviceId, blobUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = effectiveVolume <= 0;
    try {
      audio.volume = effectiveVolume;
    } catch {
      /* iOS не даёт менять volume у media element */
    }
  }, [effectiveVolume, blobUrl]);

  useEffect(() => {
    if (!syncPlayback || !audioSyncMap) {
      lastSignatureRef.current = '';
      return;
    }

    const onRemote: MapObserver = (_event, transaction) => {
      if (transaction?.local) return;
      followRemoteRef.current(false, true);
    };

    const audio = audioRef.current;
    if (audio && !audio.paused && latestRef.current.canControl) {
      publishSyncRef.current(true, audio.currentTime || uiTimeRef.current);
    }

    lastSignatureRef.current = '';
    followRemoteRef.current(true, true);
    audioSyncMap.observe(onRemote);
    return () => {
      audioSyncMap.unobserve(onRemote);
    };
  }, [syncPlayback, audioSyncMap, shape.id, blobUrl]);

  useEffect(() => {
    if (!syncPlayback || !audioSyncMap) return;
    const timer = window.setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !isDriverRef.current || audio.paused || audio.ended) return;
      publishSyncRef.current(true, audio.currentTime);
    }, SYNC_HEARTBEAT_MS);
    return () => window.clearInterval(timer);
  }, [syncPlayback, audioSyncMap, shape.id]);

  useEffect(() => {
    if (!localIsPlaying) return;

    let lastUi = 0;
    const update = (now: number) => {
      animFrameRef.current = requestAnimationFrame(update);
      if (scrubbingRef.current || now - lastUi < 200) return;
      lastUi = now;
      const audio = audioRef.current;
      if (!audio) return;
      rememberTime(audio.currentTime);
    };

    animFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [localIsPlaying, rememberTime]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !latestRef.current.canControl) return;

    if (latestRef.current.localIsPlaying) {
      const time = pendingAlignRef.current ?? (audio.currentTime || uiTimeRef.current);
      stopPlayback(audio);
      publishSync(false, time);
      return;
    }

    startPlayback(audio);
    publishSync(true, pendingAlignRef.current ?? (audio.currentTime || uiTimeRef.current));
  }, [publishSync, startPlayback, stopPlayback]);

  const seekToTime = useCallback(
    (time: number, phase: 'drag' | 'commit' = 'commit') => {
      const audio = audioRef.current;
      if (!audio || !latestRef.current.canControl || !Number.isFinite(time)) return;

      rememberTime(time);

      const apply = (next: number) => {
        const current = audioRef.current;
        if (!current) return;
        seekToPosition(current, next);
      };

      if (phase === 'drag') {
        scrubbingRef.current = true;
        pendingSeekRef.current = time;
        if (!seekTimerRef.current) {
          seekTimerRef.current = window.setTimeout(() => {
            seekTimerRef.current = 0;
            const pending = pendingSeekRef.current;
            if (pending == null) return;
            apply(pending);
          }, SCRUB_SEEK_MS);
        }
        window.clearTimeout(publishTimerRef.current);
        publishTimerRef.current = window.setTimeout(() => {
          const pending = pendingSeekRef.current;
          if (pending == null) return;
          publishSyncRef.current(latestRef.current.localIsPlaying, pending);
        }, SCRUB_PUBLISH_MS);
        return;
      }

      scrubbingRef.current = false;
      pendingSeekRef.current = null;
      window.clearTimeout(seekTimerRef.current);
      window.clearTimeout(publishTimerRef.current);
      seekTimerRef.current = 0;
      apply(time);
      publishSync(latestRef.current.localIsPlaying, time);
    },
    [publishSync, rememberTime, seekToPosition],
  );

  const enableSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    wantsPlayRef.current = true;
    if (!latestRef.current.canControl) followRemote(true, false);
    if (!wantsPlayRef.current) return;
    const current = audioRef.current;
    if (!current) return;
    if (current.paused || current.ended) startPlayback(current);
    else {
      setSoundBlocked(false);
      setLocalIsPlaying(true);
    }
  }, [followRemote, startPlayback]);

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
    soundBlocked,
    togglePlay,
    seekToTime,
    enableSound,
    toggleMute,
    onVolumeChange,
  };
}
