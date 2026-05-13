export type QuestionType = 'simple' | 'test' | 'scenario';

export interface QuestionOption {
  text: string;
  score: number;
  correct?: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options: QuestionOption[];
  isCritical?: boolean;
}

export const questions: Question[] = [
  {
    id: 1,
    type: 'simple',
    question: 'Цена вашей квартиры уже определена?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Примерно', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 2,
    type: 'test',
    question: 'Где посмотреть реальную цену аналогичных квартир?',
    options: [
      { text: 'На Авито', score: 2 },
      { text: 'В объявлениях', score: 3 },
      { text: 'В Росреестре', score: 2 },
      { text: 'По закрытым сделкам (реестр/аналитика)', score: 0, correct: true }
    ]
  },
  {
    id: 3,
    type: 'simple',
    question: 'Подготовили ли вы квартиру к показам (уборка, мелкий ремонт, фото)?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 4,
    type: 'scenario',
    question: 'Вы поставили цену выше рынка. Что, скорее всего, произойдёт?',
    options: [
      { text: 'Продам дороже', score: 3 },
      { text: 'Квартира будет дольше продаваться', score: 0, correct: true },
      { text: 'Не влияет', score: 3 },
      { text: 'Быстрее продам', score: 3 }
    ]
  },
  {
    id: 5,
    type: 'simple',
    question: 'Понимаете ли вы все расходы и налоги по сделке?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 6,
    type: 'test',
    question: 'Где проверяются обременения на квартиру?',
    isCritical: true,
    options: [
      { text: 'В договоре', score: 3 },
      { text: 'В ЕГРН', score: 0, correct: true },
      { text: 'У продавца', score: 3 },
      { text: 'В БТИ', score: 2 }
    ]
  },
  {
    id: 7,
    type: 'simple',
    question: 'Проверили ли вы собственника квартиры (личность, историю, документы)?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 8,
    type: 'scenario',
    question: 'Продавец не даёт документы сразу. Ваши действия?',
    options: [
      { text: 'Жду, когда даст', score: 2 },
      { text: 'Верю на слово', score: 3 },
      { text: 'Проверяю всё сам', score: 0, correct: true },
      { text: 'Иду дальше, ищу другой вариант', score: 1 }
    ]
  },
  {
    id: 9,
    type: 'test',
    question: 'Что из перечисленного опаснее всего при покупке квартиры?',
    isCritical: true,
    options: [
      { text: 'Ипотека', score: 2 },
      { text: 'Арест/запрет регистрации', score: 0, correct: true },
      { text: 'Долги по ЖКХ', score: 2 },
      { text: 'Ремонт', score: 1 }
    ]
  },
  {
    id: 10,
    type: 'simple',
    question: 'Проверили ли вы всех зарегистрированных и прописанных в квартире?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Нет', score: 2 },
      { text: 'Не знаю как', score: 2 }
    ]
  },
  {
    id: 11,
    type: 'test',
    question: 'Что НЕ видно в выписке из ЕГРН?',
    options: [
      { text: 'Собственник', score: 0, correct: true },
      { text: 'Обременения', score: 0, correct: true },
      { text: 'История переходов права', score: 0, correct: true },
      { text: 'Долги по ЖКХ', score: 3 }
    ]
  },
  {
    id: 12,
    type: 'test',
    question: 'Когда безопасно передавать деньги за квартиру?',
    isCritical: true,
    options: [
      { text: 'До сделки', score: 3 },
      { text: 'После регистрации права', score: 0, correct: true },
      { text: 'При встрече', score: 3 },
      { text: 'Когда скажут', score: 3 }
    ]
  },
  {
    id: 13,
    type: 'simple',
    question: 'Есть ли у вас понятная схема передачи денег (ячейка, аккредитив и т.п.)?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 14,
    type: 'test',
    question: 'Что делает задаток в сделке?',
    options: [
      { text: 'Просто бронь', score: 2 },
      { text: 'Гарантия обязательств сторон', score: 0, correct: true },
      { text: 'Ничего', score: 3 },
      { text: 'Комиссия риелтору', score: 3 }
    ]
  },
  {
    id: 15,
    type: 'scenario',
    question: 'Покупатель передумал после внесения задатка. Что по закону происходит с деньгами?',
    options: [
      { text: 'Деньги возвращаются покупателю', score: 2 },
      { text: 'Продавец оставляет задаток', score: 0, correct: true },
      { text: 'Делят пополам', score: 2 },
      { text: 'Не знаю', score: 3 }
    ]
  },
  {
    id: 16,
    type: 'simple',
    question: 'Кто проверял ваш договор купли-продажи?',
    options: [
      { text: 'Юрист/нотариус/риелтор', score: 0, correct: true },
      { text: 'Проверял сам', score: 1 },
      { text: 'Никто не проверял', score: 2 }
    ]
  },
  {
    id: 17,
    type: 'test',
    question: 'Кто регистрирует переход права собственности?',
    isCritical: true,
    options: [
      { text: 'Нотариус', score: 2 },
      { text: 'Росреестр', score: 0, correct: true },
      { text: 'Риелтор', score: 3 },
      { text: 'Банк', score: 2 }
    ]
  },
  {
    id: 18,
    type: 'scenario',
    question: 'Вы нашли квартиру по цене заметно ниже рынка. Что это может значить?',
    options: [
      { text: 'Просто повезло', score: 3 },
      { text: 'Срочная продажа и всё ок', score: 2 },
      { text: 'Возможны проблемы или риски', score: 0, correct: true },
      { text: 'Нормально, беру не глядя', score: 3 }
    ]
  },
  {
    id: 19,
    type: 'simple',
    question: 'Умеете ли вы торговаться и отстаивать свои условия?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 20,
    type: 'test',
    question: 'Что обязательно проверить перед подписанием основного договора?',
    options: [
      { text: 'Только паспорт', score: 2 },
      { text: 'Только текст договора', score: 2 },
      { text: 'Все документы и условия сделки', score: 0, correct: true },
      { text: 'Ничего, так делают все', score: 3 }
    ]
  },
  {
    id: 21,
    type: 'simple',
    question: 'Понимаете ли вы все основные этапы сделки от аванса до регистрации?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Частично', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 22,
    type: 'scenario',
    question: 'Вас торопят скорее подписать договор. Как вы поступите?',
    options: [
      { text: 'Сразу подписываю', score: 3 },
      { text: 'Подписываю, а думаю потом', score: 3 },
      { text: 'Проверяю всё ещё раз, несмотря на спешку', score: 0, correct: true },
      { text: 'Соглашаюсь, чтобы никого не задерживать', score: 3 }
    ]
  },
  {
    id: 23,
    type: 'test',
    question: 'Когда обычно передаются ключи от квартиры покупателю?',
    options: [
      { text: 'До оплаты', score: 3 },
      { text: 'После регистрации и полной оплаты', score: 0, correct: true },
      { text: 'Когда как договоримся', score: 2 },
      { text: 'Не важно', score: 3 }
    ]
  },
  {
    id: 24,
    type: 'simple',
    question: 'Знаете ли вы, что такое акт приёма-передачи и для чего он нужен?',
    options: [
      { text: 'Да', score: 0, correct: true },
      { text: 'Примерно представляю', score: 1 },
      { text: 'Нет', score: 2 }
    ]
  },
  {
    id: 25,
    type: 'test',
    question: 'Что фиксирует акт приёма-передачи квартиры?',
    options: [
      { text: 'Факт сделки', score: 2 },
      { text: 'Состояние квартиры на момент передачи', score: 0, correct: true },
      { text: 'Передачу денег', score: 2 },
      { text: 'Передачу документов', score: 2 }
    ]
  },
  {
    id: 26,
    type: 'scenario',
    question: 'После сделки вы обнаружили серьёзные проблемы с квартирой. Что можно сделать?',
    isCritical: true,
    options: [
      { text: 'Ничего нельзя сделать', score: 3 },
      { text: 'Можно разбираться через суд и документы', score: 0, correct: true },
      { text: 'Это нормально, так у всех', score: 3 },
      { text: 'Проще проигнорировать', score: 3 }
    ]
  },
  {
    id: 27,
    type: 'simple',
    question: 'Насколько вы уверены в своих знаниях по сделкам с недвижимостью?',
    options: [
      { text: 'Да, уверен', score: 0, correct: true },
      { text: 'Есть сомнения', score: 1 },
      { text: 'Нет, нужна помощь', score: 2 }
    ]
  }
];

export const MAX_SCORE: number = questions.reduce((sum, q) => {
  const maxOptionScore = Math.max(...q.options.map((o) => o.score));
  const base = maxOptionScore < 0 ? 0 : maxOptionScore;
  const factor = q.isCritical ? 1.5 : 1;
  return sum + base * factor;
}, 0);

