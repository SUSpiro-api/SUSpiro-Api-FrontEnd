import { describe, expect, it } from 'vitest';
import { getStartRouteForProfile } from './startRoute';

describe('rota inicial por perfil', () => {
  it('direciona cada perfil para seu dashboard', () => {
    expect(getStartRouteForProfile('PACIENTE')).toBe('/minha-saude');
    expect(getStartRouteForProfile('MEDICO')).toBe('/dashboard');
    expect(getStartRouteForProfile('ATENDENTE')).toBe('/dashboard');
    expect(getStartRouteForProfile('ENFERMEIRO')).toBe('/dashboard');
    expect(getStartRouteForProfile('GERENTE')).toBe('/dashboard');
    expect(getStartRouteForProfile('SUPER_ADMIN')).toBe('/dashboard');
  });

  it('não concede workspace profissional sem um perfil reconhecido', () => {
    expect(getStartRouteForProfile(undefined)).toBe('/');
    expect(getStartRouteForProfile(null)).toBe('/');
  });
});
