import { describe, expect, it } from 'vitest';
import { formatCpf, isValidCpf, normalizeCpf } from './cpf';

describe('cpf utilities', () => {
  it('normalizes non-digit characters and limits to 11 digits', () => {
    expect(normalizeCpf('111.444.777-35abc')).toBe('11144477735');
  });

  it('formats a CPF correctly', () => {
    expect(formatCpf('11144477735')).toBe('111.444.777-35');
  });

  it('validates check digits and rejects repeated digits', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });
});
