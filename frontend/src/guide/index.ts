import type { GuideArticle, GuideMeta } from './types';
import * as dokumenty from './content/dokumenty-dlya-pokupki-kvartiry';
import * as proverka from './content/proverka-kvartiry-pered-pokupkoy';
import * as pokupka from './content/pokupka-kvartiry-poshagovo';
import * as prodazha from './content/prodazha-kvartiry-poshagovo';
import * as bezRieltora from './content/kak-kupit-kvartiru-bez-rieltora';
import * as bezopasno from './content/kak-bezopasno-kupit-kvartiru';
import * as ipoteka from './content/pokupka-kvartiry-v-ipoteku-poshagovo';

export const GUIDE_META: GuideMeta[] = [
  {
    slug: 'dokumenty-dlya-pokupki-kvartiry',
    title: 'Какие документы нужны для покупки квартиры в 2026 году',
    shortDescription:
      'Полный список документов для покупателя и продавца: вторичка, новостройка, ипотека, типичные ошибки.',
    metaTitle: 'Какие документы нужны для покупки квартиры в 2026 году — полный список',
    metaDescription:
      'Какие документы нужны для покупки квартиры: списки для покупателя и продавца, ипотека, новостройка, вторичка, типичные ошибки и FAQ.',
    ctaTitle: 'Получить персональный список документов',
    ctaText:
      'Состав документов зависит от типа сделки, ипотеки, маткапитала и состава семьи. Пройдите короткий квиз — мы соберём список под ваш случай.',
    ctaButton: 'Определить мой сценарий',
    relatedSlugs: [
      'proverka-kvartiry-pered-pokupkoy',
      'pokupka-kvartiry-poshagovo',
      'pokupka-kvartiry-v-ipoteku-poshagovo'
    ],
    searchVolume: 4416
  },
  {
    slug: 'proverka-kvartiry-pered-pokupkoy',
    title: 'Проверка квартиры перед покупкой: полный чеклист',
    shortDescription:
      'Как проверить собственника, ЕГРН, долги, перепланировку, суды и банкротство перед покупкой.',
    metaTitle: 'Проверка квартиры перед покупкой — полный чеклист 2026',
    metaDescription:
      'Проверка квартиры перед покупкой: собственник, ЕГРН, долги, перепланировка, судебные споры, банкротство. Пошаговый чеклист для покупателя.',
    ctaTitle: 'Получить персональный план проверки',
    ctaText: 'Набор проверок зависит от типа жилья и способа оплаты. Квиз за 2 минуты покажет, что важно именно в вашей сделке.',
    ctaButton: 'Определить мой сценарий',
    relatedSlugs: [
      'kak-bezopasno-kupit-kvartiru',
      'dokumenty-dlya-pokupki-kvartiry',
      'pokupka-kvartiry-poshagovo'
    ],
    searchVolume: 1333
  },
  {
    slug: 'pokupka-kvartiry-poshagovo',
    title: 'Покупка квартиры пошагово: инструкция от выбора объекта до регистрации',
    shortDescription: 'Пошаговая инструкция покупки квартиры: выбор, проверка, аванс, ДКП, расчёты, регистрация.',
    metaTitle: 'Покупка квартиры пошагово — инструкция от А до Я',
    metaDescription:
      'Покупка квартиры пошагово: выбор объекта, проверка, аванс, договор, расчёты, регистрация и передача. Подробная инструкция для самостоятельной сделки.',
    ctaTitle: 'Построить персональный план покупки',
    ctaText: 'У каждой сделки свой порядок этапов. Пройдите квиз — получите roadmap с учётом ипотеки, маткапитала и рисков.',
    ctaButton: 'Определить мой сценарий',
    relatedSlugs: [
      'dokumenty-dlya-pokupki-kvartiry',
      'kak-kupit-kvartiru-bez-rieltora',
      'pokupka-kvartiry-v-ipoteku-poshagovo'
    ],
    searchVolume: 993
  },
  {
    slug: 'prodazha-kvartiry-poshagovo',
    title: 'Продажа квартиры пошагово: полный алгоритм сделки',
    shortDescription: 'Как продать квартиру: документы, поиск покупателя, проверка, подписание, расчёты, регистрация.',
    metaTitle: 'Продажа квартиры пошагово — алгоритм сделки 2026',
    metaDescription:
      'Продажа квартиры пошагово: подготовка документов, поиск покупателя, проверка, подписание, расчёты, регистрация и передача объекта.',
    ctaTitle: 'Получить план продажи',
    ctaText: 'План продажи зависит от ипотеки, количества собственников и сроков. Определите сценарий за 2 минуты.',
    ctaButton: 'Определить мой сценарий',
    relatedSlugs: [
      'dokumenty-dlya-pokupki-kvartiry',
      'pokupka-kvartiry-poshagovo',
      'kak-bezopasno-kupit-kvartiru'
    ],
    searchVolume: 802
  },
  {
    slug: 'kak-kupit-kvartiru-bez-rieltora',
    title: 'Как купить квартиру без риэлтора и не допустить ошибок',
    shortDescription: 'Самостоятельная покупка квартиры: что делает риэлтор, какие проверки обязательны, основные риски.',
    metaTitle: 'Как купить квартиру без риэлтора — пошаговый гид',
    metaDescription:
      'Как купить квартиру без риэлтора: что можно сделать самостоятельно, обязательные проверки, документы, риски и контроль сделки.',
    ctaTitle: 'Получить персональный план сделки',
    ctaText: 'Без риэлтора важен чёткий план. Квиз определит ваш сценарий и покажет все этапы с чеклистами.',
    ctaButton: 'Определить мой сценарий',
    relatedSlugs: [
      'pokupka-kvartiry-poshagovo',
      'proverka-kvartiry-pered-pokupkoy',
      'kak-bezopasno-kupit-kvartiru'
    ],
    searchVolume: 704
  },
  {
    slug: 'kak-bezopasno-kupit-kvartiru',
    title: 'Как безопасно купить квартиру: основные проверки и риски',
    shortDescription: 'Безопасная покупка квартиры: проверка продавца, документов, расчётов, схемы мошенничества.',
    metaTitle: 'Как безопасно купить квартиру — проверки и риски',
    metaDescription:
      'Как безопасно купить квартиру: проверка продавца, объекта, документов, расчётов. Типичные схемы мошенничества и чеклист безопасности.',
    ctaTitle: 'Проверить риски моей сделки',
    ctaText: 'Оцените риски вашей сделки за 2 минуты — квиз учтёт ипотеку, маткапитал, несовершеннолетних и другие факторы.',
    ctaButton: 'Определить мой сценарий',
    relatedSlugs: [
      'proverka-kvartiry-pered-pokupkoy',
      'kak-kupit-kvartiru-bez-rieltora',
      'dokumenty-dlya-pokupki-kvartiry'
    ],
    searchVolume: 863
  },
  {
    slug: 'pokupka-kvartiry-v-ipoteku-poshagovo',
    title: 'Покупка квартиры в ипотеку пошагово',
    shortDescription: 'Ипотечная сделка: одобрение, подбор, оценка, страхование, сделка, регистрация, передача.',
    metaTitle: 'Покупка квартиры в ипотеку пошагово — инструкция 2026',
    metaDescription:
      'Покупка квартиры в ипотеку пошагово: одобрение, подбор объекта, оценка, страхование, сделка, регистрация и передача квартиры.',
    ctaTitle: 'Построить ипотечный сценарий',
    ctaText: 'Ипотека с маткапиталом, созаёмщиками или на вторичку — разные документы и этапы. Определите свой сценарий.',
    ctaButton: 'Определить мой сценарий',
    relatedSlugs: [
      'dokumenty-dlya-pokupki-kvartiry',
      'pokupka-kvartiry-poshagovo',
      'kak-bezopasno-kupit-kvartiru'
    ],
    searchVolume: 230
  }
];

