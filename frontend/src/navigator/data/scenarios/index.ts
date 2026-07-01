import type { ScenarioDefinition } from '../../types';

const BUY_SECONDARY_BASE = [
  'prep-budget',
  'prep-mortgage-approval',
  'prep-buyer-docs',
  'object-area',
  'object-seller',
  'object-egrn',
  'object-title-history',
  'object-encumbrances',
  'object-registered-persons',
  'object-utilities-debt',
  'object-replanning',
  'advance-terms',
  'advance-type',
  'advance-preliminary-docs',
  'mortgage-appraisal',
  'mortgage-object-approval',
  'mortgage-insurance',
  'dkp-prepare',
  'payments-method',
  'payments-execute',
  'signing-docs',
  'registration-submit',
  'registration-track',
  'handover-act',
  'handover-utilities',
  'after-tax-deduction'
];

const BUY_CASH_BASE = BUY_SECONDARY_BASE.filter(
  (id) =>
    ![
      'prep-mortgage-approval',
      'mortgage-appraisal',
      'mortgage-object-approval',
      'mortgage-insurance'
    ].includes(id)
);

const SELL_SECONDARY_BASE = [
  'sell-prep-docs',
  'sell-restrictions',
  'sell-prep-flat',
  'sell-listing',
  'sell-shows',
  'sell-negotiation',
  'object-egrn',
  'advance-terms',
  'advance-type',
  'advance-preliminary-docs',
  'dkp-prepare',
  'payments-method',
  'payments-execute',
  'signing-docs',
  'registration-submit',
  'registration-track',
  'handover-act',
  'handover-utilities'
];

