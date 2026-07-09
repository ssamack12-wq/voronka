import type { GuideArticle, GuideMeta, GuideFaqItem, GuideSection } from './types';
import { STANDARD_CTA } from './constants';
import * as dokumenty from './content/dokumenty-dlya-pokupki-kvartiry';
import * as proverka from './content/proverka-kvartiry-pered-pokupkoy';
import * as pokupka from './content/pokupka-kvartiry-poshagovo';
import * as prodazha from './content/prodazha-kvartiry-poshagovo';
import * as bezRieltora from './content/kak-kupit-kvartiru-bez-rieltora';
import * as bezopasno from './content/kak-bezopasno-kupit-kvartiru';
import * as ipoteka from './content/pokupka-kvartiry-v-ipoteku-poshagovo';
import * as proveritProdavca from './content/kak-proverit-prodavca-kvartiry';
import * as chtoProveryat from './content/chto-proveryat-pered-pokupkoy-kvartiry';
import * as proveritKvartiru from './content/kak-proverit-kvartiru-pered-pokupkoy';
import * as poDoverennosti from './content/pokupka-kvartiry-po-doverennosti';
import * as alternativnaya from './content/alternativnaya-sdelka-s-nedvizhimostyu';
import * as matkapital from './content/pokupka-kvartiry-s-materinskim-kapitalom';
import * as obremeneniya from './content/kak-proverit-obremeneniya-na-kvartiru';
import * as elRegistraciya from './content/elektronnaya-registraciya-sdelki';
import * as bezopasnyeRaschety from './content/bezopasnye-raschety-pri-pokupke-kvartiry';
import * as zadatokAvans from './content/zadatok-ili-avans';
import * as registraciyaPrava from './content/registraciya-prava-sobstvennosti';
import * as bankrotstvo from './content/kak-proverit-bankrotstvo-prodavca';
import * as poslePokupki from './content/chto-delat-posle-pokupki-kvartiry';
import * as dogovorKp from './content/kak-oformit-dogovor-kupli-prodazhi';
import * as bezOshibok from './content/kak-kupit-kvartiru-bez-oshibok';

const CTA = STANDARD_CTA;

