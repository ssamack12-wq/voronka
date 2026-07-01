import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitConsultation } from '../../auth/api';
import { useAuthStore } from '../../auth/store';
import { Header } from '../components/Header';
import { Card, GhostButton, PageShell, PrimaryButton } from '../components/ui';
import { useNavigator } from '../store/NavigatorContext';

const NEED_TYPES = [
  'Проверка квартиры',
  'Подготовка документов',
  'Полное сопровождение',
  'Проверка рисков',
  'Помощь с ипотекой'
] as const;

export const LeadScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedStepId, deal, progress } = useNavigator();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needType, setNeedType] = useState<string>(NEED_TYPES[0]);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [error, setError] = useState<string | null>(null);

  const goBack = () => navigate(-1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitConsultation({
        dealId: progress?.id,
        scenarioId: progress?.scenarioId,
        stepId: selectedStepId ?? undefined,
        needType,
        message: message.trim(),
        phone: phone.trim(),
        email: email.trim()
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header title="Помощь специалиста" onBack={goBack} />
      <PageShell className="flex-1 overflow-y-auto pb-8">
        <Card className="p-4 mb-4">
          <p className="text-sm text-graphite leading-relaxed">
            Юрист или риелтор поможет проверить объект, подготовить документы, провести расчёты и
            сопроводить сделку.
          </p>
        </Card>

        {deal && (
          <p className="text-xs text-graphite-muted mb-4">
            Сценарий: {deal.scenario.title}
            {selectedStepId ? ` · шаг: ${selectedStepId}` : ''}
          </p>
        )}

        {sent ? (
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-graphite mb-2">Заявка отправлена</p>
            <p className="text-sm text-graphite-muted">
              Специалист свяжется с вами в ближайшее время.
            </p>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <p className="text-sm font-medium text-graphite">Что вам нужно?</p>
            <div className="flex flex-wrap gap-2">
              {NEED_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNeedType(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    needType === t
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-gray-200 text-graphite-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="tel"
              placeholder="Ваш телефон"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <input
              type="email"
              placeholder="Ваш email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <textarea
              placeholder="Опишите ситуацию"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            />
            {error && <p className="text-sm text-risk">{error}</p>}
            <PrimaryButton
              disabled={loading || !message.trim() || !phone.trim() || !email.trim()}
            >
              {loading ? 'Отправка…' : 'Отправить заявку'}
            </PrimaryButton>
          </form>
        )}

        <div className="mt-4">
          <GhostButton onClick={goBack}>Назад</GhostButton>
        </div>
      </PageShell>
    </div>
  );
};
