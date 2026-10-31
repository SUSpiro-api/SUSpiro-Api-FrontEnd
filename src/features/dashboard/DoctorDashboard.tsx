
import { useState } from 'react';
import { MaterialIcon } from '../../components/icons';
import type { Route } from '../../app/routes';
import { ClinicalRecordList } from './ClinicalRecordList';
import { DashboardOverview } from './DashboardOverview';
import { AgendaCalendar } from './AgendaCalendar';
import { GuideSuccessModal } from './GuideSuccessModal';
import { GuidesLoadNotice } from './GuidesLoadNotice';
import { PatientHistoryNotice } from './PatientHistoryNotice';
import { OverviewStats } from './OverviewStats';
import { PatientSearchBar } from './PatientSearchBar';
import { PatientSearchModal } from './PatientSearchModal';
import { PatientSummary } from './PatientSummary';
import { QuickActions } from './QuickActions';
import { ScheduleModal } from './ScheduleModal';
import { StatsGrid } from './StatsGrid';
import { RecentActivityList } from './RecentActivityList';
import { GuideDetailsModal } from './GuideDetailsModal';
import { RecentPatientList } from './RecentPatientList';
import { useDashboardOverview, type RecentActivity } from './hooks/useDashboardOverview';
import { useDoctorDashboard } from './hooks/useDoctorDashboard';
import type { Patient } from './types';

interface DoctorDashboardProps {
  route: Route;
  onNavigate: (path: string) => void;
}

type DashboardSection = 'overview' | 'atendimento' | 'agenda' | 'pacientes-recentes' | 'atividade-recente' | 'acoes-rapidas';

const sectionByRoute: Partial<Record<Route, DashboardSection>> = {
  '/dashboard': 'overview',
  '/dashboard/atendimento': 'atendimento',
  '/dashboard/agenda': 'agenda',
  '/dashboard/pacientes-recentes': 'pacientes-recentes',
  '/dashboard/atividade-recente': 'atividade-recente',
  '/dashboard/acoes-rapidas': 'acoes-rapidas',
};

const sectionCopy: Record<DashboardSection, { title: string; description: string }> = {
  overview: {
    title: 'Visão geral',
    description: 'Acompanhe os registros em aberto e retome rapidamente as atividades recentes.',
  },
  atendimento: {
    title: 'Atender paciente',
    description: 'Localize uma pessoa para consultar o histórico e registrar consultas, exames, retornos ou encaminhamentos.',
  },
  agenda: {
    title: 'Agenda',
    description: 'Consulte os registros por dia e navegue pelo calendário para planejar os atendimentos.',
  },
  'pacientes-recentes': {
    title: 'Últimos pacientes',
    description: 'Retome um atendimento recente ou abra o cadastro de um novo paciente.',
  },
  'atividade-recente': {
    title: 'Atividade recente',
    description: 'Acompanhe os registros mais recentes e seus respectivos status.',
  },
  'acoes-rapidas': {
    title: 'Ações rápidas',
    description: 'Inicie um novo registro. Caso ainda não tenha selecionado um paciente, o sistema solicitará a identificação.',
  },
};

