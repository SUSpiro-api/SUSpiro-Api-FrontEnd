import type { MouseEvent } from 'react';
import type { MaterialIconName } from '../../../components/icons';
import { canAccessProfessionalDashboard, canCreatePatient, isAdmin, isPatient } from '../../../features/auth/authorization';
import { perfilLabel } from '../../../features/auth/perfil';
import { getCurrentUser } from '../../../features/auth/token';

export interface HomeAction {
  path: string;
  icon: MaterialIconName;
  title: string;
  text: string;
}

export function useHomePage(onNavigate: (path: string) => void) {
  const perfil = getCurrentUser()?.perfil;
  const actions: HomeAction[] = [];

  if (isPatient(perfil)) {
    actions.push({
      path: '/minha-saude',
      icon: 'medical_services',
      title: 'Minha saúde',
      text: 'Veja a situação das suas consultas, exames, retornos e encaminhamentos.',
    });
  }
  if (canAccessProfessionalDashboard(perfil)) {
    actions.push({ path: '/dashboard', icon: 'dashboard', title: 'Dashboard profissional', text: 'Acompanhe consultas, exames, encaminhamentos e pendências da unidade.' });
  }
  if (canCreatePatient(perfil)) {
    actions.push({ path: '/cadastro-cidadao', icon: 'person_add', title: 'Cadastrar paciente', text: 'Registre um novo paciente com CPF, data de nascimento e Cartão Nacional de Saúde.' });
  }
  if (isAdmin(perfil)) {
    actions.push({ path: '/cadastro-funcionario', icon: 'group', title: 'Cadastrar funcionário', text: 'Crie o acesso de um novo profissional e defina o perfil dele no sistema.' });
  }

  function handleActionClick(event: MouseEvent<HTMLAnchorElement>, path: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onNavigate(path);
  }

  // Para pacientes, o rótulo genérico "Usuário" não diz nada: mostra o que são.
  const label = isPatient(perfil) ? 'paciente' : perfilLabel(perfil);

  return { perfilLabel: label, actions, handleActionClick };
}
