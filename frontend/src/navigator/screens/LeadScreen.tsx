import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitConsultation } from '../../auth/api';
import { useAuthStore } from '../../auth/store';
import { Header } from '../components/Header';
import {
  Card,
  Chip,
  GhostButton,
  InputField,
  PageShell,
  PrimaryButton,
  TextAreaField
} from '../components/ui';
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
        <Card className="p-5 mb-5">
          <p className="text-base text-graphite leading-relaxed">
            Юрист или риелтор поможет проверить объект, подготовить документы, провести расчёты и
            сопроводить сделку.
          </p>
        </Card>

        {deal && (
          <p className="text-desc text-graphite-muted mb-5">
            Сценарий: {deal.scenario.title}
            {selectedStepId ? ` · шаг: ${selectedStepId}` : ''}
          </p>
        )}

        {sent ? (
          <div className="text-center py-10">
            <p className="text-lg font-semibold text-graphite mb-2">Заявка отправлена</p>
            <p className="text-base text-graphite-muted leading-relaxed">
              Специалист свяжется с вами в ближайшее время.
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="text-base font-medium text-graphite mb-3">Что вам нужно?</p>
              <div className="flex flex-wrap gap-2">
                {NEED_TYPES.map((t) => (
                  <Chip key={t} selected={needType === t} onClick={() => setNeedType(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
            <InputField
              type="tel"
              placeholder="Ваш телефон"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <InputField
              type="email"
              placeholder="Ваш email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextAreaField
              placeholder="Опишите ситуацию"
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {error && <p className="text-desc text-risk">{error}</p>}
            <PrimaryButton
              disabled={loading || !message.trim() || !phone.trim() || !email.trim()}
            >
              {loading ? 'Отправка…' : 'Отправить заявку'}
            </PrimaryButton>
          </form>
        )}

        <div className="mt-5">
          <GhostButton onClick={goBack}>Назад</GhostButton>
        </div>
      </PageShell>
    </div>
  );
};
