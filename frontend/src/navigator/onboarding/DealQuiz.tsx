import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../../hooks/useAnalytics';
import type {
  DealIntent,
  HousingTypeAnswer,
  LessThan3YearsAnswer,
  QuizAnswers
} from '../types';
import { getActiveQuizQuestions, getEffectiveDealIntent } from './dealQuestions';

type Selections = Record<string, string>;

const TRACKABLE_QUESTION_IDS = [
  'intent',
  'housing_type',
  'mortgage',
  'matcapital',
  'poa',
  'minors',
  'alternative',
  'owners',
  'less_than_3y'
] as const;

function collectUnknownFields(selections: Selections): string[] {
  return TRACKABLE_QUESTION_IDS.filter((id) => selections[id] === 'unknown');
}

function buildQuizAnswers(selections: Selections): QuizAnswers | null {
  const rawIntent = selections.intent;
  const intent = (
    rawIntent === 'unknown' || !rawIntent ? 'buy_apartment' : rawIntent
  ) as DealIntent;

  const isLand = intent === 'buy_land' || intent === 'sell_land';
  const mortgage = isLand ? false : selections.mortgage === 'yes';

  const housingSelection = selections.housing_type;
  const housingType =
    intent === 'buy_apartment'
      ? housingSelection === 'unknown' || !housingSelection
        ? ('secondary' as HousingTypeAnswer)
        : (housingSelection as HousingTypeAnswer)
      : undefined;

  const owners = selections.owners;
  const lessThan3Selection = selections.less_than_3y as LessThan3YearsAnswer | undefined;

  return {
    intent,
    housingType,
    mortgage,
    matcapital: selections.matcapital === 'yes',
    powerOfAttorney: selections.poa === 'yes',
    minors: selections.minors === 'yes',
    alternative: selections.alternative === 'yes',
    multipleOwners: owners === 'two' || owners === 'three_plus',
    lessThan3Years: lessThan3Selection ?? 'no',
    unknownFields: collectUnknownFields(selections)
  };
}

const HintSheet: React.FC<{ hint: string; open: boolean; onClose: () => void }> = ({
  hint,
  open,
  onClose
}) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.button
          type="button"
          className="fixed inset-0 bg-black/40 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          aria-label="Закрыть пояснение"
        />
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[90] max-w-lg mx-auto sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 pointer-events-none"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-8 shadow-card w-full pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-sm font-semibold text-graphite">Пояснение</p>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4 text-graphite-muted" />
              </button>
            </div>
            <p className="text-sm text-graphite-muted leading-relaxed whitespace-pre-line">{hint}</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-5 py-3 rounded-2xl bg-accent text-white font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              Понятно
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export const DealQuiz: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    trackEvent('started_quiz');
  }, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [hintOpen, setHintOpen] = useState(false);

  const intent = selections.intent as DealIntent | undefined;
  const housingType = selections.housing_type as HousingTypeAnswer | undefined;
  const questions = useMemo(
    () => getActiveQuizQuestions(intent, housingType),
    [intent, housingType]
  );
  const current = questions[stepIndex];
  const progressPct = questions.length ? ((stepIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    setHintOpen(false);
  }, [current?.id]);

  const handleSelect = (optionId: string) => {
    if (!current) return;
    const nextSelections = { ...selections, [current.id]: optionId };
    setSelections(nextSelections);

    const nextIntentRaw = current.id === 'intent' ? optionId : nextSelections.intent;
    const nextIntent = (
      nextIntentRaw === 'unknown' || !nextIntentRaw ? 'buy_apartment' : nextIntentRaw
    ) as DealIntent;
    const nextHousingRaw = nextSelections.housing_type;
    const nextHousing =
      nextHousingRaw === 'unknown' ? undefined : (nextHousingRaw as HousingTypeAnswer | undefined);
    const nextQuestions = getActiveQuizQuestions(nextIntent, nextHousing);
    const isLast = stepIndex >= nextQuestions.length - 1;

    if (isLast) {
      const answers = buildQuizAnswers(nextSelections);
      if (!answers) return;
      const effective = getEffectiveDealIntent(answers.intent, answers.housingType);
      trackEvent('quiz_completed', { intent: answers.intent, effectiveIntent: effective });
      navigate('/app/onboarding/results', { state: { answers } });
      return;
    }

    const nextIndex = Math.min(stepIndex + 1, nextQuestions.length - 1);
    window.setTimeout(() => setStepIndex(nextIndex), 180);
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      navigate('/app/onboarding');
      return;
    }
    setStepIndex((i) => i - 1);
  };

  if (!current) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between text-xs text-graphite-muted mb-2">
          <button type="button" onClick={handleBack} className="font-medium text-graphite">
            ← Назад
          </button>
          <span>
            {stepIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="flex-1 flex flex-col px-4 py-6 min-h-0"
        >
          <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            <p className="text-xs font-medium text-accent uppercase tracking-wide mb-3">Ваш ответ</p>
            <div className="flex items-start gap-2 mb-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-graphite leading-snug flex-1">
                {current.question}
              </h2>
              <button
                type="button"
                onClick={() => setHintOpen(true)}
                className="w-9 h-9 shrink-0 rounded-full border border-gray-200 bg-white flex items-center justify-center text-accent hover:border-accent/40 hover:bg-accent-soft/30 transition-colors"
                aria-label="Пояснение к вопросу"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            {current.subtitle && (
              <p className="text-sm text-graphite-muted leading-relaxed mb-6">{current.subtitle}</p>
            )}
            {!current.subtitle && <div className="mb-6" />}
            <div className="flex flex-col gap-3">
              {current.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full text-left py-4 px-5 rounded-2xl border-2 bg-white text-[15px] font-medium active:scale-[0.98] transition-all hover:border-accent/40 hover:bg-accent-soft/30 ${
                    opt.id === 'unknown'
                      ? 'border-gray-100 text-graphite-muted'
                      : 'border-gray-100 text-graphite'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <HintSheet hint={current.hint} open={hintOpen} onClose={() => setHintOpen(false)} />
    </div>
  );
};
