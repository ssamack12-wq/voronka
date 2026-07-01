export const allowedDomains = [
  'yandex.ru',
  'ya.ru',
  'mail.ru',
  'bk.ru',
  'inbox.ru',
  'list.ru',
  'vk.com',
  'internet.ru'
];

export function getEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf('@');
  if (at < 1) return null;
  return normalized.slice(at + 1);
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isAllowedEmailDomain(email: string): boolean {
  const domain = getEmailDomain(email);
  return domain !== null && allowedDomains.includes(domain);
}

export const DOMAIN_RESTRICTION_ERROR =
  'Для доступа к сервису используйте российскую электронную почту.\n\nПоддерживаются:\n• Яндекс Почта\n• Mail.ru\n• VK Почта\n\nЭто связано с требованиями российского законодательства.';

export const EMAIL_INFO_HINT =
  'Рекомендуем использовать российские почтовые сервисы:\n• Яндекс Почта\n• Mail.ru\n• VK Почта\n\nАвторизация выполняется по Magic Link без пароля.';