/** Core scenarios resolved by the deal quiz */
export const CORE_SCENARIO_IDS = [
  'buy-secondary-mortgage',
  'buy-secondary-cash',
  'buy-newbuilding',
  'sell-secondary',
  'sell-mortgage',
  'buy-land',
  'sell-land'
] as const;

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'buy-secondary-mortgage',
    category: 'buy',
    title: 'Покупка вторички с ипотекой',
    description: 'Классическая сделка: одобрение, проверка объекта, ипотека, регистрация.',
    complexity: 7,
    baseRisk: 'medium',
    estimatedDuration: '14–45 дней',
    conditions: { mortgage: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-secondary-cash',
    category: 'buy',
    title: 'Покупка вторички',
    description: 'Полная оплата собственными средствами, усиленная проверка расчётов.',
    complexity: 6,
    baseRisk: 'medium',
    estimatedDuration: '14–35 дней',
    conditions: { mortgage: false, cash_only: true },
    baseStepIds: BUY_CASH_BASE
  },
  {
    id: 'buy-newbuilding',
    category: 'buy',
    title: 'Покупка новостройки',
    description: 'ДДУ с застройщиком, эскроу-счёт, ожидание сдачи, приёмка и регистрация права.',
    complexity: 8,
    baseRisk: 'medium',
    estimatedDuration: '12–36 месяцев',
    conditions: { mortgage: true, newbuilding: true },
    baseStepIds: [
      'prep-budget',
      'prep-mortgage-approval',
      'nb-developer-select',
      'nb-developer-reputation',
      'nb-building-permit',
      'nb-project-declaration',
      'nb-escrow-check',
      'nb-delivery-dates',
      'nb-ddu-review',
      'nb-penalties',
      'nb-reservation',
      'nb-ddu-sign',
      'nb-mortgage-disbursement',
      'mortgage-insurance',
      'nb-ddu-registration',
      'nb-wait-construction',
      'nb-acceptance',
      'nb-defects-check',
      'nb-act-signing',
      'nb-keys',
      'nb-ownership-registration',
      'after-tax-deduction'
    ]
  },
  {
    id: 'buy-apartments',
    category: 'buy',
    title: 'Покупка апартаментов',
    description: 'Проверка статуса помещения, коммунальные платежи, налоги.',
    complexity: 7,
    baseRisk: 'medium',
    estimatedDuration: '14–40 дней',
    conditions: { mortgage: true, apartments: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-house',
    category: 'buy',
    title: 'Покупка дома',
    description: 'Земельный участок, дом, межевание, коммуникации.',
    complexity: 8,
    baseRisk: 'high',
    estimatedDuration: '21–60 дней',
    conditions: { mortgage: true },
    baseStepIds: [...BUY_SECONDARY_BASE, 'object-replanning']
  },
  {
    id: 'buy-land',
    category: 'buy',
    title: 'Покупка участка',
    description: 'Категория земли, ВРИ, межевание, обременения.',
    complexity: 8,
    baseRisk: 'high',
    estimatedDuration: '21–45 дней',
    conditions: { mortgage: false, cash_only: true },
    baseStepIds: BUY_CASH_BASE.filter((id) => id !== 'object-replanning')
  },
  {
    id: 'buy-room',
    category: 'buy',
    title: 'Покупка комнаты',
    description: 'Доля в квартире, согласие сособственников, прописанные.',
    complexity: 8,
    baseRisk: 'high',
    estimatedDuration: '21–50 дней',
    conditions: { room: true, mortgage: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-share',
    category: 'buy',
    title: 'Покупка доли',
    description: 'Преимущественное право, сособственники, нотариат.',
    complexity: 9,
    baseRisk: 'high',
    estimatedDuration: '30–60 дней',
    conditions: { share: true, mortgage: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-power-of-attorney',
    category: 'buy',
    title: 'Покупка по доверенности',
    description: 'Проверка полномочий представителя продавца.',
    complexity: 8,
    baseRisk: 'high',
    estimatedDuration: '14–40 дней',
    conditions: { mortgage: true, power_of_attorney: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-mortgage',
    category: 'buy',
    title: 'Покупка с ипотекой',
    description: 'Универсальный сценарий ипотечной покупки.',
    complexity: 7,
    baseRisk: 'medium',
    estimatedDuration: '14–45 дней',
    conditions: { mortgage: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-no-mortgage',
    category: 'buy',
    title: 'Покупка без ипотеки',
    description: 'Собственные средства, проверка происхождения денег.',
    complexity: 6,
    baseRisk: 'medium',
    estimatedDuration: '14–35 дней',
    conditions: { mortgage: false, cash_only: true },
    baseStepIds: BUY_CASH_BASE
  },
  {
    id: 'buy-matcapital',
    category: 'buy',
    title: 'Покупка с маткапиталом',
    description: 'СФР, выделение долей, согласование перечисления.',
    complexity: 9,
    baseRisk: 'high',
    estimatedDuration: '30–90 дней',
    conditions: { mortgage: true, matcapital: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-alternative',
    category: 'buy',
    title: 'Альтернативная сделка',
    description: 'Одновременная покупка и продажа, синхронизация сроков.',
    complexity: 9,
    baseRisk: 'high',
    estimatedDuration: '30–60 дней',
    conditions: { mortgage: true, alternative: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-chain',
    category: 'buy',
    title: 'Цепочка сделок',
    description: 'Несколько звеньев, контроль сроков всех участников.',
    complexity: 10,
    baseRisk: 'high',
    estimatedDuration: '30–90 дней',
    conditions: { mortgage: true, chain: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-inheritance',
    category: 'buy',
    title: 'Покупка наследственной квартиры',
    description: 'Проверка наследников, сроков вступления, споров.',
    complexity: 9,
    baseRisk: 'critical',
    estimatedDuration: '21–60 дней',
    conditions: { mortgage: true, inheritance: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-less-than-3-years',
    category: 'buy',
    title: 'Покупка квартиры менее 3 лет в собственности',
    description: 'Налоговые риски и ограничения при перепродаже.',
    complexity: 7,
    baseRisk: 'high',
    estimatedDuration: '14–40 дней',
    conditions: { mortgage: true, less_than_3_years: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'buy-with-minors',
    category: 'buy',
    title: 'Покупка с несовершеннолетними собственниками',
    description: 'Разрешение опеки, альтернативное жильё.',
    complexity: 9,
    baseRisk: 'critical',
    estimatedDuration: '30–60 дней',
    conditions: { mortgage: true, minors: true },
    baseStepIds: BUY_SECONDARY_BASE
  },
  {
    id: 'sell-land',
    category: 'sell',
    title: 'Продажа участка',
    description: 'Подготовка участка, проверка ВРИ и категории земли, договор и регистрация.',
    complexity: 7,
    baseRisk: 'high',
    estimatedDuration: '21–45 дней',
    conditions: { cash_only: true },
    baseStepIds: SELL_SECONDARY_BASE.filter((id) => id !== 'object-replanning')
  },
  {
    id: 'sell-secondary',
    category: 'sell',
    title: 'Продажа вторички',
    description: 'Подготовка, показы, аванс, ДКП, расчёты, передача.',
    complexity: 6,
    baseRisk: 'medium',
    estimatedDuration: '21–60 дней',
    conditions: {},
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-newbuilding',
    category: 'sell',
    title: 'Продажа новостройки',
    description: 'Переуступка или продажа после регистрации права.',
    complexity: 6,
    baseRisk: 'medium',
    estimatedDuration: '14–45 дней',
    conditions: { newbuilding: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-mortgage',
    category: 'sell',
    title: 'Продажа ипотечной квартиры',
    description: 'Справка об остатке долга, согласование с банком, снятие обременения.',
    complexity: 8,
    baseRisk: 'high',
    estimatedDuration: '30–75 дней',
    conditions: { mortgage: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-matcapital',
    category: 'sell',
    title: 'Продажа с маткапиталом',
    description: 'Выделенные доли детям, согласование с опекой.',
    complexity: 9,
    baseRisk: 'high',
    estimatedDuration: '30–90 дней',
    conditions: { matcapital: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-power-of-attorney',
    category: 'sell',
    title: 'Продажа по доверенности',
    description: 'Представитель покупателя или продавца по доверенности.',
    complexity: 7,
    baseRisk: 'high',
    estimatedDuration: '21–45 дней',
    conditions: { power_of_attorney: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-inheritance',
    category: 'sell',
    title: 'Продажа наследственной квартиры',
    description: 'Вступление в наследство, все наследники, отказ от доли.',
    complexity: 8,
    baseRisk: 'critical',
    estimatedDuration: '30–90 дней',
    conditions: { inheritance: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-share',
    category: 'sell',
    title: 'Продажа доли',
    description: 'Уведомление сособственников, преимущественное право.',
    complexity: 8,
    baseRisk: 'high',
    estimatedDuration: '30–60 дней',
    conditions: { share: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-room',
    category: 'sell',
    title: 'Продажа комнаты',
    description: 'Доля в коммунальной квартире, согласия сособственников.',
    complexity: 8,
    baseRisk: 'high',
    estimatedDuration: '30–60 дней',
    conditions: { room: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-with-minors',
    category: 'sell',
    title: 'Продажа с несовершеннолетними',
    description: 'Разрешение опеки на отчуждение доли ребёнка.',
    complexity: 9,
    baseRisk: 'critical',
    estimatedDuration: '30–75 дней',
    conditions: { minors: true },
    baseStepIds: SELL_SECONDARY_BASE
  },
  {
    id: 'sell-urgent',
    category: 'sell',
    title: 'Срочная продажа',
    description: 'Сжатые сроки, приоритет безопасности расчётов.',
    complexity: 7,
    baseRisk: 'medium',
    estimatedDuration: '7–21 день',
    conditions: { urgent: true },
    baseStepIds: SELL_SECONDARY_BASE
  }
];

export function getScenario(id: string): ScenarioDefinition | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export const CORE_SCENARIOS = SCENARIOS.filter((s) =>
  (CORE_SCENARIO_IDS as readonly string[]).includes(s.id)
);

export const SCENARIOS_BY_CATEGORY = {
  buy: CORE_SCENARIOS.filter((s) => s.category === 'buy'),
  sell: CORE_SCENARIOS.filter((s) => s.category === 'sell')
};
