import { describe, expect, it } from 'vitest';
import { canAccessRoute } from './routeAccess';

describe('canAccessRoute', () => {
  it('keeps patients inside their own area', () => {
    expect(canAccessRoute('/minha-saude', 'PACIENTE')).toBe(true);
    expect(canAccessRoute('/orientacoes', 'PACIENTE')).toBe(true);
    expect(canAccessRoute('/dashboard', 'PACIENTE')).toBe(false);
    expect(canAccessRoute('/cadastro-cidadao', 'PACIENTE')).toBe(false);
    expect(canAccessRoute('/cadastro-funcionario', 'PACIENTE')).toBe(false);
  });

  it('keeps professionals out of the patient area', () => {
    expect(canAccessRoute('/minha-saude', 'MEDICO')).toBe(false);
    expect(canAccessRoute('/orientacoes', 'ATENDENTE')).toBe(false);
  });

  it('limits reception and nursing to the overview and the scheduling center', () => {
    expect(canAccessRoute('/dashboard', 'ATENDENTE')).toBe(true);
    expect(canAccessRoute('/dashboard/guias', 'ENFERMEIRO')).toBe(true);
    expect(canAccessRoute('/dashboard/agenda', 'ATENDENTE')).toBe(false);
    expect(canAccessRoute('/dashboard/atendimento', 'ENFERMEIRO')).toBe(false);
  });

  it('allows only admins to register employees', () => {
    expect(canAccessRoute('/cadastro-funcionario', 'GERENTE')).toBe(true);
    expect(canAccessRoute('/cadastro-funcionario', 'MEDICO')).toBe(false);
  });

  it('always allows the profile page and the 404 page', () => {
    expect(canAccessRoute('/perfil', 'PACIENTE')).toBe(true);
    expect(canAccessRoute('/404', 'PACIENTE')).toBe(true);
  });
});
