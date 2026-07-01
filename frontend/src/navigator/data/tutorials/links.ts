export interface OfficialLink {
  label: string;
  url: string;
}

export const LINKS = {
  gosuslugi: { label: 'Госуслуги', url: 'https://www.gosuslugi.ru' },
  rosreestr: { label: 'Росреестр', url: 'https://rosreestr.gov.ru' },
  rosreestrEgrn: { label: 'Выписка ЕГРН', url: 'https://rosreestr.gov.ru/wps/portal/online_request' },
  mfc: { label: 'МФЦ', url: 'https://моидокументы.рф' },
  fns: { label: 'ФНС России', url: 'https://www.nalog.gov.ru' },
  fnsDeduction: { label: 'Налоговый вычет', url: 'https://www.nalog.gov.ru/rn77/fl/interest/tax_deduction/' },
  fedresurs: { label: 'Проверка банкротств', url: 'https://fedresurs.ru' },
  kadArbitr: { label: 'Судебные дела', url: 'https://kad.arbitr.ru' },
  sudrf: { label: 'ГАС «Правосудие»', url: 'https://sudrf.ru' },
  notariat: { label: 'Реестр нотариусов', url: 'https://notariat.ru' },
  sfr: { label: 'СФР (маткапитал)', url: 'https://sfr.gov.ru' },
  domclick: { label: 'Домклик', url: 'https://domclick.ru' },
  banki: { label: 'Banki.ru', url: 'https://www.banki.ru' },
  cbr: { label: 'Банк России', url: 'https://www.cbr.ru' },
  domrf: { label: 'ДОМ.РФ', url: 'https://дом.рф' },
  reestrDover: { label: 'Реестр доверенностей', url: 'https://reestr-dover.ru' },
  opendata: { label: 'Реестр обременений', url: 'https://rosreestr.gov.ru' },
  fssp: { label: 'ФССП — поиск должников', url: 'https://fssp.gov.ru/iss/ip/' },
  efrsb: { label: 'ЕФРСБ — банкротства', url: 'https://bankrot.fedresurs.ru/' },
  mvdPassport: { label: 'Проверка паспорта (МВД)', url: 'https://мвд.рф/request_main' }
} as const satisfies Record<string, OfficialLink>;

export const LINK_SETS = {
  egrn: [LINKS.rosreestrEgrn, LINKS.gosuslugi, LINKS.rosreestr],
  mortgage: [LINKS.gosuslugi, LINKS.domclick, LINKS.cbr],
  payments: [LINKS.domclick, LINKS.cbr, LINKS.rosreestr],
  registration: [LINKS.rosreestr, LINKS.mfc, LINKS.gosuslugi],
  legal: [LINKS.fedresurs, LINKS.efrsb, LINKS.fssp, LINKS.kadArbitr, LINKS.sudrf],
  sellerCheck: [LINKS.fssp, LINKS.efrsb, LINKS.sudrf, LINKS.kadArbitr, LINKS.mvdPassport],
  notary: [LINKS.notariat, LINKS.gosuslugi],
  matcapital: [LINKS.sfr, LINKS.gosuslugi, LINKS.fns],
  tax: [LINKS.fns, LINKS.fnsDeduction, LINKS.gosuslugi],
  general: [LINKS.gosuslugi, LINKS.rosreestr, LINKS.mfc, LINKS.banki],
  poa: [LINKS.reestrDover, LINKS.notariat, LINKS.fedresurs]
} as const;

type LinkGroup = OfficialLink[] | OfficialLink;

export function mergeLinks(...groups: LinkGroup[]): OfficialLink[] {
  const seen = new Set<string>();
  const out: OfficialLink[] = [];
  for (const group of groups) {
    const items = Array.isArray(group) ? group : [group];
    for (const link of items) {
      if (seen.has(link.url)) continue;
      seen.add(link.url);
      out.push(link);
    }
  }
  return out;
}
