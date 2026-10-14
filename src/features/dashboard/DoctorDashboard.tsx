// Mostra a tela de atendimento do médico.

import { MaterialIcon } from '../../components/icons';
import { ClinicalRecordList } from './ClinicalRecordList';
import { DashboardOverview } from './DashboardOverview';
import { GuideSuccessModal } from './GuideSuccessModal';
import { PatientSearchModal } from './PatientSearchModal';
import { PatientSummary } from './PatientSummary';
import { QuickActions } from './QuickActions';
import { ScheduleModal } from './ScheduleModal';
import { StatsGrid } from './StatsGrid';
import { patients } from './data';
import { useDoctorDashboard } from './hooks/useDoctorDashboard';

export function DoctorDashboard() {
  const dashboard = useDoctorDashboard();

  return (
    <div className="page dashboard-page">
      <header id="dashboard-top" className="page__header dashboard-page__header">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__description">
            Encontre o paciente, acompanhe o histórico e gere a guia para o próximo passo do cuidado.
          </p>
        </div>
        <div className="dashboard-header__actions">
          <button
            type="button"
            className="dashboard-button dashboard-button--primary"
            onClick={() => dashboard.setPatientSearchOpen(true)}
          >
            <MaterialIcon name="patients" size={18} />Atender paciente
          </button>
          <button
            type="button"
            className="dashboard-button dashboard-button--secondary"
            onClick={() => dashboard.openSchedule('consulta')}
          >
            <MaterialIcon name="add" size={17} />Novo registro
          </button>
        </div>
      </header>

      {dashboard.loadError && (
        <p className="dashboard-inline-warning" role="status">{dashboard.loadError}</p>
      )}

      <div id="atender-paciente">
        {dashboard.selectedPatient ? (
          <PatientSummary
            patient={dashboard.selectedPatient}
            onChangePatient={() => dashboard.setPatientSearchOpen(true)}
            onClearPatient={dashboard.clearSelectedPatient}
          />
        ) : (
          <section className="patient-empty-state" aria-labelledby="patient-empty-title">
            <div className="patient-empty-state__icon" aria-hidden="true">
              <MaterialIcon name="patients" size={28} />
            </div>
            <div>
              <h2 id="patient-empty-title">Identifique o paciente pelo CPF</h2>
              <p>
                Depois de localizar o paciente, o dashboard passa a mostrar somente as consultas,
                retornos, exames e encaminhamentos dele.
              </p>
            </div>
            <button
              type="button"
              className="dashboard-button dashboard-button--primary"
              onClick={() => dashboard.setPatientSearchOpen(true)}
            >
              <MaterialIcon name="search" size={17} />Buscar paciente
            </button>
          </section>
        )}
      </div>

      {dashboard.selectedPatient ? (
        <>
          <StatsGrid records={dashboard.records} patient={dashboard.selectedPatient} />
          <div className="dashboard-layout">
            <div id="historico-paciente" className="dashboard-layout__main">
              <ClinicalRecordList
                records={dashboard.records}
                selectedPatient={dashboard.selectedPatient}
                onCreate={() => dashboard.openSchedule('consulta')}
              />
            </div>
            <aside className="dashboard-layout__aside" aria-label="Ferramentas do atendimento">
              <div id="acoes-rapidas">
                <QuickActions onCreate={dashboard.openSchedule} />
              </div>
            </aside>
          </div>
        </>
      ) : (
        <div className="dashboard-layout dashboard-layout--overview">
          <div className="dashboard-layout__main">
            <DashboardOverview
              records={dashboard.records}
              patients={patients}
              onSelectPatient={dashboard.setSelectedPatient}
              onOpenPatientSearch={() => dashboard.setPatientSearchOpen(true)}
            />
          </div>
          <aside id="acoes-rapidas" className="dashboard-layout__aside" aria-label="Ações rápidas">
            <QuickActions onCreate={dashboard.openSchedule} />
          </aside>
        </div>
      )}

      <PatientSearchModal
        open={dashboard.patientSearchOpen}
        onClose={dashboard.closePatientSearch}
        onFound={dashboard.handlePatientFound}
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
    </div>
  );
}