export const GUIDE_META: GuideMeta[] = [
  {
    slug: 'kak-kupit-kvartiru-bez-oshibok',
    title: 'Как купить квартиру без ошибок: полное руководство',
    shortDescription:
      'Системный алгоритм покупки квартиры: проверки, договор, расчёты, регистрация и действия после сделки. Центральная страница базы знаний.',
    metaTitle: 'Как купить квартиру без ошибок — полный гид 2026',
    metaDescription:
      'Как купить квартиру без ошибок: пошаговый алгоритм от поиска до регистрации права. Проверки, договор, расчёты, ипотека, маткапитал и FAQ.',
    ...CTA,
    relatedSlugs: [
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'kak-proverit-prodavca-kvartiry',
      'pokupka-kvartiry-poshagovo',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'kak-oformit-dogovor-kupli-prodazhi',
      'chto-delat-posle-pokupki-kvartiry'
    ],
    searchVolume: 5000
  },
  {
    slug: 'kak-proverit-prodavca-kvartiry',
    title: 'Как проверить продавца квартиры перед покупкой',
    shortDescription:
      'Пошаговая проверка продавца: паспорт, дееспособность, доверенность, банкротство, ФССП, суды, семейное положение, наследство.',
    metaTitle: 'Как проверить продавца квартиры — пошагово',
    metaDescription:
      'Как проверить продавца квартиры: паспорт, ФССП, банкротство, суды, согласие супруга, доверенность. Алгоритм, чек-лист и красные флаги.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-bankrotstvo-prodavca',
      'pokupka-kvartiry-po-doverennosti',
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'kak-proverit-obremeneniya-na-kvartiru',
      'pokupka-kvartiry-poshagovo'
    ],
    searchVolume: 2100
  },
  {
    slug: 'chto-proveryat-pered-pokupkoy-kvartiry',
    title: 'Что проверить перед покупкой квартиры',
    shortDescription:
      'Большой чек-лист из 25+ пунктов: продавец, объект, обременения, ЖКХ, расчёты и документы перед сделкой.',
    metaTitle: 'Что проверить перед покупкой квартиры — чек-лист',
    metaDescription:
      'Что проверить перед покупкой квартиры: 25+ пунктов чек-листа — продавец, ЕГРН, обременения, ЖКХ, перепланировка, расчёты и договор.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-prodavca-kvartiry',
      'kak-proverit-kvartiru-pered-pokupkoy',
      'kak-proverit-obremeneniya-na-kvartiru',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'kak-kupit-kvartiru-bez-oshibok'
    ],
    searchVolume: 1800
  },
  {
    slug: 'dokumenty-dlya-pokupki-kvartiry',
    title: 'Какие документы нужны для покупки квартиры в 2026 году',
    shortDescription:
      'Полный список документов для покупателя и продавца: вторичка, новостройка, ипотека, типичные ошибки.',
    metaTitle: 'Документы для покупки квартиры — список 2026',
    metaDescription:
      'Какие документы нужны для покупки квартиры: списки для покупателя и продавца, ипотека, новостройка, вторичка, типичные ошибки и FAQ.',
    ...CTA,
    relatedSlugs: [
      'kak-oformit-dogovor-kupli-prodazhi',
      'pokupka-kvartiry-poshagovo',
      'registraciya-prava-sobstvennosti',
      'pokupka-kvartiry-v-ipoteku-poshagovo',
      'chto-proveryat-pered-pokupkoy-kvartiry'
    ],
    searchVolume: 4416
  },
  {
    slug: 'pokupka-kvartiry-poshagovo',
    title: 'Покупка квартиры пошагово: инструкция от выбора объекта до регистрации',
    shortDescription: 'Пошаговая инструкция покупки квартиры: выбор, проверка, аванс, ДКП, расчёты, регистрация.',
    metaTitle: 'Покупка квартиры пошагово — инструкция 2026',
    metaDescription:
      'Покупка квартиры пошагово: выбор объекта, проверка, аванс, договор, расчёты, регистрация и передача. Подробная инструкция для самостоятельной сделки.',
    ...CTA,
    relatedSlugs: [
      'kak-kupit-kvartiru-bez-oshibok',
      'dokumenty-dlya-pokupki-kvartiry',
      'zadatok-ili-avans',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'registraciya-prava-sobstvennosti'
    ],
    searchVolume: 993
  },
  {
    slug: 'proverka-kvartiry-pered-pokupkoy',
    title: 'Проверка квартиры перед покупкой: полный чеклист',
    shortDescription:
      'Как проверить собственника, ЕГРН, долги, перепланировку, суды и банкротство перед покупкой.',
    metaTitle: 'Проверка квартиры перед покупкой — чеклист 2026',
    metaDescription:
      'Проверка квартиры перед покупкой: собственник, ЕГРН, долги, перепланировка, судебные споры, банкротство. Пошаговый чеклист для покупателя.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-kvartiru-pered-pokupkoy',
      'kak-proverit-prodavca-kvartiry',
      'kak-proverit-obremeneniya-na-kvartiru',
      'kak-bezopasno-kupit-kvartiru',
      'chto-proveryat-pered-pokupkoy-kvartiry'
    ],
    searchVolume: 1333
  },
  {
    slug: 'kak-proverit-kvartiru-pered-pokupkoy',
    title: 'Как проверить квартиру перед покупкой самостоятельно',
    shortDescription:
      'Пошаговая инструкция: выписка ЕГРН, осмотр, перепланировка, ЖКХ, прописанные и техническое состояние.',
    metaTitle: 'Как проверить квартиру перед покупкой — гид',
    metaDescription:
      'Как проверить квартиру перед покупкой самостоятельно: ЕГРН, осмотр, перепланировка, долги ЖКХ, прописанные. Пошаговый алгоритм и чек-лист.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-obremeneniya-na-kvartiru',
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'kak-proverit-prodavca-kvartiry',
      'proverka-kvartiry-pered-pokupkoy',
      'pokupka-kvartiry-poshagovo'
    ],
    searchVolume: 1500
  },
  {
    slug: 'kak-oformit-dogovor-kupli-prodazhi',
    title: 'Как оформить договор купли-продажи квартиры',
    shortDescription:
      'Из чего состоит ДКП, что обязательно проверить перед подписанием, типичные ошибки и шаблон условий.',
    metaTitle: 'Договор купли-продажи квартиры — как оформить',
    metaDescription:
      'Как оформить договор купли-продажи квартиры: обязательные условия, проверка перед подписанием, типичные ошибки, акт приёма-передачи.',
    ...CTA,
    relatedSlugs: [
      'zadatok-ili-avans',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'registraciya-prava-sobstvennosti',
      'dokumenty-dlya-pokupki-kvartiry',
      'pokupka-kvartiry-poshagovo'
    ],
    searchVolume: 1200
  },
  {
    slug: 'bezopasnye-raschety-pri-pokupke-kvartiry',
    title: 'Безопасные расчёты при покупке квартиры',
    shortDescription:
      'Аккредитив, банковская ячейка, эскроу, наличные: сравнение схем, риски и пошаговые инструкции.',
    metaTitle: 'Безопасные расчёты при покупке квартиры — гид',
    metaDescription:
      'Безопасные расчёты при покупке квартиры: аккредитив, эскроу, банковская ячейка, наличные. Сравнение схем, риски и пошаговый алгоритм.',
    ...CTA,
    relatedSlugs: [
      'zadatok-ili-avans',
      'kak-oformit-dogovor-kupli-prodazhi',
      'pokupka-kvartiry-v-ipoteku-poshagovo',
      'elektronnaya-registraciya-sdelki',
      'kak-bezopasno-kupit-kvartiru'
    ],
    searchVolume: 1100
  },
  {
    slug: 'pokupka-kvartiry-v-ipoteku-poshagovo',
    title: 'Покупка квартиры в ипотеку пошагово',
    shortDescription: 'Ипотечная сделка: одобрение, подбор, оценка, страхование, сделка, регистрация, передача.',
    metaTitle: 'Покупка квартиры в ипотеку пошагово — 2026',
    metaDescription:
      'Покупка квартиры в ипотеку пошагово: одобрение, подбор объекта, оценка, страхование, сделка, регистрация и передача квартиры.',
    ...CTA,
    relatedSlugs: [
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'dokumenty-dlya-pokupki-kvartiry',
      'pokupka-kvartiry-s-materinskim-kapitalom',
      'registraciya-prava-sobstvennosti',
      'kak-proverit-obremeneniya-na-kvartiru'
    ],
    searchVolume: 230
  },
  {
    slug: 'kak-bezopasno-kupit-kvartiru',
    title: 'Как безопасно купить квартиру: основные проверки и риски',
    shortDescription: 'Безопасная покупка квартиры: проверка продавца, документов, расчётов, схемы мошенничества.',
    metaTitle: 'Как безопасно купить квартиру — риски и проверки',
    metaDescription:
      'Как безопасно купить квартиру: проверка продавца, объекта, документов, расчётов. Типичные схемы мошенничества и чеклист безопасности.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-prodavca-kvartiry',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'kak-kupit-kvartiru-bez-rieltora',
      'pokupka-kvartiry-po-doverennosti'
    ],
    searchVolume: 863
  },
  {
    slug: 'chto-delat-posle-pokupki-kvartiry',
    title: 'Что делать после покупки квартиры',
    shortDescription:
      '20+ обязательных действий: ЖКХ, прописка, ипотека, страховка, налоговый вычет, маткапитал.',
    metaTitle: 'Что делать после покупки квартиры — чек-лист',
    metaDescription:
      'Что делать после покупки квартиры: 20+ обязательных шагов — ЖКХ, прописка, ипотека, страховка, налоговый вычет и выделение долей детям.',
    ...CTA,
    relatedSlugs: [
      'registraciya-prava-sobstvennosti',
      'pokupka-kvartiry-s-materinskim-kapitalom',
      'pokupka-kvartiry-v-ipoteku-poshagovo',
      'dokumenty-dlya-pokupki-kvartiry',
      'kak-kupit-kvartiru-bez-oshibok'
    ],
    searchVolume: 900
  },
  {
    slug: 'registraciya-prava-sobstvennosti',
    title: 'Регистрация права собственности на квартиру',
    shortDescription:
      'Что происходит после сделки, какие документы получает покупатель, сроки и порядок регистрации в Росреестре.',
    metaTitle: 'Регистрация права собственности — инструкция',
    metaDescription:
      'Регистрация права собственности на квартиру: порядок, сроки, документы покупателя, госпошлина, выписка ЕГРН и типичные ошибки.',
    ...CTA,
    relatedSlugs: [
      'elektronnaya-registraciya-sdelki',
      'kak-oformit-dogovor-kupli-prodazhi',
      'chto-delat-posle-pokupki-kvartiry',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'pokupka-kvartiry-poshagovo'
    ],
    searchVolume: 850
  },
  {
    slug: 'elektronnaya-registraciya-sdelki',
    title: 'Электронная регистрация сделки с недвижимостью',
    shortDescription:
      'Как проходит электронная регистрация: УКЭП, Госуслуги, банк, плюсы, минусы и пошаговая инструкция.',
    metaTitle: 'Электронная регистрация сделки — инструкция',
    metaDescription:
      'Электронная регистрация сделки с недвижимостью: как проходит, что потребуется, плюсы и минусы. Пошаговая инструкция через Госуслуги и банк.',
    ...CTA,
    relatedSlugs: [
      'registraciya-prava-sobstvennosti',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'kak-oformit-dogovor-kupli-prodazhi',
      'pokupka-kvartiry-v-ipoteku-poshagovo',
      'pokupka-kvartiry-poshagovo'
    ],
    searchVolume: 700
  },
  {
    slug: 'zadatok-ili-avans',
    title: 'Что выбрать: задаток или аванс при покупке квартиры',
    shortDescription:
      'Когда использовать задаток или аванс, когда нельзя, юридические различия и шаблоны условий.',
    metaTitle: 'Задаток или аванс при покупке квартиры — что выбрать',
    metaDescription:
      'Задаток или аванс при покупке квартиры: когда использовать, юридические различия, шаблоны условий, типичные ошибки и красные флаги.',
    ...CTA,
    relatedSlugs: [
      'kak-oformit-dogovor-kupli-prodazhi',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'pokupka-kvartiry-poshagovo',
      'kak-bezopasno-kupit-kvartiru',
      'chto-proveryat-pered-pokupkoy-kvartiry'
    ],
    searchVolume: 650
  },
  {
    slug: 'pokupka-kvartiry-s-materinskim-kapitalom',
    title: 'Покупка квартиры с материнским капиталом',
    shortDescription:
      'Все этапы, документы, выделение долей детям и распространённые ошибки при использовании маткапитала.',
    metaTitle: 'Покупка квартиры с материнским капиталом — гид',
    metaDescription:
      'Покупка квартиры с материнским капиталом: этапы, документы, выделение долей детям, вторичка и новостройка. Типичные ошибки и FAQ.',
    ...CTA,
    relatedSlugs: [
      'dokumenty-dlya-pokupki-kvartiry',
      'pokupka-kvartiry-v-ipoteku-poshagovo',
      'chto-delat-posle-pokupki-kvartiry',
      'registraciya-prava-sobstvennosti',
      'kak-oformit-dogovor-kupli-prodazhi'
    ],
    searchVolume: 600
  },
  {
    slug: 'alternativnaya-sdelka-s-nedvizhimostyu',
    title: 'Что такое альтернативная сделка с недвижимостью',
    shortDescription:
      'Механизм альтернативной сделки: плюсы, минусы, риски, синхронизация цепочки и пошаговый алгоритм.',
    metaTitle: 'Альтернативная сделка с недвижимостью — гид',
    metaDescription:
      'Альтернативная сделка с недвижимостью: как работает, плюсы и минусы, риски цепочки, документы и пошаговый алгоритм для покупателя.',
    ...CTA,
    relatedSlugs: [
      'pokupka-kvartiry-poshagovo',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'kak-oformit-dogovor-kupli-prodazhi',
      'zadatok-ili-avans',
      'kak-kupit-kvartiru-bez-oshibok'
    ],
    searchVolume: 550
  },
  {
    slug: 'pokupka-kvartiry-po-doverennosti',
    title: 'Покупка квартиры по доверенности: риски и проверка',
    shortDescription:
      'Риски сделки по доверенности, как проверить полномочия представителя и когда отказаться от покупки.',
    metaTitle: 'Покупка квартиры по доверенности — риски',
    metaDescription:
      'Покупка квартиры по доверенности: риски, проверка на reestr-dover.ru, обязательные полномочия и когда отказаться от сделки.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-prodavca-kvartiry',
      'kak-bezopasno-kupit-kvartiru',
      'kak-oformit-dogovor-kupli-prodazhi',
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'bezopasnye-raschety-pri-pokupke-kvartiry'
    ],
    searchVolume: 500
  },
  {
    slug: 'kak-proverit-obremeneniya-na-kvartiru',
    title: 'Как проверить обременения на квартиру',
    shortDescription:
      'Выписка ЕГРН, арест, ипотека, запрет регистрационных действий, рента — как проверить и снять.',
    metaTitle: 'Как проверить обременения на квартиру — гид',
    metaDescription:
      'Как проверить обременения на квартиру: ЕГРН, арест, ипотека, рента, запрет регистрации. Пошаговая инструкция и красные флаги.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-kvartiru-pered-pokupkoy',
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'kak-proverit-prodavca-kvartiry',
      'pokupka-kvartiry-v-ipoteku-poshagovo',
      'registraciya-prava-sobstvennosti'
    ],
    searchVolume: 480
  },
  {
    slug: 'kak-proverit-bankrotstvo-prodavca',
    title: 'Как проверить банкротство продавца',
    shortDescription:
      'Пошаговая проверка на Федресурсе и bankrot.fedresurs.ru, красные флаги и что делать при обнаружении.',
    metaTitle: 'Как проверить банкротство продавца — инструкция',
    metaDescription:
      'Как проверить банкротство продавца: пошаговая инструкция на Федресурсе, красные флаги, оспаривание сделок и что делать покупателю.',
    ...CTA,
    relatedSlugs: [
      'kak-proverit-prodavca-kvartiry',
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'kak-bezopasno-kupit-kvartiru',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'pokupka-kvartiry-poshagovo'
    ],
    searchVolume: 400
  },
  {
    slug: 'prodazha-kvartiry-poshagovo',
    title: 'Продажа квартиры пошагово: полный алгоритм сделки',
    shortDescription: 'Как продать квартиру: документы, поиск покупателя, проверка, подписание, расчёты, регистрация.',
    metaTitle: 'Продажа квартиры пошагово — алгоритм 2026',
    metaDescription:
      'Продажа квартиры пошагово: подготовка документов, поиск покупателя, проверка, подписание, расчёты, регистрация и передача объекта.',
    ...CTA,
    relatedSlugs: [
      'dokumenty-dlya-pokupki-kvartiry',
      'bezopasnye-raschety-pri-pokupke-kvartiry',
      'registraciya-prava-sobstvennosti',
      'alternativnaya-sdelka-s-nedvizhimostyu',
      'kak-oformit-dogovor-kupli-prodazhi'
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
    ...CTA,
    relatedSlugs: [
      'kak-kupit-kvartiru-bez-oshibok',
      'pokupka-kvartiry-poshagovo',
      'chto-proveryat-pered-pokupkoy-kvartiry',
      'kak-bezopasno-kupit-kvartiru',
      'dokumenty-dlya-pokupki-kvartiry'
    ],
    searchVolume: 704
  }
];

