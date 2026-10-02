import { describe, expect, it } from 'vitest';
import { perfilLabel } from './perfil';

describe('perfilLabel', () => {
  it('translates the internal profile values', () => {
    expect(perfilLabel('RECEPCIONISTA')).toBe('Recepcionista');
    expect(perfilLabel('SUPER_ADMIN')).toBe('Super administrador');
    expect(perfilLabel('MEDICO')).toBe('Médico');
  });

  it('handles a missing or unknown profile', () => {
    expect(perfilLabel(undefined)).toBe('Perfil não informado');
    expect(perfilLabel(null)).toBe('Perfil não informado');
    expect(perfilLabel('NOVO_PERFIL')).toBe('NOVO_PERFIL');
  });
});
