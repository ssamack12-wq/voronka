import React, { useMemo, useRef, useState } from 'react';
import { MAX_SCORE, Question, questions } from './questions';

interface AnswerRecord {
  questionId: number;
  optionText: string;
  score: number;
}

interface FormData {
  phone: string;
  city: string;
  type: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';
type Stage = 'hero' | 'quiz' | 'break' | 'result' | 'bridge' | 'demo' | 'form';

const TOTAL_STEPS = questions.length;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  let normalized = digits;

  if (normalized.startsWith('8')) {
    normalized = '7' + normalized.slice(1);
  }
  if (!normalized.startsWith('7')) {
    normalized = '7' + normalized;
  }

  const code = normalized.slice(1, 4);
  const part1 = normalized.slice(4, 7);
  const part2 = normalized.slice(7, 9);
  const part3 = normalized.slice(9, 11);

  let result = '+7';
  if (code) result += ` (${code}`;
  if (code && code.length === 3) result += ')';
  if (part1) result += ` ${part1}`;
  if (part2) result += `-${part2}`;
  if (part3) result += `-${part3}`;

  return result;
}

function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<number | undefined>(undefined);

  function debounced(...args: Parameters<T>) {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }

  return debounced as T;
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [breakStepsPassed, setBreakStepsPassed] = useState<number>(0);
  const [breakRiskScore, setBreakRiskScore] = useState<number>(0);
  const [showBreakScreen, setShowBreakScreen] = useState<boolean>(false);
  const [stage, setStage] = useState<Stage>('hero');
  const [formData, setFormData] = useState<FormData>({ phone: '', city: '', type: '' });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const readiness = useMemo(() => {
    if (MAX_SCORE === 0) return 100;
    const score = Math.min(riskScore, MAX_SCORE);
    return Math.round(100 - (score / MAX_SCORE) * 100);
  }, [riskScore]);

  const categoryScores = useMemo(() => {
    const byId = new Map<number, AnswerRecord>();
    answers.forEach((a) => byId.set(a.questionId, a));

    const sumRange = (from: number, to: number) =>
      Array.from({ length: to - from + 1 }, (_, i) => from + i).reduce(
        (acc, id) => acc + (byId.get(id)?.score ?? 0),
        0
      );

    return {
      legal: sumRange(6, 11),
      financial: sumRange(12, 17),
      process: sumRange(1, 5) + sumRange(18, 27)
    };
  }, [answers]);

  const handleStart = () => {
    setCurrentStep(1);
    setStage('quiz');
  };

  const goToForm = () => {
    setStage('form');
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleOptionSelect = (question: Question, optionIndex: number) => {
    const option = question.options[optionIndex];
    if (!option) return;

    let addedScore = option.score;
    if (question.isCritical) {
      addedScore = addedScore * 1.5;
    }

    const newRiskScore = riskScore + addedScore;
    setRiskScore((prev) => prev + addedScore);
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== question.id),
      {
        questionId: question.id,
        optionText: option.text,
        score: addedScore
      }
    ]);

    const nextStep = currentStep + 1;

    const shouldShowBreak =
      !showBreakScreen && (question.id === 12 || newRiskScore > 15);

    if (shouldShowBreak) {
      setBreakStepsPassed(question.id);
      setBreakRiskScore(newRiskScore);
      setShowBreakScreen(true);
      setStage('break');
      setCurrentStep(nextStep);
      return;
    }

    if (nextStep > TOTAL_STEPS) {
      setStage('result');
    } else {
      setCurrentStep(nextStep);
    }
  };

  const handleContinueAfterBreak = () => {
    setShowBreakScreen(false);
    setStage('quiz');
  };

  const handleGetHelpFromBreak = () => {
    setShowBreakScreen(false);
    setStage('form');
    goToForm();
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'phone' ? formatPhone(value) : value
    }));
  };

  const doSubmit = async () => {
    setSubmitStatus('loading');
    setSubmitError(null);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          city: formData.city,
          type: formData.type,
          readiness,
          answers
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке заявки');
      }

      setSubmitStatus('success');
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
      setSubmitError('Не удалось отправить заявку. Попробуйте ещё раз.');
    }
  };

  const debouncedSubmit = useDebouncedCallback(doSubmit, 500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.city || !formData.type) {
      setSubmitError('Пожалуйста, заполните все поля.');
      return;
    }
    if (submitStatus === 'loading') return;
    debouncedSubmit();
  };

  const currentQuestion = currentStep > 0 ? questions[currentStep - 1] : null;
  const progress = currentStep === 0 ? 0 : (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-screen-mobile px-4 py-6 flex flex-col gap-6">
        {stage === 'hero' && currentStep === 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-black">
                Готовы к сделке с квартирой?
              </h1>
              <p className="text-sm text-gray-700">
                Пройдите квиз из 27 шагов и увидите, где чаще всего появляются ошибки и
                риски.
              </p>
            </div>
            <button
              onClick={handleStart}
              className="mt-2 w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
            >
              Начать квиз
            </button>
            <a
              type="button"
              href="https://sdelka-web.ru"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 self-start"
            >
              Я риелтор — хочу такое портфолио
            </a>
          </section>
        )}

        {stage === 'quiz' && currentStep > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Шаг {currentStep} из {TOTAL_STEPS}</span>
              <span>Риск: {riskScore.toFixed(1)}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>
        )}

        {stage === 'break' && showBreakScreen && (
          <section className="flex flex-col gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-black">Небольшая пауза</h2>
            <p className="text-sm text-gray-700">
              Вы прошли часть этапов. На этом уровне чаще всего возникают ошибки.
            </p>
            <p className="text-sm text-gray-700">
              Шагов пройдено: <span className="font-semibold text-black">{breakStepsPassed}</span>. Рисков:{' '}
              <span className="font-semibold text-risk">{breakRiskScore.toFixed(1)}</span>.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleContinueAfterBreak}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
              >
                Продолжить самому
              </button>
              <button
                onClick={handleGetHelpFromBreak}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 text-sm active:scale-[0.98] transition-transform"
              >
                Разобрать с экспертом
              </button>
            </div>
          </section>
        )}

        {stage === 'quiz' && currentQuestion && !showBreakScreen && (
          <section className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">
                {currentQuestion.type === 'simple' && 'Оценка вашей подготовки'}
                {currentQuestion.type === 'test' && 'Проверка знаний'}
                {currentQuestion.type === 'scenario' && 'Проверка действий в ситуации'}
              </p>
              <h2 className="text-lg font-semibold text-black">{currentQuestion.question}</h2>
              {currentQuestion.isCritical && (
                <p className="mt-2 text-xs font-medium text-risk">
                  Важно: повышенный риск, будьте внимательны.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.text}
                  onClick={() => handleOptionSelect(currentQuestion, index)}
                  className="w-full text-left py-3 px-3 rounded-xl border border-gray-200 text-sm text-black active:scale-[0.98] transition-all duration-150 hover:border-accent"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </section>
        )}

        {stage === 'result' && (
          <section className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-black mb-2">Ваш результат</h2>
              <p className="text-sm text-gray-700 mb-3">Готовность к сделке:</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-black">{readiness}%</span>
                <span className="text-sm text-gray-600">готовности</span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium text-black">Зоны риска:</p>
                <div className="flex flex-col gap-1">
                  <CategoryBadge
                    label="Юридические"
                    score={categoryScores.legal}
                  />
                  <CategoryBadge
                    label="Финансовые"
                    score={categoryScores.financial}
                  />
                  <CategoryBadge
                    label="Процесс"
                    score={categoryScores.process}
                  />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600">
                Даже если вы понимаете процесс, контролировать сделку в одиночку сложно
              </p>
              <button
                onClick={() => setStage('bridge')}
                className="mt-4 w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
              >
                Посмотреть, как решают такие задачи
              </button>
            </div>
          </section>
        )}

        {stage === 'bridge' && (
          <section className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-black">Как решают такие риски?</h2>
              <p className="mt-2 text-sm text-gray-700">
                Вместо того чтобы контролировать всё вручную, используют сопровождение сделки с прозрачными этапами:
              </p>
              <ul className="mt-3 text-sm text-gray-700 space-y-2">
                <li>— все документы проверяются</li>
                <li>— этапы фиксируются</li>
                <li>— статус сделки виден онлайн</li>
              </ul>
              <button
                onClick={() => setStage('demo')}
                className="mt-4 w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
              >
                Посмотреть пример
              </button>
            </div>
          </section>
        )}

        {stage === 'demo' && (
          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-base font-semibold text-black">Пример сделки</h3>
                <p className="mt-1 text-sm text-gray-700">Все этапы и статус сделки видны онлайн</p>
                <button
                  type="button"
                  onClick={() =>
                    window.open('https://sdelka-web.ru/s/063b531e1f3f44419ed679c4b173c9fb', '_blank')
                  }
                  className="mt-3 w-full py-3 rounded-xl border border-gray-200 text-sm text-black active:scale-[0.98] transition-transform"
                >
                  Открыть трекер
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-base font-semibold text-black">Профиль риелтора</h3>
                <p className="mt-1 text-sm text-gray-700">Отзывы, сделки и прозрачная работа</p>
                <button
                  type="button"
                  onClick={() => window.open('https://sdelka-web.ru/agent/1', '_blank')}
                  className="mt-3 w-full py-3 rounded-xl border border-gray-200 text-sm text-black active:scale-[0.98] transition-transform"
                >
                  Посмотреть профиль
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-700">
                Если хотите пройти сделку без лишнего стресса, можно разобрать вашу ситуацию со специалистом
              </p>
              <button
                onClick={goToForm}
                className="mt-3 w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
              >
                Получить помощь по сделке
              </button>
            </div>
          </section>
        )}

        {stage === 'form' && (
          <section ref={formRef} className="flex flex-col gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-lg font-semibold text-black mb-2">Оставить заявку</h3>
            <p className="text-sm text-gray-700 mb-4">
              Оставьте контакты — специалист поможет разобрать риски и этапы сделки.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Телефон</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="+7"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Город</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleFormChange('city', e.target.value)}
                  placeholder="Например, Москва"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Тип сделки</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="">Выберите тип</option>
                  <option value="buy">Покупка</option>
                  <option value="sell">Продажа</option>
                  <option value="exchange">Обмен</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              {submitError && (
                <p className="text-xs text-risk">{submitError}</p>
              )}
              {submitStatus === 'success' && (
                <p className="text-xs text-green-600">
                  Заявка отправлена. Мы свяжемся с вами в ближайшее время.
                </p>
              )}
              <button
                type="submit"
                disabled={submitStatus === 'loading'}
                className="mt-1 w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-transform"
              >
                {submitStatus === 'loading' ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </form>
          </div>
        </section>
        )}

        {stage === 'form' && (
          <section className="flex flex-col gap-2 pb-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
              <p className="text-sm font-semibold text-black">Почему это работает</p>
              <p className="text-sm text-gray-700">пример реальной сделки</p>
              <p className="text-sm text-gray-700">прозрачный процесс</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

interface CategoryBadgeProps {
  label: string;
  score: number;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ label, score }) => {
  let color = 'bg-green-100 text-green-800';

  if (score > 8 && score <= 16) {
    color = 'bg-yellow-100 text-yellow-800';
  } else if (score > 16) {
    color = 'bg-red-100 text-red-800';
  }

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-700">{label}</span>
      <span className={`px-2 py-1 rounded-full ${color}`}>
        риск: {score.toFixed(1)}
      </span>
    </div>
  );
};

export default App;

