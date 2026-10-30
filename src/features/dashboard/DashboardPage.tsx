import type { AuthUser } from '../auth/types';
import { canCreatePatient, canScheduleGuides } from '../auth/authorization';
import type { Route } from '../../app/routes';
import { useDashboardView } from './hooks/useDashboardView';
import { SchedulingDashboard } from './SchedulingDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import './DashboardPage.css';

interface DashboardPageProps {
  user: AuthUser | null;
  route: Route;
  onNavigate: (path: string) => void;
}

export function DashboardPage({ user, route, onNavigate }: DashboardPageProps) {
  const { showSchedulingDashboard } = useDashboardView(user, route);
  if (showSchedulingDashboard) {
    return (
      <SchedulingDashboard
        onNavigate={onNavigate}
        canRegisterPatient={canCreatePatient(user?.perfil)}
        canScheduleGuides={canScheduleGuides(user?.perfil)}
      />
    );
  }

  return <DoctorDashboard route={route} onNavigate={onNavigate} />;
}
