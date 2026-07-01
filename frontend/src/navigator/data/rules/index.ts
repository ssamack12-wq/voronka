import type { Rule, RiskFactor } from '../../types';

export const RISK_FACTORS: Record<string, RiskFactor> = {
  'rf-poa': {
    id: 'rf-poa',
    label: 'Сделка по доверенности',
    level: 'high',
    description: 'Представитель действует по доверенности — нужна расширенная проверка.'
  },
  'rf-inheritance': {
    id: 'rf-inheritance',
    label: 'Наследственная квартира',
    level: 'critical',
    description: 'Возможны скрытые наследники и оспаривание.'
  },
  'rf-matcapital': {
    id: 'rf-matcapital',
    label: 'Материнский капитал',
    level: 'high',
    description: 'Требуется выделение долей детям и согласование с СФР.'
  },
  'rf-minors': {
    id: 'rf-minors',
    label: 'Несовершеннолетние собственники',
    level: 'critical',
    description: 'Нужно разрешение органов опеки и альтернативное жильё.'
  },
  'rf-less-3y': {
    id: 'rf-less-3y',
    label: 'Менее 3 лет в собственности',
    level: 'high',
    description: 'Ограничения по налогу и риск оспаривания при маткапитале.'
  },
  'rf-mortgage': {
    id: 'rf-mortgage',
    label: 'Ипотека',
    level: 'medium',
    description: 'Дополнительные этапы: оценка, одобрение объекта, страхование.'
  },
  'rf-chain': {
    id: 'rf-chain',
    label: 'Цепочка / альтернатива',
    level: 'high',
    description: 'Зависимость от сроков всех участников цепочки.'
  },
  'rf-cash': {
    id: 'rf-cash',
    label: 'Наличные расчёты',
    level: 'medium',
    description: 'Повышенные требования к подтверждению происхождения средств.'
  },
  'rf-urgent': {
    id: 'rf-urgent',
    label: 'Срочная продажа',
    level: 'medium',
    description: 'Сжатые сроки повышают риск ошибок в документах.'
  },
  'rf-multiple-owners': {
    id: 'rf-multiple-owners',
    label: 'Несколько собственников',
    level: 'medium',
    description: 'Нужны согласия всех собственников и проверка полномочий каждого.'
  }
};

export const RULES: Rule[] = [
  {
    id: 'rule-mortgage-add',
    label: 'Ипотека — добавить этапы',
    when: { mortgage: true },
    addStepIds: ['mortgage-appraisal', 'mortgage-object-approval', 'mortgage-insurance'],
    riskFactorIds: ['rf-mortgage']
  },
  {
    id: 'rule-mortgage-remove',
    label: 'Без ипотеки — убрать ипотечные этапы',
    when: { mortgage: false, cash_only: true },
    removeStepIds: [
      'prep-mortgage-approval',
      'mortgage-appraisal',
      'mortgage-object-approval',
      'mortgage-insurance'
    ],
    addStepIds: ['cash-origin-check'],
    riskFactorIds: ['rf-cash']
  },
  {
    id: 'rule-matcapital',
    label: 'Маткапитал',
    when: { matcapital: true },
    addStepIds: ['matcapital-certificate', 'matcapital-pfr', 'matcapital-shares'],
    riskFactorIds: ['rf-matcapital']
  },
  {
    id: 'rule-poa',
    label: 'Доверенность',
    when: { power_of_attorney: true },
    addStepIds: ['poa-check'],
    riskFactorIds: ['rf-poa']
  },
  {
    id: 'rule-inheritance',
    label: 'Наследство',
    when: { inheritance: true },
    addStepIds: ['inheritance-heirs'],
    riskFactorIds: ['rf-inheritance']
  },
  {
    id: 'rule-minors',
    label: 'Несовершеннолетние',
    when: { minors: true },
    addStepIds: ['minors-guardianship'],
    riskFactorIds: ['rf-minors']
  },
  {
    id: 'rule-chain',
    label: 'Цепочка',
    when: { chain: true },
    addStepIds: ['chain-sync'],
    riskFactorIds: ['rf-chain']
  },
  {
    id: 'rule-alternative',
    label: 'Альтернатива',
    when: { alternative: true },
    addStepIds: ['chain-sync'],
    riskFactorIds: ['rf-chain']
  },
  {
    id: 'rule-less-3y',
    label: 'Менее 3 лет',
    when: { less_than_3_years: true },
    riskFactorIds: ['rf-less-3y']
  },
  {
    id: 'rule-sell-mortgage',
    label: 'Продажа ипотечной',
    when: { mortgage: true },
    addStepIds: ['sell-mortgage-payoff', 'sell-mortgage-release'],
    riskFactorIds: ['rf-mortgage']
  },
  {
    id: 'rule-urgent-sell',
    label: 'Срочная продажа',
    when: { urgent: true },
    riskFactorIds: ['rf-urgent']
  },
  {
    id: 'rule-multiple-owners',
    label: 'Несколько собственников',
    when: { multiple_owners: true },
    addStepIds: ['co-owners-consent'],
    riskFactorIds: ['rf-multiple-owners']
  },
  {
    id: 'rule-nb-no-mortgage',
    label: 'Новостройка без ипотеки',
    when: { newbuilding: true, mortgage: false },
    removeStepIds: ['prep-mortgage-approval', 'nb-mortgage-disbursement', 'mortgage-insurance']
  },
  {
    id: 'rule-verify-poa',
    label: 'Проверка доверенности (неопределённость)',
    when: { verify_poa: true },
    addStepIds: ['poa-check'],
    riskFactorIds: ['rf-poa']
  },
  {
    id: 'rule-verify-minors',
    label: 'Проверка несовершеннолетних (неопределённость)',
    when: { verify_minors: true },
    addStepIds: ['minors-guardianship'],
    riskFactorIds: ['rf-minors']
  },
  {
    id: 'rule-verify-alternative',
    label: 'Проверка альтернативы (неопределённость)',
    when: { verify_alternative: true },
    addStepIds: ['chain-sync'],
    riskFactorIds: ['rf-chain']
  },
  {
    id: 'rule-verify-owners',
    label: 'Проверка собственников (неопределённость)',
    when: { verify_owners: true },
    addStepIds: ['co-owners-consent'],
    riskFactorIds: ['rf-multiple-owners']
  }
];
