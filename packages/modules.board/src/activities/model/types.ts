import type { ActivityKind } from './kinds';

export type GapInputMode = 'input' | 'choice' | 'drag';
export type CheckStatus = 'idle' | 'checked' | 'revealed';
export type ItemStatus = 'idle' | 'correct' | 'wrong';

export type ActivityMedia = {
  text: string;
  imageSrc?: string;
};

export type ActivityGap = {
  id: string;
  answers: string[];
  input: GapInputMode;
  choices: string[];
};

export type GapTextDefinition = {
  kind: 'gap-text';
  sourceText: string;
  gaps: ActivityGap[];
  bank: string[];
};

export type MatchingItem = ActivityMedia & { id: string };

export type MatchingDefinition = {
  kind: 'matching';
  mode: 'connect' | 'drag';
  left: MatchingItem[];
  right: MatchingItem[];
  pairs: Record<string, string>;
};

export type SortingCategory = { id: string; title: string };
export type SortingItem = ActivityMedia & { id: string; categoryId: string };

export type SortingDefinition = {
  kind: 'sorting';
  categories: SortingCategory[];
  items: SortingItem[];
};

export type OrderingItem = ActivityMedia & { id: string };

export type OrderingDefinition = {
  kind: 'ordering';
  items: OrderingItem[];
};

export type LabelHotspot = {
  id: string;
  x: number;
  y: number;
  label: string;
};

export type LabelImageDefinition = {
  kind: 'label-image';
  imageSrc: string;
  hotspots: LabelHotspot[];
  extraLabels: { id: string; text: string }[];
};

export type ChoiceOption = { id: string; text: string; correct: boolean };

export type MultipleChoiceDefinition = {
  kind: 'multiple-choice';
  question: string;
  multiple: boolean;
  randomize: boolean;
  options: ChoiceOption[];
};

export type MysteryTile = ActivityMedia & { id: string };

export type MysteryTilesDefinition = {
  kind: 'mystery-tiles';
  columns: number;
  tiles: MysteryTile[];
};

export type RandomCardItem = { id: string; text: string; imageSrc?: string; color?: string };

export type RandomCardDefinition = {
  kind: 'random-card';
  cards: RandomCardItem[];
  noRepeat: boolean;
};

export type ActivityDefinition =
  | GapTextDefinition
  | MatchingDefinition
  | SortingDefinition
  | OrderingDefinition
  | LabelImageDefinition
  | MultipleChoiceDefinition
  | MysteryTilesDefinition
  | RandomCardDefinition;

export type ActivityAttempt = {
  values: Record<string, string>;
  selected: Record<string, boolean>;
  placements: Record<string, string | null>;
  connections: Record<string, string | null>;
  order: string[];
  optionOrder: string[];
  bankOrder: string[];
  revealed: Record<string, boolean>;
  seed: number;
  cardQueue: string[];
  currentCardId: string | null;
  drawnCount: number;
};

export type ValidationResult = {
  correct: number;
  total: number;
  byItem: Record<string, boolean>;
};

export type ActivityKindOf<K extends ActivityKind> = Extract<ActivityDefinition, { kind: K }>;
