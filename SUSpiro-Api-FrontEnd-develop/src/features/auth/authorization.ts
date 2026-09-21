import type { PerfilUsuario } from './types';

export function isAdmin(perfil?: PerfilUsuario | null): boolean {
  return perfil === 'ADMIN' || perfil === 'SUPER_ADMIN';
}

export function canCreateAdmin(perfil?: PerfilUsuario | null): boolean {
  return perfil === 'SUPER_ADMIN';
}

export function canCreatePatient(perfil?: PerfilUsuario | null): boolean {
  return [
    'SUPER_ADMIN',
    'ADMIN',
    'MEDICO',
    'ENFERMEIRO',
    'RECEPCIONISTA',
  ].includes(perfil ?? '');
}
