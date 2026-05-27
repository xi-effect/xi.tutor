import { Button } from '@xipkg/button';
import { Textarea } from '@xipkg/textarea';
import { Trash, Eyeon, Eyeoff } from '@xipkg/icons';
import { stopEvent } from '../constants';
import { formatTime } from '../utils';
import type { AudioTimecode } from '../AudioShape';

type AudioTimecodeRowProps = {
  timecode: AudioTimecode;
  isTutor: boolean;
  canSeek: boolean;
  isInteractive: boolean;
  onSeek: (time: number) => void;
  onLabelChange: (tcId: string, label: string) => void;
  onToggleVisibility: (tcId: string) => void;
  onRemove: (tcId: string) => void;
};

export function AudioTimecodeRow({
  timecode: tc,
  isTutor,
  canSeek,
  isInteractive,
  onSeek,
  onLabelChange,
  onToggleVisibility,
  onRemove,
}: AudioTimecodeRowProps) {
  return (
    <div
      className="border-gray-10 group flex max-h-[96px] min-h-7 items-start gap-0 p-1"
      style={{ fontSize: 10, pointerEvents: isInteractive ? 'all' : 'none' }}
      data-audio-control=""
    >
      <Button
        type="button"
        variant="none"
        disabled={!canSeek}
        title={!canSeek ? 'Управление у репетитора' : undefined}
        className="text-gray-80 hover:text-brand-100 disabled:hover:text-gray-80 flex h-full w-12 shrink-0 items-start justify-center rounded-md p-2 pt-1 font-medium tabular-nums disabled:cursor-default disabled:opacity-70"
        style={{ pointerEvents: isInteractive ? 'all' : 'none', fontSize: 10 }}
        data-audio-control=""
        onPointerDown={isInteractive ? stopEvent : undefined}
        onClick={
          isInteractive
            ? (e) => {
                e.stopPropagation();
                if (canSeek) onSeek(tc.time);
              }
            : undefined
        }
      >
        {formatTime(tc.time)}
      </Button>

      {isTutor || tc.createdByStudent ? (
        <Textarea
          value={tc.label}
          placeholder="Описание..."
          maxLength={150}
          maxRows={3}
          hideCounter
          className="text-gray-80 placeholder:text-gray-40 flex-1 resize-none border-none bg-transparent p-1 shadow-none outline-none"
          style={{
            pointerEvents: isInteractive ? 'all' : 'none',
            fontSize: 10,
            lineHeight: 1.35,
          }}
          data-audio-control=""
          onPointerDown={isInteractive ? stopEvent : undefined}
          onClick={isInteractive ? stopEvent : undefined}
          onChange={(e) => onLabelChange(tc.id, e.target.value)}
        />
      ) : (
        <span
          className="text-gray-80 min-w-0 flex-1 p-1 wrap-break-word whitespace-pre-wrap"
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

      {(isTutor || tc.createdByStudent) && (
        <div
          className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ pointerEvents: isInteractive ? 'all' : 'none' }}
          data-audio-control=""
          onPointerDown={isInteractive ? stopEvent : undefined}
          onClick={isInteractive ? stopEvent : undefined}
        >
          {isTutor && (
            <Button
              type="button"
              variant="none"
              className="hover:text-gray-80 h-5 min-w-5 p-0 text-gray-50"
              title={tc.visibleToAll ? 'Скрыть от учеников' : 'Показать ученикам'}
              onPointerDown={isInteractive ? stopEvent : undefined}
              onClick={isInteractive ? () => onToggleVisibility(tc.id) : undefined}
            >
              {tc.visibleToAll ? (
                <Eyeon className="fill-gray-80 h-3 w-3" />
              ) : (
                <Eyeoff className="fill-gray-80 h-3 w-3" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="none"
            className="group hover:text-red-60 h-5 min-w-5 p-0 text-gray-50"
            title={tc.createdByStudent ? 'Удалить' : undefined}
            onPointerDown={isInteractive ? stopEvent : undefined}
            onClick={isInteractive ? () => onRemove(tc.id) : undefined}
          >
            <Trash className="fill-gray-80 group-hover:fill-red-60 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
