import React, { useEffect, useMemo, useRef, useState } from 'react';
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
type Stage = 'hero' | 'quiz' | 'break' | 'result' | 'demo_bridge' | 'form';

const TOTAL_STEPS = questions.length;
const STAGE_TRANSITION_MS = 240;

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

function getReadinessText(score: number): string {
  if (score < 30) return 'Вам необходимо лучше разобраться в вопросе';
  if (score < 70) return 'У вас есть небольшие пробелы';
  return 'Вы хорошо подготовлены';
}

function getRiskLevelText(value: number): 'Низкий' | 'Средний' | 'Высокий' {
  if (value <= 4) return 'Низкий';
  if (value <= 10) return 'Средний';
  return 'Высокий';
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [showBreakScreen, setShowBreakScreen] = useState<boolean>(false);
  const [pauseShown, setPauseShown] = useState<boolean>(false);
  const [breakStepsPassed, setBreakStepsPassed] = useState<number>(0);
  const [stage, setStage] = useState<Stage>('hero');
  const [renderedStage, setRenderedStage] = useState<Stage>('hero');
  const [stageVisible, setStageVisible] = useState<boolean>(true);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [formBackStage, setFormBackStage] = useState<'result' | 'demo_bridge'>('demo_bridge');
  const [formData, setFormData] = useState<FormData>({ phone: '', city: '', type: '' });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  const readiness = useMemo(() => {
    if (MAX_SCORE === 0) return 100;
    const score = Math.min(riskScore, MAX_SCORE);
    return Math.round(100 - (score / MAX_SCORE) * 100);
  }, [riskScore]);

  const readinessText = useMemo(() => getReadinessText(readiness), [readiness]);

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

  useEffect(() => {
    if (stage === renderedStage) return;
    setStageVisible(false);
    const timer = window.setTimeout(() => {
      setRenderedStage(stage);
      setStageVisible(true);
    }, STAGE_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [stage, renderedStage]);

  const handleStart = () => {
    setCurrentStep(1);
    setStage('quiz');
  };

  const goToForm = () => {
    setStage('form');
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleOptionSelect = (question: Question, optionIndex: number) => {
    const option = question.options[optionIndex];
    if (!option) return;

    let addedScore = option.score;
    if (question.isCritical) {
      addedScore = addedScore * 1.5;
    }

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

    if (question.id === 12 && !pauseShown) {
      setPauseShown(true);
      setBreakStepsPassed(12);
      setShowBreakScreen(true);
      setCurrentStep(nextStep);
      setStage('break');
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
    setFormBackStage('result');
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

  const canGoPrev = cardIndex > 0;
  const canGoNext = cardIndex < 2;

  const handleOpenDemoBridge = () => {
    setCardIndex(0);
    setStage('demo_bridge');
  };

  const handleGoToFormFromDemoBridge = () => {
    setFormBackStage('demo_bridge');
    goToForm();
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-screen-mobile px-4 py-6 flex flex-col gap-6">
        <div
          className={`transition-all ease-in-out ${
            stageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{ transitionDuration: `${STAGE_TRANSITION_MS}ms` }}
        >
          {renderedStage === 'hero' && (
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-black">Готовы к сделке с квартирой?</h1>
                <p className="text-sm text-gray-700">
                  Пройдите квиз из 27 шагов и увидите, где чаще всего появляются ошибки.
                </p>
              </div>
              <button
                onClick={handleStart}
                className="mt-2 w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
              >
                Начать квиз
              </button>
              <a
                href="https://sdelka-web.ru"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-500 self-start"
              >
                Я риелтор — хочу такое портфолио
              </a>
            </section>
          )}

          {renderedStage === 'quiz' && currentStep > 0 && (
            <>
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Шаг {currentStep} из {TOTAL_STEPS}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </section>

              {currentQuestion && !showBreakScreen && (
                <section className="flex flex-col gap-4 mt-6">
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
            </>
          )}

          {renderedStage === 'break' && showBreakScreen && (
            <section className="flex flex-col gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-black">Небольшая пауза</h2>
              <p className="text-sm text-gray-700">
                Вы прошли часть этапов. На этом уровне чаще всего возникают ошибки.
              </p>
              <p className="text-sm text-gray-700">
                Шагов пройдено: <span className="font-semibold text-black">{breakStepsPassed}</span>.
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

          {renderedStage === 'result' && (
            <section className="flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-black mb-2">Ваш результат</h2>
                <p className="text-base font-semibold text-black">{readinessText}</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-medium text-black">Категории рисков:</p>
                  <div className="flex flex-col gap-1">
                    <CategoryBadge label="Юридические" level={getRiskLevelText(categoryScores.legal)} />
                    <CategoryBadge label="Финансовые" level={getRiskLevelText(categoryScores.financial)} />
                    <CategoryBadge label="Процесс" level={getRiskLevelText(categoryScores.process)} />
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-600">
                  Даже если вы понимаете процесс, контролировать сделку полностью самостоятельно сложно.
                </p>
                <button
                  onClick={handleOpenDemoBridge}
                  className="mt-4 w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
                >
                  Посмотреть, как решают такие задачи
                </button>
              </div>
            </section>
          )}

          {renderedStage === 'demo_bridge' && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-black">{readinessText}</h2>
              <p className="text-sm text-gray-700">
                Даже если вы понимаете процесс, контролировать сделку полностью самостоятельно сложно.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${cardIndex * 100}%)` }}
                  >
                    <DemoCard
                      title="Как выглядит сделка с контролем"
                      points={['этапы сделки', 'статус онлайн', 'прозрачный процесс']}
                    />
                    <DemoCard
                      title="Контроль каждого этапа"
                      points={['документы', 'проверка', 'регистрация']}
                    />
                    <DemoCard
                      title="Всегда видно, что происходит"
                      points={['статус', 'прогресс', 'следующий шаг']}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setCardIndex((prev) => Math.max(0, prev - 1))}
                    disabled={!canGoPrev}
                    className="py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-700 disabled:opacity-40"
                  >
                    Назад
                  </button>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className={`h-1.5 w-5 rounded-full ${index === cardIndex ? 'bg-accent' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardIndex((prev) => Math.min(2, prev + 1))}
                    disabled={!canGoNext}
                    className="py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-700 disabled:opacity-40"
                  >
                    Далее
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700">
                Такой формат помогает избежать ошибок и держать сделку под контролем.
              </p>
              <button
                onClick={handleGoToFormFromDemoBridge}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
              >
                Разобрать мою ситуацию
              </button>
              <a
                href="https://sdelka-web.ru/s/063b531e1f3f44419ed679c4b173c9fb"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-500 underline text-center"
              >
                Посмотреть пример сделки
              </a>
            </section>
          )}

          {renderedStage === 'form' && (
            <>
              <section ref={formRef} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setStage(formBackStage)}
                  className="self-start text-xs text-gray-500"
                >
                  ← Назад
                </button>
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
                    {submitError && <p className="text-xs text-risk">{submitError}</p>}
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

              <section className="flex flex-col gap-2 pb-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-2">
                  <p className="text-sm font-semibold text-black">Почему это работает</p>
                  <p className="text-sm text-gray-700">пример реальной сделки</p>
                  <p className="text-sm text-gray-700">прозрачный процесс</p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface CategoryBadgeProps {
  label: string;
  level: 'Низкий' | 'Средний' | 'Высокий';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ label, level }) => {
  let color = 'bg-green-100 text-green-800';
  if (level === 'Средний') color = 'bg-yellow-100 text-yellow-800';
  if (level === 'Высокий') color = 'bg-red-100 text-red-800';

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-700">{label}</span>
      <span className={`px-2 py-1 rounded-full ${color}`}>{level}</span>
    </div>
  );
};

interface DemoCardProps {
  title: string;
  points: string[];
}

const DemoCard: React.FC<DemoCardProps> = ({ title, points }) => (
  <div className="min-w-full">
    <h3 className="text-base font-semibold text-black">{title}</h3>
    <ul className="mt-3 text-sm text-gray-700 space-y-2">
      {points.map((point) => (
        <li key={point}>— {point}</li>
      ))}
    </ul>
  </div>
);

export default App;

