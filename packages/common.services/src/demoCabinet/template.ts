/**
 * Единый шаблон демонстрационного кабинета.
 * `DEMO_CABINET_TEMPLATE_VERSION` увеличивают, когда меняется наполнение:
 * новую версию получают только пользователи, у которых кабинет ещё не инициализирован.
 */

export const DEMO_CABINET_TEMPLATE_VERSION = 1;

export const DEMO_CABINET_FLAG_KEY = 'demo_cabinet_initialized';

export const DEMO_CABINET_NAMES = {
  classroom: 'Демонстрационный кабинет',
  board: 'Демонстрационная доска',
  note: 'Знакомство с продуктом',
} as const;

export const DEMO_CABINET_BOARD_COPY = {
  welcomeTitle: 'Демонстрационная доска',
  welcomeBody:
    'Это общая доска кабинета. На ней удобно разобрать тему, собрать шаги занятия и оставить итог. Любой элемент можно передвинуть, изменить или удалить.',
  welcomeHint:
    'Дважды щёлкните по тексту, чтобы отредактировать его. Перетащите элемент, чтобы сдвинуть.',
  elementsTitle: 'Какие элементы есть на доске',
  rectangle: 'Фигура',
  ellipse: 'Контур',
  stickerA: 'Стикер',
  stickerB: 'Вместе',
  flipFront: 'Вопрос',
  flipBack: 'Ответ',
  elementsHint:
    'Рамка собирает тему в один блок. Два стикера ниже сгруппированы и двигаются вместе. Свой объект добавляется с панели: карандаш, фигура, стрелка, стикер или файл.',
  workflowTitle: 'От идеи до результата',
  workflowIntro: 'Связи держат шаги вместе: если передвинуть карточку, стрелка останется на ней.',
  steps: ['Идея', 'План', 'Занятие', 'Итог'] as const,
  workflowHint:
    'Рисунок от руки, комментарий, картинку и файл нельзя вложить в пример заранее. Их добавляют с панели инструментов уже на доске.',
  activityTitle: 'Упражнение',
  activityQuestion: 'Где ученик видит материалы этого кабинета?',
  activityOptions: [
    { text: 'Только на компьютере репетитора', correct: false },
    { text: 'В кабинете, если материалу открыт доступ', correct: true },
    { text: 'В отдельном черновике вне кабинета', correct: false },
  ] as const,
} as const;

export const DEMO_CABINET_NOTE_COPY = {
  title: 'Знакомство с продуктом',
  lead: 'Этот кабинет собран для первого знакомства. В нём уже есть демонстрационная доска и эта заметка. Вы владелец материалов: их можно свободно редактировать и удалять. Другие участники не добавлены.',
  formatTitle: 'Как оформляется заметка',
  formatLeadBefore: 'Текст поддерживает ',
  bold: 'жирное',
  formatMiddle: ' и ',
  italic: 'курсивное',
  formatAfterBold: ' начертание, ',
  underline: 'подчёркивание',
  formatAfterUnderline: ' и ',
  strike: 'зачёркивание',
  formatEnd: '.',
  bullets: [
    'Маркированный список для идей и тезисов',
    'Заголовки трёх уровней, чтобы делить заметку на части',
  ],
  ordered: ['Нумерованный список задаёт порядок шагов', 'Пункты можно менять местами и удалять'],
  quote: 'Заметку удобно вести как план занятия: тема, ход урока и то, что нужно повторить.',
  align: 'Этот абзац выровнен по центру.',
  code: 'тема\nход занятия\nитог',
  scenarioTitle: 'Как занятие проходит вместе',
  scenario: [
    'Пригласите ученика в кабинет по ссылке',
    'Откройте демонстрационную доску на уроке',
    'Правки видят те, кому открыт доступ к материалу',
  ],
  boardLink: 'Демонстрационная доска',
  boardFallback:
    'Демонстрационная доска лежит в этом же кабинете. Откройте её из списка материалов.',
  checklistTitle: 'С чего начать',
  checklist: [
    'Откройте демонстрационную доску',
    'Передвиньте любой элемент',
    'Измените текст стикера',
    'Добавьте свой объект с панели',
    'Вернитесь к заметке и отметьте пункты',
  ],
  hintTitle: 'Что включается с панели',
  hint: 'Картинки, аудио, файлы и рисунок от руки добавляются кнопками редактора. В готовом тексте их не показать, пока файл не выбран.',
} as const;

export type DemoNoteMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type DemoNoteNode = {
  type: string;
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: DemoNoteMark[];
  content?: DemoNoteNode[];
};

const text = (value: string, marks?: DemoNoteMark[]): DemoNoteNode =>
  marks ? { type: 'text', text: value, marks } : { type: 'text', text: value };

const paragraph = (content: DemoNoteNode[], attrs?: Record<string, unknown>): DemoNoteNode => ({
  type: 'paragraph',
  ...(attrs ? { attrs } : {}),
  content,
});

const heading = (level: 1 | 2 | 3, value: string): DemoNoteNode => ({
  type: 'heading',
  attrs: { level },
  content: [text(value)],
});

const bulletList = (items: readonly string[]): DemoNoteNode => ({
  type: 'bulletList',
  content: items.map((item) => ({
    type: 'listItem',
    content: [paragraph([text(item)])],
  })),
});

const orderedList = (items: readonly string[]): DemoNoteNode => ({
  type: 'orderedList',
  content: items.map((item) => ({
    type: 'listItem',
    content: [paragraph([text(item)])],
  })),
});

const taskList = (items: readonly string[]): DemoNoteNode => ({
  type: 'taskList',
  content: items.map((item) => ({
    type: 'taskItem',
    attrs: { checked: false },
    content: [paragraph([text(item)])],
  })),
});

/** Документ заметки в формате ProseMirror. Ссылка на доску добавляется, когда известен её адрес. */
export const buildDemoNoteDocument = (boardHref: string | null): DemoNoteNode => {
  const copy = DEMO_CABINET_NOTE_COPY;
  const boardLine: DemoNoteNode = boardHref
    ? paragraph([
        text(copy.boardLink, [
          {
            type: 'link',
            attrs: {
              href: boardHref,
              target: '_self',
            },
          },
        ]),
      ])
    : paragraph([text(copy.boardFallback)]);

  return {
    type: 'doc',
    content: [
      heading(1, copy.title),
      paragraph([text(copy.lead)]),
      heading(2, copy.formatTitle),
      paragraph([
        text(copy.formatLeadBefore),
        text(copy.bold, [{ type: 'bold' }]),
        text(copy.formatMiddle),
        text(copy.italic, [{ type: 'italic' }]),
        text(copy.formatAfterBold),
        text(copy.underline, [{ type: 'underline' }]),
        text(copy.formatAfterUnderline),
        text(copy.strike, [{ type: 'strike' }]),
        text(copy.formatEnd),
      ]),
      bulletList(copy.bullets),
      orderedList(copy.ordered),
      {
        type: 'blockquote',
        content: [paragraph([text(copy.quote)])],
      },
      paragraph([text(copy.align)], { textAlign: 'center' }),
      {
        type: 'codeBlock',
        attrs: { language: 'plaintext' },
        content: [text(copy.code)],
      },
      heading(2, copy.scenarioTitle),
      orderedList(copy.scenario),
      boardLine,
      heading(2, copy.checklistTitle),
      taskList(copy.checklist),
      heading(3, copy.hintTitle),
      paragraph([text(copy.hint)]),
    ],
  };
};
