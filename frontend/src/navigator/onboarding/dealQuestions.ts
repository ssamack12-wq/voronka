import type { DealIntent, HousingTypeAnswer } from '../types';

export interface DealQuizOption {
  id: string;
  label: string;
}

export interface DealQuizQuestion {
  id: string;
  question: string;
  /** Короткое пояснение под заголовком вопроса */
  subtitle?: string;
  /** Текст для кнопки ℹ️ */
  hint: string;
  options: DealQuizOption[];
  /** Skip when intent is land-only flows where question doesn't apply */
  skipIf?: (ctx: { intent?: DealIntent; effectiveIntent?: DealIntent }) => boolean;
}

export function getEffectiveDealIntent(
  intent?: DealIntent,
  housingType?: HousingTypeAnswer
): DealIntent | undefined {
  if (!intent) return undefined;
  if (intent === 'buy_apartment' && housingType === 'newbuilding') return 'buy_newbuilding';
  return intent;
}

const YES_NO_UNKNOWN: DealQuizOption[] = [
  { id: 'yes', label: 'Да' },
  { id: 'no', label: 'Нет' },
  { id: 'unknown', label: 'Не знаю' }
];

export const DEAL_QUIZ_QUESTIONS: DealQuizQuestion[] = [
  {
    id: 'intent',
    question: 'Что вы хотите сделать?',
    hint: 'Выберите, планируете ли вы купить или продать недвижимость. От этого зависит дальнейший план сделки.',
    options: [
      { id: 'buy_apartment', label: 'Купить квартиру' },
      { id: 'sell_apartment', label: 'Продать квартиру' },
      { id: 'buy_land', label: 'Купить участок' },
      { id: 'sell_land', label: 'Продать участок' },
      { id: 'unknown', label: 'Не знаю' }
    ]
  },
  {
    id: 'housing_type',
    question: 'Это вторичное жильё или новостройка?',
    hint: 'Вторичка — готовая квартира у прежнего владельца. Новостройка — покупка у застройщика, дом ещё строится или только сдан.',
    options: [
      { id: 'secondary', label: 'Вторичка (готовая квартира)' },
      { id: 'newbuilding', label: 'Новостройка (от застройщика / строится)' },
      { id: 'unknown', label: 'Не знаю' }
    ],
    skipIf: ({ intent }) => intent !== 'buy_apartment'
  },
  {
    id: 'mortgage',
    question: 'Нужна ипотека?',
    hint: 'Ипотека — это кредит банка на покупку жилья. Если платите полностью своими деньгами, выберите «Нет».',
    options: YES_NO_UNKNOWN,
    skipIf: ({ effectiveIntent }) =>
      effectiveIntent === 'buy_land' || effectiveIntent === 'sell_land'
  },
  {
    id: 'matcapital',
    question: 'Планируется использование маткапитала?',
    hint: 'Материнский (семейный) капитал — государственная выплата, которую можно направить на покупку жилья. Для этого нужны дополнительные документы и согласования.',
    options: YES_NO_UNKNOWN
  },
  {
    id: 'poa',
    question: 'За собственника действует другой человек?',
    subtitle: 'Например родственник, представитель или юрист.',
    hint: 'Если документы подписывает не сам собственник, а представитель по нотариальной доверенности — выберите «Да».',
    options: YES_NO_UNKNOWN
  },
  {
    id: 'minors',
    question: 'Среди владельцев квартиры есть дети младше 18 лет?',
    hint: 'Если ребёнок владеет даже небольшой долей квартиры, для сделки может потребоваться согласие органов опеки.',
    options: YES_NO_UNKNOWN
  },
  {
    id: 'alternative',
    question: 'Продавец одновременно покупает другое жильё?',
    hint: 'Альтернативная сделка — это когда продавец продаёт свою квартиру и одновременно покупает другую. Такие сделки обычно занимают больше времени.',
    options: YES_NO_UNKNOWN
  },
  {
    id: 'owners',
    question: 'Сколько владельцев указано в документах на квартиру?',
    hint: 'Информация содержится в выписке ЕГРН.',
    options: [
      { id: 'one', label: 'Один' },
      { id: 'two', label: 'Два' },
      { id: 'three_plus', label: 'Три и более' },
      { id: 'unknown', label: 'Не знаю' }
    ]
  },
  {
    id: 'less_than_3y',
    question: 'Объект находится в собственности менее 3 лет?',
    hint: 'Дата регистрации права указана в выписке ЕГРН. Если квартира в собственности менее 3 лет, могут быть налоговые ограничения и повышенные риски.',
    options: YES_NO_UNKNOWN,
    skipIf: ({ effectiveIntent }) => effectiveIntent === 'buy_newbuilding'
  }
];

export function getActiveQuizQuestions(
  intent?: DealIntent,
  housingType?: HousingTypeAnswer
): DealQuizQuestion[] {
  const effectiveIntent = getEffectiveDealIntent(intent, housingType);
  return DEAL_QUIZ_QUESTIONS.filter(
    (q) => !q.skipIf?.({ intent, effectiveIntent })
  );
}

export const DEAL_QUIZ_TOTAL = DEAL_QUIZ_QUESTIONS.length;
