import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { GuideArticle } from '../types';

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
        <p className="badge-eyebrow mb-3">Руководство</p>
        <h1 className="text-section-title text-graphite">{article.title}</h1>
        <div className="text-base text-graphite-muted mt-4 leading-relaxed space-y-4">
          {article.lead.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </header>

      <nav
        aria-label="Содержание"
        className="mb-8 p-6 rounded-card bg-white shadow-soft"
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
          <ul className="space-y-3">
            {article.audience.map((item, i) => (
              <li key={i} className="checklist-card flex gap-4">
                <span className="check-icon check-icon--done shrink-0 mt-0.5" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-base text-graphite leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {article.sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-8 scroll-mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-4">{section.title}</h2>
          <div className="space-y-4 text-sm sm:text-base text-graphite leading-relaxed">
            {section.paragraphs?.map((p, pi) => (
              <p key={pi}>{p}</p>
            ))}
            {section.list && (
              <ul className="space-y-3">
                {section.list.map((item, li) => (
                  <li key={li} className="checklist-card flex gap-4">
                    <span className="check-icon check-icon--done shrink-0 mt-0.5" aria-hidden>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-base text-graphite leading-relaxed">{item}</span>
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
                    <ul className="space-y-3">
                      {sub.list.map((item, li) => (
                        <li key={li} className="checklist-card flex gap-4">
                          <span className="check-icon check-icon--done shrink-0 mt-0.5" aria-hidden>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span className="text-base text-graphite leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {article.nextSteps.length > 0 && (
        <section id="next-steps" className="mb-8 scroll-mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-4">Что делать дальше</h2>
          <ol className="space-y-3">
            {article.nextSteps.map((step, i) => (
              <li key={i} className="step-card flex gap-4 items-start">
                <span className="w-8 h-8 rounded-btn bg-accent/10 text-accent flex items-center justify-center text-sm font-semibold shrink-0">
                  {i + 1}
                </span>
                <span className="text-base text-graphite leading-relaxed pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {article.faq.length > 0 && (
        <section id="faq" className="mb-8 scroll-mt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-graphite mb-4">Частые вопросы</h2>
          <div className="space-y-4">
            {article.faq.map((item) => (
              <details
                key={item.question}
                className="group rounded-card bg-white p-5 shadow-soft"
              >
                <summary className="font-medium text-base text-graphite cursor-pointer list-none flex justify-between gap-3 leading-snug">
                  {item.question}
                  <span className="text-graphite-muted group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="text-desc text-graphite-muted mt-4 leading-relaxed">{item.answer}</p>
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
