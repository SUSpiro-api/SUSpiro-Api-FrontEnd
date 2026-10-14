import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it('gives 21:1 for black on white and 1:1 for equal colors', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('is symmetric and accepts the short hex form', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(contrastRatio('#000000', '#ffffff'), 5);
  });

  it('matches known WCAG values', () => {
    expect(contrastRatio('#64748b', '#ffffff')).toBeCloseTo(4.76, 1);
    expect(contrastRatio('#e2e8f0', '#ffffff')).toBeLessThan(1.5);
  });

  it('rejects invalid colors', () => {
    expect(() => contrastRatio('azul', '#ffffff')).toThrow('Cor inválida');
  });
});
