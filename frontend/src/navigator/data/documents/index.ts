import type { DocumentTemplate } from '../../types';

export const DOCUMENT_LIBRARY: DocumentTemplate[] = [
  {
    id: 'doc-ddu',
    title: 'Договор долевого участия (ДДУ)',
    description:
      'Договор с застройщиком: объект, цена, срок передачи, отделка, эскроу-счёт и ответственность сторон.',
    type: 'ДДУ',
    scenarioTags: ['buy']
  },
  {
    id: 'doc-dkp',
    title: 'Договор купли-продажи (ДКП)',
    description: 'Основной договор передачи права на квартиру. Проверьте стороны, объект, цену и порядок расчётов.',
    type: 'ДКП',
    scenarioTags: ['buy', 'sell']
  },
  {
    id: 'doc-pre-dkp',
    title: 'Предварительный ДКП',
    description: 'Фиксирует намерение сторон и основные условия до основного договора.',
    type: 'Предварительный ДКП',
    scenarioTags: ['buy']
  },
  {
    id: 'doc-advance',
    title: 'Авансовое соглашение',
    description: 'Условия предоплаты, сроки основного договора и ответственность сторон.',
    type: 'Аванс',
    scenarioTags: ['buy', 'sell']
  },
  {
    id: 'doc-receipt',
    title: 'Расписка',
    description: 'Подтверждение получения денежных средств с указанием суммы и назначения.',
    type: 'Расписка',
    scenarioTags: ['buy', 'sell']
  },
  {
    id: 'doc-handover',
    title: 'Акт приёма-передачи',
    description: 'Фиксирует передачу квартиры, ключей, показания счётчиков и состояние.',
    type: 'Акт',
    scenarioTags: ['buy', 'sell']
  },
  {
    id: 'doc-spouse-consent',
    title: 'Согласие супруга',
    description: 'Нотариальное согласие на сделку при совместно нажитом имуществе.',
    type: 'Согласие супруга',
    scenarioTags: ['buy', 'sell']
  },
  {
    id: 'doc-guardianship',
    title: 'Разрешение органов опеки',
    description: 'Обязательно при участии несовершеннолетних собственников.',
    type: 'Разрешение опеки',
    scenarioTags: ['buy', 'sell']
  },
  {
    id: 'doc-egrn',
    title: 'Выписка из ЕГРН',
    description: 'Актуальные сведения об объекте, правах и обременениях.',
    type: 'Выписка ЕГРН',
    scenarioTags: ['buy', 'sell']
  },
  {
    id: 'doc-appraisal',
    title: 'Оценочный отчёт',
    description: 'Для ипотечной сделки — отчёт аккредитованной оценочной компании.',
    type: 'Оценка',
    scenarioTags: ['buy']
  },
  {
    id: 'doc-mortgage',
    title: 'Ипотечный договор',
    description: 'Кредитный договор с банком и график платежей.',
    type: 'Ипотека',
    scenarioTags: ['buy', 'sell']
  }
];

export function getDocument(id: string): DocumentTemplate | undefined {
  return DOCUMENT_LIBRARY.find((d) => d.id === id);
}
