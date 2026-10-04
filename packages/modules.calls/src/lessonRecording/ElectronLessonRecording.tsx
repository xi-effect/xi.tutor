import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  getSovliumDesktop,
  isElectronConferenceSurface,
  type LessonRecordingCommand,
  type LessonRecordingStatus,
} from 'common.platform';
import { useCurrentUser } from 'common.services';
import {
  LessonRecordingPresenceSync,
  useConferenceAudioSources,
  useCurrentClassroomId,
  useLessonRecordingPresence,
  usePublishLessonRecording,
} from '@xipkg/calls-hooks';
import { useLessonRecordingControlsStore } from '@xipkg/calls-store';
import { LessonRecordButton } from '@xipkg/calls-ui';
import { useLocation } from '@tanstack/react-router';
import { useElectronConferenceState } from '../useElectronConferenceState';
import { RecordingBar } from './RecordingBar';
import { ConferenceAudioMixer } from './audioMixer';
import { LessonRecorder } from './LessonRecorder';
import { captureElectronWindow, mapCaptureError, sourcesAlongsidePlayback } from './capture';
import { createElectronRecordingSink } from './sinks';
import { formatLessonRecordingFilename } from './filename';
import { selectRecordingMimeType } from './mime';
import {
  trackLessonRecordingCompleted,
  trackLessonRecordingFailed,
  trackLessonRecordingStarted,
} from './analytics';
import type { LessonRecordingFailureReason } from './types';

type Phase = 'idle' | 'starting' | 'recording' | 'stopping';

const FAILURE_REASONS = new Set<LessonRecordingFailureReason>([
  'capture_denied',
  'capture_unsupported',
  'desktop_rejected',
  'recorder_error',
  'sink_error',
  'conference_unavailable',
  'unknown',
]);

function asFailureReason(value: string): LessonRecordingFailureReason {
  return FAILURE_REASONS.has(value as LessonRecordingFailureReason)
    ? (value as LessonRecordingFailureReason)
    : 'unknown';
}

function ElectronPresenceRelay() {
  const presence = useLessonRecordingPresence();

  useEffect(() => {
    void getSovliumDesktop()?.recording.reportPresence({
      active: presence.active,
      startedAt: presence.startedAt,
    });
  }, [presence.active, presence.startedAt]);

  return null;
}

