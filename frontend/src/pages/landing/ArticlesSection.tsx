import { ArrowRight, BookOpen } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import type { GuideMeta } from '../../guide/types';
import { CARD_CLASS, FadeIn, SectionHeading } from './shared';

type ArticlesSectionProps = {
  guides: GuideMeta[];
};

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ guides }) => (
  <section className="py-16 sm:py-20 lg:py-24">
    <FadeIn>
      <SectionHeading
        eyebrow="База знаний"
        title="Полезные статьи"
        subtitle="Руководства по сделкам с недвижимостью"
      />
    </FadeIn>
    <div className="grid gap-4 sm:grid-cols-2">
      {guides.map((guide, i) => (
        <FadeIn key={guide.slug} delay={i * 70}>
          <Link
            to={`/guide/${guide.slug}`}
            className={`group flex gap-4 ${CARD_CLASS} h-full`}
          >
            <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-graphite group-hover:text-accent transition-colors leading-relaxed">
                {guide.title}
              </h3>
              <p className="text-desc text-graphite-muted mt-2 leading-relaxed line-clamp-2">
                {guide.shortDescription}
              </p>
              <span className="inline-flex items-center gap-1 text-desc font-medium text-accent mt-3">
                Читать
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        </FadeIn>
      ))}
    </div>
    <FadeIn className="flex justify-center mt-8" delay={200}>
      <Link
        to="/guide"
        className="inline-flex items-center gap-1.5 text-base font-medium text-accent hover:underline"
      >
        Все руководства
        <ArrowRight className="w-4 h-4" />
      </Link>
    </FadeIn>
  </section>
);
