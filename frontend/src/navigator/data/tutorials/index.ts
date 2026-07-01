import type { Tutorial } from '../../types';
import { buildFallbackTutorial } from '../contentDefaults';
import { findStepIdByTutorialId, getStep } from '../steps';
import { getSubtasksForStep } from './subtasks';
import { EXTRA_TUTORIALS } from './extra';
import { getAllNewbuildingTutorials } from './newbuilding';
import { LINK_SETS, LINKS, mergeLinks } from './links';

function resolveTutorialStepId(tutorial: Tutorial): string | undefined {
  if (tutorial.stepId) return tutorial.stepId;
  if (!tutorial.id.startsWith('tut-')) return undefined;

  const fromId = tutorial.id.slice(4);
  if (getStep(fromId)) return fromId;

  return findStepIdByTutorialId(tutorial.id) ?? fromId;
}

function enrichTutorial(tutorial: Tutorial, scenarioId?: string): Tutorial {
  const stepId = resolveTutorialStepId(tutorial);
  if (!stepId) return tutorial;

  const step = getStep(stepId);
  const subtasks = getSubtasksForStep(stepId, step, scenarioId);
  if (!subtasks.length) return tutorial;

  return { ...tutorial, stepId, subtasks };
}

const BASE_TUTORIALS: Record<string, Tutorial> = {
  'tut-egrn': {
    id: 'tut-egrn',
    checklistItemId: 'cb-egrn-order',
    stepId: 'object-egrn',
    title: 'Получить выписку из ЕГРН',
    summary: 'Заказ актуальной выписки на сайте Росреестра или через Госуслуги',
    whatIsIt:
      'Выписка из ЕГРН — официальный документ с данными об объекте, собственниках и обременениях.',
    whyNeeded:
      'Без актуальной выписки невозможно убедиться в юридической чистоте квартиры и правах продавца.',
    requirements: ['Адрес объекта', 'Кадастровый номер', 'Учётная запись на Госуслугах'],
    estimatedTime: '5–10 минут (онлайн)',
    steps: [
      {
        order: 1,
        title: 'Перейдите на сайт Росреестра',
        description: 'Откройте раздел «Получить сведения из ЕГРН» на rosreestr.gov.ru или через Госуслуги.'
      },
      {
        order: 2,
        title: 'Нажмите «Получить выписку»',
        description: 'Выберите тип: «Об объекте недвижимости» для проверки квартиры.'
      },
      {
        order: 3,
        title: 'Введите кадастровый номер',
        description: 'Используйте кадастровый номер из объявления или спросите у продавца. Адрес — запасной вариант.'
      },
      {
        order: 4,
        title: 'Оплатите и скачайте PDF',
        description: 'Сохраните выписку и проверьте разделы «Право» и «Ограничения».'
      }
    ],
    commonMistakes: [
      'Вводят адрес вместо кадастрового номера',
      'Заказывают устаревшую выписку старше 30 дней',
      'Не проверяют раздел обременений'
    ],
    redFlags: ['Арест', 'Залог', 'Ипотека без согласования с банком', 'Несовпадение площади'],
    nextActions: ['Проверить собственников', 'Сверить с паспортом продавца', 'Перейти к обременениям'],
    links: mergeLinks(LINK_SETS.egrn),
    faq: [
      {
        q: 'Сколько действует выписка?',
        a: 'Для сделки обычно запрашивают выписку не старше 30 дней.'
      },
      {
        q: 'Чем отличается от справки БТИ?',
        a: 'ЕГРН — юридические данные о правах; БТИ — технический план и площадь.'
      }
    ]
  },

  'tut-mortgage-approval': {
    id: 'tut-mortgage-approval',
    stepId: 'prep-mortgage-approval',
    title: 'Ипотечное одобрение',
    summary: 'Как выбрать банк и повысить шанс одобрения',
    whatIsIt: 'Предварительное одобрение — решение банка о сумме кредита до выбора квартиры.',
    whyNeeded: 'Продавцы охотнее работают с покупателем, у которого уже есть одобрение банка.',
    requirements: ['Паспорт', 'Справка о доходах', 'СНИЛС', 'Трудовая история'],
    estimatedTime: '3–10 дней',
    steps: [
      {
        order: 1,
        title: 'Сравните 3–5 банков',
        description: 'Смотрите ставку, первоначальный взнос, страховку и срок одобрения объекта.'
      },
      {
        order: 2,
        title: 'Подайте заявку онлайн',
        description: 'Через сайт банка или агрегатор — так быстрее предварительный ответ.'
      },
      {
        order: 3,
        title: 'Загрузите документы',
        description: '2-НДФЛ или справка по форме банка, трудовой договор, выписки со счетов.'
      }
    ],
    commonMistakes: ['Подавать в один банк', 'Скрывать кредитную нагрузку', 'Не читать условия страховки'],
    redFlags: ['Одобрение без проверки объекта', 'Слишком низкая ставка с скрытыми комиссиями'],
    nextActions: ['Сохранить одобрение', 'Уточнить срок действия', 'Начать подбор объекта'],
    links: mergeLinks(LINK_SETS.mortgage),
    faq: [{ q: 'Сколько действует одобрение?', a: 'Обычно 60–90 дней, уточняйте в банке.' }]
  },

  'tut-advance': {
    id: 'tut-advance',
    stepId: 'advance-type',
    title: 'Аванс или задаток',
    summary: 'Юридическая разница и риски',
    whatIsIt: 'Аванс и задаток по-разному регулируют возврат денег при срыве сделки.',
    whyNeeded: 'Неверный выбор формы может стоить всей суммы предоплаты.',
    requirements: ['Согласованная цена', 'Сроки сделки', 'Паспортные данные сторон'],
    estimatedTime: '30–60 минут на изучение',
    steps: [
      {
        order: 1,
        title: 'Определите ответственность сторон',
        description: 'Задаток: при вине покупателя — не возвращается; при вине продавца — двойной возврат.'
      },
      {
        order: 2,
        title: 'Зафиксируйте в письменном виде',
        description: 'Используйте предварительный договор или расписку с чёткими условиями.'
      }
    ],
    commonMistakes: ['Путать аванс и задаток в тексте', 'Передавать наличные без расписки'],
    redFlags: ['Устные договорённости', 'Отказ продавца подписывать документы'],
    nextActions: ['Подготовить предварительный ДКП', 'Согласовать сроки'],
    links: mergeLinks(LINK_SETS.general, LINK_SETS.legal),
    faq: [
      {
        q: 'Что безопаснее — аванс или задаток?',
        a: 'Зависит от того, кто может сорвать сделку; задаток строже по ГК РФ.'
      }
    ]
  },

  'tut-payments': {
    id: 'tut-payments',
    stepId: 'payments-method',
    title: 'Способы расчётов',
    summary: 'Аккредитив, ячейка, СБР и наличные',
    whatIsIt: 'Безопасный расчёт — схема, при которой деньги передаются после регистрации права.',
    whyNeeded: 'Прямой перевод продавцу до регистрации — главный риск для покупателя.',
    requirements: ['ДКП', 'Реквизиты', 'Согласие банка при ипотеке'],
    estimatedTime: '1–2 дня на выбор схемы',
    steps: [
      {
        order: 1,
        title: 'Сравните аккредитив и ячейку',
        description: 'Аккредитив удобен при ипотеке; ячейка — при полной оплате наличными/безналом.'
      },
      {
        order: 2,
        title: 'Рассмотрите сервис безопасных расчётов (СБР)',
        description: 'Электронная блокировка средств до регистрации в Росреестре.'
      }
    ],
    commonMistakes: ['Перевод на карту физлица', 'Доверие «устной» гарантии риелтора'],
    redFlags: ['Давление передать деньги до регистрации', 'Счёт третьего лица'],
    nextActions: ['Согласовать схему в ДКП', 'Проверить реквизиты'],
    links: mergeLinks(LINK_SETS.payments, [LINKS.domclick]),
    faq: [
      {
        q: 'Что такое аккредитив?',
        a: 'Банк блокирует сумму и переводит продавцу после выполнения условий (регистрации).'
      }
    ]
  },

  'tut-poa': {
    id: 'tut-poa',
    stepId: 'poa-check',
    title: 'Проверка доверенности',
    summary: 'Как проверить полномочия представителя',
    whatIsIt: 'Доверенность даёт право действовать от имени собственника.',
    whyNeeded: 'Недействительная доверенность делает сделку оспоримой.',
    requirements: ['Оригинал доверенности', 'Паспорт представителя', 'Данные нотариуса'],
    estimatedTime: '1 день',
    steps: [
      {
        order: 1,
        title: 'Проверьте срок и полномочия',
        description: 'В тексте должны быть слова о праве продажи именно этой квартиры.'
      },
      {
        order: 2,
        title: 'Уточните у нотариуса',
        description: 'Позвоните в нотариальную палату или проверьте реестр отменённых доверенностей.'
      }
    ],
    commonMistakes: ['Не проверять отзыв доверенности', 'Принимать копию без сверки'],
    redFlags: ['Срочное давление', 'Доверенность старше года без продления'],
    nextActions: ['Запросить согласие собственника', 'Рассмотреть личное участие продавца'],
    links: mergeLinks(LINK_SETS.notary, LINK_SETS.legal),
    faq: [{ q: 'Можно ли проверить отзыв доверенности?', a: 'Да, через нотариальную палату или запрос к нотариусу.' }]
  },

  'tut-dkp': {
    id: 'tut-dkp',
    stepId: 'dkp-prepare',
    title: 'Подготовка ДКП',
    summary: 'Ключевые пункты договора купли-продажи',
    whatIsIt: 'ДКП — основной документ передачи права на квартиру.',
    whyNeeded: 'Ошибки в ДКП приводят к отказу в регистрации или спорам.',
    requirements: ['Паспорта', 'Выписка ЕГРН', 'Документы по расчётам'],
    estimatedTime: '2–5 дней',
    steps: [
      { order: 1, title: 'Сверьте стороны и объект', description: 'ФИО, паспорт, адрес, кадастровый номер.' },
      { order: 2, title: 'Пропишите порядок расчётов', description: 'Сумма, сроки, способ (аккредитив/ячейка/СБР).' }
    ],
    commonMistakes: ['Занижение цены', 'Неточный адрес', 'Отсутствие срока передачи ключей'],
    redFlags: ['Два разных ДКП с разной ценой', 'Оплата на третье лицо'],
    nextActions: ['Согласовать с банком', 'Подготовить к подписанию'],
    links: mergeLinks(LINK_SETS.general, LINK_SETS.registration),
    faq: [{ q: 'Нужен ли нотариус для ДКП?', a: 'Для вторички чаще обычная форма; банк может требовать свой шаблон.' }]
  },

  'tut-budget': {
    id: 'tut-budget',
    stepId: 'prep-budget',
    title: 'Расчёт бюджета',
    summary: 'Полный бюджет сделки с ипотекой',
    whatIsIt: 'Сводный план расходов на покупку и сопутствующие услуги.',
    whyNeeded: 'Чтобы не остаться без резерва после первого взноса.',
    requirements: ['Доход', 'Первый взнос', 'Ставка банка'],
    estimatedTime: '1–2 часа',
    steps: [
      { order: 1, title: 'Посчитайте платёж', description: 'Используйте ипотечный калькулятор банка.' },
      { order: 2, title: 'Добавьте 15–20% на сопутствующие расходы', description: 'Страховка, оценка, госпошлина, переезд.' }
    ],
    commonMistakes: ['Не учитывать страховку', 'Тратить весь кэш на взнос'],
    redFlags: ['Платёж выше 40% дохода'],
    nextActions: ['Получить предодобрение'],
    links: mergeLinks(LINK_SETS.mortgage, [LINKS.fns]),
    faq: []
  },

  'tut-title-history': {
    id: 'tut-title-history',
    stepId: 'object-title-history',
    title: 'История переходов права',
    summary: 'Как читать цепочку собственников',
    whatIsIt: 'Раздел выписки ЕГРН с основаниями перехода права.',
    whyNeeded: 'Частые перепродажи и «свежие» сделки могут скрывать риски.',
    requirements: ['Выписка ЕГРН', 'Архивные выписки при необходимости'],
    estimatedTime: '30–60 минут',
    steps: [
      { order: 1, title: 'Откройте раздел переходов', description: 'Смотрите даты и основания: купля, дарение, наследство.' },
      { order: 2, title: 'Оцените частоту', description: 'Несколько сделок за 1–2 года — повод для углублённой проверки.' }
    ],
    commonMistakes: ['Игнорировать дарение между родственниками', 'Не проверять приватизацию'],
    redFlags: ['Частые перепродажи', 'Наследство без вступления', 'Свежая приватизация'],
    nextActions: ['Запросить документы-основания', 'Проверить обременения'],
    links: mergeLinks(LINK_SETS.egrn, LINK_SETS.legal),
    faq: []
  },

  'tut-encumbrances': {
    id: 'tut-encumbrances',
    stepId: 'object-encumbrances',
    title: 'Обременения',
    summary: 'Ипотека, арест, залог',
    whatIsIt: 'Ограничения права, записанные в ЕГРН.',
    whyNeeded: 'Сделка с не снятым обременением может быть невозможна.',
    requirements: ['Актуальная выписка ЕГРН'],
    estimatedTime: '30 минут',
    steps: [
      { order: 1, title: 'Найдите раздел «Ограничения»', description: 'Проверьте ипотеку, арест, ренту, сервитут.' },
      { order: 2, title: 'Согласуйте снятие с продавцом', description: 'Ипотека снимается после расчётов по схеме банка.' }
    ],
    commonMistakes: ['Верить словам продавца без выписки'],
    redFlags: ['Арест', 'Судебный запрет', 'Не согласованная ипотека'],
    nextActions: ['Запросить справку банка', 'Отложить аванс до ясности'],
    links: mergeLinks(LINK_SETS.egrn, LINK_SETS.legal),
    faq: [
      { q: 'Что такое обременение?', a: 'Ограничение права: ипотека, арест, рента, сервитут и др.' },
      { q: 'Можно ли купить квартиру в ипотеке?', a: 'Да, по схеме с банком: погашение из расчётов сделки.' },
      { q: 'Кто снимает арест?', a: 'Взыскатель или суд — до снятия регистрация перехода права невозможна.' }
    ]
  },

  'tut-spouse-consent': {
    id: 'tut-spouse-consent',
    title: 'Согласие супруга',
    summary: 'Нотариальное согласие при совместной собственности',
    whatIsIt: 'Документ супруга на отчуждение доли или квартиры.',
    whyNeeded: 'Без согласия сделку могут оспорить.',
    requirements: ['Паспорта', 'Свидетельство о браке', 'Документы на объект'],
    estimatedTime: '1 день',
    steps: [
      { order: 1, title: 'Запишитесь к нотариусу', description: 'Оба супруга или согласие одного при нотариальном оформлении.' }
    ],
    commonMistakes: ['Простая подпись без нотариуса'],
    redFlags: ['Скрытый брак', 'Развод в процессе'],
    nextActions: ['Приложить к пакету на регистрацию'],
    links: mergeLinks(LINK_SETS.notary, LINK_SETS.general, LINK_SETS.poa),
    faq: [
      { q: 'Обязательно ли нотариальное согласие?', a: 'Да, если объект — совместная собственность супругов.' },
      { q: 'Нужно ли присутствие супруга?', a: 'Да, лично у нотариуса или по доверенности с полномочиями.' },
      { q: 'Что если в бракоразводном процессе?', a: 'Высокий риск — дождитесь решения суда или соглашения.' }
    ]
  }
};

export const TUTORIAL_LIBRARY: Record<string, Tutorial> = {
  ...BASE_TUTORIALS,
  ...EXTRA_TUTORIALS,
  ...getAllNewbuildingTutorials()
};

export function getTutorial(id: string, scenarioId?: string): Tutorial | undefined {
  if (TUTORIAL_LIBRARY[id]) return enrichTutorial(TUTORIAL_LIBRARY[id], scenarioId);
  const stepId = id.startsWith('tut-') ? id.slice(4) : id;
  const step = getStep(stepId);
  if (step) return enrichTutorial(buildFallbackTutorial(step, id.startsWith('tut-') ? id : `tut-${stepId}`), scenarioId);
  return undefined;
}