/** Движок в окне конференции: здесь есть LiveKit, а картинка берётся с главного окна приложения. */
function ElectronConferenceRecordingEngine() {
  const audio = useConferenceAudioSources();
  const publish = usePublishLessonRecording();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const lessonId = useCurrentClassroomId();
  const [phase, setPhase] = useState<Phase>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const recorderRef = useRef<LessonRecorder | null>(null);
  const audioRef = useRef(audio);
  const mimeRef = useRef(selectRecordingMimeType());
  const playbackIncludesCallRef = useRef(false);
  audioRef.current = audio;

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = null;
    playbackIncludesCallRef.current = false;
    const desktop = getSovliumDesktop();
    publish(false, null);
    setPhase('stopping');
    const participantsCount = audioRef.current.participantCount;
    try {
      const result = await recorder.stop();
      trackLessonRecordingCompleted({
        lessonId,
        role: user?.default_layout,
        participantsCount,
        format: result.format,
        durationSeconds: result.durationSeconds,
        sizeBytes: result.sizeBytes,
      });
      void desktop?.recording.reportStatus({
        phase: 'saved',
        sizeBytes: result.sizeBytes,
        format: result.format,
        filename: result.filename,
      });
    } catch {
      trackLessonRecordingFailed({
        lessonId,
        role: user?.default_layout,
        participantsCount,
        format: mimeRef.current.format,
        reason: 'sink_error',
        durationSeconds: Math.max(0, Math.round((Date.now() - recorder.startedAt) / 1000)),
      });
      void desktop?.recording.reportStatus({ phase: 'error', reason: 'sink_error' });
    } finally {
      setStartedAt(null);
      setPhase('idle');
    }
  }, [lessonId, publish, user?.default_layout]);

  const stopRef = useRef(stop);
  stopRef.current = stop;

  useEffect(() => {
    recorderRef.current?.setAudioSources(
      sourcesAlongsidePlayback(audio.sources, playbackIncludesCallRef.current),
    );
  }, [audio.sources]);

  useEffect(() => {
    if (!recorderRef.current) return;
    if (audio.connected) return;
    void stopRef.current();
  }, [audio.connected]);

  const startFromCommand = useCallback(
    async (command: Extract<LessonRecordingCommand, { action: 'start' }>) => {
      if (recorderRef.current) return;
      const desktop = getSovliumDesktop();
      const mime = selectRecordingMimeType();
      mimeRef.current = mime;
      const filename = formatLessonRecordingFilename(new Date(), mime.extension);
      const mixer = new ConferenceAudioMixer();
      void mixer.resume();
      let captured: Awaited<ReturnType<typeof captureElectronWindow>> | null = null;
      try {
        captured = await captureElectronWindow(command.sourceId, command.audioSourceId);
        const playbackIncludesCall =
          captured.playbackIncludesCall && Boolean(captured.playbackTrack);
        playbackIncludesCallRef.current = playbackIncludesCall;
        const sink = createElectronRecordingSink(command.fileId, filename);
        const recorder = await LessonRecorder.start({
          mixer,
          videoStream: captured.video,
          extraStream: captured.extraStream,
          playbackTrack: captured.playbackTrack,
          audioSources: sourcesAlongsidePlayback(audioRef.current.sources, playbackIncludesCall),
          sink,
          mimeType: command.mimeType || mime.mimeType,
          format: mime.format,
        });
        captured.playbackTrack?.addEventListener(
          'ended',
          () => {
            playbackIncludesCallRef.current = false;
            recorderRef.current?.setAudioSources(audioRef.current.sources);
          },
          { once: true },
        );
        recorderRef.current = recorder;
        setStartedAt(recorder.startedAt);
        setPhase('recording');
        publish(true, recorder.startedAt);
        trackLessonRecordingStarted({
          lessonId,
          role: user?.default_layout,
          participantsCount: audioRef.current.participantCount,
          format: mime.format,
        });
        void desktop?.recording.reportStatus({ phase: 'recording', startedAt: recorder.startedAt });
      } catch (caught) {
        playbackIncludesCallRef.current = false;
        if (!recorderRef.current) {
          await mixer.close().catch(() => undefined);
          captured?.video.getTracks().forEach((track) => track.stop());
          captured?.extraStream?.getTracks().forEach((track) => track.stop());
        }
        setStartedAt(null);
        setPhase('idle');
        await getSovliumDesktop()?.recording.discard({ fileId: command.fileId });
        const captureReason = mapCaptureError(caught);
        const reason: LessonRecordingFailureReason =
          captureReason === 'cancelled' || captureReason === 'unknown'
            ? 'recorder_error'
            : captureReason;
        trackLessonRecordingFailed({
          lessonId,
          role: user?.default_layout,
          participantsCount: audioRef.current.participantCount,
          format: mime.format,
          reason,
        });
        void desktop?.recording.reportStatus({ phase: 'error', reason });
      }
    },
    [lessonId, publish, user?.default_layout],
  );

  useEffect(() => {
    const desktop = getSovliumDesktop();
    if (!desktop) return;
    return desktop.recording.onCommand((command) => {
      if (command.action === 'stop') {
        if (!recorderRef.current) {
          void desktop.recording.reportStatus({ phase: 'idle' });
          return;
        }
        void stopRef.current();
        return;
      }
      void startFromCommand(command);
    });
  }, [startFromCommand]);

  const start = useCallback(async () => {
    if (recorderRef.current) return;
    const desktop = getSovliumDesktop();
    if (!desktop) return;
    setPhase('starting');
    const mime = selectRecordingMimeType();
    const filename = formatLessonRecordingFilename(new Date(), mime.extension);
    const opened = await desktop.recording.open({
      defaultName: filename,
      mimeType: mime.mimeType,
    });
    if ('error' in opened) setPhase('idle');
  }, []);

  const startRef = useRef(start);
  startRef.current = start;

  useEffect(() => {
    useLessonRecordingControlsStore.getState().setSession({
      visible: Boolean(isTutor && audio.connected),
      phase,
      startedAt,
      start: () => void startRef.current(),
      stop: () => void stopRef.current(),
    });
  }, [audio.connected, isTutor, phase, startedAt]);

  useEffect(() => {
    return () => {
      useLessonRecordingControlsStore.getState().reset();
      void stopRef.current();
    };
  }, []);

  return null;
}