export function DoctorDashboard({ route, onNavigate }: DoctorDashboardProps) {
  const section = sectionByRoute[route] ?? 'overview';
  const copy = sectionCopy[section];
  const dashboard = useDoctorDashboard();
  const overview = useDashboardOverview(dashboard.records, dashboard.patients);
  const [selectedActivity, setSelectedActivity] = useState<RecentActivity | null>(null);

  function selectPatientAndOpenCare(patient: Patient) {
    dashboard.setSelectedPatient(patient);
    onNavigate('/dashboard/atendimento');
  }

  function handlePatientFound(patient: Patient) {
    dashboard.handlePatientFound(patient);
    if (section !== 'atendimento') onNavigate('/dashboard/atendimento');
  }

  return (
    <div className={`page dashboard-page dashboard-page--${section}`}>
      <header className="page__header dashboard-page__header">
        <div>
          <h1 className="page__title">{copy.title}</h1>
          <p className="page__description">{copy.description}</p>
        </div>
        <div className="dashboard-header__actions">
          {section === 'overview' && (
            <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => onNavigate('/dashboard/atendimento')}>
              <MaterialIcon name="patients" size={17} />Atender paciente
            </button>
          )}
          {section === 'atendimento' && (
            <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => dashboard.openSchedule('consulta')}>
              <MaterialIcon name="add" size={17} />Novo registro
            </button>
          )}
          {section === 'pacientes-recentes' && (
            <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => onNavigate('/cadastro-cidadao')}>
              <MaterialIcon name="person_add" size={17} />Cadastrar paciente
            </button>
          )}
        </div>
      </header>

      {section === 'overview' && (
        <>
          <OverviewStats records={dashboard.records} />
          <DashboardOverview
            records={dashboard.records}
            patients={dashboard.patients}
            onSelectPatient={selectPatientAndOpenCare}
            onSelectActivity={setSelectedActivity}
            onOpenPatientSearch={() => dashboard.setPatientSearchOpen(true)}
            guidesLoadFailed={dashboard.guidesLoadFailed}
            guidesLoading={dashboard.guidesLoading}
            onRetryGuides={dashboard.retryLoadGuides}
          />
        </>
      )}

      {section === 'atendimento' && (
        <>
          {dashboard.selectedPatient ? (
            <>
              <PatientSummary
                patient={dashboard.selectedPatient}
                onChangePatient={() => dashboard.setPatientSearchOpen(true)}
                onClearPatient={dashboard.clearSelectedPatient}
              />
              {dashboard.patientHistoryLoadFailed && (
                <PatientHistoryNotice
                  retrying={dashboard.patientHistoryLoading}
                  onRetry={() => void dashboard.retryLoadPatientHistory()}
                />
              )}
              {dashboard.patientHistoryLoading && (
                <p className="dashboard-empty dashboard-empty--compact" role="status">Carregando histórico clínico do paciente…</p>
              )}
              <StatsGrid records={dashboard.patientRecords} patient={dashboard.selectedPatient} />
              {dashboard.guidesLoadFailed && (
                <GuidesLoadNotice retrying={dashboard.guidesLoading} onRetry={dashboard.retryLoadGuides} />
              )}
              <ClinicalRecordList
                records={dashboard.patientRecords}
                selectedPatient={dashboard.selectedPatient}
                onCreate={() => dashboard.openSchedule('consulta')}
              />
            </>
          ) : (
            <PatientSearchBar
              inputRef={dashboard.searchInputRef}
              onFound={dashboard.handlePatientFound}
              findPatient={dashboard.findPatientByCpf}
            />
          )}
        </>
      )}

      {section === 'agenda' && (
        <AgendaCalendar records={dashboard.records} patients={dashboard.patients} patient={null} />
      )}

      {section === 'pacientes-recentes' && (
        <section className="dashboard-card dashboard-card--standalone" aria-labelledby="recent-patients-title">
          <header className="dashboard-card__header">
            <div>
              <h2 id="recent-patients-title" className="dashboard-card__title">Pacientes atendidos recentemente</h2>
              <p className="dashboard-card__subtitle">Selecione uma pessoa para abrir o histórico clínico.</p>
            </div>
          </header>
          <RecentPatientList
            patients={overview.recentPatients}
            onSelectPatient={selectPatientAndOpenCare}
            onOpenPatientSearch={() => dashboard.setPatientSearchOpen(true)}
          />
        </section>
      )}

      {section === 'atividade-recente' && (
        <section className="dashboard-card dashboard-card--standalone" aria-labelledby="activity-title">
          <header className="dashboard-card__header">
            <div>
              <h2 id="activity-title" className="dashboard-card__title">Registros recentes</h2>
              <p className="dashboard-card__subtitle">Últimas guias e atividades disponíveis neste painel.</p>
            </div>
          </header>
          {dashboard.guidesLoadFailed && <GuidesLoadNotice retrying={dashboard.guidesLoading} onRetry={dashboard.retryLoadGuides} />}
          <RecentActivityList activities={overview.recentActivity} onSelectActivity={setSelectedActivity} />
        </section>
      )}

      {section === 'acoes-rapidas' && (
        <div className="dashboard-quick-actions-page">
          <QuickActions onCreate={dashboard.openSchedule} />
        </div>
      )}

      <PatientSearchModal
        open={dashboard.patientSearchOpen}
        onClose={dashboard.closePatientSearch}
        onFound={handlePatientFound}
        findPatient={dashboard.findPatientByCpf}
      />

      <ScheduleModal
        open={dashboard.scheduleModalOpen}
        initialType={dashboard.scheduleType}
        patient={dashboard.selectedPatient}
        onClose={() => dashboard.setScheduleModalOpen(false)}
        onCreated={dashboard.handleCreated}
        findPatient={dashboard.findPatientByCpf}
        onPatientChange={dashboard.setSelectedPatient}
      />

      <GuideSuccessModal
        guide={dashboard.successGuide}
        onClose={() => dashboard.setSuccessGuide(null)}
      />

      <GuideDetailsModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
}
