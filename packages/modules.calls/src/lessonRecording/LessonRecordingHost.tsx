import { isElectronMainSurface, isElectronConferenceSurface } from 'common.platform';
import {
  ElectronConferenceRecording,
  ElectronMainRecordingControls,
} from './ElectronLessonRecording';
import { WebLessonRecording } from './BrowserLessonRecording';

export function LessonRecordingHost() {
  if (isElectronConferenceSurface()) return <ElectronConferenceRecording />;
  if (isElectronMainSurface()) return <ElectronMainRecordingControls />;
  return <WebLessonRecording />;
}
