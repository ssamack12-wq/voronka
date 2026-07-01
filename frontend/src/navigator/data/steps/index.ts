import type { DealStep } from '../../types';
import { enrichStep } from '../contentDefaults';
import { NEWBUILDING_STEPS } from './newbuilding';

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

export const STEP_LIBRARY: Record<string, DealStep> = {
  ...NEWBUILDING_STEPS,
  'prep-budget': s({
    id: 'prep-budget',
    phase: 'preparation',
    title: 'Определить бюджет сделки',
    shortDescription: 'Рассчитайте взнос, платёж и все расходы',
    detailedDescription:
      'Рассчитайте первоначальный взнос, ежемесячный платёж по ипотеке и дополнительные расходы: ремонт, страховка, комиссия банка, госпошлины, переезд.',
    estimatedTime: '1–2 дня',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-budget', title: 'Рассчитать бюджет', mandatory: true, tutorialId: 'tut-budget' },
      { id: 'cb-repair', title: 'Учесть ремонт', mandatory: false },
      { id: 'cb-insurance', title: 'Учесть страховку', mandatory: true },
      { id: 'cb-bank-fee', title: 'Учесть комиссию банка', mandatory: true },
      { id: 'cb-fees', title: 'Учесть госпошлины', mandatory: true },
      { id: 'cb-move', title: 'Учесть переезд', mandatory: false }
    ],
    warnings: ['Не тратьте весь кэш на первый взнос', 'Оставьте финансовую подушку на 3–6 месяцев']
  }),

  'prep-mortgage-approval': s({
    id: 'prep-mortgage-approval',
    phase: 'preparation',
    title: 'Получить ипотечное одобрение',
    shortDescription: 'Выберите банк и получите предварительное одобрение',
    detailedDescription:
      'Подайте заявку в банк, загрузите документы и получите предварительное одобрение до поиска квартиры.',
    estimatedTime: '3–10 дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-bank', title: 'Выбрать банк', mandatory: true, tutorialId: 'tut-mortgage-approval' },
      { id: 'cb-apply', title: 'Подать заявку', mandatory: true },
      { id: 'cb-docs-upload', title: 'Загрузить документы', mandatory: true },
      { id: 'cb-preapproval', title: 'Получить предварительное одобрение', mandatory: true }
    ],
    tutorialIds: ['tut-mortgage-approval']
  }),

  'prep-buyer-docs': s({
    id: 'prep-buyer-docs',
    phase: 'preparation',
    title: 'Подготовить документы покупателя',
    shortDescription: 'Соберите пакет для банка и сделки',
    detailedDescription: 'Подготовьте паспорт, справки о доходах и выписки по счетам.',
    estimatedTime: '1–3 дня',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-passport', title: 'Паспорт', mandatory: true },
      { id: 'cb-snils', title: 'СНИЛС', mandatory: true },
      { id: 'cb-income', title: 'Справка о доходах', mandatory: true },
      { id: 'cb-contract', title: 'Трудовой договор', mandatory: false },
      { id: 'cb-accounts', title: 'Выписка по счетам', mandatory: true }
    ]
  }),

  'object-area': s({
    id: 'object-area',
    phase: 'selection',
    title: 'Проверить район и инфраструктуру',
    shortDescription: 'Оцените транспорт, школы, шум и перспективы',
    detailedDescription: 'Проверьте транспортную доступность, социальную инфраструктуру и планы застройки района.',
    estimatedTime: '1–3 дня',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-transport', title: 'Транспорт', mandatory: true },
      { id: 'cb-schools', title: 'Школы и детсады', mandatory: false },
      { id: 'cb-shops', title: 'Магазины', mandatory: false },
      { id: 'cb-noise', title: 'Шум и экология', mandatory: true },
      { id: 'cb-parking', title: 'Парковка', mandatory: false }
    ],
    warnings: ['Проверьте планы застройки района', 'Уточните наличие промзон рядом']
  }),

  'object-seller': s({
    id: 'object-seller',
    phase: 'selection',
    title: 'Проверить продавца',
    shortDescription: 'Дееспособность, семейное положение, банкротства',
    detailedDescription: 'Проверьте паспорт продавца, дееспособность, семейное положение и судебные риски.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-seller-passport', title: 'Паспорт продавца', mandatory: true },
      {
        id: 'cb-capacity',
        title: 'Справки из диспансеров',
        description:
          'Если продавец пожилой или вызывает сомнения, попросите справки из ПНД и наркологического диспансера — они подтвердят, что человек осознаёт суть сделки.',
        mandatory: true
      },
      { id: 'cb-family', title: 'Семейное положение', mandatory: true },
      { id: 'cb-bankruptcy', title: 'Проверка банкротств', mandatory: true },
      { id: 'cb-courts', title: 'Судебные дела', mandatory: true }
    ],
    warnings: ['Отказ показывать документы — красный флаг']
  }),

  'object-egrn': s({
    id: 'object-egrn',
    phase: 'object_check',
    title: 'Получить выписку из ЕГРН',
    shortDescription: 'Основной документ о квартире и правах',
    detailedDescription:
      'Закажите актуальную выписку из ЕГРН и проверьте собственников, площадь, обременения и кадастровый номер.',
    estimatedTime: '2–4 дня',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      {
        id: 'cb-egrn-order',
        title: 'Получить выписку из ЕГРН',
        description: 'Основной документ о квартире',
        mandatory: true,
        tutorialId: 'tut-egrn'
      },
      { id: 'cb-owners', title: 'Проверить собственников', mandatory: true, tutorialId: 'tut-egrn' },
      { id: 'cb-area', title: 'Проверить площадь', mandatory: true },
      { id: 'cb-encumbrance-preview', title: 'Проверить обременения', mandatory: true },
      { id: 'cb-cadastral', title: 'Проверить кадастровый номер', mandatory: true }
    ],
    tutorialIds: ['tut-egrn'],
    warnings: ['Арест', 'Ипотека', 'Несовпадение площади', 'Недавний переход права']
  }),

  'object-title-history': s({
    id: 'object-title-history',
    phase: 'object_check',
    title: 'Проверить историю переходов права',
    shortDescription: 'Частота сделок, основания, наследство',
    detailedDescription: 'Изучите количество продаж, основания перехода права и подозрительные сделки.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-sales-count', title: 'Количество продаж', mandatory: true, tutorialId: 'tut-title-history' },
      { id: 'cb-resale-freq', title: 'Частота перепродаж', mandatory: true },
      { id: 'cb-basis', title: 'Основания перехода', mandatory: true },
      { id: 'cb-inheritance-hist', title: 'Наследство в истории', mandatory: true },
      { id: 'cb-gift', title: 'Дарение в истории', mandatory: false }
    ],
    tutorialIds: ['tut-title-history']
  }),

  'object-encumbrances': s({
    id: 'object-encumbrances',
    phase: 'object_check',
    title: 'Проверить обременения',
    shortDescription: 'Ипотека, аресты, залоги, судебные ограничения',
    detailedDescription: 'Проверьте все обременения в выписке ЕГРН и дополнительных источниках.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-mortgage-enc', title: 'Ипотека', mandatory: true, tutorialId: 'tut-encumbrances' },
      { id: 'cb-arrest', title: 'Аресты', mandatory: true },
      { id: 'cb-court-limits', title: 'Судебные ограничения', mandatory: true },
      { id: 'cb-pledge', title: 'Залог', mandatory: true }
    ],
    tutorialIds: ['tut-encumbrances']
  }),

  'object-registered-persons': s({
    id: 'object-registered-persons',
    phase: 'object_check',
    title: 'Проверить прописанных лиц',
    shortDescription: 'Несовершеннолетние и особые категории',
    detailedDescription: 'Уточните состав зарегистрированных лиц и сроки их выписки.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'critical',
    required: true,
    checklist: [
      { id: 'cb-minors-reg', title: 'Несовершеннолетние', mandatory: true },
      { id: 'cb-special-reg', title: 'Особые категории', mandatory: true },
      { id: 'cb-temp-out', title: 'Временно выписанные', mandatory: false }
    ],
    warnings: ['Несовершеннолетние — критический риск', 'Лица в местах лишения свободы']
  }),

  'object-utilities-debt': s({
    id: 'object-utilities-debt',
    phase: 'object_check',
    title: 'Проверить долги по ЖКХ',
    shortDescription: 'Коммунальные платежи и капремонт',
    detailedDescription: 'Запросите справки по задолженностям ЖКХ, капремонту и ресурсам.',
    estimatedTime: '1–2 дня',
    difficulty: 'low',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-utilities', title: 'ЖКХ', mandatory: true },
      { id: 'cb-caprepair', title: 'Капремонт', mandatory: true },
      { id: 'cb-electric', title: 'Электричество', mandatory: false },
      { id: 'cb-gas', title: 'Газ', mandatory: false }
    ]
  }),

  'object-replanning': s({
    id: 'object-replanning',
    phase: 'object_check',
    title: 'Проверить перепланировку',
    shortDescription: 'Соответствие плану БТИ и узаконенность',
    detailedDescription: 'Сверьте план БТИ с фактической планировкой и проверьте узаконенность изменений.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-bti', title: 'Соответствие плану БТИ', mandatory: true },
      { id: 'cb-legal-plan', title: 'Узаконенность перепланировки', mandatory: true },
      { id: 'cb-load-bearing', title: 'Несущие стены', mandatory: true }
    ],
    warnings: ['Неузаконенная перепланировка', 'Перенос мокрых зон']
  }),

  'advance-terms': s({
    id: 'advance-terms',
    phase: 'advance',
    title: 'Согласовать условия сделки',
    shortDescription: 'Цена, сроки, мебель, освобождение',
    detailedDescription: 'Зафиксируйте цену, сроки, состав имущества и условия освобождения квартиры.',
    estimatedTime: '1–3 дня',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-price', title: 'Цена', mandatory: true },
      { id: 'cb-dates', title: 'Сроки', mandatory: true },
      { id: 'cb-vacate', title: 'Освобождение квартиры', mandatory: true },
      { id: 'cb-furniture', title: 'Мебель и техника', mandatory: false }
    ]
  }),

  'advance-type': s({
    id: 'advance-type',
    phase: 'advance',
    title: 'Выбрать: аванс или задаток',
    shortDescription: 'Понять юридические последствия',
    detailedDescription: 'Определите форму предоплаты и зафиксируйте условия возврата.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-advance-vs-deposit', title: 'Сравнить аванс и задаток', mandatory: true, tutorialId: 'tut-advance' }
    ],
    tutorialIds: ['tut-advance']
  }),

  'advance-preliminary-docs': s({
    id: 'advance-preliminary-docs',
    phase: 'advance',
    title: 'Подписать предварительные документы',
    shortDescription: 'Аванс, предварительный ДКП, расписка',
    detailedDescription: 'Подготовьте и подпишите предварительные документы с чёткими условиями.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    documentIds: ['doc-advance', 'doc-pre-dkp', 'doc-receipt'],
    checklist: [
      { id: 'cb-advance-agreement', title: 'Авансовое соглашение', mandatory: true },
      { id: 'cb-pre-dkp', title: 'Предварительный ДКП', mandatory: false },
      { id: 'cb-receipt', title: 'Расписка', mandatory: true }
    ]
  }),

  'mortgage-appraisal': s({
    id: 'mortgage-appraisal',
    phase: 'mortgage',
    title: 'Провести оценку недвижимости',
    shortDescription: 'Оценка для банка',
    detailedDescription: 'Выберите аккредитованную оценочную компанию и получите отчёт.',
    estimatedTime: '3–7 дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-appraiser', title: 'Выбрать оценочную компанию', mandatory: true, tutorialId: 'tut-appraisal' },
      { id: 'cb-appraisal-schedule', title: 'Согласовать время', mandatory: true },
      { id: 'cb-appraisal-docs', title: 'Передать документы', mandatory: true }
    ],
    tutorialIds: ['tut-appraisal']
  }),

  'mortgage-object-approval': s({
    id: 'mortgage-object-approval',
    phase: 'mortgage',
    title: 'Получить одобрение объекта банком',
    shortDescription: 'Банк проверяет объект сделки',
    detailedDescription: 'Передайте документы и оценку в банк, дождитесь решения по объекту.',
    estimatedTime: '5–14 дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-bank-docs', title: 'Передать документы в банк', mandatory: true, tutorialId: 'tut-appraisal' },
      { id: 'cb-upload-appraisal', title: 'Загрузить оценку', mandatory: true, tutorialId: 'tut-appraisal' },
      { id: 'cb-bank-decision', title: 'Дождаться решения', mandatory: true, tutorialId: 'tut-appraisal' }
    ],
    tutorialIds: ['tut-appraisal']
  }),

  'mortgage-insurance': s({
    id: 'mortgage-insurance',
    phase: 'mortgage',
    title: 'Оформить страховку',
    shortDescription: 'Жизнь и недвижимость',
    detailedDescription: 'Оформите обязательное страхование по требованиям банка.',
    estimatedTime: '1–3 дня',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-life-ins', title: 'Страхование жизни', mandatory: true },
      { id: 'cb-property-ins', title: 'Страхование недвижимости', mandatory: true }
    ]
  }),

  'dkp-prepare': s({
    id: 'dkp-prepare',
    phase: 'contract',
    title: 'Подготовить ДКП',
    shortDescription: 'Проверить все реквизиты и условия',
    detailedDescription: 'Подготовьте договор купли-продажи и проверьте данные сторон и объекта.',
    estimatedTime: '2–5 дней',
    difficulty: 'high',
    riskLevel: 'high',
    required: true,
    documentIds: ['doc-dkp'],
    checklist: [
      { id: 'cb-dkp-price', title: 'Проверить цену', mandatory: true, tutorialId: 'tut-dkp' },
      { id: 'cb-dkp-parties', title: 'Проверить паспортные данные', mandatory: true },
      { id: 'cb-dkp-address', title: 'Проверить адрес', mandatory: true },
      { id: 'cb-dkp-payment', title: 'Проверить порядок расчётов', mandatory: true }
    ],
    tutorialIds: ['tut-dkp'],
    warnings: ['Ошибки в данных', 'Неверный кадастровый номер', 'Занижение стоимости в договоре']
  }),

  'payments-method': s({
    id: 'payments-method',
    phase: 'payments',
    title: 'Выбрать способ расчётов',
    shortDescription: 'Аккредитив, ячейка, безопасный расчёт',
    detailedDescription: 'Сравните способы расчётов по безопасности, срокам и стоимости.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-payment-compare', title: 'Сравнить варианты', mandatory: true, tutorialId: 'tut-payments' },
      { id: 'cb-accreditive', title: 'Аккредитив', mandatory: false },
      { id: 'cb-safe-box', title: 'Банковская ячейка', mandatory: false },
      { id: 'cb-escrow', title: 'Безопасный расчёт (СБР)', mandatory: false }
    ],
    tutorialIds: ['tut-payments']
  }),

  'payments-execute': s({
    id: 'payments-execute',
    phase: 'payments',
    title: 'Провести расчёты',
    shortDescription: 'Перевести средства безопасным способом',
    detailedDescription: 'Проведите расчёты только по согласованной схеме и после проверки реквизитов.',
    estimatedTime: '1–3 дня',
    difficulty: 'high',
    riskLevel: 'critical',
    required: true,
    checklist: [
      { id: 'cb-verify-details', title: 'Проверить реквизиты', mandatory: true },
      { id: 'cb-execute', title: 'Провести перевод / открыть ячейку', mandatory: true }
    ],
    warnings: ['Не передавайте деньги до регистрации без защиты', 'Проверяйте реквизиты дважды']
  }),

  'signing-docs': s({
    id: 'signing-docs',
    phase: 'signing',
    title: 'Подписать документы',
    shortDescription: 'ДКП, акты, банковские документы',
    detailedDescription: 'Подпишите договор и сопутствующие документы у нотариуса или в банке.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-sign-dkp', title: 'ДКП', mandatory: true },
      { id: 'cb-sign-act', title: 'Акт', mandatory: true },
      { id: 'cb-sign-bank', title: 'Банковские документы', mandatory: false },
      { id: 'cb-sign-receipts', title: 'Расписки', mandatory: false }
    ]
  }),

  'registration-submit': s({
    id: 'registration-submit',
    phase: 'registration',
    title: 'Подать документы в Росреестр',
    shortDescription: 'МФЦ или электронная подача',
    detailedDescription: 'Соберите пакет и подайте на регистрацию перехода права.',
    estimatedTime: '1–2 дня',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-reg-dkp', title: 'ДКП', mandatory: true },
      { id: 'cb-reg-passports', title: 'Паспорта', mandatory: true },
      { id: 'cb-reg-mortgage', title: 'Ипотечные документы', mandatory: false },
      { id: 'cb-reg-fee', title: 'Госпошлина', mandatory: true, tutorialId: 'tut-registration' }
    ],
    tutorialIds: ['tut-registration']
  }),

  'registration-track': s({
    id: 'registration-track',
    phase: 'registration',
    title: 'Отслеживать статус регистрации',
    shortDescription: 'Принято → на регистрации → зарегистрировано',
    detailedDescription: 'Отслеживайте статус в личном кабинете Росреестра или на Госуслугах.',
    estimatedTime: '5–14 дней',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-status-accepted', title: 'Принято', mandatory: true },
      { id: 'cb-status-progress', title: 'На регистрации', mandatory: true },
      { id: 'cb-status-done', title: 'Зарегистрировано', mandatory: true }
    ]
  }),

  'handover-act': s({
    id: 'handover-act',
    phase: 'handover',
    title: 'Подписать акт приёма-передачи',
    tutorialIds: ['tut-handover'],
    shortDescription: 'Ключи, счётчики, состояние',
    detailedDescription: 'Примите квартиру по акту, зафиксируйте показания счётчиков и состояние.',
    estimatedTime: '1 день',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    documentIds: ['doc-handover'],
    checklist: [
      { id: 'cb-condition', title: 'Состояние квартиры', mandatory: true },
      { id: 'cb-keys', title: 'Ключи', mandatory: true },
      { id: 'cb-meters', title: 'Счётчики', mandatory: true },
      { id: 'cb-furniture-list', title: 'Мебель по описи', mandatory: false }
    ]
  }),

  'handover-utilities': s({
    id: 'handover-utilities',
    phase: 'handover',
    title: 'Переоформить коммунальные услуги',
    shortDescription: 'Электричество, вода, газ, интернет',
    detailedDescription: 'Переоформите договоры с ресурсоснабжающими организациями.',
    estimatedTime: '3–7 дней',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-util-electric', title: 'Электричество', mandatory: true },
      { id: 'cb-util-water', title: 'Вода', mandatory: true },
      { id: 'cb-util-gas', title: 'Газ', mandatory: false },
      { id: 'cb-util-internet', title: 'Интернет', mandatory: false }
    ]
  }),

  'after-tax-deduction': s({
    id: 'after-tax-deduction',
    phase: 'after_deal',
    title: 'Оформить налоговый вычет',
    shortDescription: 'Имущественный вычет после покупки',
    detailedDescription: 'Соберите документы и подайте заявление на налоговый вычет.',
    estimatedTime: '3–10 дней',
    difficulty: 'low',
    riskLevel: 'low',
    required: false,
    checklist: [
      { id: 'cb-tax-docs', title: 'Собрать документы', mandatory: true },
      { id: 'cb-tax-apply', title: 'Подать заявление', mandatory: true },
      { id: 'cb-tax-account', title: 'Указать реквизиты', mandatory: true }
    ]
  }),

  'cash-origin-check': s({
    id: 'cash-origin-check',
    phase: 'payments',
    title: 'Подтвердить происхождение средств',
    shortDescription: 'Для сделки без ипотеки',
    detailedDescription: 'Подготовьте документы о происхождении средств при крупных наличных расчётах.',
    estimatedTime: '1–3 дня',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-cash-docs', title: 'Справки и выписки', mandatory: true },
      { id: 'cb-cash-bank', title: 'Уведомить банк при необходимости', mandatory: false }
    ]
  }),

  'matcapital-certificate': s({
    id: 'matcapital-certificate',
    phase: 'preparation',
    title: 'Проверить сертификат маткапитала',
    shortDescription: 'Статус и остаток средств',
    detailedDescription: 'Проверьте актуальность сертификата и возможность направления на покупку.',
    estimatedTime: '2–5 дней',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    tutorialIds: ['tut-matcapital'],
    warnings: ['Нельзя нарушать права детей', 'Необходимо выделение долей'],
    checklist: [
      { id: 'cb-mc-cert-status', title: 'Проверить остаток сертификата', mandatory: true, tutorialId: 'tut-matcapital' },
      { id: 'cb-mc-cert-valid', title: 'Убедиться в действительности', mandatory: true, tutorialId: 'tut-matcapital' },
      { id: 'cb-mc-cert-purpose', title: 'Подтвердить цель — покупка жилья', mandatory: true, tutorialId: 'tut-matcapital' }
    ]
  }),

  'matcapital-pfr': s({
    id: 'matcapital-pfr',
    phase: 'preparation',
    title: 'Согласовать с ПФР / СФР',
    shortDescription: 'Направление средств на покупку',
    detailedDescription: 'Подайте заявление о распоряжении материнским капиталом.',
    estimatedTime: '10–30 дней',
    difficulty: 'high',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-mc-pfr-apply', title: 'Подать заявление в СФР', mandatory: true, tutorialId: 'tut-matcapital' },
      { id: 'cb-mc-pfr-docs', title: 'Приложить документы на объект', mandatory: true, tutorialId: 'tut-matcapital' },
      { id: 'cb-mc-pfr-track', title: 'Отслеживать статус', mandatory: true, tutorialId: 'tut-matcapital' }
    ],
    tutorialIds: ['tut-matcapital']
  }),

  'matcapital-shares': s({
    id: 'matcapital-shares',
    phase: 'contract',
    title: 'Выделить доли детям',
    shortDescription: 'Обязательное условие при использовании маткапитала',
    detailedDescription: 'Оформите выделение долей несовершеннолетним детям в установленные сроки.',
    estimatedTime: '6 месяцев после регистрации',
    difficulty: 'high',
    riskLevel: 'critical',
    required: true,
    warnings: ['Нарушение сроков — штрафы и риск оспаривания сделки'],
    checklist: [
      { id: 'cb-mc-shares-plan', title: 'Спланировать доли', mandatory: true, tutorialId: 'tut-matcapital' },
      { id: 'cb-mc-shares-register', title: 'Зарегистрировать выделение', mandatory: true, tutorialId: 'tut-matcapital' },
      { id: 'cb-mc-shares-deadline', title: 'Уложиться в 6 месяцев', mandatory: true, tutorialId: 'tut-matcapital' }
    ],
    tutorialIds: ['tut-matcapital']
  }),

  'poa-check': s({
    id: 'poa-check',
    phase: 'object_check',
    title: 'Проверить доверенность',
    shortDescription: 'Срок, полномочия, нотариус',
    detailedDescription: 'Проверьте доверенность продавца: срок действия, полномочия и реестр нотариуса.',
    estimatedTime: '1 день',
    difficulty: 'high',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-poa-valid', title: 'Срок действия', mandatory: true, tutorialId: 'tut-poa' },
      { id: 'cb-poa-powers', title: 'Полномочия на продажу', mandatory: true },
      { id: 'cb-poa-notary', title: 'Проверка у нотариуса', mandatory: true }
    ],
    tutorialIds: ['tut-poa']
  }),

  'inheritance-heirs': s({
    id: 'inheritance-heirs',
    phase: 'object_check',
    title: 'Проверить наследников',
    shortDescription: 'Скрытые наследники и сроки',
    detailedDescription: 'Проверьте сроки вступления в наследство и возможных оспаривателей.',
    estimatedTime: '2–5 дней',
    difficulty: 'high',
    riskLevel: 'critical',
    required: true,
    tutorialIds: ['tut-inheritance'],
    warnings: ['Возможны скрытые наследники даже после сделки', 'Судебные споры по наследству'],
    checklist: [
      { id: 'cb-inh-heirs-list', title: 'Проверить всех наследников', mandatory: true, tutorialId: 'tut-inheritance' },
      { id: 'cb-inh-heirs-term', title: 'Срок 6 месяцев с даты смерти', mandatory: true, tutorialId: 'tut-inheritance' },
      { id: 'cb-inh-heirs-court', title: 'Проверить судебные споры', mandatory: true, tutorialId: 'tut-inheritance' }
    ]
  }),

  'minors-guardianship': s({
    id: 'minors-guardianship',
    phase: 'contract',
    title: 'Получить разрешение опеки',
    shortDescription: 'При несовершеннолетних собственниках',
    detailedDescription: 'Получите разрешение органов опеки и проверьте альтернативное жильё.',
    estimatedTime: '14–30 дней',
    difficulty: 'high',
    riskLevel: 'critical',
    required: true,
    tutorialIds: ['tut-minors'],
    documentIds: ['doc-guardianship'],
    warnings: ['Сделка может быть оспорена при нарушении прав ребёнка'],
    checklist: [
      { id: 'cb-min-guard-apply', title: 'Подать документы в опеку', mandatory: true, tutorialId: 'tut-minors' },
      { id: 'cb-min-guard-housing', title: 'Подтвердить альтернативное жильё', mandatory: true, tutorialId: 'tut-minors' },
      { id: 'cb-min-guard-permit', title: 'Получить разрешение', mandatory: true, tutorialId: 'tut-minors' }
    ]
  }),

  'co-owners-consent': s({
    id: 'co-owners-consent',
    phase: 'object_check',
    title: 'Согласия всех собственников',
    shortDescription: 'Несколько собственников в сделке',
    detailedDescription:
      'Соберите согласия всех собственников, проверьте паспорта и полномочия. При долевой собственности уточните нотариальные требования.',
    estimatedTime: '3–7 дней',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    tutorialIds: ['tut-spouse-consent'],
    warnings: ['Отказ одного собственника блокирует сделку'],
    checklist: [
      { id: 'cb-co-list', title: 'Список всех собственников из ЕГРН', mandatory: true },
      { id: 'cb-co-passports', title: 'Паспорта и документы каждого', mandatory: true },
      { id: 'cb-co-consent', title: 'Письменные согласия / нотариат', mandatory: true },
      { id: 'cb-co-spouse', title: 'Согласие супругов', mandatory: false, tutorialId: 'tut-spouse-consent' }
    ]
  }),

  'chain-sync': s({
    id: 'chain-sync',
    phase: 'advance',
    title: 'Синхронизировать цепочку сделок',
    shortDescription: 'Альтернатива и цепочка',
    detailedDescription: 'Согласуйте сроки и условия со всеми участниками цепочки.',
    estimatedTime: '7–21 день',
    difficulty: 'high',
    riskLevel: 'high',
    required: true,
    tutorialIds: ['tut-chain'],
    warnings: ['Срыв одного звена блокирует всю цепочку'],
    checklist: [
      { id: 'cb-chain-calendar', title: 'Составить календарь сделок', mandatory: true, tutorialId: 'tut-chain' },
      { id: 'cb-chain-contacts', title: 'Согласовать контакты участников', mandatory: true, tutorialId: 'tut-chain' },
      { id: 'cb-chain-penalty', title: 'Зафиксировать штрафы за срыв', mandatory: true, tutorialId: 'tut-chain' }
    ]
  }),

  'sell-prep-docs': s({
    id: 'sell-prep-docs',
    phase: 'preparation',
    title: 'Подготовить документы продавца',
    shortDescription: 'Правоустанавливающие и личные документы',
    detailedDescription: 'Соберите документы на квартиру и личные документы всех собственников.',
    estimatedTime: '2–5 дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-sell-egrn', title: 'Выписка ЕГРН', mandatory: true },
      { id: 'cb-sell-ownership', title: 'Правоустанавливающие', mandatory: true },
      { id: 'cb-sell-spouse', title: 'Согласие супруга', mandatory: false, tutorialId: 'tut-spouse-consent' }
    ]
  }),

  'sell-restrictions': s({
    id: 'sell-restrictions',
    phase: 'preparation',
    title: 'Проверить ограничения продажи',
    shortDescription: 'Ипотека, опека, маткапитал',
    detailedDescription: 'Убедитесь, что нет ограничений на распоряжение объектом.',
    estimatedTime: '1–3 дня',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    checklist: [
      { id: 'cb-sell-rest-mortgage', title: 'Проверить ипотеку', mandatory: true, tutorialId: 'tut-sell-mortgage' },
      { id: 'cb-sell-rest-mc', title: 'Проверить маткапитал', mandatory: true, tutorialId: 'tut-matcapital' },
      { id: 'cb-sell-rest-guard', title: 'Проверить опеку', mandatory: true, tutorialId: 'tut-minors' }
    ]
  }),

  'sell-prep-flat': s({
    id: 'sell-prep-flat',
    phase: 'preparation',
    title: 'Подготовить квартиру к показам',
    shortDescription: 'Уборка, мелкий ремонт, фото',
    detailedDescription: 'Подготовьте квартиру к показам и съёмке для объявления.',
    estimatedTime: '3–7 дней',
    difficulty: 'low',
    riskLevel: 'low',
    required: false,
    checklist: [
      { id: 'cb-sell-flat-clean', title: 'Уборка и деперсонализация', mandatory: true, tutorialId: 'tut-sell-prep-flat' },
      { id: 'cb-sell-flat-repair', title: 'Мелкий ремонт', mandatory: false, tutorialId: 'tut-sell-prep-flat' },
      { id: 'cb-sell-flat-photo', title: 'Подготовка к фотосъёмке', mandatory: true, tutorialId: 'tut-sell-prep-flat' }
    ],
    tutorialIds: ['tut-sell-prep-flat']
  }),

  'sell-listing': s({
    id: 'sell-listing',
    phase: 'marketing',
    title: 'Опубликовать объявление',
    shortDescription: 'Фото, описание, площадки',
    detailedDescription: 'Разместите объявление на площадках с качественными фото.',
    estimatedTime: '1–2 дня',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-sell-list-photo', title: 'Загрузить фото', mandatory: true, tutorialId: 'tut-sell-listing' },
      { id: 'cb-sell-list-text', title: 'Написать описание', mandatory: true, tutorialId: 'tut-sell-listing' },
      { id: 'cb-sell-list-publish', title: 'Опубликовать на площадках', mandatory: true, tutorialId: 'tut-sell-listing' }
    ],
    tutorialIds: ['tut-sell-listing']
  }),

  'sell-shows': s({
    id: 'sell-shows',
    phase: 'marketing',
    title: 'Провести показы',
    shortDescription: 'Организация визитов покупателей',
    detailedDescription: 'Проводите показы по расписанию, фиксируйте обратную связь.',
    estimatedTime: '7–30 дней',
    difficulty: 'low',
    riskLevel: 'low',
    required: true,
    checklist: [
      { id: 'cb-sell-show-schedule', title: 'Составить расписание', mandatory: true, tutorialId: 'tut-sell-shows' },
      { id: 'cb-sell-show-conduct', title: 'Провести показы', mandatory: true, tutorialId: 'tut-sell-shows' },
      { id: 'cb-sell-show-feedback', title: 'Собрать обратную связь', mandatory: true, tutorialId: 'tut-sell-shows' }
    ],
    tutorialIds: ['tut-sell-shows']
  }),

  'sell-negotiation': s({
    id: 'sell-negotiation',
    phase: 'advance',
    title: 'Вести переговоры',
    shortDescription: 'Цена, сроки, условия',
    detailedDescription: 'Согласуйте цену и условия с покупателем.',
    estimatedTime: '3–14 дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-sell-neg-price', title: 'Согласовать цену', mandatory: true, tutorialId: 'tut-sell-negotiation' },
      { id: 'cb-sell-neg-terms', title: 'Согласовать сроки', mandatory: true, tutorialId: 'tut-sell-negotiation' },
      { id: 'cb-sell-neg-advance', title: 'Условия аванса', mandatory: true, tutorialId: 'tut-sell-negotiation' }
    ],
    tutorialIds: ['tut-sell-negotiation']
  }),

  'sell-mortgage-payoff': s({
    id: 'sell-mortgage-payoff',
    phase: 'preparation',
    title: 'Получить справку об остатке долга',
    shortDescription: 'Для ипотечной квартиры',
    detailedDescription: 'Запросите в банке справку об остатке ипотеки и согласуйте порядок снятия обременения.',
    estimatedTime: '3–7 дней',
    difficulty: 'medium',
    riskLevel: 'high',
    required: true,
    tutorialIds: ['tut-sell-mortgage'],
    checklist: [
      { id: 'cb-sell-mp-request', title: 'Запросить справку в банке', mandatory: true, tutorialId: 'tut-sell-mortgage' },
      { id: 'cb-sell-mp-scheme', title: 'Согласовать схему расчётов', mandatory: true, tutorialId: 'tut-sell-mortgage' },
      { id: 'cb-sell-mp-buyer', title: 'Согласовать покупателя с банком', mandatory: true, tutorialId: 'tut-sell-mortgage' }
    ]
  }),

  'sell-mortgage-release': s({
    id: 'sell-mortgage-release',
    phase: 'registration',
    title: 'Снять обременение',
    shortDescription: 'После погашения ипотеки',
    detailedDescription: 'Организуйте снятие ипотеки в Росреестре после расчётов.',
    estimatedTime: '5–14 дней',
    difficulty: 'medium',
    riskLevel: 'medium',
    required: true,
    checklist: [
      { id: 'cb-sell-mr-payoff', title: 'Погасить остаток', mandatory: true, tutorialId: 'tut-sell-mortgage' },
      { id: 'cb-sell-mr-bank', title: 'Получить документы от банка', mandatory: true, tutorialId: 'tut-sell-mortgage' },
      { id: 'cb-sell-mr-register', title: 'Подать на снятие обременения', mandatory: true, tutorialId: 'tut-sell-mortgage' }
    ],
    tutorialIds: ['tut-sell-mortgage']
  }),

  'spouse-consent': s({
    id: 'spouse-consent',
    phase: 'preparation',
    title: 'Получить согласие супруга',
    shortDescription: 'Если квартира нажита в браке',
    detailedDescription: 'Оформите нотариальное согласие супруга на сделку.',
    estimatedTime: '1–2 дня',
    difficulty: 'low',
    riskLevel: 'medium',
    required: false,
    documentIds: ['doc-spouse-consent'],
    checklist: [
      { id: 'cb-spouse-notary', title: 'Записаться к нотариусу', mandatory: true, tutorialId: 'tut-spouse-consent' },
      { id: 'cb-spouse-sign', title: 'Подписать согласие', mandatory: true, tutorialId: 'tut-spouse-consent' },
      { id: 'cb-spouse-attach', title: 'Приложить к пакету документов', mandatory: true, tutorialId: 'tut-spouse-consent' }
    ],
    tutorialIds: ['tut-spouse-consent']
  })
};

export const ALL_STEP_IDS = Object.keys(STEP_LIBRARY);

/** Находит шаг сделки, к которому привязан туториал (по tutorialIds или checklist). */
export function findStepIdByTutorialId(tutorialId: string): string | undefined {
  for (const stepId of ALL_STEP_IDS) {
    const step = STEP_LIBRARY[stepId];
    if (step.tutorialIds?.includes(tutorialId)) return stepId;
    if (step.checklist?.some((item) => item.tutorialId === tutorialId)) return stepId;
  }
  return undefined;
}

export function getStep(id: string): DealStep | undefined {
  const step = STEP_LIBRARY[id];
  return step ? enrichStep(step) : undefined;
}

export function getSteps(ids: string[]): DealStep[] {
  return ids.map((id) => STEP_LIBRARY[id]).filter(Boolean).map(enrichStep);
}
