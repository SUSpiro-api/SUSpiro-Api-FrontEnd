import type { PerfilUsuario } from '../features/auth/types';
import { canAccessProfessionalDashboard, isPatient } from '../features/auth/authorization';

/** Retorna a primeira tela permitida para cada perfil devolvido pela API. */
export type StartRoute = '/' | '/minha-saude' | '/dashboard';

export function getStartRouteForProfile(perfil?: PerfilUsuario | null): StartRoute {
  if (isPatient(perfil)) return '/minha-saude';
  if (canAccessProfessionalDashboard(perfil)) return '/dashboard';
  return '/';
}
