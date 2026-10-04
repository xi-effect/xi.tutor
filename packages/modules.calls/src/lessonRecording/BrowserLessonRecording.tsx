import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { subscribeDisplayCaptureAudio } from 'common.platform';
import { useCurrentUser } from 'common.services';
import {
  LessonRecordingPresenceSync,
  useConferenceAudioSources,
  useCurrentClassroomId,
  useLessonRecordingPresence,
  usePublishLessonRecording,
} from '@xipkg/calls-hooks';
import { useLessonRecordingControlsStore } from '@xipkg/calls-store';
import { RecordingBar } from './RecordingBar';
import { ConferenceAudioMixer } from './audioMixer';
import { LessonRecorder } from './LessonRecorder';
import { captureLessonTab, mapCaptureError, sourcesAlongsidePlayback } from './capture';
import { mergeShareAudio } from './screenShareAudio';
import { useScreenShareAudioSources } from './useScreenShareAudioSources';
import { createBrowserRecordingSink } from './sinks';
import { formatLessonRecordingFilename } from './filename';
import { selectRecordingMimeType } from './mime';
import {
  trackLessonRecordingCompleted,
  trackLessonRecordingFailed,
  trackLessonRecordingStarted,
} from './analytics';
import type { LessonRecordingFailureReason } from './types';

type Phase = 'idle' | 'starting' | 'recording' | 'stopping';

const ERROR_KEYS: Partial<Record<LessonRecordingFailureReason, string>> = {
  capture_denied: 'captureDenied',
  capture_unsupported: 'unsupported',
  desktop_rejected: 'desktopRejected',
  conference_unavailable: 'conferenceUnavailable',
};

export function BrowserLessonRecording() {
  const { t } = useTranslation('lessonRecording');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const audio = useConferenceAudioSources();
  const screenShare = useScreenShareAudioSources();
  const publish = usePublishLessonRecording();
  const presence = useLessonRecordingPresence();
  const lessonId = useCurrentClassroomId();
  const [phase, setPhase] = useState<Phase>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<LessonRecordingFailureReason | null>(null);
  const recorderRef = useRef<LessonRecorder | null>(null);
  const audioRef = useRef(audio);
  const screenShareRef = useRef(screenShare);
  const displayAudioRef = useRef<MediaStreamTrack[]>([]);
  const [displayAudio, setDisplayAudio] = useState<MediaStreamTrack[]>([]);
  const playbackIncludesCallRef = useRef(false);
  audioRef.current = audio;
  screenShareRef.current = screenShare;

  useEffect(
    () =>
      subscribeDisplayCaptureAudio((tracks) => {
        displayAudioRef.current = tracks;
        setDisplayAudio(tracks);
      }),
    [],
  );

  useEffect(() => {
    recorderRef.current?.setAudioSources(
      sourcesAlongsidePlayback(
        audio.sources,
        playbackIncludesCallRef.current,
        mergeShareAudio(screenShare, displayAudio),
      ),
    );
  }, [audio.sources, displayAudio, screenShare]);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    recorderRef.current = null;
    playbackIncludesCallRef.current = false;
    setPhase('stopping');
    publish(false, null);
    const participantsCount = audioRef.current.participantCount;
    try {
      const result = await recorder.stop();
      toast.success(t('saved'));
      trackLessonRecordingCompleted({
        lessonId,
        role: user?.default_layout,
        participantsCount,
        format: result.format,
        durationSeconds: result.durationSeconds,
        sizeBytes: result.sizeBytes,
      });
      setError(null);
    } catch {
      setError('sink_error');
      trackLessonRecordingFailed({
        lessonId,
        role: user?.default_layout,
        participantsCount,
        format: selectRecordingMimeType().format,
        reason: 'sink_error',
        durationSeconds: Math.max(0, Math.round((Date.now() - recorder.startedAt) / 1000)),
      });
    } finally {
      setStartedAt(null);
      setPhase('idle');
    }
  }, [lessonId, publish, t, user?.default_layout]);

  const stopRef = useRef(stop);
  stopRef.current = stop;
  const startRef = useRef<() => void>(() => undefined);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    useLessonRecordingControlsStore.getState().setSession({
      visible: Boolean(isTutor && audio.connected),
      phase,
      startedAt,
      start: () => startRef.current(),
      stop: () => void stopRef.current(),
    });
  }, [audio.connected, isTutor, phase, startedAt]);

  useEffect(() => {
    return () => useLessonRecordingControlsStore.getState().reset();
  }, []);

  useEffect(() => {
    if (phase !== 'recording') return;
    if (audio.connected) return;
    void stopRef.current();
  }, [audio.connected, phase]);

  useEffect(() => {
    if (phase !== 'recording') return;
    const onLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const onPageHide = () => {
      void stopRef.current();
    };
    window.addEventListener('beforeunload', onLeave);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [phase]);

  const start = async () => {
    if (phaseRef.current !== 'idle' || !audioRef.current.connected) return;
    phaseRef.current = 'starting';
    setPhase('starting');
    setError(null);
    const mixer = new ConferenceAudioMixer();
    void mixer.resume();
    const mime = selectRecordingMimeType();
    const filename = formatLessonRecordingFilename(new Date(), mime.extension);
    let captured: Awaited<ReturnType<typeof captureLessonTab>> | null = null;
    let sinkCreated = false;
    let recorderOwned = false;
    try {
      captured = await captureLessonTab();
      const playbackIncludesCall = captured.playbackIncludesCall && Boolean(captured.playbackTrack);
      playbackIncludesCallRef.current = playbackIncludesCall;
      const sink = await createBrowserRecordingSink(filename);
      sinkCreated = true;
      const recorder = await LessonRecorder.start({
        mixer,
        videoStream: captured.video,
        extraStream: captured.extraStream,
        playbackTrack: captured.playbackTrack,
        audioSources: sourcesAlongsidePlayback(
          audioRef.current.sources,
          playbackIncludesCall,
          mergeShareAudio(screenShareRef.current, displayAudioRef.current),
        ),
        sink,
        mimeType: mime.mimeType,
        format: mime.format,
      });
      captured.playbackTrack?.addEventListener(
        'ended',
        () => {
          playbackIncludesCallRef.current = false;
          recorderRef.current?.setAudioSources(
            sourcesAlongsidePlayback(
              audioRef.current.sources,
              false,
              mergeShareAudio(screenShareRef.current, displayAudioRef.current),
            ),
          );
        },
        { once: true },
      );
      recorderOwned = true;
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
    } catch (caught) {
      playbackIncludesCallRef.current = false;
      if (!recorderOwned) await mixer.close().catch(() => undefined);
      if (!sinkCreated) {
        captured?.video.getTracks().forEach((track) => track.stop());
        captured?.extraStream?.getTracks().forEach((track) => track.stop());
      }
      const captureReason = mapCaptureError(caught);
      if (captureReason === 'cancelled') {
        setPhase('idle');
        return;
      }
      const reason: LessonRecordingFailureReason =
        captureReason === 'unknown' ? 'recorder_error' : captureReason;
      setError(reason);
      setPhase('idle');
      toast.error(t(ERROR_KEYS[reason] ?? 'error'));
      trackLessonRecordingFailed({
        lessonId,
        role: user?.default_layout,
        participantsCount: audioRef.current.participantCount,
        format: mime.format,
        reason,
      });
    }
  };

  startRef.current = () => void start();

  if (presence.active && !isTutor) {
    return <RecordingBar mode="student" error={error} />;
  }

  return null;
}

export function WebLessonRecording() {
  return (
    <>
      <LessonRecordingPresenceSync />
      <BrowserLessonRecording />
    </>
  );
}
