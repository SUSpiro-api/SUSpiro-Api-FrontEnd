// Painel "Minha saúde": o paciente vê a situação das próprias consultas, exames,
// retornos e encaminhamentos.

import { useMemo, useState } from 'react';
import { MaterialIcon } from '../../components/icons';
import type { AuthUser } from '../auth/types';
import { formatIsoDate } from '../dashboard/guideLabels';
import { usePatientCare } from './hooks/usePatientCare';
import { careDisplayTitle, careReferenceLabel, careStatusLabels, careTypeIcons, type CareItem } from './data';
import { CareDetailsModal } from './components/CareDetailsModal';
import { CareHero } from './components/CareHero';
import { CareTypeStats } from './components/CareTypeStats';
import { findNextScheduled, summarizeByType } from './careSummary';
import '../../components/layout/layout.css';
import '../dashboard/DashboardPage.css';
import './patient-area.css';

interface MinhaSaudePageProps {
  user: AuthUser;
  /** true quando um admin está pré-visualizando a área para testá-la. */
  preview?: boolean;
}

function itemMeta(item: CareItem): string {
  const date = formatIsoDate(item.date);
  if (item.status === 'pendente') {
    return `Desejada para ${date}`;
  }
  const time = item.time ? ` às ${item.time.slice(0, 5)}` : '';
  const professional = item.professional ? ` · ${item.professional}` : '';
  return `${date}${time}${professional}`;
}

function compareByDate(direction: 1 | -1) {
  return (first: CareItem, second: CareItem) => direction * first.date.localeCompare(second.date);
}

export function MinhaSaudePage({ user, preview = false }: MinhaSaudePageProps) {
  const { items, fromServer, demoPreview, loading } = usePatientCare(user.sub, preview);
  const [selected, setSelected] = useState<CareItem | null>(null);

  const sections = useMemo(() => {
    const agendados = items.filter((item) => item.status === 'agendado').sort(compareByDate(1));
    const pendentes = items.filter((item) => item.status === 'pendente').sort(compareByDate(1));
    const historico = items
      .filter((item) => item.status === 'realizado' || item.status === 'cancelado' || item.status === 'vencido')
      .sort(compareByDate(-1));
    return { agendados, pendentes, historico };
  }, [items]);

  const summary = useMemo(() => summarizeByType(items), [items]);
  const nextCare = useMemo(() => findNextScheduled(items), [items]);

  const greeting = user.nome ? `Olá, ${user.nome}. ` : '';

  return (
    <div id="minha-saude" className="page patient-page">
      <CareHero
        greeting={greeting}
        loading={loading}
        next={nextCare}
        waiting={sections.pendentes.length}
        onSelect={setSelected}
      />

      {!fromServer && (
        <p className="patient-notice" role="status">
          <MaterialIcon name="warning" size={18} aria-hidden="true" />
          Não foi possível consultar seus atendimentos com segurança. Tente novamente mais tarde; nenhum dado local será exibido.
        </p>
      )}

      {demoPreview && (
        <p className="patient-notice patient-notice--info" role="status">
          <MaterialIcon name="info" size={18} aria-hidden="true" />
          Pré-visualização da área do paciente com uma jornada de demonstração — as guias reais
          deste CPF aparecem aqui assim que existirem.
        </p>
      )}

      {loading ? (
        <CareSkeleton />
      ) : (
        <>
          <CareTypeStats summary={summary} />

          {items.length === 0 ? (
            <section className="patient-empty" aria-label="Nenhum atendimento">
              <span className="patient-empty__icon" aria-hidden="true">
                <MaterialIcon name="medical_services" size={28} />
              </span>
              <h2 className="patient-empty__title">Tudo calmo por aqui</h2>
              <p className="patient-empty__text">
                Quando a clínica registrar consultas, exames ou encaminhamentos para você, eles aparecem
                nesta tela com a data e a situação de cada um.
              </p>
            </section>
          ) : (
            <>
              <CareSection
                title="Próximos atendimentos"
                subtitle="Estes já têm data e horário. Chegue com alguns minutos de antecedência."
                items={sections.agendados}
                emptyText="Nenhum atendimento agendado no momento."
                onSelect={setSelected}
              />
              <CareSection
                title="Aguardando agendamento"
                subtitle="Assim que a recepção definir data e horário, eles passam para a lista de próximos."
                items={sections.pendentes}
                emptyText="Nenhuma guia aguardando agendamento."
                onSelect={setSelected}
              />
              <CareSection
                title="Histórico"
                subtitle="Atendimentos que já aconteceram."
                items={sections.historico}
                emptyText="Seus atendimentos anteriores aparecem aqui."
                onSelect={setSelected}
              />
            </>
          )}

        </>
      )}

      <CareDetailsModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

interface CareSectionProps {
  title: string;
  subtitle: string;
  items: CareItem[];
  emptyText: string;
  onSelect: (item: CareItem) => void;
}

function CareSection({ title, subtitle, items, emptyText, onSelect }: CareSectionProps) {
  return (
    <section className="dashboard-card patient-card" aria-labelledby={`care-${title.replace(/\s+/g, '-')}`}>
      <header className="dashboard-card__header">
        <div>
          <h2 id={`care-${title.replace(/\s+/g, '-')}`} className="dashboard-card__title">{title}</h2>
          <p className="dashboard-card__subtitle">{subtitle}</p>
        </div>
        {items.length > 0 && (
          <span className="patient-card__count" aria-hidden="true">{items.length}</span>
        )}
      </header>

      {items.length === 0 ? (
        <p className="dashboard-empty">{emptyText}</p>
      ) : (
        <ul className="appointment-list">
          {items.map((item) => (
            <CareRow key={item.id} item={item} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CareRow({ item, onSelect }: { item: CareItem; onSelect: (item: CareItem) => void }) {
  // Na seção "aguardando", o que o paciente precisa ver é a urgência.
  const chipClass = item.urgent && item.status === 'pendente'
    ? 'appointment__status--urgente'
    : `appointment__status--${item.status}`;
  const chipLabel = item.urgent && item.status === 'pendente' ? 'Urgente' : careStatusLabels[item.status];

  return (
    <li className="appointment">
      <button
        type="button"
        className="appointment__row"
        onClick={() => onSelect(item)}
        aria-haspopup="dialog"
        title="Ver detalhes"
      >
        <span className={`appointment__type appointment__type--${item.type}`} aria-hidden="true">
          <MaterialIcon name={careTypeIcons[item.type]} size={22} />
        </span>
        <span className="appointment__info">
          <strong className="appointment__heading">{careDisplayTitle(item)}</strong>
          <span className="appointment__meta">
            <span className="appointment__code">{careReferenceLabel(item)}</span>
            <span className="appointment__meta-separator" aria-hidden="true">·</span>
            <span className="appointment__date">{itemMeta(item)}</span>
          </span>
          {item.location && (
            <small className="appointment__location">
              <MaterialIcon name="local_hospital" size={16} />
              <span>Local: {item.location}</span>
            </small>
          )}
          {item.note && <small className="appointment__note">{item.note}</small>}
        </span>
        <span className={`appointment__status ${chipClass}`}>{chipLabel}</span>
      </button>
    </li>
  );
}

function CareSkeleton() {
  return (
    <div className="patient-skeleton" role="status" aria-label="Carregando seus atendimentos">
      {[0, 1, 2].map((row) => (
        <div key={row} className="patient-skeleton__card">
          <span className="patient-skeleton__line patient-skeleton__line--lg" aria-hidden="true" />
          <span className="patient-skeleton__line patient-skeleton__line--sm" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
