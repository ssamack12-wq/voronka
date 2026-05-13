export type QuestionType = 'simple' | 'test' | 'scenario';
export type QuestionCategory = 'legal' | 'financial' | 'process';

export interface QuestionOption {
  text: string;
  score: number;
  correct?: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  category: QuestionCategory;
  question: string;
  options: QuestionOption[];
  isCritical?: boolean;
}

export const questions: Question[] = [
  {
    id: 1,
    type: 'simple',
    category: 'financial',
    question: 'Понимаешь расходы и налоги?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 2,
    type: 'test',
    category: 'legal',
    question: 'Где проверяются обременения?',
    isCritical: true,
    options: [
      { text: 'В договоре', score: 3 },
      { text: 'В ЕГРН', score: 0, correct: true },
      { text: 'У продавца', score: 3 },
      { text: 'В БТИ', score: 2 }
    ]
  },
  {
    id: 3,
    type: 'simple',
    category: 'legal',
    question: 'Проверил собственника?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 4,
    type: 'simple',
    category: 'legal',
    question: 'Проверил прописанных?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Нет', score: 2 },
      { text: 'Не знаю как', score: 2 }
    ]
  },
  {
    id: 5,
    type: 'test',
    category: 'legal',
    question: 'Что НЕ видно в ЕГРН?',
    options: [
      { text: 'Собственник', score: 2 },
      { text: 'Обременения', score: 2 },
      { text: 'История переходов', score: 2 },
      { text: 'Долги по ЖКХ', score: 0, correct: true }
    ]
  },
  {
    id: 6,
    type: 'test',
    category: 'legal',
    question: 'Кто регистрирует переход права?',
    isCritical: true,
    options: [
      { text: 'Нотариус', score: 2 },
      { text: 'Росреестр', score: 0, correct: true },
      { text: 'Риелтор', score: 3 },
      { text: 'Банк', score: 2 }
    ]
  },
  {
    id: 7,
    type: 'test',
    category: 'legal',
    question: 'Что обязательно проверить перед подписанием?',
    options: [
      { text: 'Паспорт', score: 2 },
      { text: 'Договор', score: 2 },
      { text: 'Все документы и условия', score: 0, correct: true },
      { text: 'Ничего', score: 3 }
    ]
  },
  {
    id: 8,
    type: 'simple',
    category: 'process',
    question: 'Понимаешь этапы сделки?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 9,
    type: 'scenario',
    category: 'process',
    question: 'Тебя торопят подписать договор',
    options: [
      { text: 'Подписываю', score: 3 },
      { text: 'Думаю потом', score: 3 },
      { text: 'Проверяю всё ещё раз', score: 0, correct: true },
      { text: 'Соглашаюсь', score: 3 }
    ]
  },
  {
    id: 10,
    type: 'test',
    category: 'legal',
    question: 'Когда передаются ключи?',
    options: [
      { text: 'До оплаты', score: 3 },
      { text: 'После регистрации и оплаты', score: 0, correct: true },
      { text: 'Когда договорились', score: 2 },
      { text: 'Не важно', score: 3 }
    ]
  },
  {
    id: 11,
    type: 'simple',
    category: 'process',
    question: 'Знаешь акт приёма-передачи?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 12,
    type: 'test',
    category: 'legal',
    question: 'Что фиксирует акт приёма-передачи?',
    options: [
      { text: 'Сделку', score: 2 },
      { text: 'Состояние квартиры', score: 0, correct: true },
      { text: 'Деньги', score: 2 },
      { text: 'Документы', score: 2 }
    ]
  },
  {
    id: 13,
    type: 'scenario',
    category: 'legal',
    question: 'После сделки обнаружены проблемы',
    isCritical: true,
    options: [
      { text: 'Ничего нельзя сделать', score: 3 },
      { text: 'Можно через суд/документы', score: 0, correct: true },
      { text: 'Это нормально', score: 3 },
      { text: 'Игнор', score: 3 }
    ]
  },
  {
    id: 14,
    type: 'simple',
    category: 'process',
    question: 'Уверен в своих знаниях?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Есть сомнения', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  }
];

export const MAX_SCORE: number = questions.reduce((sum, q) => {
  const maxOptionScore = Math.max(...q.options.map((o) => o.score));
  const base = maxOptionScore < 0 ? 0 : maxOptionScore;
  const factor = q.isCritical ? 1.5 : 1;
  return sum + base * factor;
}, 0);
