import { useAudioWaveform } from '@livekit/components-react';
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
import { Participant, Track } from 'livekit-client';
import { ChevronBottom, MicrophoneOff, RedLine } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { ParticipantName, TrackMutedIndicator } from '../Participant';
import { RaisedHandIndicator } from '../Participant/RaisedHandIndicator';
import { cn } from '@xipkg/utils';

type CompactCallCollapsedBarProps = {
  participant: Participant | null;
  audioTrack?: LocalAudioTrack | RemoteAudioTrack | null;
  onExpand: () => void;
  className?: string;
};

export function CompactCallCollapsedBar({
  participant,
  audioTrack,
  onExpand,
  className,
}: CompactCallCollapsedBarProps) {
  const { bars } = useAudioWaveform(audioTrack ?? undefined, {
    barCount: 24,
    volMultiplier: 4,
    updateInterval: 50,
  });
  return (
    <div
      className={cn(
        'bg-gray-20 flex items-center gap-2 rounded-2xl px-2 py-2 shadow-lg',
        className,
      )}
    >
      {/* Тот же блок, что и в плитке участника ВКС: микрофон + имя */}
      <div className="bg-gray-0/80 flex h-6 max-w-[45%] min-w-0 shrink gap-1.5 rounded-lg px-1.5 py-1 backdrop-blur">
        {participant ? (
          <>
            <TrackMutedIndicator
              trackRef={{
                participant,
                source: Track.Source.Microphone,
              }}
              show="muted"
              style={{ marginRight: '0.45rem', background: 'transparent' }}
            />
            <span className="flex min-w-0 truncate">
              <ParticipantName participant={participant} />
            </span>
          </>
        ) : (
          <>
            <div className="relative w-3 shrink-0">
              <MicrophoneOff className="absolute h-4 w-4 fill-gray-100" />
              <RedLine className="fill-red-80 absolute h-4 w-4" />
            </div>
            <span className="text-xs-base-size leading-[16px] text-gray-100">Нет участников</span>
          </>
        )}
      </div>
      {participant && <RaisedHandIndicator participantId={participant.identity ?? 'unknown'} />}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5 py-1">
        {bars.length > 0 ? (
          <div className="flex h-4 items-end justify-center gap-0.5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="bg-brand-80 w-0.5 min-w-[2px] rounded-full transition-all duration-75"
                style={{ height: `${Math.min(100, Math.max(20, h * 150))}%` }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-brand-60 h-2 w-12 rounded-full" />
        )}
      </div>
      <Button
        size="icon"
        variant="none"
        onClick={onExpand}
        className="bg-brand-100 hover:bg-brand-100/80 h-8 w-8 shrink-0 rounded-xl p-0 text-gray-100"
        aria-label="Развернуть"
      >
        <ChevronBottom className="fill-gray-0 h-4 w-4" />
      </Button>
    </div>
  );
}
