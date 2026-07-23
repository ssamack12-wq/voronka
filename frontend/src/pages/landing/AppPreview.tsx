import { ArrowLeft, Check, Circle } from 'lucide-react';
import React from 'react';

const ANNOTATIONS = [
  { label: 'Здесь риски', position: 'top-8 -left-1 lg:-left-16', align: 'left' as const },
  { label: 'Здесь прогресс', position: 'top-[14%] -right-1 lg:-right-14', align: 'right' as const },
  { label: 'Здесь чек-лист', position: 'top-[42%] -right-1 lg:-right-16', align: 'right' as const },
  { label: 'Здесь документы', position: 'bottom-[22%] -left-1 lg:-left-16', align: 'left' as const }
];

export const AppPreview: React.FC = () => (
  <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl px-2 sm:px-0">
    {ANNOTATIONS.map(({ label, position, align }) => (
      <div
        key={label}
        className={`absolute ${position} z-10 hidden lg:flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      >
        <span className="badge-eyebrow whitespace-nowrap bg-white/95 backdrop-blur-sm shadow-soft">
          {align === 'left' ? '←' : '→'} {label}
        </span>
        <span className="w-8 h-px bg-accent/25" aria-hidden />
      </div>
    ))}

    <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-white shadow-card overflow-hidden">
      <div className="bg-white px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4 text-graphite-muted" />
          <span className="text-base font-medium text-graphite">Моя сделка</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs sm:text-sm text-graphite-muted">Прогресс</p>
          <p className="text-xs sm:text-sm font-medium text-accent tabular-nums">8 из 26</p>
        </div>
        <div className="h-2.5 rounded-full bg-black/[0.04]">
          <div className="h-full w-[31%] rounded-full bg-accent" />
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-surface/50">
        <div className="info-box bg-warning-soft !text-amber-900">
          <p className="badge-eyebrow !text-amber-800 !bg-amber-100/60 mb-1.5">Риски</p>
          <p className="text-sm text-amber-900 leading-relaxed">2 фактора требуют внимания перед подписанием</p>
        </div>

        <div className="card-premium !p-4">
          <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-2">Следующий шаг</p>
          <p className="text-base font-medium text-graphite">Проверка продавца</p>
          <p className="text-sm text-graphite-muted mt-1 leading-relaxed">4 пункта чек-листа · ~15 мин</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="card-premium !p-4">
            <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-3">Документы</p>
            <div className="space-y-2.5">
              {['Выписка ЕГРН', 'Паспорт продавца', 'Справка об отсутствии долгов'].map((doc) => (
                <div key={doc} className="flex items-center gap-2.5 text-sm text-graphite">
                  <span className="check-icon check-icon--done shrink-0 !w-5 !h-5 !rounded-md">
                    <Check className="w-3 h-3" />
                  </span>
                  {doc}
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium !p-4">
            <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-3">Этапы</p>
            <div className="space-y-2.5">
              {[
                { label: 'Подготовка', done: true },
                { label: 'Проверка объекта', done: true },
                { label: 'Договор', done: false },
                { label: 'Регистрация', done: false }
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  {done ? (
                    <span className="check-icon check-icon--done shrink-0 !w-5 !h-5">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <Circle className="w-5 h-5 text-black/10 shrink-0" />
                  )}
                  <span className={done ? 'text-graphite font-medium' : 'text-graphite-muted'}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-2 gap-2 lg:hidden">
      {ANNOTATIONS.map(({ label }) => (
        <span key={label} className="badge-eyebrow text-center !text-[11px] sm:!text-xs">
          {label}
        </span>
      ))}
    </div>
  </div>
);
