import { ExternalLink, Mail } from 'lucide-react';
import React from 'react';

const MAIL_APPS = [
  { id: 'yandex', label: 'Яндекс Почта', url: 'https://mail.yandex.ru' },
  { id: 'mailru', label: 'Mail.ru', url: 'https://e.mail.ru/inbox/' },
  { id: 'vk', label: 'VK Почта', url: 'https://vk.com/mail' }
] as const;

interface OpenEmailAppsProps {
  email?: string;
  className?: string;
}

export const OpenEmailApps: React.FC<OpenEmailAppsProps> = ({ email, className = '' }) => {
  const open = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs font-semibold text-graphite-muted uppercase tracking-wide">
        Открыть почту
      </p>
      <div className="grid grid-cols-2 gap-2">
        {MAIL_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => open(app.url)}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-btn border border-black/[0.06] text-desc font-medium text-graphite hover:border-accent/40 hover:bg-accent-soft/30 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-accent" />
            {app.label}
          </button>
        ))}
      </div>
      {email && (
        <a
          href={`mailto:${encodeURIComponent(email)}`}
          className="flex items-center justify-center gap-2 w-full btn-secondary !min-h-[44px]"
        >
          <Mail className="w-4 h-4" />
          Открыть почтовое приложение
        </a>
      )}
    </div>
  );
};
