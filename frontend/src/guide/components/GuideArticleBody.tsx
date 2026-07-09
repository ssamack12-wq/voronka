import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { GuideArticle } from '../types';
import { ConversionBlock } from './ConversionBlock';

interface GuideArticleBodyProps {
  article: GuideArticle;
}

export const GuideArticleBody: React.FC<GuideArticleBodyProps> = ({ article }) => {
  const toc = useMemo(
    () => [
      { id: 'audience', title: 'Кому подойдёт это руководство' },
      ...article.sections.map((s) => ({ id: s.id, title: s.title })),
      ...(article.nextSteps.length > 0 ? [{ id: 'next-steps', title: 'Что делать дальше' }] : []),
      ...(article.faq.length > 0 ? [{ id: 'faq', title: 'Частые вопросы' }] : [])
    ],
    [article.sections, article.nextSteps.length, article.faq.length]
  );

  return (
    <article>
      <header className="mb-8">
        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Руководство</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-graphite leading-tight tracking-tight">
          {article.title}
        </h1>
        <div className="text-sm text-graphite-muted mt-3 leading-relaxed space-y-3">
          {article.lead.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </header>

      <nav
        aria-label="Содержание"
        className="mb-8 p-4 sm:p-5 rounded-2xl bg-surface border border-gray-100"
      >
        <p className="text-xs font-semibold text-graphite-muted uppercase tracking-wide mb-3">
          Содержание страницы
        </p>
        <ol className="space-y-2">
          {toc.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-sm text-graphite hover:text-accent transition-colors flex gap-2"
              >
                <span className="text-graphite-muted shrink-0">{i + 1}.</span>
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {article.audience.length > 0 && (
        <section id="audience" className="mb-8 scroll-mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-4">
            Кому подойдёт это руководство
          </h2>
          <ul className="space-y-2 pl-1">
            {article.audience.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm sm:text-base text-graphite leading-relaxed">
                <span className="text-accent shrink-0 mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {article.sections.map((section, index) => (
        <React.Fragment key={section.id}>
          <section id={section.id} className="mb-8 scroll-mt-6">
            <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-4">{section.title}</h2>
            <div className="space-y-4 text-sm sm:text-base text-graphite leading-relaxed">
              {section.paragraphs?.map((p, pi) => (
                <p key={pi}>{p}</p>
              ))}
              {section.list && (
                <ul className="space-y-2 pl-1">
                  {section.list.map((item, li) => (
                    <li key={li} className="flex gap-2">
                      <span className="text-accent shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className="mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-graphite mb-3">{sub.title}</h3>
                  <div className="space-y-3">
                    {sub.paragraphs?.map((p, pi) => (
                      <p key={pi}>{p}</p>
                    ))}
                    {sub.list && (
                      <ul className="space-y-2 pl-1">
                        {sub.list.map((item, li) => (
                          <li key={li} className="flex gap-2">
                            <span className="text-accent shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          {(index + 1) % 2 === 0 && index < article.sections.length - 1 && <ConversionBlock />}
        </React.Fragment>
      ))}

      {article.nextSteps.length > 0 && (
        <section id="next-steps" className="mb-8 scroll-mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-4">Что делать дальше</h2>
          <ol className="space-y-2 pl-1">
            {article.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm sm:text-base text-graphite leading-relaxed">
                <span className="text-accent font-semibold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <aside className="my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-accent-soft/80 to-white border border-accent/20 shadow-card">
        <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-2">{article.ctaTitle}</h2>
        <p className="text-sm text-graphite-muted mb-5 leading-relaxed">{article.ctaText}</p>
        <Link
          to="/app/onboarding"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-accent text-white text-sm font-semibold shadow-soft hover:opacity-95 transition-opacity"
        >
          {article.ctaButton}
        </Link>
      </aside>

      {article.faq.length > 0 && (
        <section id="faq" className="mb-8 scroll-mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-4">Частые вопросы</h2>
          <div className="space-y-4">
            {article.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-soft"
              >
                <summary className="font-medium text-sm text-graphite cursor-pointer list-none flex justify-between gap-2">
                  {item.question}
                  <span className="text-graphite-muted group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-graphite-muted mt-3 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mb-4">
        <h2 className="text-base font-semibold text-graphite mb-3">Полезные руководства</h2>
        <ul className="space-y-2">
          {article.relatedSlugs.map((slug) => {
            const related = article.allGuides.find((g) => g.slug === slug);
            if (!related) return null;
            return (
              <li key={slug}>
                <Link to={`/guide/${slug}`} className="text-sm text-accent font-medium hover:underline">
                  {related.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
};
