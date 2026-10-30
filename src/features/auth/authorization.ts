import type { PerfilUsuario } from './types';

export function isAdmin(perfil?: PerfilUsuario | null): boolean {
  return perfil === 'GERENTE' || perfil === 'SUPER_ADMIN';
}

export function canCreateAdmin(perfil?: PerfilUsuario | null): boolean {
  return perfil === 'SUPER_ADMIN';
}

export function canCreatePatient(perfil?: PerfilUsuario | null): boolean {
  return [
    'SUPER_ADMIN',
    'GERENTE',
    'MEDICO',
    'ENFERMEIRO',
    'ATENDENTE',
  ].includes(perfil ?? '');
}

export function canAccessProfessionalDashboard(perfil?: PerfilUsuario | null): boolean {
  return ['MEDICO', 'ENFERMEIRO', 'ATENDENTE'].includes(perfil ?? '') || isAdmin(perfil);
}

export function canAccessSchedulingDashboard(perfil?: PerfilUsuario | null): boolean {
  return ['ATENDENTE', 'ENFERMEIRO', 'GERENTE'].includes(perfil ?? '');
}

export function canViewGuideQueue(perfil?: PerfilUsuario | null): boolean {
  return perfil === 'MEDICO' || perfil === 'ATENDENTE' || perfil === 'ENFERMEIRO' || isAdmin(perfil);
}

export function canScheduleGuides(perfil?: PerfilUsuario | null): boolean {
  return perfil === 'ATENDENTE' || perfil === 'ENFERMEIRO' || isAdmin(perfil);
}

// Contas sem perfil clínico são de pacientes: veem a própria área de saúde.
export function isPatient(perfil?: PerfilUsuario | null): boolean {
  return perfil === 'PACIENTE';
}
