import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MAX_SCORE, Question, questions } from './questions';
import { publicImageUrl } from './publicImageUrl';

const QUIZ_TRACKER_IMAGE = publicImageUrl('tracker-preview.png');
const QUIZ_PORTFOLIO_IMAGE = publicImageUrl('portfolio-preview.png');
const QUIZ_IMAGE_FALLBACK = publicImageUrl('fallback.svg');

function quizImageProps(alt: string) {
  return {
    alt,
    className: 'quiz-image',
    loading: 'eager' as const,
    decoding: 'async' as const,
    fetchPriority: 'high' as const,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      const el = e.currentTarget;
      if (el.dataset.fallback === '1') return;
      el.dataset.fallback = '1';
      el.src = QUIZ_IMAGE_FALLBACK;
    }
  };
}

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
type Stage = 'hero' | 'quiz' | 'break' | 'result' | 'why_works' | 'form';

const TRACKER_URL = 'https://sdelka-web.ru/s/063b531e1f3f44419ed679c4b173c9fb';
const PORTFOLIO_URL = 'https://sdelka-web.ru/agent/1';
const SDELKA_PROJECT_URL = 'https://sdelka-web.ru';

const TOTAL_STEPS = questions.length;
const BACK_BUTTON_CLASS =
  'w-full py-3 rounded-xl border border-gray-300 text-sm text-gray-700 font-medium active:scale-[0.98] transition-transform';
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

function looksLikeEmailStart(value: string): boolean {
  const t = value.trim();
  if (t.includes('@')) return true;
  return /^[^\d+\s()][^\d]*$/.test(t);
}

function isValidContact(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (t.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
  }
  const digits = t.replace(/\D/g, '');
  return digits.length >= 11;
}

