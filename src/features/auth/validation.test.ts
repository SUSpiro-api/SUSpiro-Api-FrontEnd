import { describe, expect, it } from 'vitest';
import { validateIdentifier, validatePassword, validateResetCpf } from './validation';

describe('auth validation', () => {
  it('accepts a valid CPF', () => {
    expect(validateIdentifier('529.982.247-25')).toBe('');
  });

  it('rejects an invalid CPF', () => {
    expect(validateIdentifier('111.111.111-11')).toContain('CPF válido');
  });

  it('accepts a valid email', () => {
    expect(validateIdentifier('usuario@suspiro.gov.br')).toBe('');
  });

  it('rejects an invalid email', () => {
    expect(validateIdentifier('usuario@')).toBe('Informe um e-mail válido.');
  });

  it('requires a password', () => {
    expect(validatePassword('   ')).toBe('Informe sua senha.');
  });

  it('validates recovery CPF', () => {
    expect(validateResetCpf('52998224725')).toBe('');
    expect(validateResetCpf('123')).toContain('CPF válido');
  });
});
