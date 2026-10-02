import { describe, expect, it } from 'vitest';
import { isPastIsoDate, todayIsoDate } from './date';

describe('datas das guias', () => {
  it('gera a data de hoje usando o calendário local', () => {
    const reference = new Date(2026, 9, 1, 23, 45, 0);
    expect(todayIsoDate(reference)).toBe('2026-10-01');
  });

  it('bloqueia datas anteriores a hoje', () => {
    expect(isPastIsoDate('2026-09-10', '2026-10-01')).toBe(true);
    expect(isPastIsoDate('2026-10-01', '2026-10-01')).toBe(false);
    expect(isPastIsoDate('2026-10-10', '2026-10-01')).toBe(false);
  });
});
