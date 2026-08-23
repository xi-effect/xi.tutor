import { Button } from '@xipkg/button';
import { Trash } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type {
  ActivityAttempt,
  CheckStatus,
  RandomCardDefinition,
  RandomCardItem,
} from '../../model/types';
import { activityCardClass, activityCardTintStyle } from '../activityUi';
import { ActivityTextareaField } from '../activityFields';
import { ActivityImage, ActivityImageIconButton } from '../ActivityImage';
import { createEmptyAttempt } from '../../model/defaults';
import { randomCardTransition, randomCardVariants } from '../activityUiMotion';
import { BOARD_COLORS, getBoardColorOption } from '../../../utils/boardColors';
import { ColorDot } from '../../../ui/components/canvas/ColorDot';
import { boardDropdownZClass, boardIconClass, boardMenuSurfaceClass } from '../../../ui/boardTheme';

type Props = {
  definition: RandomCardDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  mode: 'edit' | 'play';
  onDefinition: (definition: RandomCardDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

function patchCard(
  definition: RandomCardDefinition,
  cardId: string,
  patch: Partial<RandomCardItem>,
): RandomCardDefinition {
  return {
    ...definition,
    cards: definition.cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card)),
  };
}

function CardColorButton({
  value,
  onChange,
  noneLabel,
  colorLabel,
}: {
  value?: string;
  onChange: (color: string) => void;
  noneLabel: string;
  colorLabel: string;
}) {
  const editor = useEditor();
  const [open, setOpen] = useState(false);
  const option = value ? getBoardColorOption(value) : undefined;

  const stop = (event: SyntheticEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  const pick = (color: string) => {
    onChange(color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-board-control=""
          title={colorLabel}
          aria-label={colorLabel}
          className="text-text-primary hover:bg-background-hover data-[state=open]:bg-background-hover flex size-7 shrink-0 items-center justify-center rounded-lg p-0"
        >
          <span
            className={cn(
              'size-4 rounded-full border-2',
              option ? 'border-transparent' : 'border-gray-60 bg-gray-0',
            )}
            style={option ? { backgroundColor: option.cssVar } : undefined}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        data-board-control=""
        onPointerDown={stop}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          boardMenuSurfaceClass,
          boardDropdownZClass,
          'pointer-events-auto z-80 flex w-46 flex-wrap gap-1.5 rounded-xl p-2',
        )}
      >
        <button
          type="button"
          data-board-control=""
          title={noneLabel}
          aria-label={noneLabel}
          onPointerDown={stop}
          onClick={() => pick('')}
          className={cn(
            'border-gray-60 bg-gray-0 size-6 shrink-0 rounded-full border-2',
            !value ? 'ring-border-strong ring-2 ring-offset-1' : 'hover:scale-110',
          )}
        />
        {BOARD_COLORS.map(({ name, class: colorClass, cssVar }) => (
          <ColorDot
            key={name}
            colorClass={colorClass}
            colorCss={cssVar}
            isSelected={value === name}
            onClick={() => pick(name)}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}

function CardFace({ card, emptyLabel }: { card?: RandomCardItem; emptyLabel: string }) {
  const tint = activityCardTintStyle(card?.color);
  return (
    <div
      className={`${activityCardClass} flex h-full min-h-0 flex-col items-center justify-center gap-2 overflow-hidden px-3 py-3 text-center`}
      style={tint}
    >
      {card?.imageSrc ? (
        <ActivityImage src={card.imageSrc} className="max-h-32 w-full object-contain" />
      ) : null}
      <span className="min-w-0">{card?.text || emptyLabel}</span>
    </div>
  );
}

export function RandomCardActivity({
  definition,
  attempt,
  mode,
  onDefinition,
  onAttempt,
  interactLocked = false,
}: Props) {
  const { t } = useTranslation('board');
  const current = definition.cards.find((card) => card.id === attempt.currentCardId);
  const [direction, setDirection] = useState(1);

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-3">
        {definition.cards.map((card) => (
          <div key={card.id} className="flex items-start gap-1">
            <div className="group/field relative min-w-0 flex-1">
              <ActivityTextareaField
                className="min-h-14 pr-16"
                style={activityCardTintStyle(card.color)}
                value={card.text}
                onChange={(event) =>
                  onDefinition(patchCard(definition, card.id, { text: event.target.value }))
                }
              />
              <div
                data-board-control=""
                className={cn(
                  'bg-background-page/90 absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-lg p-0.5',
                  'pointer-events-none opacity-0 transition-opacity',
                  'group-hover/field:pointer-events-auto group-hover/field:opacity-100',
                  'has-data-[state=open]:pointer-events-auto has-data-[state=open]:opacity-100',
                )}
              >
                <ActivityImageIconButton
                  value={card.imageSrc}
                  onChange={(imageSrc) =>
                    onDefinition(patchCard(definition, card.id, { imageSrc }))
                  }
                />
                <CardColorButton
                  value={card.color}
                  colorLabel={t('activity.cardColor')}
                  noneLabel={t('activity.cardColorNone')}
                  onChange={(color) => onDefinition(patchCard(definition, card.id, { color }))}
                />
              </div>
            </div>
            <button
              type="button"
              data-board-control=""
              disabled={definition.cards.length <= 1}
              title={t('activity.removeCard')}
              aria-label={t('activity.removeCard')}
              className="text-text-secondary hover:bg-background-hover hover:text-text-primary mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg p-0 disabled:opacity-30"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => {
                if (definition.cards.length <= 1) return;
                const next = {
                  ...definition,
                  cards: definition.cards.filter((entry) => entry.id !== card.id),
                };
                onDefinition(next);
                onAttempt(createEmptyAttempt(next));
              }}
            >
              <Trash className={cn('size-4', boardIconClass)} />
            </button>
          </div>
        ))}
        <Button
          variant="default"
          size="s"
          className="h-7 self-start px-3 text-xs"
          data-board-control=""
          onClick={() =>
            onDefinition({
              ...definition,
              cards: [...definition.cards, { id: createActivityId(), text: t('activity.card') }],
            })
          }
        >
          {t('activity.addCard')}
        </Button>
      </div>
    );
  }

  const draw = () => {
    setDirection(1);
    if (definition.noRepeat) {
      const [nextId, ...rest] = attempt.cardQueue;
      if (!nextId) return;
      onAttempt({
        ...attempt,
        cardQueue: rest,
        currentCardId: nextId,
        drawnCount: attempt.drawnCount + 1,
      });
      return;
    }
    const pool = definition.cards.map((card) => card.id);
    if (!pool.length) return;
    const nextId = pool[Math.floor(Math.random() * pool.length)] ?? null;
    onAttempt({ ...attempt, currentCardId: nextId, drawnCount: attempt.drawnCount + 1 });
  };

  const exhausted = definition.noRepeat && attempt.cardQueue.length === 0 && attempt.currentCardId;
  const stackTint = activityCardTintStyle(current?.color);

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="relative min-h-44 flex-1" style={{ perspective: 1400 }}>
        <div
          aria-hidden
          className="border-border-default bg-background-subtle absolute inset-x-4 inset-y-3 translate-y-3 scale-[0.92] rounded-xl border"
          style={stackTint}
        />
        <div
          aria-hidden
          className="border-border-default bg-background-page absolute inset-x-2 inset-y-1.5 translate-y-1.5 scale-[0.96] rounded-xl border"
          style={stackTint}
        />
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={`${current?.id ?? 'empty'}-${attempt.drawnCount}`}
            custom={direction}
            variants={randomCardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={randomCardTransition}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          >
            <CardFace card={current} emptyLabel={t('activity.drawPrompt')} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="default"
            size="s"
            className="h-7 px-3 text-xs"
            data-board-control=""
            disabled={Boolean(exhausted) || interactLocked}
            onClick={draw}
          >
            {t('activity.draw')}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button
            variant="secondary"
            size="s"
            className="h-7 px-3 text-xs"
            data-board-control=""
            disabled={interactLocked}
            onClick={() => {
              setDirection(-1);
              onAttempt(createEmptyAttempt(definition));
            }}
          >
            {t('activity.reshuffle')}
          </Button>
        </motion.div>
        {definition.noRepeat && (
          <motion.span
            key={attempt.drawnCount}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-text-secondary text-xs tabular-nums"
          >
            {attempt.drawnCount} / {definition.cards.length}
          </motion.span>
        )}
      </div>
    </div>
  );
}
