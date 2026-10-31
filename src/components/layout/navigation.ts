import type { PerfilUsuario } from '../../features/auth/types';
import {
  canAccessProfessionalDashboard,
  canAccessSchedulingDashboard,
  canCreatePatient,
  isAdmin,
  isPatient,
} from '../../features/auth/authorization';
import type { MaterialIconName } from '../icons';

export interface NavItem {
  path: string;
  label: string;
  icon: MaterialIconName;
}

const doctorNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Visão geral', icon: 'dashboard' },
  { path: '/dashboard/atendimento', label: 'Atender paciente', icon: 'patients' },
  { path: '/dashboard/agenda', label: 'Agenda', icon: 'calendar' },
  { path: '/dashboard/pacientes-recentes', label: 'Últimos pacientes', icon: 'person' },
  { path: '/dashboard/atividade-recente', label: 'Atividade recente', icon: 'description' },
  { path: '/dashboard/acoes-rapidas', label: 'Ações rápidas', icon: 'task_alt' },
  { path: '/dashboard/guias', label: 'Central de agendamento', icon: 'event_available' },
];

// Recepção e enfermagem trabalham prioritariamente na fila e no agendamento de guias.
const schedulingNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Central de agendamento', icon: 'event_available' },
  { path: '/dashboard/buscar-paciente', label: 'Buscar paciente', icon: 'person_search' },
  { path: '/dashboard/buscar-guia', label: 'Buscar guia', icon: 'assignment' },
];

// A administração mantém acesso à visão geral, operação e cadastros, sem misturar
// o fluxo clínico do médico nem a área privada do paciente.
const adminNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Visão geral', icon: 'dashboard' },
  { path: '/dashboard/guias', label: 'Central de agendamento', icon: 'event_available' },
  { path: '/dashboard/agenda', label: 'Agenda', icon: 'calendar' },
  { path: '/dashboard/buscar-paciente', label: 'Buscar paciente', icon: 'person_search' },
  { path: '/dashboard/buscar-guia', label: 'Buscar guia', icon: 'assignment' },
];

// Área do paciente: somente dados da própria saúde.
const patientNavItems: NavItem[] = [
  { path: '/minha-saude', label: 'Início', icon: 'home' },
  { path: '/orientacoes', label: 'Orientações', icon: 'assignment' },
];

export function getProfessionalNavItems(perfil?: PerfilUsuario | null): NavItem[] {
  if (isPatient(perfil)) return [...patientNavItems];

  const items = isAdmin(perfil)
    ? [...adminNavItems]
    : perfil === 'ENFERMEIRO' || perfil === 'ATENDENTE'
      ? [...schedulingNavItems]
      : [...doctorNavItems];

  // Gerência abre a central de agendamento por padrão; o Super Admin mantém
  // a visão geral e navega para a central pela entrada própria da fila.
  // O item Início é sempre o dashboard inicial do perfil autenticado.
  if (items.length > 0) items[0] = { ...items[0], path: '/dashboard', label: 'Início', icon: 'home' };

  if (perfil === 'GERENTE' && items.length > 1) {
    // Mantém o primeiro item como Início; os demais abrem rotinas de trabalho.
    items[1] = { ...items[1], label: 'Fila de guias' };
  }

  // O Super Admin também pode entrar no fluxo clínico para emitir uma guia;
  // o backend continua aplicando a permissão no POST /guias.
  if (perfil === 'SUPER_ADMIN') {
    const paths = new Set(items.map((item) => item.path));
    for (const item of doctorNavItems) {
      if (!paths.has(item.path)) {
        items.push(item);
        paths.add(item.path);
      }
    }
  }

  if (canCreatePatient(perfil)) {
    items.push({ path: '/cadastro-cidadao', label: 'Cadastrar paciente', icon: 'person_add' });
  }

  if (isAdmin(perfil)) {
    items.push({ path: '/cadastro-funcionario', label: 'Cadastrar funcionário', icon: 'group' });
  }

  return items;
}

export function getPatientNavItems(): NavItem[] {
  return [...patientNavItems];
}

// Navegação enxuta para páginas comuns fora dos workspaces profissionais.
export function getNavItems(perfil?: PerfilUsuario | null): NavItem[] {
  if (isPatient(perfil)) return getPatientNavItems();

  const items: NavItem[] = [{ path: '/dashboard', label: 'Início', icon: 'home' }];
  if (canAccessProfessionalDashboard(perfil)) {
    items.push({ path: '/dashboard', label: canAccessSchedulingDashboard(perfil) ? 'Central de agendamento' : isAdmin(perfil) ? 'Visão geral' : 'Dashboard profissional', icon: 'dashboard' });
  }
  if (canCreatePatient(perfil)) {
    items.push({ path: '/cadastro-cidadao', label: 'Cadastrar paciente', icon: 'person_add' });
  }
  if (isAdmin(perfil)) {
    items.push({ path: '/cadastro-funcionario', label: 'Cadastrar funcionário', icon: 'group' });
  }
  return items;
}
