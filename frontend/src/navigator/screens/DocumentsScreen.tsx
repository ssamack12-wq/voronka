import { FileText, Lock } from 'lucide-react';
import React from 'react';
import { useAuthStore } from '../../auth/store';
import { DOCUMENT_LIBRARY } from '../data/documents';
import { filterDocumentsForGuest, GUEST_VISIBLE_DOCS_COUNT } from '../engine/guestAccess';
import { Header } from '../components/Header';
import { Card, EmptyState, PageShell, SectionTitle } from '../components/ui';
import { useNavigator } from '../store/NavigatorContext';

export const DocumentsScreen: React.FC = () => {
  const { user, openAuthModal } = useAuthStore();
  const { deal, setDrawerOpen } = useNavigator();

  const allDocs = deal
    ? DOCUMENT_LIBRARY.filter(
        (d) =>
          d.scenarioTags.includes(deal.scenario.category) ||
          d.scenarioTags.includes('buy') ||
          d.scenarioTags.includes('sell')
      )
    : [];

  const docs = filterDocumentsForGuest(allDocs, user);
  const hiddenCount = allDocs.length - docs.length;

  return (
    <PageShell noPadding className="overflow-y-auto">
      <Header logo showMenu onMenu={() => setDrawerOpen(true)} title="Документы" />
      <div className="px-4 pb-4">
        {!deal ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="Нет документов"
            description="Добавьте документы сделки, чтобы отслеживать прогресс. Начните с выбора сценария."
          />
        ) : (
          <>
            <SectionTitle sub="Образцы и чеклист документов по сделке">
              Ваши документы
            </SectionTitle>
            {!user && hiddenCount > 0 && (
              <Card className="p-4 mb-4 bg-accent-soft/40 border-accent/15">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-graphite">
                      Показаны {GUEST_VISIBLE_DOCS_COUNT} из {allDocs.length} документов
                    </p>
                    <p className="text-xs text-graphite-muted mt-1">
                      Полный список и шаблоны — после входа.
                    </p>
                    <button
                      type="button"
                      onClick={() => openAuthModal('/app/deal')}
                      className="mt-2 text-sm font-semibold text-accent"
                    >
                      Войти
                    </button>
                  </div>
                </div>
              </Card>
            )}
            <div className="space-y-2">
              {docs.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="icon-box icon-box--sm">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-graphite text-sm">{doc.title}</p>
                      <p className="text-xs text-accent font-medium mt-0.5">{doc.type}</p>
                      <p className="text-xs text-graphite-muted mt-2 leading-relaxed">
                        {doc.description}
                      </p>
                      <span className="inline-block mt-2 text-[10px] text-graphite-muted bg-surface px-2 py-0.5 rounded-full">
                        Образец · скоро PDF
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};
