import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { GuideArticle } from '../types';

interface GuideArticleBodyProps {
  article: GuideArticle;
}

const ChecklistItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="checklist-row">
    <span className="feature-row__icon check-icon check-icon--done mt-0.5" aria-hidden>
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
    <span className="feature-row__content text-body text-graphite leading-relaxed text-safe">
      {children}
    </span>
  </li>
);

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
    <article className="min-w-0 max-w-full">
      <header className="mb-8 min-w-0">
        <p className="badge-eyebrow mb-3">Руководство</p>
        <h1 className="text-h1 text-graphite text-safe">{article.title}</h1>
        <div className="text-body text-graphite-muted mt-4 leading-relaxed space-y-4">
          {article.lead.map((p, i) => (
            <p key={i} className="text-safe">
              {p}
            </p>
          ))}
        </div>
      </header>

      <nav aria-label="Содержание" className="mb-8 card-inline">
        <p className="text-small font-semibold text-graphite-muted uppercase tracking-wide mb-3">
          Содержание страницы
        </p>
        <ol className="card-list">
          {toc.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="feature-row text-small text-graphite hover:text-accent transition-colors"
              >
                <span className="feature-row__icon text-graphite-muted">{i + 1}.</span>
                <span className="feature-row__content text-safe">{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {article.audience.length > 0 && (
        <section id="audience" className="mb-8 scroll-mt-6 min-w-0">
          <h2 className="text-h2 text-graphite mb-4 text-safe">Кому подойдёт это руководство</h2>
          <div className="card-inline">
            <ul className="card-list">
              {article.audience.map((item, i) => (
                <ChecklistItem key={i}>{item}</ChecklistItem>
              ))}
            </ul>
          </div>
        </section>
      )}

      {article.sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-8 scroll-mt-6 min-w-0">
          <h2 className="text-h2 text-graphite mb-4 text-safe">{section.title}</h2>
          <div className="space-y-4 text-body text-graphite leading-relaxed">
            {section.paragraphs?.map((p, pi) => (
              <p key={pi} className="text-safe">
                {p}
              </p>
            ))}
            {section.list && (
              <div className="card-inline">
                <ul className="card-list">
                  {section.list.map((item, li) => (
                    <ChecklistItem key={li}>{item}</ChecklistItem>
                  ))}
                </ul>
              </div>
            )}
            {section.subsections?.map((sub) => (
              <div key={sub.title} className="mt-6 min-w-0">
                <h3 className="text-body font-semibold text-graphite mb-3 text-safe">{sub.title}</h3>
                <div className="space-y-3">
                  {sub.paragraphs?.map((p, pi) => (
                    <p key={pi} className="text-safe">
                      {p}
                    </p>
                  ))}
                  {sub.list && (
                    <div className="card-inline">
                      <ul className="card-list">
                        {sub.list.map((item, li) => (
                          <ChecklistItem key={li}>{item}</ChecklistItem>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {article.nextSteps.length > 0 && (
        <section id="next-steps" className="mb-8 scroll-mt-6 min-w-0">
          <h2 className="text-h2 text-graphite mb-4 text-safe">Что делать дальше</h2>
          <ol className="card-inline card-list">
            {article.nextSteps.map((step, i) => (
              <li key={i} className="feature-row items-start">
                <span className="feature-row__icon step-number">{i + 1}</span>
                <span className="feature-row__content text-body text-graphite leading-relaxed text-safe pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {article.faq.length > 0 && (
        <section id="faq" className="mb-8 scroll-mt-6 min-w-0">
          <h2 className="text-h2 text-graphite mb-4 text-safe">Частые вопросы</h2>
          <div className="card-list">
            {article.faq.map((item) => (
              <details key={item.question} className="group card-inline">
                <summary className="feature-row font-medium text-body text-graphite cursor-pointer list-none leading-snug">
                  <span className="feature-row__content text-safe">{item.question}</span>
                  <span className="feature-row__trailing text-graphite-muted group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="text-desc text-graphite-muted mt-4 leading-relaxed text-safe">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="mb-4 min-w-0">
        <h2 className="text-body font-semibold text-graphite mb-3 text-safe">Полезные руководства</h2>
        <ul className="card-list">
          {article.relatedSlugs.map((slug) => {
            const related = article.allGuides.find((g) => g.slug === slug);
            if (!related) return null;
            return (
              <li key={slug}>
                <Link
                  to={`/guide/${slug}`}
                  className="text-small text-accent font-medium hover:underline text-safe"
                >
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
