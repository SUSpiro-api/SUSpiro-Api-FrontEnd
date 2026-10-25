import { describe, expect, it } from 'vitest';
import { buildMonthGrid, chunkWeeks, formatDayTitle, formatMonthTitle, shiftIsoDay, shiftIsoMonth, shiftMonth } from './calendar';

describe('calendário mensal', () => {
  it('monta a grade de outubro de 2026 começando no domingo anterior', () => {
    const cells = buildMonthGrid({ year: 2026, month: 9 });

    expect(cells).toHaveLength(35);
    expect(cells[0]).toEqual({ iso: '2026-09-27', day: 27, inMonth: false });
    expect(cells[4]).toEqual({ iso: '2026-10-01', day: 1, inMonth: true });
    expect(cells[34]).toEqual({ iso: '2026-10-31', day: 31, inMonth: true });
    expect(chunkWeeks(cells)).toHaveLength(5);
  });

  it('usa seis semanas quando o mês precisa', () => {
    expect(buildMonthGrid({ year: 2026, month: 7 })).toHaveLength(42);
  });

  it('troca de mês virando o ano', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it('anda por dias e meses sem passar do fim do mês', () => {
    expect(shiftIsoDay('2026-10-31', 1)).toBe('2026-11-01');
    expect(shiftIsoDay('2026-10-14', -7)).toBe('2026-10-07');
    expect(shiftIsoMonth('2026-10-31', 1)).toBe('2026-11-30');
  });

  it('formata títulos em português com só a primeira letra maiúscula', () => {
    expect(formatMonthTitle({ year: 2026, month: 9 })).toBe('Outubro de 2026');
    expect(formatDayTitle('2026-10-14')).toBe('Quarta-feira, 14 de outubro');
  });
});
