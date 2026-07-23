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
const BACK_BUTTON_CLASS = 'btn-secondary w-full';
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
            className="text-desc text-graphite-muted hover:text-graphite"
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
            <p className="badge-eyebrow mb-3">Проверка знаний</p>
            <h1 className="text-section-title text-graphite text-safe">Насколько вы готовы к сделке?</h1>
            <p className="text-body text-graphite-muted mt-4 leading-relaxed text-safe">
              Короткий тест по рискам и типичным ошибкам. В конце можно оставить контакты для разбора
              с экспертом.
            </p>
          </div>
          <button type="button" onClick={handleStart} className="btn-primary w-full">
            Начать тест
          </button>
        </section>
      )}

      {renderedStage === 'quiz' && currentStep > 0 && (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-desc text-graphite-muted">
              <span>
                Шаг {currentStep} из {TOTAL_STEPS}
              </span>
            </div>
            <div className="w-full h-2 bg-black/[0.04] rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </section>
          {currentQuestion && !showBreakScreen && (
            <section className="flex flex-col gap-4 mt-6">
              <div className="card-premium">
                <p className="text-desc text-graphite-muted mb-2">
                  {currentQuestion.type === 'simple' && 'Оценка вашей подготовки'}
                  {currentQuestion.type === 'test' && 'Проверка знаний'}
                  {currentQuestion.type === 'scenario' && 'Проверка действий в ситуации'}
                </p>
                <h2 className="text-h2 text-graphite leading-snug text-safe">{currentQuestion.question}</h2>
                {currentQuestion.isCritical && (
                  <p className="mt-2 text-small font-medium text-risk text-safe">Важно: повышенный риск.</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={option.text}
                    onClick={() => handleOptionSelect(currentQuestion, index)}
                    className="option-card"
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
        <section className="card-premium flex flex-col gap-4">
          <h2 className="text-h2 text-graphite text-safe">Небольшая пауза</h2>
          <p className="text-body text-graphite-muted leading-relaxed text-safe">Вы прошли часть этапов. Шагов: {breakStepsPassed}.</p>
          <button onClick={handleContinueAfterBreak} className="btn-primary w-full">
            Продолжить самому
          </button>
          <button onClick={handleGetHelpFromBreak} className="btn-secondary w-full">
            Разобрать с экспертом
          </button>
        </section>
      )}

      {renderedStage === 'result' && (
        <section className="flex flex-col gap-4">
          <div className="card-premium">
            <h2 className="text-h2 text-graphite mb-3 text-safe">Ваш результат</h2>
            <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
              <span className="text-h1 text-graphite text-safe">{readiness}%</span>
              <span className="text-desc text-graphite-muted text-safe">готовности</span>
            </div>
            {!isPerfectScore && <p className="mt-4 font-medium text-body text-graphite text-safe">{readinessText}</p>}
            {!isPerfectScore && (
              <div className="mt-4 space-y-2 text-small">
                <CategoryBadge label="Юридические" level={getRiskLevelText(categoryScores.legal)} />
                <CategoryBadge label="Финансовые" level={getRiskLevelText(categoryScores.financial)} />
                <CategoryBadge label="Процесс" level={getRiskLevelText(categoryScores.process)} />
              </div>
            )}
          </div>
          <button type="button" onClick={restartQuiz} className={BACK_BUTTON_CLASS}>
            Пройти тест ещё раз
          </button>
          <button onClick={goToFormFromResult} className="btn-primary w-full">
            Разобрать мою ситуацию
          </button>
        </section>
      )}

      {renderedStage === 'form' && (
        <section ref={formRef} className="flex flex-col gap-4 flex-1">
          <div className="card-premium">
            <h3 className="text-h2 text-graphite mb-4 text-safe">Оставить заявку</h3>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="+7 или email"
                className="input-field"
              />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
                placeholder="Город"
                className="input-field"
              />
              <select
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                className="input-field"
              >
                <option value="">Тип сделки</option>
                <option value="buy">Покупка</option>
                <option value="sell">Продажа</option>
              </select>
              {submitError && <p className="text-xs text-risk">{submitError}</p>}
              {submitStatus === 'success' && <p className="text-xs text-green-600">Заявка отправлена.</p>}
              <button type="submit" disabled={submitStatus === 'loading'} className="btn-primary w-full">
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
    <div className="flex justify-between gap-3 text-small min-w-0">
      <span className="text-safe">{label}</span>
      <span className={`px-2 py-1 rounded-full shrink-0 ${color}`}>{level}</span>
    </div>
  );
};
