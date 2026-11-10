/**
 * Единый шаблон демонстрационного кабинета.
 * `DEMO_CABINET_TEMPLATE_VERSION` увеличивают, когда меняется наполнение.
 * Уже созданный кабинет получает новую версию при следующем входе, без нового кабинета.
 */

export const DEMO_CABINET_TEMPLATE_VERSION = 3;

/** Публичный PDF для демонстрационной доски и заметки. Не требует загрузки в хранилище. */
export const DEMO_SAMPLE_PDF = {
  path: '/assets/test_recipes_2_pages.pdf',
  fileName: 'test_recipes_2_pages.pdf',
  totalPages: 2,
} as const;

export const isPublicAssetSrc = (src: string): boolean => {
  if (!src) return false;
  if (src.startsWith('/assets/')) return true;
  try {
    return new URL(src).pathname.startsWith('/assets/');
  } catch {
    return false;
  }
};

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
    'Рисунок от руки, комментарий и картинку добавляют с панели инструментов. Готовый PDF лежит отдельной рамкой справа.',
  pdfTitle: 'PDF',
  pdfHint: 'Две страницы. Их можно листать, а поверх — рисовать.',
  activityTitle: 'Упражнение',
  activityQuestion: 'Где ученик видит материалы этого кабинета?',
  activityOptions: [
    { text: 'Только на компьютере репетитора', correct: false },
    { text: 'В кабинете, если материалу открыт доступ', correct: true },
    { text: 'В отдельном черновике вне кабинета', correct: false },
  ] as const,
} as const;

