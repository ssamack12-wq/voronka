import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { buildGuideJsonLd, getGuideArticle } from '../index';
import { GuideLayout } from '../components/GuideLayout';
import { GuideArticleBody } from '../components/GuideArticleBody';
import { SeoHead } from '../components/SeoHead';
import { SITE_URL } from '../config';

export const GuideArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getGuideArticle(slug) : undefined;

  if (!article) {
    return <Navigate to="/guide" replace />;
  }

  const stickyCta = (
    <Link
      to="/app/onboarding"
      className="flex items-center justify-center w-full min-h-btn-h rounded-btn bg-accent text-white text-base font-medium shadow-btn hover:scale-[1.02] transition-transform"
    >
      {article.ctaButton}
    </Link>
  );

  return (
    <GuideLayout
      breadcrumbs={[
        { label: 'Руководства', href: '/guide' },
        { label: article.title }
      ]}
      stickyCta={stickyCta}
    >
      <SeoHead
        title={article.metaTitle}
        description={article.metaDescription}
        canonicalPath={`/guide/${article.slug}`}
        ogType="article"
        jsonLd={buildGuideJsonLd(article, SITE_URL)}
      />
      <GuideArticleBody article={article} />
    </GuideLayout>
  );
};
