import { describe, expect, it } from 'vitest';
import type { CareItem } from './data';
import { dateParts, findNextScheduled, summarizeByType, todayIso } from './careSummary';

function item(overrides: Partial<CareItem>): CareItem {
  return {
    id: 'x',
    type: 'consulta',
    title: 'Teste',
    status: 'agendado',
    date: '2026-10-20',
    urgent: false,
    source: 'guia',
    ...overrides,
  };
}

describe('careSummary', () => {
  it('conta cada tipo com zero quando não há atendimentos', () => {
    const resumo = summarizeByType([]);
    expect(resumo.map((entry) => entry.type)).toEqual(['consulta', 'exame', 'retorno', 'encaminhamento']);
    expect(resumo.every((entry) => entry.total === 0 && entry.scheduled === 0 && entry.waiting === 0)).toBe(true);
  });

  it('separa o total, os agendados e os que aguardam, por tipo', () => {
    const resumo = summarizeByType([
      item({ id: '1', type: 'exame', status: 'agendado' }),
      item({ id: '2', type: 'exame', status: 'pendente' }),
      item({ id: '3', type: 'exame', status: 'realizado' }),
      item({ id: '4', type: 'consulta', status: 'pendente' }),
      item({ id: '5', type: 'solicitacao', status: 'pendente' }),
    ]);
    expect(resumo.find((entry) => entry.type === 'exame')).toEqual({ type: 'exame', total: 3, scheduled: 1, waiting: 1 });
    expect(resumo.find((entry) => entry.type === 'consulta')).toEqual({ type: 'consulta', total: 1, scheduled: 0, waiting: 1 });
    expect(resumo.find((entry) => entry.type === 'retorno')?.total).toBe(0);
  });

  it('escolhe o próximo agendado que ainda não passou', () => {
    const items = [
      item({ id: 'passado', date: '2026-10-01' }),
      item({ id: 'depois', date: '2026-10-25', time: '08:00' }),
      item({ id: 'proximo', date: '2026-10-22', time: '15:30' }),
      item({ id: 'cedo', date: '2026-10-22', time: '09:00' }),
      item({ id: 'pendente', date: '2026-10-21', status: 'pendente' }),
    ];
    expect(findNextScheduled(items, '2026-10-21')?.id).toBe('cedo');
  });

  it('considera atendimento marcado para hoje como próximo e devolve null sem agendados futuros', () => {
    expect(findNextScheduled([item({ id: 'hoje', date: '2026-10-21' })], '2026-10-21')?.id).toBe('hoje');
    expect(findNextScheduled([item({ date: '2026-10-01' })], '2026-10-21')).toBeNull();
    expect(findNextScheduled([], '2026-10-21')).toBeNull();
  });

  it('formata a data em partes sem depender de fuso horário', () => {
    expect(dateParts('2026-10-20')).toEqual({ day: '20', month: 'out', weekday: 'terça-feira' });
    expect(dateParts('2026-01-04')).toEqual({ day: '4', month: 'jan', weekday: 'domingo' });
  });

  it('gera a data de hoje no formato AAAA-MM-DD', () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
