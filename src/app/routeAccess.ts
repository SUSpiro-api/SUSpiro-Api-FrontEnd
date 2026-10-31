import {
  canAccessProfessionalDashboard,
  canCreatePatient,
  canViewGuideQueue,
  isAdmin,
  isPatient,
} from '../features/auth/authorization';
import type { PerfilUsuario } from '../features/auth/types';
import type { Route } from './routes';

/**
 * Fonte única das permissões de navegação. Quem abre uma tela que o seu perfil não pode ver
 * recebe a página 404, como se ela não existisse, em vez de uma tela de "acesso negado".
 */
export function canAccessRoute(route: Route, perfil?: PerfilUsuario | null): boolean {
  switch (route) {
    case '/':
    case '/login':
      return isPatient(perfil) || canAccessProfessionalDashboard(perfil);

    case '/minha-saude':
    case '/orientacoes':
    case '/proteger-conta':
      return isPatient(perfil);

    case '/cadastro-funcionario':
      return isAdmin(perfil);

    case '/cadastro-cidadao':
      return canCreatePatient(perfil);

    case '/dashboard/buscar-paciente':
    case '/dashboard/buscar-guia':
      return canViewGuideQueue(perfil);

    case '/dashboard':
    case '/dashboard/guias':
    case '/dashboard/atendimento':
    case '/dashboard/agenda':
    case '/dashboard/pacientes-recentes':
    case '/dashboard/atividade-recente':
    case '/dashboard/acoes-rapidas': {
      if (!canAccessProfessionalDashboard(perfil)) return false;
      if (route === '/dashboard/guias') return canViewGuideQueue(perfil);
      // Recepção e enfermagem só usam a visão geral e a central de agendamento.
      const isSchedulingProfile = perfil === 'ATENDENTE' || perfil === 'ENFERMEIRO';
      const isDoctorOnlySection = route !== '/dashboard';
      return !(isSchedulingProfile && isDoctorOnlySection);
    }

    // Perfil, recuperação de senha, criação de conta e a própria 404 não dependem do perfil.
    default:
      return true;
  }
}
