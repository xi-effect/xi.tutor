import { AnimatePresence, motion } from 'motion/react';
import type { ActivityAttempt, ActivityDefinition, CheckStatus } from '../model/types';
import { TokenDndProvider } from './TokenDnd';
import { GapTextActivity } from './kinds/GapTextActivity';
import { MatchingActivity } from './kinds/MatchingActivity';
import { SortingActivity } from './kinds/SortingActivity';
import { OrderingActivity } from './kinds/OrderingActivity';
import { LabelImageActivity } from './kinds/LabelImageActivity';
import { MultipleChoiceActivity } from './kinds/MultipleChoiceActivity';
import { MysteryTilesActivity } from './kinds/MysteryTilesActivity';
import { RandomCardActivity } from './kinds/RandomCardActivity';

export function ActivityBody({
  definition,
  attempt,
  checkStatus,
  byItem,
  mode,
  onDefinition,
  onAttempt,
  interactLocked,
}: {
  definition: ActivityDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: ActivityDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked: boolean;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${definition.kind}-${mode}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full"
      >
        <TokenDndProvider>
          {definition.kind === 'gap-text' && (
            <GapTextActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              byItem={byItem}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
          {definition.kind === 'matching' && (
            <MatchingActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              byItem={byItem}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
          {definition.kind === 'sorting' && (
            <SortingActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              byItem={byItem}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
          {definition.kind === 'ordering' && (
            <OrderingActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              byItem={byItem}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
          {definition.kind === 'label-image' && (
            <LabelImageActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              byItem={byItem}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
          {definition.kind === 'multiple-choice' && (
            <MultipleChoiceActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              byItem={byItem}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
          {definition.kind === 'mystery-tiles' && (
            <MysteryTilesActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
          {definition.kind === 'random-card' && (
            <RandomCardActivity
              definition={definition}
              attempt={attempt}
              checkStatus={checkStatus}
              mode={mode}
              onDefinition={onDefinition}
              onAttempt={onAttempt}
              interactLocked={interactLocked}
            />
          )}
        </TokenDndProvider>
      </motion.div>
    </AnimatePresence>
  );
}
