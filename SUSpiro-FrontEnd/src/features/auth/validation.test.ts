import { describe, expect, it } from 'vitest';
import { validateLoginCpf, validatePassword, validateResetCpf } from './validation';

describe('auth validation', () => {
  it('accepts a valid CPF', () => {
    expect(validateLoginCpf('529.982.247-25')).toBe('');
  });

  it('rejects an invalid CPF', () => {
    expect(validateLoginCpf('111.111.111-11')).toContain('CPF válido');
  });

  it('rejects email because the current API authenticates by CPF', () => {
    expect(validateLoginCpf('usuario@suspiro.gov.br')).toContain('CPF válido');
  });

  it('requires a password', () => {
    expect(validatePassword('   ')).toBe('Informe sua senha.');
  });

  it('validates recovery CPF', () => {
    expect(validateResetCpf('52998224725')).toBe('');
    expect(validateResetCpf('123')).toContain('CPF válido');
  });
});
