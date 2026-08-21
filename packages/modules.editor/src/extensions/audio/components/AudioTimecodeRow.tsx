import { Button } from '@xipkg/button';
import { Textarea } from '@xipkg/textarea';
import { Trash, Eyeon, Eyeoff } from '@xipkg/icons';
import { stopEvent } from '../constants';
import { formatTime } from '../../../utils/formatMedia';
import type { AudioTimecode } from '../audioTypes';
import { useTranslation } from 'react-i18next';

type AudioTimecodeRowProps = {
  timecode: AudioTimecode;
  isTutor: boolean;
  canSeek: boolean;
  onSeek: (time: number) => void;
  onLabelChange: (tcId: string, label: string) => void;
  onToggleVisibility: (tcId: string) => void;
  onRemove: (tcId: string) => void;
};

export function AudioTimecodeRow({
  timecode: tc,
  isTutor,
  canSeek,
  onSeek,
  onLabelChange,
  onToggleVisibility,
  onRemove,
}: AudioTimecodeRowProps) {
  const { t } = useTranslation('editor');
  return (
    <div
      className="border-border-default group flex max-h-[96px] min-h-7 items-start gap-0 p-1"
      style={{ fontSize: 10 }}
      data-audio-control=""
    >
      <Button
        type="button"
        variant="none"
        disabled={!canSeek}
        title={!canSeek ? t('audio.tutorControls') : undefined}
        className="text-text-primary hover:text-text-link disabled:hover:text-text-primary flex h-full w-12 shrink-0 items-start justify-center rounded-md p-2 pt-1 font-medium tabular-nums disabled:cursor-default disabled:opacity-70"
        style={{ fontSize: 10 }}
        data-audio-control=""
        onPointerDown={(e) => {
          stopEvent(e);
          if (e.button !== 0 || !canSeek) return;
          onSeek(tc.time);
        }}
      >
        {formatTime(tc.time)}
      </Button>

      {isTutor || tc.createdByStudent ? (
        <Textarea
          value={tc.label}
          placeholder={t('audio.descriptionPlaceholder')}
          maxLength={150}
          maxRows={3}
          hideCounter
          className="text-text-primary placeholder:text-text-disabled flex-1 resize-none border-none bg-transparent p-1 shadow-none outline-none"
          style={{ fontSize: 10, lineHeight: 1.35 }}
          data-audio-control=""
          onPointerDown={stopEvent}
          onClick={stopEvent}
          onKeyDown={stopEvent}
          onChange={(e) => onLabelChange(tc.id, e.target.value)}
        />
      ) : (
        <span
          className="text-text-primary min-w-0 flex-1 p-1 wrap-break-word whitespace-pre-wrap"
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
          data-audio-control=""
          onPointerDown={stopEvent}
          onClick={stopEvent}
        >
          {isTutor && (
            <Button
              type="button"
              variant="none"
              className="hover:text-text-primary text-text-muted h-5 min-w-5 p-0"
              title={tc.visibleToAll ? t('audio.hideFromStudents') : t('audio.showToStudents')}
              onPointerDown={(e) => {
                stopEvent(e);
                if (e.button !== 0) return;
                onToggleVisibility(tc.id);
              }}
            >
              {tc.visibleToAll ? (
                <Eyeon className="fill-icon-primary h-3 w-3" />
              ) : (
                <Eyeoff className="fill-icon-primary h-3 w-3" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="none"
            className="group hover:text-text-danger text-text-muted h-5 min-w-5 p-0"
            title={tc.createdByStudent ? t('audio.delete') : undefined}
            onPointerDown={(e) => {
              stopEvent(e);
              if (e.button !== 0) return;
              onRemove(tc.id);
            }}
          >
            <Trash className="fill-icon-primary group-hover:fill-icon-danger h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
