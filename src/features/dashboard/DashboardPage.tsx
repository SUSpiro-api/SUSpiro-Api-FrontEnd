// Escolhe qual dashboard aparece conforme o perfil do usuário.

import { useEffect, useState } from 'react';
import { canAccessSchedulingDashboard, canViewGuideQueue } from '../auth/authorization';
import type { AuthUser } from '../auth/types';
import { SchedulingDashboard } from './SchedulingDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import './DashboardPage.css';

interface DashboardPageProps {
  user: AuthUser | null;
}

const GUIDE_QUEUE_HASH = '#fila-de-guias';

export function DashboardPage({ user }: DashboardPageProps) {
  const isSchedulingProfile = canAccessSchedulingDashboard(user?.perfil);

  // Alguns perfis podem alternar entre o atendimento e a fila de guias.
  const canToggleQueue = !isSchedulingProfile && canViewGuideQueue(user?.perfil);
  const [queueRequested, setQueueRequested] = useState(
    () => window.location.hash === GUIDE_QUEUE_HASH,
  );

  useEffect(() => {
    if (!canToggleQueue) return;

    function syncWithHash() {
      setQueueRequested(window.location.hash === GUIDE_QUEUE_HASH);
    }

    window.addEventListener('hashchange', syncWithHash);
    return () => window.removeEventListener('hashchange', syncWithHash);
  }, [canToggleQueue]);

  useEffect(() => {
    if (!queueRequested) return;

    requestAnimationFrame(() => {
      document.getElementById('fila-de-guias')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }, [queueRequested]);

  if (isSchedulingProfile || (canToggleQueue && queueRequested)) {
    return <SchedulingDashboard />;
  }

  return <DoctorDashboard />;
}
