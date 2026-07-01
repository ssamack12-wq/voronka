import type { ScenarioCategory } from '../types';

export interface OppositePartyBlock {
  title: string;
  actions: string[];
}

const PHASE_ACTIONS: Record<
  string,
  { buyerSeesSeller: string[]; sellerSeesBuyer: string[] }
> = {
  preparation: {
    buyerSeesSeller: [
      'Готовит объект к показам',
      'Собирает базовые документы',
      'Уточняет условия продажи'
    ],
    sellerSeesBuyer: [
      'Определяет бюджет и сроки',
      'Собирает документы для банка',
      'Изучает рынок и варианты'
    ]
  },
  marketing: {
    buyerSeesSeller: [
      'Ведёт переговоры с покупателями',
      'Показывает квартиру',
      'Согласовывает условия'
    ],
    sellerSeesBuyer: [
      'Сравнивает объекты',
      'Планирует просмотры',
      'Оценивает цену и риски'
    ]
  },
  selection: {
    buyerSeesSeller: [
      'Отвечает на вопросы по объекту',
      'Предоставляет доступ на просмотр',
      'Уточняет характеристики жилья'
    ],
    sellerSeesBuyer: [
      'Сравнивает районы и объекты',
      'Проверяет инфраструктуру',
      'Готовит список вопросов продавцу'
    ]
  },
  object_check: {
    buyerSeesSeller: [
      'Подготавливает пакет документов',
      'Отвечает на запросы',
      'Подтверждает данные по объекту'
    ],
    sellerSeesBuyer: [
      'Проверяет ЕГРН',
      'Проверяет риски',
      'Анализирует документы'
    ]
  },
  advance: {
    buyerSeesSeller: [
      'Готовит соглашение',
      'Подтверждает условия аванса'
    ],
    sellerSeesBuyer: [
      'Проверяет условия',
      'Согласовывает расчёты и сроки'
    ]
  },
  mortgage: {
    buyerSeesSeller: [
      'Ждёт одобрения объекта банком',
      'Предоставляет документы по запросу',
      'Согласовывает дату сделки'
    ],
    sellerSeesBuyer: [
      'Подаёт заявку в банк',
      'Ожидает оценку и одобрение',
      'Согласовывает график расчётов'
    ]
  },
  contract: {
    buyerSeesSeller: [
      'Проверяет данные',
      'Согласует текст договора'
    ],
    sellerSeesBuyer: [
      'Проверяет пункты договора',
      'Проверяет реквизиты и суммы'
    ]
  },
  payments: {
    buyerSeesSeller: [
      'Подтверждает реквизиты',
      'Готовит документы для расчётов',
      'Ожидает поступление средств'
    ],
    sellerSeesBuyer: [
      'Выбирает способ расчётов',
      'Готовит деньги или аккредитив',
      'Сверяет условия с банком'
    ]
  },
  signing: {
    buyerSeesSeller: [
      'Согласовывает дату подписания',
      'Готовит паспорт и документы',
      'Проверяет финальную версию ДКП'
    ],
    sellerSeesBuyer: [
      'Согласовывает дату подписания',
      'Проверяет условия перед подписью',
      'Готовит средства к расчётам'
    ]
  },
  registration: {
    buyerSeesSeller: [
      'Подписывает документы',
      'Ожидает регистрацию перехода права'
    ],
    sellerSeesBuyer: [
      'Отслеживает статус в Росреестре',
      'Готовится к приёмке объекта'
    ]
  },
  handover: {
    buyerSeesSeller: [
      'Передаёт объект',
      'Подписывает акт приёма-передачи'
    ],
    sellerSeesBuyer: [
      'Осматривает квартиру',
      'Проверяет состояние',
      'Подписывает акт'
    ]
  },
  after_deal: {
    buyerSeesSeller: [
      'Передаёт ключи и документы',
      'Закрывает коммунальные вопросы'
    ],
    sellerSeesBuyer: [
      'Оформляет налоговый вычет',
      'Проверяет передачу счётчиков',
      'Сохраняет комплект документов'
    ]
  }
};

const STEP_OVERRIDES: Record<
  string,
  { buyerSeesSeller?: string[]; sellerSeesBuyer?: string[] }
> = {
  'object-egrn': {
    buyerSeesSeller: [
      'Подготавливает пакет документов',
      'Отвечает на запросы',
      'Подтверждает данные'
    ],
    sellerSeesBuyer: [
      'Проверяет ЕГРН',
      'Проверяет риски',
      'Анализирует документы'
    ]
  },
  'object-seller': {
    buyerSeesSeller: [
      'Предоставляет паспорт и документы',
      'Подтверждает семейное положение',
      'Отвечает на проверки'
    ],
    sellerSeesBuyer: [
      'Проверяет дееспособность продавца',
      'Ищет судебные риски',
      'Сверяет данные с ЕГРН'
    ]
  },
  'sell-listing': {
    buyerSeesSeller: ['Размещает объявление', 'Готовит фото и описание'],
    sellerSeesBuyer: ['Ищет объекты', 'Сравнивает предложения']
  }
};

export function getOppositePartyBlock(
  stepId: string,
  phase: string,
  category: ScenarioCategory
): OppositePartyBlock {
  const override = STEP_OVERRIDES[stepId];
  const phaseData = PHASE_ACTIONS[phase] ?? PHASE_ACTIONS.preparation;

  const isBuyer = category === 'buy';
  const actions = isBuyer
    ? (override?.buyerSeesSeller ?? phaseData.buyerSeesSeller)
    : (override?.sellerSeesBuyer ?? phaseData.sellerSeesBuyer);

  const title = isBuyer
    ? 'Что сейчас делает продавец?'
    : 'Что сейчас делает покупатель?';

  return { title, actions };
}
