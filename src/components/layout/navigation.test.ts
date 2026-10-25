import { describe, expect, it } from 'vitest';
import { getPatientNavItems } from './navigation';

describe('navegação do paciente', () => {
  it('oferece apenas as áreas pessoais e mantém orientações e segurança em destinos próprios', () => {
    const items = getPatientNavItems();

    expect(items.map((item) => item.path)).toEqual(['/', '/minha-saude', '/orientacoes', '/proteger-conta']);
    expect(items.map((item) => item.label)).toContain('Orientações');
    expect(items.map((item) => item.label)).toContain('Proteja sua conta');
    expect(items.some((item) => item.label.includes('Cadastrar'))).toBe(false);
    expect(items.some((item) => item.label.includes('guia'))).toBe(false);
  });
});


describe('navegação do Super Admin', () => {
  it('exibe o fluxo de atendimento para emissão de guias', async () => {
    const { getProfessionalNavItems } = await import('./navigation');
    const items = getProfessionalNavItems('SUPER_ADMIN');
    expect(items).toContainEqual({ path: '/dashboard/atendimento', label: 'Atender paciente', icon: 'patients' });
  });
});
