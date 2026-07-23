import { ArrowLeft, Check, Circle } from 'lucide-react';
import React from 'react';

export const AppPreview: React.FC = () => (
  <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-2xl px-2 sm:px-0 min-w-0">
    <div className="rounded-card bg-white shadow-card overflow-hidden">
      <div className="bg-white card-inner pb-4">
        <div className="flex items-center gap-2 mb-4 min-w-0">
          <ArrowLeft className="w-4 h-4 text-graphite-muted shrink-0" />
          <span className="text-body font-medium text-graphite text-safe">Моя сделка</span>
        </div>
        <div className="flex items-center justify-between mb-2 min-w-0">
          <p className="text-small text-graphite-muted">Прогресс</p>
          <p className="text-small font-medium text-accent tabular-nums">8 из 26</p>
        </div>
        <div className="h-2.5 rounded-full bg-black/[0.04]">
          <div className="h-full w-[31%] rounded-full bg-accent" />
        </div>
      </div>

      <div className="card-inner space-y-3 sm:space-y-4 bg-surface/50">
        <div className="info-box bg-warning-soft !text-amber-900">
          <p className="badge-eyebrow !text-amber-800 !bg-amber-100/60 mb-1.5">Риски</p>
          <p className="text-body text-amber-900 leading-relaxed text-safe">2 фактора требуют внимания перед подписанием</p>
        </div>

        <div className="card-premium">
          <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-2">Следующий шаг</p>
          <p className="text-body font-medium text-graphite text-safe">Проверка продавца</p>
          <p className="text-small text-graphite-muted mt-1 leading-relaxed text-safe">4 пункта чек-листа · ~15 мин</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="card-premium min-w-0">
            <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-3">Документы</p>
            <div className="space-y-2.5">
              {['Выписка ЕГРН', 'Паспорт продавца', 'Справка об отсутствии долгов'].map((doc) => (
                <div key={doc} className="feature-row !gap-2.5">
                  <span className="check-icon check-icon--done shrink-0 !w-5 !h-5 !rounded-md">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="feature-row__content text-body text-graphite text-safe">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium min-w-0">
            <p className="badge-eyebrow !text-graphite-muted !bg-surface mb-3">Этапы</p>
            <div className="space-y-2.5">
              {[
                { label: 'Подготовка', done: true },
                { label: 'Проверка объекта', done: true },
                { label: 'Договор', done: false },
                { label: 'Регистрация', done: false }
              ].map(({ label, done }) => (
                <div key={label} className="feature-row !gap-2.5">
                  {done ? (
                    <span className="check-icon check-icon--done shrink-0 !w-5 !h-5">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : (
                    <Circle className="w-5 h-5 text-black/10 shrink-0" />
                  )}
                  <span className={`feature-row__content text-body text-safe ${done ? 'text-graphite font-medium' : 'text-graphite-muted'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
