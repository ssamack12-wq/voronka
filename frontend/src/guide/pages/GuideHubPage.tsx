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

      <header className="mb-8 min-w-0">
        <p className="badge-eyebrow mb-3">База знаний</p>
        <h1 className="text-h1 text-graphite text-safe">Руководства по сделкам с недвижимостью</h1>
        <p className="text-body text-graphite-muted mt-4 leading-relaxed max-w-prose text-safe">
          Пошаговые инструкции для покупки и продажи квартиры. После каждого гида — персональный план
          сделки по вашей ситуации.
        </p>
      </header>

      <div className="grid gap-4 sm:gap-5">
        {sorted.map((guide) => (
          <Link
            key={guide.slug}
            to={`/guide/${guide.slug}`}
            className="group block card-premium-interactive min-w-0"
          >
            <div className="feature-row">
              <div className="feature-row__icon w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div className="feature-row__content text-safe">
                <h2 className="feature-row__title font-semibold group-hover:text-accent transition-colors leading-snug">
                  {guide.title}
                </h2>
                <p className="feature-row__description text-safe">{guide.shortDescription}</p>
                <span className="inline-flex items-center gap-1 text-small font-medium text-accent mt-3">
                  Читать
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <aside className="mt-12 card-premium bg-accent-soft/40 min-w-0">
        <h2 className="text-h2 text-graphite mb-2 text-safe">Нужен персональный план?</h2>
        <p className="text-body text-graphite-muted mb-5 leading-relaxed text-safe">
          Пройдите квиз за 2 минуты — определим сценарий сделки и построим roadmap с документами и
          проверками.
        </p>
        <Link to="/app/onboarding" className="btn-primary">
          Определить мой сценарий
        </Link>
      </aside>
    </GuideLayout>
  );
};
