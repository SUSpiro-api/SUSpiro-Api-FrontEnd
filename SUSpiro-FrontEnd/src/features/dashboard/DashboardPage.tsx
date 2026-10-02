import { useEffect, useState } from 'react';
import { ApiError } from '../../core/api/httpClient';
import { MaterialIcon } from '../../components/icons';
import { canAccessSchedulingDashboard } from '../auth/authorization';
import type { AuthUser } from '../auth/types';
import { ClinicalRecordList } from './ClinicalRecordList';
import { findPatientByCpf, clinicalRecords as initialRecords, patients } from './data';
import { PatientSearchModal } from './PatientSearchModal';
import { PatientSummary } from './PatientSummary';
import { QuickActions } from './QuickActions';
import { ScheduleModal } from './ScheduleModal';
import { StatsGrid } from './StatsGrid';
import { DashboardOverview } from './DashboardOverview';
import { GuideSuccessModal } from './GuideSuccessModal';
import { listMyGuides, type Guide } from '../guides';
import { SchedulingDashboard } from './SchedulingDashboard';
import type { ClinicalRecord, Patient, ScheduleType } from './types';
import './DashboardPage.css';

interface DashboardPageProps {
  user: AuthUser | null;
}

function guideToClinicalRecord(guide: Guide): ClinicalRecord {
  const typeMap: Record<Guide['tipo'], ClinicalRecord['type']> = {
    CONSULTA: 'consulta',
    RETORNO: 'retorno',
    EXAME: 'exame',
    ENCAMINHAMENTO: 'encaminhamento',
  };

  const statusMap: Record<Guide['status'], ClinicalRecord['status']> = {
    AGUARDANDO_AGENDAMENTO: 'pendente',
    AGENDADO: 'agendado',
    CANCELADO: 'cancelado',
  };

  const title = guide.tipo === 'CONSULTA'
    ? guide.especialidade ?? 'Consulta'
    : guide.detalhe ?? guide.tipo;

  return {
    id: guide.id,
    patientId: guide.pacienteId,
    date: guide.dataSolicitada,
    time: guide.horaAgendamento ?? undefined,
    type: typeMap[guide.tipo],
    title,
    observation: guide.observacao ?? undefined,
    status: statusMap[guide.status],
    priority: guide.prioridade === 'URGENTE' ? 'urgente' : 'normal',
  };
}

export function DashboardPage({ user }: DashboardPageProps) {
  if (canAccessSchedulingDashboard(user?.perfil)) {
    return <SchedulingDashboard user={user} />;
  }

  return <DoctorDashboard user={user} />;
}

