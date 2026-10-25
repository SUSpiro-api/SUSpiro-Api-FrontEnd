import { describe, expect, it } from 'vitest';
import { formatCpf, isValidCpf, normalizeCpf } from './cpf';

describe('cpf utilities', () => {
  it('normalizes non-digit characters and limits to 11 digits', () => {
    expect(normalizeCpf('529.982.247-25abc')).toBe('52998224725');
  });

  it('formats a CPF correctly', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });

  it('validates check digits and rejects repeated digits', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });
});