function normalizeContactInput(value: string): string {
  if (!value.trim()) {
    return '';
  }
  if (looksLikeEmailStart(value)) {
    return value;
  }
  return formatPhone(value);
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
  const [formBackStage, setFormBackStage] = useState<'result' | 'break'>('result');
  const [whyWorksReturnTarget, setWhyWorksReturnTarget] = useState<'form' | 'result'>('form');
  const [whyWorksVariant, setWhyWorksVariant] = useState<'safe' | 'realtor'>('safe');
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

    const sumCategory = (cat: (typeof questions)[number]['category']) =>
      questions
        .filter((q) => q.category === cat)
        .reduce((acc, q) => acc + (byId.get(q.id)?.score ?? 0), 0);

    return {
      legal: sumCategory('legal'),
      financial: sumCategory('financial'),
      process: sumCategory('process')
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

    if (question.id === 7 && !pauseShown) {
      setPauseShown(true);
      setBreakStepsPassed(7);
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
    setFormBackStage('break');
    goToForm();
  };

  const openWhyWorks = (returnTarget: 'form' | 'result', variant: 'safe' | 'realtor') => {
    setWhyWorksReturnTarget(returnTarget);
    setWhyWorksVariant(variant);
    setStage('why_works');
  };

  const backFromWhyWorks = () => {
    if (whyWorksReturnTarget === 'form') {
      setStage('form');
      window.setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      setStage('result');
    }
  };

  const restartQuiz = () => {
    setAnswers([]);
    setRiskScore(0);
    setShowBreakScreen(false);
    setPauseShown(false);
    setBreakStepsPassed(0);
    setCurrentStep(1);
    setStage('quiz');
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'phone' ? normalizeContactInput(value) : value
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
    if (!isValidContact(formData.phone) || !formData.city || !formData.type) {
      setSubmitError('Укажите телефон или корректную почту и заполните остальные поля.');
      return;
    }
    if (submitStatus === 'loading') return;
    debouncedSubmit();
  };

  const currentQuestion = currentStep > 0 ? questions[currentStep - 1] : null;
  const progress = currentStep === 0 ? 0 : (currentStep / TOTAL_STEPS) * 100;

  const goToFormFromResult = () => {
    setFormBackStage('result');
    goToForm();
  };

  const handleBackFromForm = () => {
    if (formBackStage === 'break') {
      setShowBreakScreen(true);
      setStage('break');
    } else {
      setStage('result');
    }
  };

  const isPerfectScore = readiness === 100;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-screen-mobile px-4 py-3 sm:py-6 flex flex-col gap-4 sm:gap-6 min-h-screen">
        <div
          className={`transition-all ease-in-out flex flex-1 flex-col min-h-0 ${
            stageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{ transitionDuration: `${STAGE_TRANSITION_MS}ms` }}
        >
          {renderedStage === 'hero' && (
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold text-black">Готовы к сделке с квартирой?</h1>
                <p className="text-sm text-gray-700">
                  Пройдите квиз из 14 шагов и увидите, где чаще всего появляются ошибки.
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
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl font-semibold text-black">{readiness}%</span>
                  <span className="text-sm text-gray-600">готовности к сделке</span>
                </div>
                {!isPerfectScore && (
                  <p className="mt-3 text-base font-semibold text-black">{readinessText}</p>
                )}
                {isPerfectScore ? (
                  <p className="mt-4 text-sm text-gray-800 leading-relaxed">
                    Вы безупречны! Если требуется, мы подберём риелтора, вы сможете увидеть его онлайн-портфолио.
                    Если у вас уже есть риелтор, отслеживайте его действия с помощью умного трекера сделки!
                  </p>
                ) : (
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-medium text-black">Обратите внимание на зоны риска:</p>
                    <div className="flex flex-col gap-1">
                      <CategoryBadge label="Юридические" level={getRiskLevelText(categoryScores.legal)} />
                      <CategoryBadge label="Финансовые" level={getRiskLevelText(categoryScores.financial)} />
                      <CategoryBadge label="Процесс" level={getRiskLevelText(categoryScores.process)} />
                    </div>
                  </div>
                )}
              </div>

              {!isPerfectScore && (
                <p className="text-xs text-gray-600 leading-relaxed px-0.5">
                  Даже если вы понимаете процесс, контролировать сделку полностью самостоятельно сложно.
                </p>
              )}

              <button
                type="button"
                onClick={restartQuiz}
                className="w-full py-3 rounded-xl border border-gray-300 text-sm text-gray-800 font-medium active:scale-[0.98] transition-transform"
              >
                Пройти тест ещё раз
              </button>

              <button
                type="button"
                onClick={() => openWhyWorks('result', 'safe')}
                className="w-full py-3 rounded-xl border border-gray-300 text-sm text-gray-800 font-medium active:scale-[0.98] transition-transform"
              >
                Почему работа с нами — безопаснее?
              </button>

              <WhyWorksShowcase showOpenLinks={false} hideTrackerLeadLine trackerOnly />

              <button
                onClick={goToFormFromResult}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform"
              >
                Разобрать мою ситуацию
              </button>
            </section>
          )}

          {renderedStage === 'why_works' && (
            <section className="quiz-why-works-screen flex flex-col gap-2 min-h-0 flex-1 overflow-hidden">
              <h2 className="text-base sm:text-lg font-semibold text-black leading-snug shrink-0">
                {whyWorksVariant === 'safe' && 'Почему работа с нами безопаснее?'}
                {whyWorksVariant === 'realtor' && 'Как улучшить взаимодействие с риелтором?'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-snug shrink-0 line-clamp-3">
                Прозрачные этапы, онлайн-статус и проверенный профиль специалиста — в одном месте.
              </p>
              <WhyWorksShowcase showOpenLinks compact />
              <button type="button" onClick={backFromWhyWorks} className={`${BACK_BUTTON_CLASS} mt-auto shrink-0`}>
                Назад
              </button>
            </section>
          )}

          {renderedStage === 'form' && (
            <section ref={formRef} className="flex flex-col gap-4 flex-1 min-h-0">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-lg font-semibold text-black mb-2">Оставить заявку</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Оставьте контакты — специалист поможет разобрать риски и этапы сделки.
                  </p>
                  <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-600">Телефон или почта</label>
                      <input
                        type="text"
                        inputMode="text"
                        autoComplete="tel email"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="+7 или email@…"
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

              <div className="flex flex-col gap-2 mt-auto pb-4 shrink-0">
                <button
                  type="button"
                  onClick={() => openWhyWorks('form', 'realtor')}
                  className={BACK_BUTTON_CLASS}
                >
                  Как улучшить взаимодействие с риелтором?
                </button>
                <button type="button" onClick={handleBackFromForm} className={BACK_BUTTON_CLASS}>
                  Назад
                </button>
              </div>
            </section>
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

const RealtorShareCta: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <a
    href={SDELKA_PROJECT_URL}
    target="_blank"
    rel="noreferrer"
    className={`block w-full rounded-xl border border-gray-200 bg-gray-50 text-center text-gray-800 leading-snug active:scale-[0.99] transition-transform ${
      compact ? 'px-3 py-2 text-[10px]' : 'px-4 py-3 text-xs'
    }`}
  >
    Уже работаете с риелтором? Улучшите опыт и поделитесь ссылкой!
    <span className="mt-1 block text-accent font-semibold">sdelka-web.ru →</span>
  </a>
);

const DemoImageSlider: React.FC<{ hideTrackerLeadLine?: boolean; trackerOnly?: boolean; compact?: boolean }> = ({
  hideTrackerLeadLine,
  trackerOnly,
  compact
}) => {
  const [slide, setSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const maxSlide = trackerOnly ? 0 : 1;
  const trackWidthPct = trackerOnly ? 100 : 200;
  const translatePct = trackerOnly ? 0 : slide * 50;

  const go = (dir: -1 | 1) => {
    setSlide((s) => Math.max(0, Math.min(maxSlide, s + dir)));
  };

  return (
    <div
      className={`quiz-slider-root rounded-xl border border-gray-100 bg-slate-50 shadow-sm overflow-hidden flex flex-col min-h-0 min-w-0 max-w-full ${
        compact ? 'quiz-slider-root--compact' : ''
      }`}
    >
      <div
        className="quiz-slider-viewport touch-pan-y min-h-0 min-w-0 flex-1 flex flex-col"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (trackerOnly) return;
          const start = touchStartX.current;
          touchStartX.current = null;
          const end = e.changedTouches[0]?.clientX;
          if (start == null || end == null) return;
          const dx = end - start;
          if (dx > 48) go(1);
          if (dx < -48) go(-1);
        }}
      >
        <div
          className="flex min-h-0 min-w-0 max-w-full transition-transform duration-300 ease-in-out"
          style={{
            width: `${trackWidthPct}%`,
            transform: `translateX(-${translatePct}%)`
          }}
        >
          <div
            className={`shrink-0 box-border px-3 pt-2 pb-2 sm:px-4 sm:pt-4 sm:pb-3 flex flex-col min-h-0 min-w-0 ${
              trackerOnly ? 'w-full' : 'w-1/2'
            }`}
          >
            {!hideTrackerLeadLine && (
              <p className="text-xs sm:text-sm font-semibold text-black text-center mb-2 shrink-0 leading-tight">
                Отслеживайте сделку в реальном времени!
              </p>
            )}
            <div className="quiz-image-container">
              <img src={QUIZ_TRACKER_IMAGE} {...quizImageProps('Пример трекера сделки')} />
            </div>
          </div>
          {!trackerOnly && (
            <div className="w-1/2 shrink-0 min-w-0 flex flex-col box-border px-3 pt-2 pb-2 sm:px-4 sm:pt-4 sm:pb-3">
              <p className="text-xs sm:text-sm font-semibold text-black text-center mb-2 leading-tight shrink-0 px-0.5">
                Изучите портфолио риелтора прежде чем начать работать с ним
              </p>
              <div className="quiz-image-container">
                <img src={QUIZ_PORTFOLIO_IMAGE} {...quizImageProps('Пример портфолио риелтора')} />
              </div>
            </div>
          )}
        </div>
      </div>
      {!trackerOnly && (
        <>
          <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-1 sm:px-4 sm:pb-4 shrink-0">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={slide === 0}
              className="py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-700 disabled:opacity-40"
            >
              Назад
            </button>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Слайд 1"
                onClick={() => setSlide(0)}
                className={`h-2 w-8 rounded-full transition-colors ${slide === 0 ? 'bg-accent' : 'bg-gray-200'}`}
              />
              <button
                type="button"
                aria-label="Слайд 2"
                onClick={() => setSlide(1)}
                className={`h-2 w-8 rounded-full transition-colors ${slide === 1 ? 'bg-accent' : 'bg-gray-200'}`}
              />
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={slide === 1}
              className="py-2 px-3 rounded-xl border border-gray-300 text-xs text-gray-700 disabled:opacity-40"
            >
              Далее
            </button>
          </div>
          <p className="text-center text-[10px] sm:text-xs text-gray-500 pb-2 shrink-0">Свайп вправо — портфолио риелтора</p>
        </>
      )}
    </div>
  );
};

interface WhyWorksShowcaseProps {
  /** Кнопки «Открыть трекер / портфолио» — только в потоке «Почему работа с нами безопаснее?» */
  showOpenLinks?: boolean;
  /** Скрыть заголовок над превью трекера (экран результата после квиза) */
  hideTrackerLeadLine?: boolean;
  /** Только превью трекера: без слайда «Изучите портфолио…» (после квиза на экране результата) */
  trackerOnly?: boolean;
  /** Ужать отступы и высоты, чтобы экран «почему» помещался в один viewport */
  compact?: boolean;
}

const WhyWorksShowcase: React.FC<WhyWorksShowcaseProps> = ({
  showOpenLinks = true,
  hideTrackerLeadLine,
  trackerOnly,
  compact
}) => (
  <div className={`flex flex-col min-h-0 min-w-0 ${compact ? 'gap-2 flex-1' : 'gap-4'}`}>
    <div className={compact ? 'min-h-0 flex-1 flex flex-col' : ''}>
      <DemoImageSlider hideTrackerLeadLine={hideTrackerLeadLine} trackerOnly={trackerOnly} compact={compact} />
    </div>

    {showOpenLinks && (
      <div className={`flex flex-col shrink-0 ${compact ? 'gap-1.5' : 'gap-2'}`}>
        <a
          href={TRACKER_URL}
          target="_blank"
          rel="noreferrer"
          className={`block w-full rounded-xl bg-accent text-white text-center font-semibold active:scale-[0.98] transition-transform ${
            compact ? 'py-2 text-xs' : 'py-3 text-sm'
          }`}
        >
          Открыть умный трекер
        </a>
        <a
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noreferrer"
          className={`block w-full rounded-xl border border-gray-200 text-center font-semibold text-black active:scale-[0.98] transition-transform ${
            compact ? 'py-2 text-xs' : 'py-3 text-sm'
          }`}
        >
          Открыть онлайн-портфолио
        </a>
      </div>
    )}

    <div className={compact ? 'shrink-0' : ''}>
      <RealtorShareCta compact={compact} />
    </div>
  </div>
);

export default App;

