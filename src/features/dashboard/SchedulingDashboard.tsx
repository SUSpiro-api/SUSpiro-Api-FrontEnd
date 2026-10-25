// Mostra a central onde a recepção agenda as guias geradas pelos médicos e enfermeiros.

import { MaterialIcon } from '../../components/icons';
import { formatIsoDate } from './guideLabels';
import { todayIsoDate } from './date';
import { GuideScheduleModal } from './GuideScheduleModal';
import { StatCard } from './StatCard';
import { useGuideQueue } from './hooks/useGuideQueue';
import { GuideQueueFilters } from './components/GuideQueueFilters';
import { GuideQueueResults } from './components/GuideQueueResults';
import './DashboardPage.css';

interface SchedulingDashboardProps {
  onNavigate: (path: string) => void;
  canRegisterPatient: boolean;
}

export function SchedulingDashboard({ onNavigate, canRegisterPatient }: SchedulingDashboardProps) {
  const queue = useGuideQueue();

  return (
    <div id="central-de-agendamento" className="page dashboard-page">
      <header id="dashboard-top" className="page__header dashboard-page__header">
        <div>
          <h1 className="page__title">Central de agendamento</h1>
          <p className="page__description">
            Guias geradas pelos médicos esperam data e horário. Agende cada solicitação para confirmar
            o atendimento ao paciente.
          </p>
        </div>
        <div className="dashboard-header__actions">
          {canRegisterPatient && (
            <button
              type="button"
              className="dashboard-button dashboard-button--primary"
              onClick={() => onNavigate('/cadastro-cidadao')}
            >
              <MaterialIcon name="person_add" size={17} />
              Cadastrar paciente
            </button>
          )}
          <button
            type="button"
            className="dashboard-button dashboard-button--secondary"
            onClick={() => void queue.loadGuides()}
            disabled={queue.loading || queue.refreshing}
          >
            <span className={queue.loading || queue.refreshing ? 'dashboard-button__icon--spin' : undefined} aria-hidden="true">
              <MaterialIcon name="refresh" size={17} />
            </span>
            Atualizar fila
          </button>
        </div>
      </header>

      {queue.notice && (
        <p className={`guide-queue-notice guide-queue-notice--${queue.notice.tone}`} role="status">
          <MaterialIcon name={queue.notice.tone === 'success' ? 'check_circle' : 'pending_actions'} size={18} aria-hidden="true" />
          {queue.notice.text}
        </p>
      )}

      <section className="guide-queue-stats" aria-label="Resumo das guias">
        <StatCard
          label="Guias aguardando"
          value={queue.guides.length}
          meta="Aguardando definição de data e horário."
          icon="pending_actions"
          tone="action"
        />
        <StatCard
          label="Prioridade urgente"
          value={queue.urgentCount}
          meta="Guias para encaixar primeiro."
          icon="priority_high"
          tone="danger"
        />
        <StatCard
          label="Para hoje"
          value={queue.todayCount}
          meta={`Data solicitada para ${formatIsoDate(todayIsoDate())}.`}
          icon="today"
          tone="warning"
        />
        <StatCard
          label="Exames pendentes"
          value={queue.guides.filter((guide) => guide.tipo === 'EXAME').length}
          meta="Solicitações de exame nesta fila."
          icon="science"
        />
      </section>

      <section className="dashboard-card guide-queue-card" aria-labelledby="guide-queue-title">
        <header className="dashboard-card__header">
          <div>
            <h2 id="guide-queue-title" className="dashboard-card__title">Guias aguardando agendamento</h2>
            <p className="dashboard-card__subtitle">
              {queue.lastUpdated
                ? `Atualizada às ${queue.lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`
                : 'Carregando a fila.'}
            </p>
          </div>
        </header>

        <GuideQueueFilters
          search={queue.search}
          priority={queue.priority}
          type={queue.type}
          sortOrder={queue.sortOrder}
          visibleCount={queue.visibleGuides.length}
          totalGuides={queue.guides.length}
          onSearchChange={queue.setSearch}
          onPriorityChange={queue.setPriority}
          onTypeChange={queue.setType}
          onSortOrderChange={queue.setSortOrder}
          onClear={() => { queue.setSearch(''); queue.setPriority('todas'); queue.setType('todas'); queue.setSortOrder('prioridade'); }}
        />

        <GuideQueueResults
          loading={queue.loading}
          error={queue.error}
          totalGuides={queue.guides.length}
          guides={queue.visibleGuides}
          onRetry={() => void queue.loadGuides()}
          onSchedule={queue.setSelectedGuide}
        />
      </section>

      <GuideScheduleModal
        guide={queue.selectedGuide}
        onClose={() => queue.setSelectedGuide(null)}
        onScheduled={queue.handleScheduled}
      />
    </div>
  );
}
