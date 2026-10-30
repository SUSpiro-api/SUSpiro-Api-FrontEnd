import { describe, expect, it } from 'vitest';
import { isPastIsoDate, todayIsoDate } from './date';
import { ageFromIsoDate } from '../../utils/date';

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

describe('idade e data por extenso', () => {
  it('calcula a idade considerando se o aniversário já passou', () => {
    const reference = new Date(2026, 9, 14, 12);
    expect(ageFromIsoDate('1987-04-18', reference)).toBe(39);
    expect(ageFromIsoDate('1987-10-14', reference)).toBe(39);
    expect(ageFromIsoDate('1987-10-15', reference)).toBe(38);
  });
});
