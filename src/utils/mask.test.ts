import { describe, expect, it } from 'vitest';
import { maskCns, maskCpf } from './mask';

describe('maskCpf', () => {
  it('shows only the last 2 digits', () => {
    expect(maskCpf('52998224725')).toBe('•••.•••.•••-25');
    expect(maskCpf('529.982.247-25')).toBe('•••.•••.•••-25');
  });

  it('returns an empty string when there is no complete CPF', () => {
    expect(maskCpf('')).toBe('');
    expect(maskCpf('5299')).toBe('');
  });
});

describe('maskCns', () => {
  it('shows only the last 4 digits', () => {
    expect(maskCns('123456789012345')).toBe('•••••••••••2345');
  });

  it('returns an empty string when the CNS is incomplete', () => {
    expect(maskCns('1234')).toBe('');
  });
});
