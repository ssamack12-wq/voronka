export interface GuideSection {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
}

export interface GuideFaqItem {
  question: string;
  answer: string;
}

export interface GuideMeta {
  slug: string;
  title: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  relatedSlugs: string[];
  searchVolume?: number;
}

export interface GuideArticle extends GuideMeta {
  lead: string;
  sections: GuideSection[];
  faq: GuideFaqItem[];
  allGuides: GuideMeta[];
}
