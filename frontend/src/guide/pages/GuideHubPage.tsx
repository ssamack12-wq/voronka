import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { GUIDE_META } from '../index';
import { GuideLayout } from '../components/GuideLayout';
import { SeoHead } from '../components/SeoHead';
import { SITE_URL } from '../config';

export const GuideHubPage: React.FC = () => {
  const sorted = [...GUIDE_META].sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));

  return (
    <GuideLayout breadcrumbs={[{ label: 'Руководства' }]}>
      <SeoHead
        title="Руководства по сделкам с недвижимостью — Навигатор сделки"
        description="Пошаговые инструкции: документы, проверка квартиры, покупка и продажа, ипотека, безопасность сделки. Бесплатные гиды для самостоятельной сделки."
        canonicalPath="/guide"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Руководства по сделкам с недвижимостью',
          url: `${SITE_URL}/guide`
        }}
      />

      <header className="mb-8">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">База знаний</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-graphite leading-tight">
          Руководства по сделкам с недвижимостью
        </h1>
        <p className="text-sm text-graphite-muted mt-3 leading-relaxed max-w-prose">
          Пошаговые инструкции для покупки и продажи квартиры. После каждого гида — персональный план
          сделки по вашей ситуации.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-5">
        {sorted.map((guide) => (
          <Link
            key={guide.slug}
            to={`/guide/${guide.slug}`}
            className="group block p-5 sm:p-6 rounded-2xl border border-gray-100 bg-white shadow-soft hover:border-accent/30 hover:shadow-card transition-all"
          >
            <div className="flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-graphite group-hover:text-accent transition-colors leading-snug">
                  {guide.title}
                </h2>
                <p className="text-sm text-graphite-muted mt-2 leading-relaxed line-clamp-2">
                  {guide.shortDescription}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent mt-3">
                  Читать
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <aside className="mt-10 p-6 rounded-2xl bg-accent-soft/50 border border-accent/15">
        <h2 className="text-lg font-semibold text-graphite mb-2">Нужен персональный план?</h2>
        <p className="text-sm text-graphite-muted mb-4">
          Пройдите квиз за 2 минуты — определим сценарий сделки и построим roadmap с документами и
          проверками.
        </p>
        <Link
          to="/app/onboarding"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-accent text-white text-sm font-semibold shadow-soft"
        >
          Определить мой сценарий
        </Link>
      </aside>
    </GuideLayout>
  );
};