export function ElectronConferenceRecording() {
  if (!isElectronConferenceSurface()) return null;
  return (
    <>
      <LessonRecordingPresenceSync />
      <ElectronConferenceRecordingEngine />
      <ElectronPresenceRelay />
    </>
  );
}

type MainPresence = { active: boolean; startedAt: number | null };

export function ElectronMainRecordingControls() {
  const { t } = useTranslation('lessonRecording');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const conference = useElectronConferenceState();
  const [phase, setPhase] = useState<Phase>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<LessonRecordingFailureReason | null>(null);
  const [presence, setPresence] = useState<MainPresence>({ active: false, startedAt: null });

  useEffect(() => {
    const desktop = getSovliumDesktop();
    if (!desktop) return;
    const offStatus = desktop.recording.onStatus((status: LessonRecordingStatus) => {
      if (status.phase === 'recording') {
        setPhase('recording');
        setStartedAt(status.startedAt);
        setError(null);
        return;
      }
      if (status.phase === 'saved') {
        toast.success(t('saved'));
        setPhase('idle');
        setStartedAt(null);
        return;
      }
      if (status.phase === 'error') {
        setError(asFailureReason(status.reason));
        setPhase('idle');
        setStartedAt(null);
        return;
      }
      setPhase('idle');
      setStartedAt(null);
    });
    const offPresence = desktop.recording.onPresence(setPresence);
    return () => {
      offStatus();
      offPresence();
    };
  }, [t]);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (phase !== 'starting') return;
    const id = window.setTimeout(() => {
      if (phaseRef.current !== 'starting') return;
      setPhase('idle');
      setError((current) => current ?? 'conference_unavailable');
    }, 20_000);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'recording') return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [phase]);

  const start = async () => {
    const desktop = getSovliumDesktop();
    if (!desktop || phase !== 'idle') return;
    setPhase('starting');
    setError(null);
    const mime = selectRecordingMimeType();
    const filename = formatLessonRecordingFilename(new Date(), mime.extension);
    const opened = await desktop.recording.open({ defaultName: filename, mimeType: mime.mimeType });
    if ('error' in opened) {
      if (opened.error !== 'cancelled') {
        setError(opened.error);
        trackLessonRecordingFailed({
          role: user?.default_layout,
          format: mime.format,
          reason: opened.error,
        });
      }
      setPhase('idle');
    }
  };

  const stop = () => {
    setPhase('stopping');
    void getSovliumDesktop()?.recording.requestStop();
  };

  const location = useLocation();
  const onCallPage = location.pathname.includes('/call/');
  const startRef = useRef(start);
  startRef.current = start;
  const stopRef = useRef(stop);
  stopRef.current = stop;

  useEffect(() => {
    useLessonRecordingControlsStore.getState().setSession({
      visible: Boolean(isTutor && conference.active),
      phase,
      startedAt,
      start: () => void startRef.current(),
      stop: () => stopRef.current(),
    });
  }, [conference.active, isTutor, phase, startedAt]);

  useEffect(() => {
    return () => useLessonRecordingControlsStore.getState().reset();
  }, []);

  if (presence.active && !isTutor) {
    return <RecordingBar mode="student" error={error} />;
  }

  if (!isTutor || onCallPage) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[210] flex -translate-x-1/2">
      <div className="pointer-events-auto">
        <LessonRecordButton />
      </div>
    </div>
  );
}