export const DEMO_CABINET_NOTE_COPY = {
  title: 'Знакомство с заметкой',
  lead: 'Заметка хранит план занятия, объяснение и упражнения. Ниже каждый тип блока: коротко, зачем он нужен, и пример, который можно оставить для урока или стереть.',
  textTitle: 'Текст',
  textBefore: 'Обычный абзац. Термин выделяют ',
  bold: 'жирным',
  textAfterBold: ', пример — ',
  italic: 'курсивом',
  textAfterItalic: ', правило — ',
  underline: 'подчёркиванием',
  textAfterUnderline: ', ошибку — ',
  strike: 'зачёркиванием',
  textAfterStrike: ', а формулу или команду — ',
  inlineCode: 'термин',
  textEnd: '.',
  linkLead: 'Ссылка открывает материал кабинета. Например, ',
  boardLink: 'демонстрационную доску',
  boardFallback:
    'Демонстрационная доска лежит в этом же кабинете. Откройте её из списка материалов.',
  alignLeft: 'По левому краю читают условие задачи.',
  alignCenter: 'По центру ставят тему урока или эпиграф.',
  alignRight: 'По правому краю — дату занятия или подпись.',
  alignJustify:
    'По ширине удобно длинное объяснение: строки ровные, и ученику проще следить за мыслью от начала абзаца до конца.',
  headingsTitle: 'Заголовки',
  headingsBody:
    'Первый уровень — название материала. Второй делит занятие на части. Третий отмечает шаг внутри части.',
  headingStep: 'Разминка, 5 минут',
  headingStepBody: 'Короткий вопрос, с которого начинается урок: что ученик уже знает по теме.',
  listsTitle: 'Списки',
  bulletsLead: 'Маркированный список собирает идеи, когда порядок не важен.',
  bullets: ['Повторить прошлую тему', 'Разобрать новый пример', 'Оставить домашнее задание'],
  orderedLead: 'Нумерованный список задаёт ход урока.',
  ordered: [
    'Откройте доску и покажите пример',
    'Дайте ученику решить похожее',
    'Запишите вывод в эту заметку',
  ],
  tasksLead: 'Чеклист отмечает подготовку. Отмеченный пункт уже сделан, остальные ждут.',
  tasks: [
    { text: 'Открыть демонстрационную доску', checked: true },
    { text: 'Передвинуть любой элемент на доске', checked: false },
    { text: 'Добавить свой пример в заметку', checked: false },
  ],
  quoteTitle: 'Цитата',
  quote: 'Сначала пример, потом формулировка. Так правило запоминается лучше.',
  codeTitle: 'Блок кода',
  codeLead: 'Отдельный блок кода подходит для информатики, точных шагов и формул.',
  code: 'начало\n  показать пример\n  спросить ученика\nконец',
  activitiesTitle: 'Упражнения',
  activitiesLead:
    'Упражнение вставляется из меню блока и решается прямо в заметке. Ниже по одному живому примеру каждого вида.',
  gapTitle: 'Пропуск в тексте',
  gapBody:
    'Ученик вписывает слово в предложение. Так проверяют термин, не уводя его с текста урока.',
  matchingTitle: 'Сопоставление',
  matchingBody: 'Пары связывают термин и смысл. Удобно для словаря в начале темы.',
  sortingTitle: 'Сортировка',
  sortingBody:
    'Карточки раскладывают по группам. Здесь отделено то, что нужно на уроке, от библиотеки шаблонов.',
  orderingTitle: 'Порядок',
  orderingBody: 'Пункты выстраивают в правильной последовательности. Хорошо для хода занятия.',
  choiceTitle: 'Выбор ответа',
  choiceBody:
    'Один или несколько вариантов. Вопрос можно сразу использовать как проверку в конце урока.',
  tilesTitle: 'Скрытые плитки',
  tilesBody: 'Под плитками лежат подсказки. Открывайте их по одной, когда ученик застрял.',
  cardsTitle: 'Случайная карточка',
  cardsBody:
    'Карточка вытягивается для устного ответа. Набор вопросов можно менять под свой предмет.',
  labelsTitle: 'Подписи к картинке',
  labelsBody:
    'Точки ставятся на изображение. Картинку добавляют внутри упражнения: с устройства, из облака или по ссылке.',
  filesTitle: 'PDF',
  filesBody:
    'Ниже двухстраничный PDF: страницы листаются, поверх можно рисовать. Картинку, аудио, презентацию и обычный файл добавляют из меню блока — с устройства, из облака или по ссылке.',
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

const pdfBlock = (): DemoNoteNode => ({
  type: 'pdf',
  attrs: {
    src: DEMO_SAMPLE_PDF.path,
    fileName: DEMO_SAMPLE_PDF.fileName,
    totalPages: DEMO_SAMPLE_PDF.totalPages,
    annotations: {},
  },
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

const taskList = (items: readonly { text: string; checked: boolean }[]): DemoNoteNode => ({
  type: 'taskList',
  content: items.map((item) => ({
    type: 'taskItem',
    attrs: { checked: item.checked },
    content: [paragraph([text(item.text)])],
  })),
});

const activity = (
  title: string,
  definition: { kind: string } & Record<string, unknown>,
): DemoNoteNode => ({
  type: 'activity',
  attrs: {
    kind: definition.kind,
    title,
    definition: JSON.stringify(definition),
    attempt: '',
    checkStatus: 'idle',
    studentAccess: '',
  },
});

/** Документ заметки в формате ProseMirror. Ссылка на доску добавляется, когда известен её адрес. */
export const buildDemoNoteDocument = (boardHref: string | null): DemoNoteNode => {
  const copy = DEMO_CABINET_NOTE_COPY;
  const boardLink: DemoNoteNode = boardHref
    ? text(copy.boardLink, [
        {
          type: 'link',
          attrs: {
            href: boardHref,
            target: '_self',
          },
        },
      ])
    : text(copy.boardFallback);

  return {
    type: 'doc',
    content: [
      heading(1, copy.title),
      paragraph([text(copy.lead)]),
      heading(2, copy.textTitle),
      paragraph([
        text(copy.textBefore),
        text(copy.bold, [{ type: 'bold' }]),
        text(copy.textAfterBold),
        text(copy.italic, [{ type: 'italic' }]),
        text(copy.textAfterItalic),
        text(copy.underline, [{ type: 'underline' }]),
        text(copy.textAfterUnderline),
        text(copy.strike, [{ type: 'strike' }]),
        text(copy.textAfterStrike),
        text(copy.inlineCode, [{ type: 'code' }]),
        text(copy.textEnd),
      ]),
      paragraph([text(copy.linkLead), boardLink]),
      paragraph([text(copy.alignLeft)], { textAlign: 'left' }),
      paragraph([text(copy.alignCenter)], { textAlign: 'center' }),
      paragraph([text(copy.alignRight)], { textAlign: 'right' }),
      paragraph([text(copy.alignJustify)], { textAlign: 'justify' }),
      heading(2, copy.headingsTitle),
      paragraph([text(copy.headingsBody)]),
      heading(3, copy.headingStep),
      paragraph([text(copy.headingStepBody)]),
      heading(2, copy.listsTitle),
      paragraph([text(copy.bulletsLead)]),
      bulletList(copy.bullets),
      paragraph([text(copy.orderedLead)]),
      orderedList(copy.ordered),
      paragraph([text(copy.tasksLead)]),
      taskList(copy.tasks),
      heading(2, copy.quoteTitle),
      { type: 'blockquote', content: [paragraph([text(copy.quote)])] },
      heading(2, copy.codeTitle),
      paragraph([text(copy.codeLead)]),
      {
        type: 'codeBlock',
        attrs: { language: 'plaintext' },
        content: [text(copy.code)],
      },
      heading(2, copy.activitiesTitle),
      paragraph([text(copy.activitiesLead)]),
      paragraph([text(copy.gapBody)]),
      activity(copy.gapTitle, {
        kind: 'gap-text',
        sourceText: 'Материалы урока ученик открывает в {{gap-cabinet}}.',
        gaps: [{ id: 'gap-cabinet', answers: ['кабинете'], input: 'input', choices: [] }],
        bank: [],
      }),
      paragraph([text(copy.matchingBody)]),
      activity(copy.matchingTitle, {
        kind: 'matching',
        mode: 'connect',
        left: [
          { id: 'match-cabinet', text: 'Кабинет' },
          { id: 'match-board', text: 'Доска' },
          { id: 'match-note', text: 'Заметка' },
        ],
        right: [
          { id: 'match-place', text: 'Место урока с учеником' },
          { id: 'match-field', text: 'Общее поле для разбора' },
          { id: 'match-plan', text: 'План, текст и упражнения' },
        ],
        pairs: {
          'match-cabinet': 'match-place',
          'match-board': 'match-field',
          'match-note': 'match-plan',
        },
      }),
      paragraph([text(copy.sortingBody)]),
      activity(copy.sortingTitle, {
        kind: 'sorting',
        categories: [
          { id: 'sort-lesson', title: 'Нужно на уроке' },
          { id: 'sort-library', title: 'Лежит в библиотеке' },
        ],
        items: [
          { id: 'sort-board', text: 'Демонстрационная доска', categoryId: 'sort-lesson' },
          { id: 'sort-note', text: 'Эта заметка', categoryId: 'sort-lesson' },
          { id: 'sort-template', text: 'Шаблон для других кабинетов', categoryId: 'sort-library' },
        ],
      }),
      paragraph([text(copy.orderingBody)]),
      activity(copy.orderingTitle, {
        kind: 'ordering',
        items: [
          { id: 'order-show', text: 'Показать пример' },
          { id: 'order-practice', text: 'Дать ученику практику' },
          { id: 'order-write', text: 'Записать вывод' },
        ],
      }),
      paragraph([text(copy.choiceBody)]),
      activity(copy.choiceTitle, {
        kind: 'multiple-choice',
        question: 'Где ученик видит материалы этого кабинета?',
        multiple: false,
        randomize: false,
        options: [
          { id: 'choice-tutor', text: 'Только на компьютере репетитора', correct: false },
          { id: 'choice-here', text: 'В этом кабинете, если ему открыт доступ', correct: true },
          { id: 'choice-bank', text: 'В общем банке заданий', correct: false },
        ],
      }),
      paragraph([text(copy.tilesBody)]),
      activity(copy.tilesTitle, {
        kind: 'mystery-tiles',
        columns: 2,
        tiles: [
          { id: 'tile-rule', text: 'Сначала пример, потом правило' },
          { id: 'tile-ask', text: 'Спросите, что ученик уже знает' },
          { id: 'tile-board', text: 'Разберите шаги на доске' },
          { id: 'tile-note', text: 'Вывод запишите в заметку' },
        ],
      }),
      paragraph([text(copy.cardsBody)]),
      activity(copy.cardsTitle, {
        kind: 'random-card',
        noRepeat: true,
        cards: [
          { id: 'card-know', text: 'Что ты уже знаешь по этой теме?' },
          { id: 'card-example', text: 'Приведи свой пример' },
          { id: 'card-hard', text: 'Что оказалось самым сложным?' },
        ],
      }),
      paragraph([text(copy.labelsBody)]),
      activity(copy.labelsTitle, {
        kind: 'label-image',
        imageSrc: '',
        hotspots: [
          { id: 'label-a', x: 0.28, y: 0.32, label: 'Тема' },
          { id: 'label-b', x: 0.68, y: 0.62, label: 'Пример' },
        ],
        extraLabels: [],
      }),
      heading(2, copy.filesTitle),
      paragraph([text(copy.filesBody)]),
      pdfBlock(),
    ],
  };
};
