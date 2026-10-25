// Decide a tela do dashboard pelo perfil e pela rota ativa.

import { canAccessSchedulingDashboard, canViewGuideQueue } from '../../auth/authorization';
import type { AuthUser } from '../../auth/types';
import type { Route } from '../../../app/routes';

export function useDashboardView(user: AuthUser | null, route: Route) {
  const schedulingProfile = canAccessSchedulingDashboard(user?.perfil);
  const requestedQueue = route === '/dashboard/guias';
  return {
    showSchedulingDashboard: schedulingProfile || (requestedQueue && canViewGuideQueue(user?.perfil)),
  };
}
