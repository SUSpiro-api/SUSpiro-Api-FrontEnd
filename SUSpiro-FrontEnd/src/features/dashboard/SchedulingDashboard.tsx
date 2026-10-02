import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../core/api/httpClient';
import { MaterialIcon } from '../../components/icons';
import type { AuthUser } from '../auth/types';
import { todayIsoDate } from './date';
import { formatIsoDate, guidePriorityLabels, guideStatusLabels, guideTypeLabels, specialtyLabels } from './guideLabels';
import { GuideScheduleModal } from './GuideScheduleModal';
import { listPendingGuides, type Guide } from '../guides';
import './DashboardPage.css';

interface SchedulingDashboardProps {
  user: AuthUser | null;
}

function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11);
  return digits.length === 11
    ? `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
    : cpf;
}

function guideDetail(guide: Guide): string {
  if (guide.tipo === 'CONSULTA' && guide.especialidade) return specialtyLabels[guide.especialidade];
  return guide.detalhe ?? guideTypeLabels[guide.tipo];
}

export function SchedulingDashboard({ user }: SchedulingDashboardProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<'todas' | 'URGENTE' | 'NORMAL'>('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadGuides = useCallback(async () => {
    setError('');
    try {
      const response = await listPendingGuides();
      setGuides(response);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : 'Não foi possível carregar a fila de guias.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGuides();
    const interval = window.setInterval(() => void loadGuides(), 15000);
    return () => window.clearInterval(interval);
  }, [loadGuides]);

  const visibleGuides = useMemo(() => {
    const term = search.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchesPriority = priority === 'todas' || guide.prioridade === priority;
      const matchesSearch = !term
        || guide.pacienteNome.toLowerCase().includes(term)
        || guide.pacienteCpf.includes(term.replace(/\D/g, ''))
        || guideDetail(guide).toLowerCase().includes(term);
      return matchesPriority && matchesSearch;
    });
  }, [guides, priority, search]);

  const handleScheduled = (scheduled: Guide) => {
    setGuides((current) => current.filter((guide) => guide.id !== scheduled.id));
  };

  const urgentCount = guides.filter((guide) => guide.prioridade === 'URGENTE').length;
  const todayCount = guides.filter((guide) => guide.dataSolicitada === todayIsoDate()).length;

  return (
    <div className="page dashboard-page">
      <header id="dashboard-top" className="page__header dashboard-page__header">
        <div>
          <p className="dashboard-eyebrow">
            <MaterialIcon name="assignment" size={16} />
            Central de agendamento
          </p>
          <h1 className="page__title">Fila de guias</h1>
          <p className="page__description">
            Guias geradas pelos médicos ficam aqui até que a recepção ou a enfermagem defina o atendimento.
          </p>
        </div>
        <div className="dashboard-header__actions">
          <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => void loadGuides()} disabled={loading}>
            <MaterialIcon name="refresh" size={17} />
            Atualizar fila
          </button>
        </div>
      </header>

      <section className="guide-queue-stats" aria-label="Resumo da fila">
        <article className="dashboard-stat dashboard-stat--action">
          <div className="dashboard-stat__header"><span className="dashboard-stat__icon"><MaterialIcon name="pending_actions" size={20} /></span></div>
          <p className="dashboard-stat__value">{guides.length}</p>
          <p className="dashboard-stat__label">Guias aguardando</p>
          <p className="dashboard-stat__meta">Solicitações ainda sem agendamento.</p>
        </article>
        <article className="dashboard-stat dashboard-stat--danger">
          <div className="dashboard-stat__header"><span className="dashboard-stat__icon"><MaterialIcon name="priority_high" size={20} /></span></div>
          <p className="dashboard-stat__value">{urgentCount}</p>
          <p className="dashboard-stat__label">Prioridade urgente</p>
          <p className="dashboard-stat__meta">Devem ser avaliadas com atenção.</p>
        </article>
        <article className="dashboard-stat dashboard-stat--warning">
          <div className="dashboard-stat__header"><span className="dashboard-stat__icon"><MaterialIcon name="today" size={20} /></span></div>
          <p className="dashboard-stat__value">{todayCount}</p>
          <p className="dashboard-stat__label">Para hoje</p>
          <p className="dashboard-stat__meta">Data solicitada para {formatIsoDate(todayIsoDate())}.</p>
        </article>
      </section>

      <section className="dashboard-card guide-queue-card" aria-labelledby="guide-queue-title">
        <header className="dashboard-card__header">
          <div>
            <h2 id="guide-queue-title" className="dashboard-card__title">Guias aguardando agendamento</h2>
            <p className="dashboard-card__subtitle">
              {lastUpdated ? `Última atualização às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.` : 'Carregando a fila.'}
            </p>
          </div>
        </header>

        <div className="guide-queue-filters">
          <div className="ui-field guide-queue-filters__search">
            <label className="ui-field__label" htmlFor="guide-search">Pesquisar paciente</label>
            <input
              id="guide-search"
              className="ui-field__input"
              placeholder="Nome, CPF ou solicitação"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="ui-field">
            <label className="ui-field__label" htmlFor="guide-priority">Prioridade</label>
            <select id="guide-priority" className="ui-field__input ui-field__select" value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)}>
              <option value="todas">Todas</option>
              <option value="URGENTE">Urgente</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="dashboard-empty">Carregando guias...</p>
        ) : error ? (
          <div className="guide-queue-error" role="alert">
            <p>{error}</p>
            <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => void loadGuides()}>Tentar novamente</button>
          </div>
        ) : visibleGuides.length > 0 ? (
          <ul className="guide-queue-list">
            {visibleGuides.map((guide) => (
              <li key={guide.id} className="guide-queue-item">
                <div className="guide-queue-item__icon" aria-hidden="true">
                  <MaterialIcon name={guide.tipo === 'EXAME' ? 'science' : guide.tipo === 'ENCAMINHAMENTO' ? 'description' : guide.tipo === 'RETORNO' ? 'medical_services' : 'calendar'} size={20} />
                </div>
                <div className="guide-queue-item__content">
                  <div className="guide-queue-item__title-row">
                    <strong>{guide.pacienteNome}</strong>
                    <span className={`appointment__status appointment__status--${guide.prioridade === 'URGENTE' ? 'cancelado' : 'pendente'}`}>
                      {guidePriorityLabels[guide.prioridade]}
                    </span>
                  </div>
                  <span>{formatCpf(guide.pacienteCpf)} · {guideTypeLabels[guide.tipo]} · {guideDetail(guide)}</span>
                  <small>Data solicitada: {formatIsoDate(guide.dataSolicitada)} · Solicitada por {guide.solicitanteNome} · {guideStatusLabels[guide.status]}</small>
                  {guide.observacao && <small>{guide.observacao}</small>}
                </div>
                <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => setSelectedGuide(guide)}>
                  <MaterialIcon name="event_available" size={17} />
                  Agendar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="dashboard-empty guide-queue-empty">
            <span className="guide-queue-empty__icon" aria-hidden="true"><MaterialIcon name="task_alt" size={28} /></span>
            <p>{guides.length > 0 ? 'Nenhuma guia corresponde aos filtros selecionados.' : 'Nenhuma guia aguardando agendamento.'}</p>
            <span>Novas guias geradas pelos médicos aparecerão automaticamente nesta fila.</span>
          </div>
        )}
      </section>

      <GuideScheduleModal
        guide={selectedGuide}
        onClose={() => setSelectedGuide(null)}
        onScheduled={handleScheduled}
      />
    </div>
  );
}
