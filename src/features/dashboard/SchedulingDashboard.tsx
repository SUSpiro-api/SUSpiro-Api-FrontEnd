// Mostra a lista de guias que precisam ser agendadas.

import { MaterialIcon } from '../../components/icons';
import { formatCpf } from '../../utils/cpf';
import { formatIsoDate, guidePriorityLabels, guideTypeLabels, guideDetail } from './guideLabels';
import { todayIsoDate } from './date';
import { GuideScheduleModal } from './GuideScheduleModal';
import { StatCard } from './StatCard';
import { useGuideQueue } from './hooks/useGuideQueue';
import './DashboardPage.css';

export function SchedulingDashboard() {
  const queue = useGuideQueue();

  return (
    <div id="fila-de-guias" className="page dashboard-page">
      <header id="dashboard-top" className="page__header dashboard-page__header">
        <div>
          <h1 className="page__title">Fila de guias</h1>
          <p className="page__description">
            Guias geradas pelos médicos ficam aqui até que a recepção ou a enfermagem defina o atendimento.
          </p>
        </div>
        <div className="dashboard-header__actions">
          <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => void queue.loadGuides()} disabled={queue.loading || queue.refreshing}>
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

      <section className="guide-queue-stats" aria-label="Resumo da fila">
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
      </section>

      <section className="dashboard-card guide-queue-card" aria-labelledby="guide-queue-title">
        <header className="dashboard-card__header">
          <div>
            <h2 id="guide-queue-title" className="dashboard-card__title">Guias aguardando agendamento</h2>
            <p className="dashboard-card__subtitle">
              {queue.lastUpdated ? `Última atualização às ${queue.lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.` : 'Carregando a fila.'}
            </p>
          </div>
        </header>

        <div className="guide-queue-filters">
          <div className="ui-field guide-queue-filters__search">
            <label className="ui-field__label" htmlFor="guide-search">Pesquisar na fila</label>
            <div className="ui-field__control">
              <span className="ui-field__icon ui-field__icon--start" aria-hidden="true"><MaterialIcon name="search" size={20} /></span>
              <input
                id="guide-search"
                className="ui-field__input ui-field__input--with-start-icon"
                placeholder="Nome, CPF ou solicitação"
                value={queue.search}
                onChange={(event) => queue.setSearch(event.target.value)}
              />
            </div>
          </div>
          <div className="ui-field">
            <label className="ui-field__label" htmlFor="guide-priority">Prioridade</label>
            <select id="guide-priority" className="ui-field__input ui-field__select" value={queue.priority} onChange={(event) => queue.setPriority(event.target.value as typeof queue.priority)}>
              <option value="todas">Todas</option>
              <option value="URGENTE">Urgente</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>
        </div>

        {queue.loading ? (
          <ul className="guide-queue-skeleton" role="status" aria-label="Carregando guias">
            {[0, 1, 2].map((row) => (
              <li key={row}>
                <span className="guide-queue-skeleton__block" aria-hidden="true" />
                <span className="guide-queue-skeleton__lines" aria-hidden="true">
                  <span className="guide-queue-skeleton__line guide-queue-skeleton__line--lg" />
                  <span className="guide-queue-skeleton__line guide-queue-skeleton__line--sm" />
                </span>
                <span className="guide-queue-skeleton__block guide-queue-skeleton__block--action" aria-hidden="true" />
              </li>
            ))}
          </ul>
        ) : queue.error ? (
          <div className="guide-queue-error" role="alert">
            <p className="guide-queue-error__message">
              <MaterialIcon name="error" size={20} aria-hidden="true" />
              {queue.error}
            </p>
            <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => void queue.loadGuides()}>Tentar novamente</button>
          </div>
        ) : queue.visibleGuides.length > 0 ? (
          <ul className="guide-queue-list">
            {queue.visibleGuides.map((guide) => {
              const detail = guideDetail(guide);
              return (
                <li key={guide.id} className="guide-queue-item">
                  <div className="guide-queue-item__icon" aria-hidden="true">
                    <MaterialIcon name={guide.tipo === 'EXAME' ? 'science' : guide.tipo === 'ENCAMINHAMENTO' ? 'description' : guide.tipo === 'RETORNO' ? 'medical_services' : 'calendar'} size={20} />
                  </div>
                  <div className="guide-queue-item__content">
                    <div className="guide-queue-item__title-row">
                      <strong title={guide.pacienteNome}>{guide.pacienteNome}</strong>
                      <span className={`appointment__status appointment__status--${guide.prioridade === 'URGENTE' ? 'urgente' : 'normal'}`}>
                        {guidePriorityLabels[guide.prioridade]}
                      </span>
                    </div>
                    <span title={`${formatCpf(guide.pacienteCpf)} · ${guideTypeLabels[guide.tipo]} · ${detail}`}>
                      {formatCpf(guide.pacienteCpf)} · {guideTypeLabels[guide.tipo]} · {detail}
                    </span>
                    <small>Data solicitada: {formatIsoDate(guide.dataSolicitada)} · Solicitada por {guide.solicitanteNome}</small>
                    {guide.observacao && (
                      <small className="guide-queue-item__obs" title={guide.observacao}>{guide.observacao}</small>
                    )}
                  </div>
                  <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => queue.setSelectedGuide(guide)}>
                    <MaterialIcon name="event_available" size={17} />
                    Agendar
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="dashboard-empty guide-queue-empty">
            <span className="guide-queue-empty__icon" aria-hidden="true"><MaterialIcon name="task_alt" size={28} /></span>
            <p>{queue.guides.length > 0 ? 'Nenhuma guia corresponde aos filtros selecionados.' : 'Nenhuma guia aguardando agendamento.'}</p>
            <span>Novas guias geradas pelos médicos aparecerão automaticamente nesta fila.</span>
          </div>
        )}
      </section>

      <GuideScheduleModal
        guide={queue.selectedGuide}
        onClose={() => queue.setSelectedGuide(null)}
        onScheduled={queue.handleScheduled}
      />
    </div>
  );
}
