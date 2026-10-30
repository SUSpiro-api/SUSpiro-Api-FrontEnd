import { describe, expect, it } from 'vitest';
import { useDashboardView } from './useDashboardView';
import type { AuthUser } from '../../auth/types';

function user(perfil: AuthUser['perfil']): AuthUser {
  return { id: '3', sub: '11144477735', nome: 'Profissional', perfil };
}

describe('useDashboardView', () => {
  it.each(['MEDICO', 'SUPER_ADMIN'] as const)('%s abre a Central de agendamento pela rota da fila', (perfil) => {
    expect(useDashboardView(user(perfil), '/dashboard/guias').showSchedulingDashboard).toBe(true);
  });

  it.each(['ATENDENTE', 'ENFERMEIRO', 'GERENTE'] as const)('%s abre sua Central de agendamento ao entrar no dashboard', (perfil) => {
    expect(useDashboardView(user(perfil), '/dashboard').showSchedulingDashboard).toBe(true);
  });

  it.each(['MEDICO', 'SUPER_ADMIN'] as const)('%s abre seu dashboard profissional ao entrar', (perfil) => {
    expect(useDashboardView(user(perfil), '/dashboard').showSchedulingDashboard).toBe(false);
  });

  it('mantém a visão geral como início do médico e do Super Admin', () => {
    expect(useDashboardView(user('MEDICO'), '/dashboard').showSchedulingDashboard).toBe(false);
    expect(useDashboardView(user('SUPER_ADMIN'), '/dashboard').showSchedulingDashboard).toBe(false);
  });
});
