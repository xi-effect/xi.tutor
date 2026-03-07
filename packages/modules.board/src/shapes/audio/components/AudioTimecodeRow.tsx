import { Button } from '@xipkg/button';
import { Textarea } from '@xipkg/textarea';
import { Trash, Eyeon, Eyeoff } from '@xipkg/icons';
import { stopEvent } from '../constants';
import { formatTime } from '../utils';
import type { AudioTimecode } from '../AudioShape';

type AudioTimecodeRowProps = {
  timecode: AudioTimecode;
  isTutor: boolean;
  onSeek: (time: number) => void;
  onLabelChange: (tcId: string, label: string) => void;
  onToggleVisibility: (tcId: string) => void;
  onRemove: (tcId: string) => void;
};

export function AudioTimecodeRow({
  timecode: tc,
  isTutor,
  onSeek,
  onLabelChange,
  onToggleVisibility,
  onRemove,
}: AudioTimecodeRowProps) {
  return (
    <div
      className="border-gray-10 group flex max-h-[96px] min-h-7 items-start gap-0 p-1"
      style={{ fontSize: 10, pointerEvents: 'all' }}
    >
      <Button
        type="button"
        variant="none"
        className="text-gray-80 hover:text-brand-100 flex h-full w-12 shrink-0 items-start justify-center rounded-md p-2 pt-1 font-medium tabular-nums"
        style={{ pointerEvents: 'all', fontSize: 10 }}
        onPointerDown={stopEvent}
        onClick={(e) => {
          e.stopPropagation();
          onSeek(tc.time);
        }}
      >
        {formatTime(tc.time)}
      </Button>

      {isTutor ? (
        <Textarea
          value={tc.label}
          placeholder="Описание..."
          rows={3}
          // variant="s"
          className="text-gray-80 placeholder:text-gray-40 max-h-[96px] min-h-0 min-w-0 flex-1 resize-none border-none bg-transparent p-1 shadow-none outline-none"
          style={{
            pointerEvents: 'all',
            fontSize: 10,
            lineHeight: 1.35,
          }}
          onPointerDown={stopEvent}
          onClick={stopEvent}
          onChange={(e) => onLabelChange(tc.id, e.target.value)}
        />
      ) : (
        <span
          className="text-gray-80 min-w-0 flex-1 wrap-break-word whitespace-pre-wrap"
          style={{
            lineHeight: 1.35,
            maxHeight: 'calc(3 * 1.35em)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const,
          }}
        >
          {tc.label || '—'}
        </span>
      )}

      {isTutor && (
        <div
          className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ pointerEvents: 'all' }}
          onPointerDown={stopEvent}
          onClick={stopEvent}
        >
          <Button
            type="button"
            variant="none"
            className="hover:text-gray-80 h-5 min-w-5 p-0 text-gray-50"
            title={tc.visibleToAll ? 'Скрыть от учеников' : 'Показать ученикам'}
            onPointerDown={stopEvent}
            onClick={() => onToggleVisibility(tc.id)}
          >
            {tc.visibleToAll ? (
              <Eyeon className="fill-gray-80 h-3 w-3" />
            ) : (
              <Eyeoff className="fill-gray-80 h-3 w-3" />
            )}
          </Button>
          <Button
            type="button"
            variant="none"
            className="group hover:text-red-60 h-5 min-w-5 p-0 text-gray-50"
            onPointerDown={stopEvent}
            onClick={() => onRemove(tc.id)}
          >
            <Trash className="fill-gray-80 group-hover:fill-red-60 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
