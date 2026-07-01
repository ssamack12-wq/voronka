import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LoginButton } from '../components/LoginButton';
import { submitQuizLead } from '../auth/api';
import { MAX_SCORE, Question, questions } from '../questions';

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
type Stage = 'quiz' | 'break' | 'result' | 'form';

const TOTAL_STEPS = questions.length;
const BACK_BUTTON_CLASS =
  'w-full py-3 rounded-xl border border-gray-300 text-sm text-gray-700 font-medium active:scale-[0.98] transition-transform';
const STAGE_TRANSITION_MS = 240;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  let normalized = digits;
  if (normalized.startsWith('8')) normalized = '7' + normalized.slice(1);
  if (!normalized.startsWith('7')) normalized = '7' + normalized;
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
  if (t.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
  return t.replace(/\D/g, '').length >= 11;
}

function normalizeContactInput(value: string): string {
  if (!value.trim()) return '';
  if (looksLikeEmailStart(value)) return value;
  return formatPhone(value);
}

function useDebouncedCallback<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<number | undefined>(undefined);
  return ((...args: Parameters<T>) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => callback(...args), delay);
  }) as T;
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

export interface QuizAppProps {
  onBackToLanding?: () => void;
}

export const QuizApp: React.FC<QuizAppProps> = ({ onBackToLanding }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [riskScore, setRiskScore] = useState(0);
  const [showBreakScreen, setShowBreakScreen] = useState(false);
  const [pauseShown, setPauseShown] = useState(false);
  const [breakStepsPassed, setBreakStepsPassed] = useState(0);
  const [stage, setStage] = useState<Stage>('quiz');
  const [renderedStage, setRenderedStage] = useState<Stage>('quiz');
  const [stageVisible, setStageVisible] = useState(true);
  const [formBackStage, setFormBackStage] = useState<'result' | 'break'>('result');
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
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const handleOptionSelect = (question: Question, optionIndex: number) => {
    const option = question.options[optionIndex];
    if (!option) return;
    let addedScore = option.score;
    if (question.isCritical) addedScore *= 1.5;
    setRiskScore((prev) => prev + addedScore);
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== question.id),
      { questionId: question.id, optionText: option.text, score: addedScore }
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
    if (nextStep > TOTAL_STEPS) setStage('result');
    else setCurrentStep(nextStep);
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
      await submitQuizLead({
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        type: formData.type,
        readiness,
        riskScore,
        answers
      });
      setSubmitStatus('success');
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
      setSubmitError(
        error instanceof Error ? error.message : 'Не удалось отправить заявку. Попробуйте ещё раз.'
      );
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
    } else setStage('result');
  };

  const isPerfectScore = readiness === 100;

  return (
    <div
      className={`transition-all ease-in-out flex flex-1 flex-col min-h-0 ${
        stageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
      style={{ transitionDuration: `${STAGE_TRANSITION_MS}ms` }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        {onBackToLanding ? (
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← На главную
          </button>
        ) : (
          <span />
        )}
        <LoginButton redirectPath="/quiz" />
      </div>

      {renderedStage === 'quiz' && currentStep === 0 && (
        <section className="flex flex-col gap-6 flex-1 justify-center py-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
              Проверка знаний
            </p>
            <h1 className="text-2xl font-semibold text-black leading-tight">
              Насколько вы готовы к сделке?
            </h1>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Короткий тест по рискам и типичным ошибкам. В конце можно оставить контакты для разбора
              с экспертом.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-base"
          >
            Начать тест
          </button>
        </section>
      )}

      {renderedStage === 'quiz' && currentStep > 0 && (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                Шаг {currentStep} из {TOTAL_STEPS}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
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
                  <p className="mt-2 text-xs font-medium text-risk">Важно: повышенный риск.</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={option.text}
                    onClick={() => handleOptionSelect(currentQuestion, index)}
                    className="w-full text-left py-3 px-3 rounded-xl border border-gray-200 text-sm text-black active:scale-[0.98] transition-all hover:border-accent"
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
          <p className="text-sm text-gray-700">Вы прошли часть этапов. Шагов: {breakStepsPassed}.</p>
          <button onClick={handleContinueAfterBreak} className="w-full py-3 rounded-xl bg-accent text-white font-semibold">
            Продолжить самому
          </button>
          <button onClick={handleGetHelpFromBreak} className="w-full py-3 rounded-xl border border-gray-300 text-sm">
            Разобрать с экспертом
          </button>
        </section>
      )}

      {renderedStage === 'result' && (
        <section className="flex flex-col gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-black mb-2">Ваш результат</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold">{readiness}%</span>
              <span className="text-sm text-gray-600">готовности</span>
            </div>
            {!isPerfectScore && <p className="mt-3 font-semibold">{readinessText}</p>}
            {!isPerfectScore && (
              <div className="mt-4 space-y-2 text-sm">
                <CategoryBadge label="Юридические" level={getRiskLevelText(categoryScores.legal)} />
                <CategoryBadge label="Финансовые" level={getRiskLevelText(categoryScores.financial)} />
                <CategoryBadge label="Процесс" level={getRiskLevelText(categoryScores.process)} />
              </div>
            )}
          </div>
          <button type="button" onClick={restartQuiz} className={BACK_BUTTON_CLASS}>
            Пройти тест ещё раз
          </button>
          <button onClick={goToFormFromResult} className="w-full py-3 rounded-xl bg-accent text-white font-semibold">
            Разобрать мою ситуацию
          </button>
        </section>
      )}

      {renderedStage === 'form' && (
        <section ref={formRef} className="flex flex-col gap-4 flex-1">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-lg font-semibold mb-2">Оставить заявку</h3>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="+7 или email"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
                placeholder="Город"
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
              <select
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              >
                <option value="">Тип сделки</option>
                <option value="buy">Покупка</option>
                <option value="sell">Продажа</option>
              </select>
              {submitError && <p className="text-xs text-risk">{submitError}</p>}
              {submitStatus === 'success' && <p className="text-xs text-green-600">Заявка отправлена.</p>}
              <button
                type="submit"
                disabled={submitStatus === 'loading'}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold disabled:opacity-60"
              >
                {submitStatus === 'loading' ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </div>
          <button type="button" onClick={handleBackFromForm} className={BACK_BUTTON_CLASS}>
            Назад
          </button>
        </section>
      )}
    </div>
  );
};

const CategoryBadge: React.FC<{ label: string; level: string }> = ({ label, level }) => {
  let color = 'bg-green-100 text-green-800';
  if (level === 'Средний') color = 'bg-yellow-100 text-yellow-800';
  if (level === 'Высокий') color = 'bg-red-100 text-red-800';
  return (
    <div className="flex justify-between text-xs">
      <span>{label}</span>
      <span className={`px-2 py-1 rounded-full ${color}`}>{level}</span>
    </div>
  );
};
