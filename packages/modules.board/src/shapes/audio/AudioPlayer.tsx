import { useCallback, useEffect, useRef, useState } from 'react';
import { Slider } from '@xipkg/slider';
import { SoundTwo } from '@xipkg/icons';
import { useEditor } from 'tldraw';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../providers/YjsProvider';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { audioWaveformCache } from './audioWaveformCache';
import type { AudioShape } from './AudioShape';

type AudioPlayerProps = {
  shape: AudioShape;
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const WAVEFORM_HEIGHT = 28;
const BAR_MIN_HEIGHT = 2;

function stopEvent(e: React.SyntheticEvent) {
  e.stopPropagation();
}

export const AudioPlayer = ({ shape }: AudioPlayerProps) => {
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const { token, audioSyncMap } = useYjsContext();
  const isTutor = user?.default_layout === 'tutor';

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const latestRef = useRef({ syncPlayback: shape.props.syncPlayback, isTutor });

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(shape.props.duration || 0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const { src, syncPlayback } = shape.props;
  const canControl = !syncPlayback || isTutor;
  const effectiveVolume = isMuted ? 0 : volume;

  latestRef.current = { syncPlayback, isTutor };

  // ── Load audio blob + compute waveform ──
  useEffect(() => {
    if (!src || !token) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const url = await resolveAssetUrl(src, token);
        if (cancelled) return;
        setBlobUrl(url);

        const wf = await audioWaveformCache.get(url);
        if (!cancelled) setWaveform(wf);

        setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Не удалось загрузить аудио');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, token]);

  // ── Create audio element ──
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

  // ── Sync volume to audio element ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // ── Sync mode: observe audioSyncMap (students only) ──
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

  // ── Progress animation loop ──
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

  // ── Action handlers ──

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

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const onVolumeChange = useCallback((value: number[]) => {
    const val = value[0] ?? 0;
    setVolume(val);
    if (val > 0) setIsMuted(false);
    if (val === 0) setIsMuted(true);
  }, []);

  // ── Derived values ──
  const progress = duration > 0 ? currentTime / duration : 0;

  // ── Error / loading states ──

  if (error) {
    return (
      <div
        style={{ pointerEvents: 'none' }}
        className="text-gray-40 flex h-full w-full items-center justify-center gap-2 px-4"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-30">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M15 9l-6 6M9 9l6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs">{error}</span>
      </div>
    );
  }

  if (loading || !src) {
    return (
      <div
        style={{ pointerEvents: 'none' }}
        className="text-gray-40 flex h-full w-full items-center justify-center"
      >
        <span className="text-xs">Загрузка...</span>
      </div>
    );
  }

  // ── Main render ──
  // pointerEvents: 'none' on the layout wrapper — clicks on empty space
  // pass through to tldraw for select / drag / resize.
  // Only specific controls get pointerEvents: 'all'.

  return (
    <div
      style={{ pointerEvents: 'none' }}
      className="flex h-full items-center gap-3 px-3 select-none"
    >
      {/* ─── Play / Pause button ─── */}
      <button
        type="button"
        disabled={!canControl}
        style={{ pointerEvents: 'all', backgroundColor: '#3B82F6' }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
        onPointerDown={stopEvent}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        {localIsPlaying ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M4.5 2v12l9-6-9-6z" />
          </svg>
        )}
      </button>

      {/* ─── Content column ─── */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Waveform — interactive, seek on click */}
        <svg
          style={{ pointerEvents: 'all', cursor: canControl ? 'pointer' : 'default' }}
          className="w-full"
          height={WAVEFORM_HEIGHT}
          preserveAspectRatio="none"
          onPointerDown={(e) => {
            e.stopPropagation();
            seekTo(e);
          }}
        >
          {waveform.map((amp, i) => {
            const count = waveform.length;
            const barW = 100 / count;
            const gapRatio = 0.3;
            const barHeight = Math.max(BAR_MIN_HEIGHT, amp * (WAVEFORM_HEIGHT - 4));
            const played = (i + 0.5) / count <= progress;

            return (
              <rect
                key={i}
                x={`${i * barW + (barW * gapRatio) / 2}%`}
                y={(WAVEFORM_HEIGHT - barHeight) / 2}
                width={`${barW * (1 - gapRatio)}%`}
                height={barHeight}
                rx={1.5}
                fill={played ? '#3B82F6' : '#CBD5E1'}
              />
            );
          })}
        </svg>

        {/* Info row */}
        <div
          className="flex items-center justify-between"
          style={{ fontSize: 10, color: '#6B7280' }}
        >
          <span>
            {localIsPlaying
              ? `${formatTime(currentTime)} / ${formatTime(duration)}`
              : `${formatTime(duration)}, ${formatFileSize(shape.props.fileSize)}`}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Volume: иконка всегда видна, слайдер слева — только при наведении */}
            <div
              className="group flex items-center gap-1.5"
              style={{ pointerEvents: 'all' }}
              onPointerDown={stopEvent}
              onPointerMove={stopEvent}
              onPointerUp={stopEvent}
              onClick={stopEvent}
            >
              <div className="flex min-h-6 max-w-0 min-w-0 items-center overflow-hidden opacity-0 transition-[max-width,opacity] duration-150 group-hover:max-w-[80px] group-hover:opacity-100">
                <Slider
                  value={[effectiveVolume]}
                  onValueChange={onVolumeChange}
                  min={0}
                  max={1}
                  step={0.01}
                  className="h-6 w-[80px] shrink-0"
                />
              </div>
              <button
                type="button"
                className="text-gray-60 hover:text-gray-80 flex shrink-0 items-center justify-center"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={() => toggleMute()}
              >
                <SoundTwo
                  className="h-3.5 w-3.5"
                  style={{ opacity: effectiveVolume === 0 ? 0.5 : 1 }}
                />
              </button>
            </div>

            {syncPlayback && (
              <span style={{ fontSize: 9, color: '#3B82F6', fontWeight: 500 }}>SYNC</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
