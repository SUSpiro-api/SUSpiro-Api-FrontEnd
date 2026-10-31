import type { ClinicalRecord, Patient } from './types';
import { RecentActivityList } from './RecentActivityList';
import { RecentPatientList } from './RecentPatientList';
import { GuidesLoadNotice } from './GuidesLoadNotice';
import { useDashboardOverview, type RecentActivity } from './hooks/useDashboardOverview';

interface DashboardOverviewProps {
  records: ClinicalRecord[];
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onSelectActivity: (activity: RecentActivity) => void;
  onOpenPatientSearch: () => void;
  guidesLoadFailed: boolean;
  guidesLoading: boolean;
  onRetryGuides: () => void;
}

export function DashboardOverview({
  records,
  patients,
  onSelectPatient,
  onSelectActivity,
  onOpenPatientSearch,
  guidesLoadFailed,
  guidesLoading,
  onRetryGuides,
}: DashboardOverviewProps) {
  const overview = useDashboardOverview(records, patients);

  return (
    <section className="dashboard-overview" aria-labelledby="dashboard-overview-title">
      <h2 id="dashboard-overview-title" className="sr-only">Visão inicial do atendimento</h2>

      <div className="dashboard-overview__grid">
        <section id="atividade-recente" className="dashboard-card dashboard-overview__activity" aria-labelledby="activity-title">
          <header className="dashboard-card__header">
            <div>
              <h2 id="activity-title" className="dashboard-card__title">Atividade recente</h2>
              <p className="dashboard-card__subtitle">Últimas guias e registros realizados no sistema.</p>
            </div>
          </header>
          {guidesLoadFailed && <GuidesLoadNotice retrying={guidesLoading} onRetry={onRetryGuides} />}
          <RecentActivityList activities={overview.recentActivity} onSelectActivity={onSelectActivity} />
        </section>

        <section id="ultimos-pacientes" className="dashboard-card dashboard-overview__patients" aria-labelledby="recent-patients-title">
          <header className="dashboard-card__header">
            <div>
              <h2 id="recent-patients-title" className="dashboard-card__title">Últimos pacientes</h2>
              <p className="dashboard-card__subtitle">Retome rapidamente um atendimento recente.</p>
            </div>
          </header>
          <RecentPatientList
            patients={overview.recentPatients}
            onSelectPatient={onSelectPatient}
            onOpenPatientSearch={onOpenPatientSearch}
          />
        </section>
      </div>
    </section>
  );
}
