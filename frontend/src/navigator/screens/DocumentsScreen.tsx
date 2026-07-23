import { FileText, Lock } from 'lucide-react';
import React from 'react';
import { useAuthStore } from '../../auth/store';
import { DOCUMENT_LIBRARY } from '../data/documents';
import { filterDocumentsForGuest, GUEST_VISIBLE_DOCS_COUNT } from '../engine/guestAccess';
import { Header } from '../components/Header';
import { Card, EmptyState, FeatureRow, IconBox, PageShell, SectionTitle } from '../components/ui';
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
      <Header showMenu onMenu={() => setDrawerOpen(true)} title="Документы" />
      <div className="page-content pb-4">
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
              <Card className="mb-4 bg-accent-soft/40 border border-accent/15">
                <FeatureRow
                  icon={<Lock className="w-5 h-5 text-accent mt-0.5" />}
                  title={
                    <span className="text-body font-medium text-graphite text-safe">
                      Показаны {GUEST_VISIBLE_DOCS_COUNT} из {allDocs.length} документов
                    </span>
                  }
                  description={
                    <>
                      <span className="text-safe">Полный список и шаблоны — после входа.</span>
                      <button
                        type="button"
                        onClick={() => openAuthModal('/app/deal')}
                        className="mt-2 text-body font-semibold text-accent block"
                      >
                        Войти
                      </button>
                    </>
                  }
                />
              </Card>
            )}
            <div className="space-y-2">
              {docs.map((doc) => (
                <Card key={doc.id}>
                  <FeatureRow
                    icon={
                      <IconBox size="sm">
                        <FileText className="w-5 h-5 text-accent" />
                      </IconBox>
                    }
                    title={<span className="font-semibold text-body text-graphite text-safe">{doc.title}</span>}
                    description={
                      <>
                        <span className="text-small text-accent font-medium block text-safe">{doc.type}</span>
                        <span className="text-small mt-2 leading-relaxed block text-safe">{doc.description}</span>
                        <span className="inline-block mt-2 text-[10px] text-graphite-muted bg-surface px-2 py-0.5 rounded-full">
                          Образец · скоро PDF
                        </span>
                      </>
                    }
                  />
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};