const CONTENT_MAP: Record<
  string,
  { sections: GuideArticle['sections']; faq: GuideArticle['faq'] }
> = {
  'dokumenty-dlya-pokupki-kvartiry': dokumenty,
  'proverka-kvartiry-pered-pokupkoy': proverka,
  'pokupka-kvartiry-poshagovo': pokupka,
  'prodazha-kvartiry-poshagovo': prodazha,
  'kak-kupit-kvartiru-bez-rieltora': bezRieltora,
  'kak-bezopasno-kupit-kvartiru': bezopasno,
  'pokupka-kvartiry-v-ipoteku-poshagovo': ipoteka
};

const LEADS: Record<string, string> = {
  'dokumenty-dlya-pokupki-kvartiry':
    'Покупка квартиры — это десятки документов, и состав пакета меняется в зависимости от типа жилья, ипотеки, материнского капитала и состава семьи. В этом руководстве — актуальные требования на 2026 год для покупателя и продавца.',
  'proverka-kvartiry-pered-pokupkoy':
    'Юридическая чистота квартиры важнее красивого ремонта. Один пропущенный документ может стоить миллионы. Разбираем полный чеклист проверки перед покупкой.',
  'pokupka-kvartiry-poshagovo':
    'От первого просмотра до получения ключей — покупка квартиры включает 7 ключевых этапов. Рассказываем, что делать на каждом и как не потерять деньги.',
  'prodazha-kvartiry-poshagovo':
    'Продажа квартиры требует подготовки документов, поиска покупателя и безопасной организации расчётов. Пошаговый алгоритм для продавца.',
  'kak-kupit-kvartiru-bez-rieltora':
    'Риэлтор не обязателен, но его функции нужно закрыть самостоятельно. Разбираем, что можно сделать без посредника и где риски максимальны.',
  'kak-bezopasno-kupit-kvartiru':
    'Безопасность сделки — это система проверок, а не удача. Собрали ключевые риски, схемы мошенничества и чеклист для покупателя.',
  'pokupka-kvartiry-v-ipoteku-poshagovo':
    'Ипотека добавляет к сделке банк, оценку, страховки и закладную. Пошагово — от одобрения до получения ключей.'
};

export function getGuideMeta(slug: string): GuideMeta | undefined {
  return GUIDE_META.find((g) => g.slug === slug);
}

export function getGuideArticle(slug: string): GuideArticle | undefined {
  const meta = getGuideMeta(slug);
  const content = CONTENT_MAP[slug];
  if (!meta || !content) return undefined;

  return {
    ...meta,
    lead: LEADS[slug] ?? meta.shortDescription,
    sections: content.sections,
    faq: content.faq,
    allGuides: GUIDE_META
  };
}

export function buildGuideJsonLd(article: GuideArticle, siteUrl: string) {
  const url = `${siteUrl}/guide/${article.slug}`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Руководства', item: `${siteUrl}/guide` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url }
    ]
  };
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: '2026-01-15',
    dateModified: new Date().toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: 'Навигатор сделки' },
    publisher: { '@type': 'Organization', name: 'Навигатор сделки' },
    mainEntityOfPage: url
  };
  const faqSchema =
    article.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer }
          }))
        }
      : null;

  return [breadcrumb, articleSchema, ...(faqSchema ? [faqSchema] : [])];
}

export const GUIDE_SLUGS = GUIDE_META.map((g) => g.slug);
