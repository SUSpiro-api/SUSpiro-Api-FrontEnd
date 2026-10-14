// Guarda os itens que aparecem no menu lateral.

import type { PerfilUsuario } from '../../features/auth/types';
import { canAccessProfessionalDashboard, canCreatePatient, isAdmin } from '../../features/auth/authorization';
import type { MaterialIconName } from '../icons';

export interface NavItem {
  path: string;
  label: string;
  icon: MaterialIconName;
}

const doctorNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '#atender-paciente', label: 'Atender paciente', icon: 'patients' },
  { path: '#ultimos-pacientes', label: 'Últimos pacientes', icon: 'person' },
  { path: '#atividade-recente', label: 'Atividade recente', icon: 'description' },
  { path: '#acoes-rapidas', label: 'Ações rápidas', icon: 'add' },
];

const schedulingNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Fila de guias', icon: 'assignment' },
];

const adminNavItems: NavItem[] = [
  ...doctorNavItems,
  { path: '#fila-de-guias', label: 'Fila de guias', icon: 'assignment' },
];

export function getProfessionalNavItems(perfil?: PerfilUsuario | null): NavItem[] {
  if (perfil === 'ENFERMEIRO' || perfil === 'RECEPCIONISTA') return schedulingNavItems;
  if (isAdmin(perfil)) return adminNavItems;
  return doctorNavItems;
}

export function getNavItems(perfil?: PerfilUsuario | null): NavItem[] {
  const items: NavItem[] = [{ path: '/', label: 'Início', icon: 'home' }];
  if (canAccessProfessionalDashboard(perfil)) items.push({ path: '/dashboard', label: 'Dashboard profissional', icon: 'dashboard' });
  if (canCreatePatient(perfil)) items.push({ path: '/cadastro-cidadao', label: 'Cadastrar cidadão', icon: 'person_add' });
  if (isAdmin(perfil)) items.push({ path: '/cadastro-funcionario', label: 'Cadastrar funcionário', icon: 'group' });
  return items;
}
