import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OverviewStats } from './OverviewStats';
import type { ClinicalRecord } from './types';

const base = { patientId: '00000000-0000-4000-8000-000000000001', date: '2026-10-14', title: 'Registro', priority: 'normal' as const };

const records: ClinicalRecord[] = [
  { ...base, id: 1, type: 'consulta', status: 'agendado' },
  { ...base, id: 2, type: 'consulta', status: 'realizado' },
  { ...base, id: 3, type: 'exame', status: 'pendente', priority: 'urgente' },
  { ...base, id: 4, type: 'exame', status: 'cancelado' },
];

describe('OverviewStats', () => {
  it('conta só registros em aberto (agendado ou pendente) por tipo', () => {
    render(<OverviewStats records={records} />);

    const consultas = screen.getByRole('heading', { name: 'Consultas em aberto' }).closest('article')!;
    expect(consultas).toHaveTextContent('1');

    const exames = screen.getByRole('heading', { name: 'Exames em aberto' }).closest('article')!;
    expect(exames).toHaveTextContent('1 aguarda agendamento · 1 urgente');

    const retornos = screen.getByRole('heading', { name: 'Retornos em aberto' }).closest('article')!;
    expect(retornos).toHaveTextContent('0');
  });
});
