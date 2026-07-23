import { Download, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwa: React.FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIos(/iphone|ipad|ipod/i.test(ua));
    setStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    );

    const dismissedKey = localStorage.getItem('tn-pwa-dismissed');
    if (dismissedKey) setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (standalone || dismissed) return null;

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setDismissed(true);
    localStorage.setItem('tn-pwa-dismissed', '1');
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem('tn-pwa-dismissed', '1');
  };

  if (deferred) {
    return (
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 max-w-lg mx-auto">
        <div className="bg-graphite text-white rounded-card px-4 py-3 shadow-card flex items-center gap-3">
          <Download className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium">Установить на устройство</p>
            <p className="text-xs text-white/70">Быстрый доступ с главного экрана</p>
          </div>
          <button
            type="button"
            onClick={() => void handleInstall()}
            className="text-xs font-medium bg-white text-graphite px-3 py-2 rounded-btn shrink-0"
          >
            Установить
          </button>
          <button type="button" onClick={dismiss} className="shrink-0 p-1" aria-label="Скрыть">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>
    );
  }

  if (isIos) {
    return (
      <div className="mx-4 mb-3 p-4 rounded-card shadow-soft bg-surface text-desc text-graphite-muted">
        <p className="font-medium text-graphite text-base mb-1">Установить на iPhone</p>
        <p>
          Safari → «Поделиться» → «На экран Домой». Приложение откроется как отдельная иконка.
        </p>
        <button type="button" onClick={dismiss} className="text-accent font-medium mt-2">
          Понятно
        </button>
      </div>
    );
  }

  return null;
};