function DoctorDashboard({ user }: DashboardPageProps) {
  const [records, setRecords] = useState<ClinicalRecord[]>(initialRecords);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('consulta');
  const [pendingScheduleType, setPendingScheduleType] = useState<ScheduleType | null>(null);
  const [successGuide, setSuccessGuide] = useState<Guide | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadMyGuides = async () => {
      try {
        const guides = await listMyGuides();
        const apiRecords = guides.map(guideToClinicalRecord);
        setRecords((current) => {
          const staticRecords = current.filter((record) => !guides.some((guide) => guide.id === record.id));
          return [...apiRecords, ...staticRecords];
        });
      } catch (error) {
        if (error instanceof ApiError && error.code === 'SESSAO_EXPIRADA') return;
        setLoadError('Não foi possível carregar as guias já geradas. Novas guias continuarão sendo registradas normalmente.');
      }
    };
    void loadMyGuides();
  }, []);

  useEffect(() => {
    const openFromSidebar = () => {
      if (window.location.hash === '#atender-paciente') setPatientSearchOpen(true);
    };
    openFromSidebar();
    window.addEventListener('hashchange', openFromSidebar);
    return () => window.removeEventListener('hashchange', openFromSidebar);
  }, []);

  const openSchedule = (type: ScheduleType = 'consulta') => {
    setScheduleType(type);
    if (!selectedPatient) {
      setPendingScheduleType(type);
      setPatientSearchOpen(true);
      return;
    }
    setScheduleModalOpen(true);
  };

  const handlePatientFound = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearchOpen(false);
    if (pendingScheduleType) {
      setScheduleType(pendingScheduleType);
      setPendingScheduleType(null);
      setScheduleModalOpen(true);
    }
  };

  const handleCreated = (guide: Guide) => {
    setRecords((current) => [guideToClinicalRecord(guide), ...current.filter((record) => record.id !== guide.id)]);
    setSuccessGuide(guide);
  };

  return (
    <div className="page dashboard-page">
      <header id="dashboard-top" className="page__header dashboard-page__header">
        <div>
          <p className="dashboard-eyebrow"><MaterialIcon name="medical_services" size={16} />Área profissional</p>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__description">Encontre o paciente, acompanhe o histórico e gere a guia para o próximo passo do cuidado.</p>
        </div>
        <div className="dashboard-header__actions">
          <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => setPatientSearchOpen(true)}>
            <MaterialIcon name="patients" size={18} />Atender paciente
          </button>
          <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => openSchedule('consulta')}>
            <MaterialIcon name="add" size={17} />Novo registro
          </button>
        </div>
      </header>

      {loadError && <p className="dashboard-inline-warning" role="status">{loadError}</p>}

      <div id="atender-paciente">
        {selectedPatient ? (
          <PatientSummary
            patient={selectedPatient}
            onChangePatient={() => setPatientSearchOpen(true)}
            onClearPatient={() => { setSelectedPatient(null); setPendingScheduleType(null); }}
          />
        ) : (
          <section className="patient-empty-state" aria-labelledby="patient-empty-title">
            <div className="patient-empty-state__icon" aria-hidden="true"><MaterialIcon name="patients" size={24} /></div>
            <div>
              <p className="patient-empty-state__eyebrow">Antes de iniciar um atendimento</p>
              <h2 id="patient-empty-title">Identifique o paciente pelo CPF</h2>
              <p>Depois de localizar o paciente, o dashboard passa a mostrar somente as consultas, retornos, exames e encaminhamentos dele.</p>
            </div>
            <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => setPatientSearchOpen(true)}>
              <MaterialIcon name="search" size={17} />Buscar paciente
            </button>
          </section>
        )}
      </div>

      {selectedPatient ? (
        <>
          <StatsGrid records={records} patient={selectedPatient} />
          <div className="dashboard-layout">
            <div id="historico-paciente" className="dashboard-layout__main">
              <ClinicalRecordList records={records} patients={patients} selectedPatient={selectedPatient} onCreate={() => openSchedule('consulta')} />
            </div>
            <aside className="dashboard-layout__aside" aria-label="Ferramentas do atendimento">
              <div id="acoes-rapidas"><QuickActions onCreate={openSchedule} /></div>
            </aside>
          </div>
        </>
      ) : (
        <div className="dashboard-layout dashboard-layout--overview">
          <div className="dashboard-layout__main">
            <DashboardOverview records={records} patients={patients} onSelectPatient={setSelectedPatient} onOpenPatientSearch={() => setPatientSearchOpen(true)} />
          </div>
          <aside id="acoes-rapidas" className="dashboard-layout__aside" aria-label="Ações rápidas">
            <QuickActions onCreate={openSchedule} />
          </aside>
        </div>
      )}

      <PatientSearchModal
        open={patientSearchOpen}
        onClose={() => { setPatientSearchOpen(false); setPendingScheduleType(null); }}
        onFound={handlePatientFound}
        findPatient={findPatientByCpf}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        initialType={scheduleType}
        patient={selectedPatient}
        onClose={() => setScheduleModalOpen(false)}
        onCreated={handleCreated}
        findPatient={findPatientByCpf}
        onPatientChange={setSelectedPatient}
      />

      <GuideSuccessModal guide={successGuide} onClose={() => setSuccessGuide(null)} />
    </div>
  );
}
