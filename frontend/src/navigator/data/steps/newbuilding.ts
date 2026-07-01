import type { DealStep } from '../../types';

const s = (
  partial: Omit<DealStep, 'checklist' | 'tutorialIds' | 'documentIds' | 'warnings' | 'nextStepIds'> & {
    checklist?: DealStep['checklist'];
    tutorialIds?: string[];
    documentIds?: string[];
    warnings?: string[];
    nextStepIds?: string[];
  }
): DealStep => ({
  checklist: [],
  tutorialIds: [],
  documentIds: [],
  warnings: [],
  nextStepIds: [],
  ...partial
});

export const NEWBUILDING_STEPS: Record<string, DealStep> = {
  'nb-developer-select': s({
    id: 'nb-developer-select',
    phase: 'selection',
    title: 'Выбрать застройщика',
    shortDescription: 'Сравните проекты, локацию и условия покупки',
    detailedDescription:
      'Определите 2–3 застройщика с подходящими проектами. Сравните сроки сдачи, цену за м², отделку, парковку и транспортную доступность.',
    estimatedTime: '3–7 дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-dev-list', title: 'Составить список проектов', mandatory: true, tutorialId: 'tut-nb-developer-select' },
      { id: 'cb-nb-dev-visit', title: 'Посетить офис продаж', mandatory: true, tutorialId: 'tut-nb-developer-select' },
      { id: 'cb-nb-dev-price', title: 'Сравнить цену и акции', mandatory: true, tutorialId: 'tut-nb-developer-select' }
    ],
    tutorialIds: ['tut-nb-developer-select']
  }),

  'nb-developer-reputation': s({
    id: 'nb-developer-reputation',
    phase: 'selection',
    title: 'Проверить репутацию застройщика',
    shortDescription: 'ЕИСЖС, судебные дела, отзывы дольщиков',
    detailedDescription:
      'Проверьте застройщика в едином реестре застройщиков (наш.дом.рф), историю сдачи объектов, банкротства и судебные споры.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-nb-rep-eiszhs', title: 'Проверить в реестре ЕИСЖС', mandatory: true, tutorialId: 'tut-nb-developer-reputation' },
      { id: 'cb-nb-rep-courts', title: 'Проверить суды и банкротства', mandatory: true, tutorialId: 'tut-nb-developer-reputation' },
      { id: 'cb-nb-rep-reviews', title: 'Изучить отзывы дольщиков', mandatory: true, tutorialId: 'tut-nb-developer-reputation' }
    ],
    warnings: ['Застройщик не в реестре — критический риск', 'Массовые судебные иски дольщиков'],
    tutorialIds: ['tut-nb-developer-reputation']
  }),

  'nb-building-permit': s({
    id: 'nb-building-permit',
    phase: 'object_check',
    title: 'Проверить разрешение на строительство',
    shortDescription: 'Действующее разрешение и соответствие проекту',
    detailedDescription:
      'Запросите у застройщика копию разрешения на строительство. Сверьте адрес объекта, этажность и срок действия документа.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-nb-permit-copy', title: 'Получить копию разрешения', mandatory: true, tutorialId: 'tut-nb-building-permit' },
      { id: 'cb-nb-permit-valid', title: 'Проверить срок действия', mandatory: true, tutorialId: 'tut-nb-building-permit' },
      { id: 'cb-nb-permit-match', title: 'Сверить с проектом дома', mandatory: true, tutorialId: 'tut-nb-building-permit' }
    ],
    warnings: ['Отсутствие разрешения — строительство незаконно'],
    tutorialIds: ['tut-nb-building-permit']
  }),

  'nb-project-declaration': s({
    id: 'nb-project-declaration',
    phase: 'object_check',
    title: 'Проверить проектную декларацию',
    shortDescription: 'Сроки, площади, этапность строительства',
    detailedDescription:
      'Изучите проектную декларацию на сайте наш.дом.рф: срок ввода, площадь квартир, отделка, инфраструктура, эскроу-банк.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-decl-read', title: 'Скачать декларацию', mandatory: true, tutorialId: 'tut-nb-project-declaration' },
      { id: 'cb-nb-decl-dates', title: 'Сверить сроки сдачи', mandatory: true, tutorialId: 'tut-nb-project-declaration' },
      { id: 'cb-nb-decl-area', title: 'Проверить площадь лота', mandatory: true, tutorialId: 'tut-nb-project-declaration' }
    ],
    tutorialIds: ['tut-nb-project-declaration']
  }),

  'nb-escrow-check': s({
    id: 'nb-escrow-check',
    phase: 'object_check',
    title: 'Проверить эскроу-счета',
    shortDescription: 'Деньги на эскроу, банк-партнёр',
    detailedDescription:
      'Убедитесь, что договор предусматривает расчёты через эскроу-счёт в уполномоченном банке. Проверьте реквизиты и условия открытия счёта.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-nb-escrow-bank', title: 'Уточнить банк эскроу', mandatory: true, tutorialId: 'tut-nb-escrow-check' },
      { id: 'cb-nb-escrow-ddu', title: 'Проверить условия в ДДУ', mandatory: true, tutorialId: 'tut-nb-escrow-check' },
      { id: 'cb-nb-escrow-mortgage', title: 'Согласовать с ипотечным банком', mandatory: false, tutorialId: 'tut-nb-escrow-check' }
    ],
    warnings: ['Расчёты не через эскроу — высокий риск потери средств'],
    tutorialIds: ['tut-nb-escrow-check']
  }),

  'nb-delivery-dates': s({
    id: 'nb-delivery-dates',
    phase: 'object_check',
    title: 'Проверить сроки сдачи',
    shortDescription: 'Дата ввода в эксплуатацию и штрафы за просрочку',
    detailedDescription:
      'Сверьте срок передачи квартиры в декларации и ДДУ. Уточните, предусмотрена ли неустойка за каждый день просрочки.',
    estimatedTime: '1 день',
    difficulty: 'low',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-date-ddu', title: 'Дата в ДДУ', mandatory: true, tutorialId: 'tut-nb-delivery-dates' },
      { id: 'cb-nb-date-decl', title: 'Дата в декларации', mandatory: true, tutorialId: 'tut-nb-delivery-dates' },
      { id: 'cb-nb-date-penalty', title: 'Неустойка за просрочку', mandatory: true, tutorialId: 'tut-nb-delivery-dates' }
    ],
    warnings: ['Срок «до ввода в эксплуатацию» без конкретной даты'],
    tutorialIds: ['tut-nb-delivery-dates']
  }),

  'nb-ddu-review': s({
    id: 'nb-ddu-review',
    phase: 'contract',
    title: 'Проверить проект ДДУ',
    shortDescription: 'Цена, площадь, отделка, график платежей',
    detailedDescription:
      'Проверьте договор долевого участия: предмет, цену, график платежей, отделку, штрафы, порядок приёмки и регистрации.',
    estimatedTime: '2–5 дней',
    difficulty: 'high',
    riskLevel: 'high',
    required: true,
    documentIds: ['doc-ddu'],
    checklist: [
      { id: 'cb-nb-ddu-price', title: 'Цена и график платежей', mandatory: true, tutorialId: 'tut-nb-ddu-review' },
      { id: 'cb-nb-ddu-area', title: 'Площадь и планировка', mandatory: true, tutorialId: 'tut-nb-ddu-review' },
      { id: 'cb-nb-ddu-finish', title: 'Отделка и комплектация', mandatory: true, tutorialId: 'tut-nb-ddu-review' },
      { id: 'cb-nb-ddu-lawyer', title: 'Проверка юристом', mandatory: false, tutorialId: 'tut-nb-ddu-review' }
    ],
    tutorialIds: ['tut-nb-ddu-review']
  }),

  'nb-penalties': s({
    id: 'nb-penalties',
    phase: 'contract',
    title: 'Проверить штрафы и неустойки',
    shortDescription: 'За просрочку сдачи и расторжение',
    detailedDescription:
      'Изучите раздел об ответственности: неустойка за просрочку передачи, условия расторжения и возврата денег с эскроу.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-pen-delay', title: 'Неустойка за просрочку сдачи', mandatory: true, tutorialId: 'tut-nb-penalties' },
      { id: 'cb-nb-pen-cancel', title: 'Условия расторжения', mandatory: true, tutorialId: 'tut-nb-penalties' },
      { id: 'cb-nb-pen-refund', title: 'Возврат с эскроу', mandatory: true, tutorialId: 'tut-nb-penalties' }
    ],
    tutorialIds: ['tut-nb-penalties']
  }),

  'nb-reservation': s({
    id: 'nb-reservation',
    phase: 'advance',
    title: 'Забронировать квартиру',
    shortDescription: 'Платная или бесплатная бронь, срок фиксации цены',
    detailedDescription:
      'Заключите соглашение о бронировании. Зафиксируйте цену, номер квартиры, срок действия брони и условия возврата.',
    estimatedTime: '1–3 дня',
    difficulty: 'low',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-res-contract', title: 'Подписать соглашение о брони', mandatory: true, tutorialId: 'tut-nb-reservation' },
      { id: 'cb-nb-res-pay', title: 'Оплатить бронь (если платная)', mandatory: false, tutorialId: 'tut-nb-reservation' },
      { id: 'cb-nb-res-flat', title: 'Зафиксировать номер квартиры', mandatory: true, tutorialId: 'tut-nb-reservation' }
    ],
    tutorialIds: ['tut-nb-reservation']
  }),

  'nb-ddu-sign': s({
    id: 'nb-ddu-sign',
    phase: 'signing',
    title: 'Подписать ДДУ',
    shortDescription: 'Электронная или бумажная форма',
    detailedDescription:
      'Подпишите договор долевого участия. При ипотеке — согласуйте подписание с банком и откройте эскроу-счёт.',
    estimatedTime: '1–3 дня',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    documentIds: ['doc-ddu'],
    checklist: [
      { id: 'cb-nb-sign-read', title: 'Перечитать финальную версию', mandatory: true, tutorialId: 'tut-nb-ddu-sign' },
      { id: 'cb-nb-sign-escrow', title: 'Открыть эскроу-счёт', mandatory: true, tutorialId: 'tut-nb-ddu-sign' },
      { id: 'cb-nb-sign-copy', title: 'Получить экземпляр ДДУ', mandatory: true, tutorialId: 'tut-nb-ddu-sign' }
    ],
    tutorialIds: ['tut-nb-ddu-sign']
  }),

  'nb-mortgage-disbursement': s({
    id: 'nb-mortgage-disbursement',
    phase: 'payments',
    title: 'Оформить ипотеку по ДДУ',
    shortDescription: 'Кредитный договор и перечисление на эскроу',
    detailedDescription:
      'Подпишите кредитный договор, оформите страховку и согласуйте с банком перечисление средств на эскроу-счёт застройщика.',
    estimatedTime: '5–14 дней',
    difficulty: 'high',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-mort-contract', title: 'Подписать кредитный договор', mandatory: true, tutorialId: 'tut-nb-mortgage-disbursement' },
      { id: 'cb-nb-mort-escrow', title: 'Перечисление на эскроу', mandatory: true, tutorialId: 'tut-nb-mortgage-disbursement' },
      { id: 'cb-nb-mort-schedule', title: 'График платежей', mandatory: true, tutorialId: 'tut-nb-mortgage-disbursement' }
    ],
    tutorialIds: ['tut-nb-mortgage-disbursement']
  }),

  'nb-ddu-registration': s({
    id: 'nb-ddu-registration',
    phase: 'registration',
    title: 'Зарегистрировать ДДУ',
    shortDescription: 'Росреестр, госпошлина, уведомление застройщика',
    detailedDescription:
      'Подайте ДДУ на государственную регистрацию через МФЦ, банк или Госуслуги. Дождитесь записи в ЕГРН.',
    estimatedTime: '5–9 рабочих дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-reg-submit', title: 'Подать документы', mandatory: true, tutorialId: 'tut-nb-ddu-registration' },
      { id: 'cb-nb-reg-fee', title: 'Оплатить госпошлину', mandatory: true, tutorialId: 'tut-nb-ddu-registration' },
      { id: 'cb-nb-reg-done', title: 'Получить выписку о регистрации', mandatory: true, tutorialId: 'tut-nb-ddu-registration' }
    ],
    tutorialIds: ['tut-nb-ddu-registration']
  }),

  'nb-wait-construction': s({
    id: 'nb-wait-construction',
    phase: 'handover',
    title: 'Ожидание сдачи объекта',
    shortDescription: 'После регистрации ДДУ — до ввода дома в эксплуатацию',
    detailedDescription:
      'После регистрации ДДУ необходимо дождаться ввода дома в эксплуатацию. Следите за ходом строительства, уведомлениями застройщика и соблюдением сроков передачи квартиры.',
    estimatedTime: '6–24 месяца',
    difficulty: 'low',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-wait-status', title: 'Следить за статусом строительства', mandatory: true, tutorialId: 'tut-nb-wait-construction' },
      { id: 'cb-nb-wait-notify', title: 'Проверять уведомления застройщика', mandatory: true, tutorialId: 'tut-nb-wait-construction' },
      { id: 'cb-nb-wait-dates', title: 'Контролировать сроки передачи', mandatory: true, tutorialId: 'tut-nb-wait-construction' },
      { id: 'cb-nb-wait-prep', title: 'Подготовиться к приёмке', mandatory: true, tutorialId: 'tut-nb-wait-construction' }
    ],
    warnings: [
      'Перенос сроков сдачи — требуйте неустойку по ДДУ',
      'Банкротство застройщика — обратитесь в компенсационный фонд',
      'Изменение проекта без согласования — основание для претензии'
    ],
    tutorialIds: ['tut-nb-wait-construction']
  }),

  'nb-acceptance': s({
    id: 'nb-acceptance',
    phase: 'handover',
    title: 'Приёмка квартиры',
    shortDescription: 'Осмотр с представителем застройщика',
    detailedDescription:
      'Запишитесь на приёмку, осмотрите квартиру с актом, проверьте отделку, окна, сантехнику и комплект документов.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-acc-appointment', title: 'Записаться на приёмку', mandatory: true, tutorialId: 'tut-nb-acceptance' },
      { id: 'cb-nb-acc-inspect', title: 'Осмотреть квартиру', mandatory: true, tutorialId: 'tut-nb-acceptance' },
      { id: 'cb-nb-acc-meters', title: 'Проверить счётчики', mandatory: true, tutorialId: 'tut-nb-acceptance' }
    ],
    tutorialIds: ['tut-nb-acceptance']
  }),

  'nb-defects-check': s({
    id: 'nb-defects-check',
    phase: 'handover',
    title: 'Проверка дефектов',
    shortDescription: 'Зафиксировать недостатки в акте',
    detailedDescription:
      'Зафиксируйте все дефекты в акте осмотра или отдельном дефектном ведомости. Сфотографируйте и укажите сроки устранения.',
    estimatedTime: '2–4 часа',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-nb-def-photo', title: 'Сфотографировать дефекты', mandatory: true, tutorialId: 'tut-nb-defects-check' },
      { id: 'cb-nb-def-list', title: 'Внести в акт/ведомость', mandatory: true, tutorialId: 'tut-nb-defects-check' },
      { id: 'cb-nb-def-deadline', title: 'Согласовать сроки устранения', mandatory: true, tutorialId: 'tut-nb-defects-check' }
    ],
    warnings: ['Подписание акта без осмотра лишает права на претензии'],
    tutorialIds: ['tut-nb-defects-check']
  }),

  'nb-act-signing': s({
    id: 'nb-act-signing',
    phase: 'handover',
    title: 'Подписание акта приёма-передачи',
    shortDescription: 'Передача квартиры по акту',
    detailedDescription:
      'Подпишите акт приёма-передачи после устранения критичных замечаний или с оговорками. Получите второй экземпляр.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    documentIds: ['doc-handover'],
    checklist: [
      { id: 'cb-nb-act-read', title: 'Проверить текст акта', mandatory: true, tutorialId: 'tut-nb-act-signing' },
      { id: 'cb-nb-act-sign', title: 'Подписать акт', mandatory: true, tutorialId: 'tut-nb-act-signing' },
      { id: 'cb-nb-act-copy', title: 'Получить свой экземпляр', mandatory: true, tutorialId: 'tut-nb-act-signing' }
    ],
    tutorialIds: ['tut-nb-act-signing']
  }),

  'nb-keys': s({
    id: 'nb-keys',
    phase: 'handover',
    title: 'Получение ключей',
    shortDescription: 'Ключи, пропуска, инструкции',
    detailedDescription:
      'Получите ключи от квартиры и подъезда, чипы/брелоки, инструкции по технике и контакты управляющей компании.',
    estimatedTime: '1 час',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-nb-keys-flat', title: 'Ключи от квартиры', mandatory: true, tutorialId: 'tut-nb-keys' },
      { id: 'cb-nb-keys-entrance', title: 'Ключи/чип от подъезда', mandatory: true, tutorialId: 'tut-nb-keys' },
      { id: 'cb-nb-keys-docs', title: 'Инструкции и гарантии', mandatory: false, tutorialId: 'tut-nb-keys' }
    ],
    tutorialIds: ['tut-nb-keys']
  }),

  'nb-ownership-registration': s({
    id: 'nb-ownership-registration',
    phase: 'registration',
    title: 'Регистрация собственности',
    shortDescription: 'Переход права после сдачи дома',
    detailedDescription:
      'После ввода дома в эксплуатацию зарегистрируйте право собственности по ДДУ. Получите выписку ЕГРН на своё имя.',
    estimatedTime: '5–14 дней',
    difficulty: 'medium',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-nb-own-notice', title: 'Получить уведомление о вводе дома', mandatory: true, tutorialId: 'tut-nb-ownership-registration' },
      { id: 'cb-nb-own-submit', title: 'Подать на регистрацию права', mandatory: true, tutorialId: 'tut-nb-ownership-registration' },
      { id: 'cb-nb-own-egrn', title: 'Получить выписку ЕГРН', mandatory: true, tutorialId: 'tut-nb-ownership-registration' }
    ],
    tutorialIds: ['tut-nb-ownership-registration']
  })
};
