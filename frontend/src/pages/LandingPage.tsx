import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginButton } from '../components/LoginButton';
import { GUIDE_META } from '../guide/index';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartDeal = useCallback(() => {
    navigate('/app/onboarding');
  }, [navigate]);

  const topGuides = [...GUIDE_META]
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .slice(0, 4);

  return (
    <section className="flex flex-col gap-6 flex-1">
      <div className="flex justify-end">
        <LoginButton redirectPath="/app/onboarding" showProfileWhenAuthed />
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider">
          Навигатор сделки
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-graphite tracking-tight leading-tight">
          Проведите сделку с недвижимостью безопасно
        </h1>
        <p className="text-sm text-graphite-muted leading-relaxed">
          Бесплатные руководства, квиз и персональный план сделки — без обязательной регистрации.
        </p>
      </div>

      <PrimaryCta onClick={handleStartDeal} />

      <div className="rounded-2xl border border-gray-100 bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-graphite">Руководства</h2>
          <Link to="/guide" className="text-sm font-medium text-accent">
            Все →
          </Link>
        </div>
        <ul className="space-y-2">
          {topGuides.map((g) => (
            <li key={g.slug}>
              <Link
                to={`/guide/${g.slug}`}
                className="text-sm text-graphite hover:text-accent transition-colors leading-snug block py-1"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-surface p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-graphite mb-2">Что вы получите</h2>
        <ul className="text-sm text-graphite space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            Персональный план сделки — без ручного выбора сценария
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            Учёт рисков: ипотека, маткапитал, опека, альтернатива
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            Чеклисты, шаблоны документов и контроль прогресса
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={() => navigate('/quiz')}
        className="w-full py-3 rounded-2xl border border-gray-200 text-sm text-graphite-muted font-medium"
      >
        Быстрая проверка знаний
      </button>
    </section>
  );
};

const PrimaryCta: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-3.5 rounded-2xl bg-accent text-white font-semibold text-base active:scale-[0.98] transition-transform shadow-soft"
  >
    Начать
  </button>
);
