import type { AudioTimecode } from '../AudioShape';
import { AudioTimecodeRow } from './AudioTimecodeRow';

type AudioTimecodesListProps = {
  timecodes: AudioTimecode[];
  isTutor: boolean;
  onSeek: (time: number) => void;
  onLabelChange: (tcId: string, label: string) => void;
  onToggleVisibility: (tcId: string) => void;
  onRemove: (tcId: string) => void;
};

export function AudioTimecodesList({
  timecodes,
  isTutor,
  onSeek,
  onLabelChange,
  onToggleVisibility,
  onRemove,
}: AudioTimecodesListProps) {
  if (timecodes.length === 0) return null;

  return (
    <div className="border-gray-10 flex flex-col border-t" style={{ pointerEvents: 'none' }}>
      {timecodes.map((tc) => (
        <AudioTimecodeRow
          key={tc.id}
          timecode={tc}
          isTutor={isTutor}
          onSeek={onSeek}
          onLabelChange={onLabelChange}
          onToggleVisibility={onToggleVisibility}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
