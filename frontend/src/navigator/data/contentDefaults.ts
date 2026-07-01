import type { ChecklistItem, DealStep, Tutorial } from '../types';
import { getSubtasksForStep } from './tutorials/subtasks';
import { LINK_SETS, LINKS, mergeLinks } from './tutorials/links';

/** Reusable FAQ for payment and registration topics */
export const UNIVERSAL_FAQ = [
  {
    q: 'Когда передавать деньги продавцу?',
    a: 'После регистрации перехода права — через аккредитив, ячейку или эскроу. До регистрации — только аванс/задаток по письменному договору.'
  },
  {
    q: 'Что безопаснее: ячейка или аккредитив?',
    a: 'Аккредитив удобнее при ипотеке: банк контролирует условия выдачи. Ячейка подходит при расчётах наличными между физлицами.'
  },
  {
    q: 'Что делать, если Росреестр приостановил регистрацию?',
    a: 'Получите мотивированное уведомление, устраните замечания в срок и подайте документы повторно без новой госпошлины.'
  },
  {
    q: 'Можно ли отказаться после внесения аванса?',
    a: 'Зависит от условий в расписке или предварительном договоре. Без письменных условий возврат оспаривается в суде.'
  },
  {
    q: 'Нужно ли заверять расписку у нотариуса?',
    a: 'Не обязательно, но нотариальная форма снижает риск оспаривания суммы и факта передачи денег.'
  }
] as const;

export const UNIVERSAL_RED_FLAGS = [
  'Продавец отказывается показывать документы',
  'Давление «подписать сегодня»',
  'Расчёты на личную карту без договора',
  'Несовпадение данных в выписке и паспорте',
  'Свежая перепродажа менее чем за 3 года'
];

/** Default checklist so every step can be tracked and completed */
export function defaultChecklist(step: Pick<DealStep, 'id' | 'title'>): ChecklistItem[] {
  return [
    {
      id: `cb-${step.id}-review`,
      title: 'Изучить требования шага',
      mandatory: true,
      tutorialId: `tut-${step.id}`
    },
    {
      id: `cb-${step.id}-docs`,
      title: 'Подготовить документы',
      mandatory: true,
      tutorialId: `tut-${step.id}`
    },
    {
      id: `cb-${step.id}-confirm`,
      title: 'Подтвердить выполнение',
      mandatory: false,
      tutorialId: `tut-${step.id}`
    }
  ];
}

/** Production-ready fallback tutorial when no dedicated content exists */
export function buildFallbackTutorial(step: DealStep, tutorialId = `tut-${step.id}`): Tutorial {
  const links = mergeLinks(LINK_SETS.general, LINK_SETS.egrn, LINK_SETS.legal);
  return {
    id: tutorialId,
    stepId: step.id,
    title: step.title,
    summary: step.shortDescription,
    whatIsIt: step.detailedDescription,
    whyNeeded:
      'Этот шаг снижает юридические и финансовые риски сделки. Пропуск проверок может привести к потере денег или оспариванию договора.',
    requirements: [
      'Паспорт и контактные данные',
      'Документы по объекту (при наличии)',
      'Доступ к Госуслугам или личному кабинету Росреестра',
      'Время на проверку — ' + step.estimatedTime
    ],
    estimatedTime: step.estimatedTime,
    steps: [
      {
        order: 1,
        title: 'Ознакомьтесь с задачей',
        description: step.shortDescription
      },
      {
        order: 2,
        title: 'Соберите документы',
        description: 'Подготовьте пакет по чек-листу на экране шага. Сверьте ФИО и адрес во всех документах.'
      },
      {
        order: 3,
        title: 'Выполните проверки',
        description: step.detailedDescription
      },
      {
        order: 4,
        title: 'Зафиксируйте результат',
        description: 'Сохраните скриншоты, PDF и переписку. Отметьте пункты чек-листа.'
      },
      {
        order: 5,
        title: 'Проверьте предупреждения',
        description:
          step.warnings.length > 0
            ? step.warnings.join('. ')
            : 'Убедитесь, что нет красных флагов по объекту и продавцу.'
      },
      {
        order: 6,
        title: 'Переходите к следующему шагу',
        description: 'После выполнения отметьте шаг выполненным и откройте следующий этап в дорожной карте.'
      }
    ],
    commonMistakes: [
      'Пропустить проверку из-за спешки',
      'Использовать устаревшие документы',
      'Не сохранить подтверждения и квитанции'
    ],
    redFlags: step.warnings.length > 0 ? [...step.warnings, ...UNIVERSAL_RED_FLAGS.slice(0, 2)] : UNIVERSAL_RED_FLAGS.slice(0, 4),
    nextActions: ['Отметить пункты чек-листа', 'Перейти к следующему шагу сделки'],
    links,
    faq: [...UNIVERSAL_FAQ.slice(0, 3)],
    subtasks: getSubtasksForStep(step.id, step)
  };
}

export function enrichStep(step: DealStep): DealStep {
  const checklist = step.checklist.length > 0 ? step.checklist : defaultChecklist(step);
  const tutorialIds =
    step.tutorialIds.length > 0 ? step.tutorialIds : [`tut-${step.id}`];
  const checklistWithTutorials = checklist.map((item) => ({
    ...item,
    tutorialId: item.tutorialId ?? tutorialIds[0]
  }));
  return {
    ...step,
    checklist: checklistWithTutorials,
    tutorialIds
  };
}
