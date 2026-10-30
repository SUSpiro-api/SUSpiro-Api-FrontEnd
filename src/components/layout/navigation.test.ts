import { describe, expect, it } from 'vitest';
import { getPatientNavItems } from './navigation';

describe('navegação do paciente', () => {
  it('oferece apenas as áreas pessoais, sem atalho separado para proteção da conta', () => {
    const items = getPatientNavItems();

    expect(items.map((item) => item.path)).toEqual(['/minha-saude', '/orientacoes']);
    expect(items.map((item) => item.label)).toContain('Orientações');
    expect(items.some((item) => item.label === 'Proteja sua conta')).toBe(false);
    expect(items.some((item) => item.label.includes('Cadastrar'))).toBe(false);
    expect(items.some((item) => item.label.includes('guia'))).toBe(false);
  });
});


describe('navegação do Super Admin', () => {
  it('exibe o fluxo de atendimento para emissão de guias', async () => {
    const { getProfessionalNavItems } = await import('./navigation');
    const items = getProfessionalNavItems('SUPER_ADMIN');
    expect(items).toContainEqual({ path: '/dashboard/atendimento', label: 'Atender paciente', icon: 'patients' });
    expect(items.some((item) => item.path === '/dashboard/pacientes-recentes')).toBe(true);
    expect(items.some((item) => item.path === '/dashboard/atividade-recente')).toBe(true);
    expect(items.some((item) => item.path === '/dashboard/acoes-rapidas')).toBe(true);
    expect(items.some((item) => item.path === '/minha-saude' && item.label === 'Minha saúde')).toBe(false);
  });
});


describe('dashboard de agendamento por perfil', () => {
  it('exibe a central para a enfermagem e para a gerência', async () => {
    const { getProfessionalNavItems } = await import('./navigation');
    expect(getProfessionalNavItems('ENFERMEIRO').some((item) => item.path === '/dashboard')).toBe(true);
    expect(getProfessionalNavItems('GERENTE').some((item) => item.path === '/dashboard' && item.label === 'Central de agendamento')).toBe(true);
    expect(getProfessionalNavItems('GERENTE').some((item) => item.path === '/dashboard/guias' && item.label === 'Fila de guias')).toBe(true);
  });
});


describe('central de agendamento do médico', () => {
  it('disponibiliza a fila sem conceder permissão de agendamento', async () => {
    const { getProfessionalNavItems } = await import('./navigation');
    expect(getProfessionalNavItems('MEDICO').some((item) => item.path === '/dashboard/guias')).toBe(true);
  });
});


describe('atalhos do painel médico', () => {
  it('mostra Ações rápidas no menu do médico e do Super Admin, sem duplicar a rota', async () => {
    const { getProfessionalNavItems } = await import('./navigation');
    for (const perfil of ['MEDICO', 'SUPER_ADMIN'] as const) {
      const actions = getProfessionalNavItems(perfil).filter((item) => item.path === '/dashboard/acoes-rapidas');
      expect(actions).toHaveLength(1);
      expect(actions[0].label).toBe('Ações rápidas');
    }
  });
});
