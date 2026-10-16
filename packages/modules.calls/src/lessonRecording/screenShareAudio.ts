import type { MixerAudioSource } from './audioMixer';

const SCREEN_SHARE_AUDIO = 'screen_share_audio';

type Publication = {
  source: string;
  trackSid: string;
  isSubscribed?: boolean;
  track?: { source?: string; mediaStreamTrack?: MediaStreamTrack } | null;
};

type PublicationList = { forEach: (cb: (publication: Publication) => void) => void };

type Participant = {
  identity: string;
  audioTrackPublications?: PublicationList;
  getTrackPublications?: () => Publication[];
};

type RoomLike = {
  localParticipant?: Participant;
  remoteParticipants: { forEach: (cb: (participant: Participant) => void) => void };
};

function publicationsOf(participant: Participant): Publication[] {
  if (participant.getTrackPublications) return participant.getTrackPublications();
  const list: Publication[] = [];
  participant.audioTrackPublications?.forEach((publication) => list.push(publication));
  return list;
}

function isScreenShareAudio(publication: Publication): boolean {
  if (publication.track?.source === SCREEN_SHARE_AUDIO) return true;
  return publication.source === SCREEN_SHARE_AUDIO;
}

/** Звук вкладки или экрана, который демонстрируют в конференции. Исходные треки не останавливаются. */
export function collectScreenShareAudio(room: RoomLike): MixerAudioSource[] {
  const sources: MixerAudioSource[] = [];
  const push = (identity: string, publication: Publication, remote: boolean) => {
    if (!isScreenShareAudio(publication)) return;
    if (remote && publication.isSubscribed === false) return;
    const track = publication.track?.mediaStreamTrack;
    if (!track || track.readyState === 'ended') return;
    sources.push({
      id: remote
        ? `share:remote:${identity}:${publication.trackSid}`
        : `share:local:${publication.trackSid}`,
      track,
    });
  };

  const local = room.localParticipant;
  if (local) {
    for (const publication of publicationsOf(local)) push(local.identity, publication, false);
  }
  room.remoteParticipants.forEach((participant) => {
    for (const publication of publicationsOf(participant)) {
      push(participant.identity, publication, true);
    }
  });
  return sources;
}

/**
 * Свой звук демонстрации берём из клона getDisplayMedia: трек LiveKit в Web Audio молчит.
 * Чужой звук демонстрации остаётся публикацией комнаты.
 */
export function mergeShareAudio(
  screenShare: MixerAudioSource[],
  displayTracks: MediaStreamTrack[],
): MixerAudioSource[] {
  const display = displayTracks
    .filter((track) => track.readyState === 'live')
    .map((track) => ({ id: `display:${track.id}`, track }));
  if (display.length === 0) return screenShare;
  return [...screenShare.filter((source) => !source.id.startsWith('share:local:')), ...display];
}