type GuideContentModule = {
  sections: GuideSection[];
  faq: GuideFaqItem[];
  lead?: string[];
  audience?: string[];
  nextSteps?: string[];
};

const CONTENT_MAP: Record<string, GuideContentModule> = {
  'dokumenty-dlya-pokupki-kvartiry': dokumenty,
  'proverka-kvartiry-pered-pokupkoy': proverka,
  'pokupka-kvartiry-poshagovo': pokupka,
  'prodazha-kvartiry-poshagovo': prodazha,
  'kak-kupit-kvartiru-bez-rieltora': bezRieltora,
  'kak-bezopasno-kupit-kvartiru': bezopasno,
  'pokupka-kvartiry-v-ipoteku-poshagovo': ipoteka,
  'kak-proverit-prodavca-kvartiry': proveritProdavca,
  'chto-proveryat-pered-pokupkoy-kvartiry': chtoProveryat,
  'kak-proverit-kvartiru-pered-pokupkoy': proveritKvartiru,
  'pokupka-kvartiry-po-doverennosti': poDoverennosti,
  'alternativnaya-sdelka-s-nedvizhimostyu': alternativnaya,
  'pokupka-kvartiry-s-materinskim-kapitalom': matkapital,
  'kak-proverit-obremeneniya-na-kvartiru': obremeneniya,
  'elektronnaya-registraciya-sdelki': elRegistraciya,
  'bezopasnye-raschety-pri-pokupke-kvartiry': bezopasnyeRaschety,
  'zadatok-ili-avans': zadatokAvans,
  'registraciya-prava-sobstvennosti': registraciyaPrava,
  'kak-proverit-bankrotstvo-prodavca': bankrotstvo,
  'chto-delat-posle-pokupki-kvartiry': poslePokupki,
  'kak-oformit-dogovor-kupli-prodazhi': dogovorKp,
  'kak-kupit-kvartiru-bez-oshibok': bezOshibok
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

  const fallbackLead = LEADS[slug] ?? meta.shortDescription;

  return {
    ...meta,
    lead: content.lead ?? [fallbackLead],
    audience: content.audience ?? [],
    sections: content.sections,
    faq: content.faq,
    nextSteps: content.nextSteps ?? [],
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
