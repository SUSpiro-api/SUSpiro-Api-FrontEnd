import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgendaCalendar } from './AgendaCalendar';
import { patients } from './data';
import type { ClinicalRecord } from './types';

const base = { priority: 'normal' as const, title: 'Consulta clínica' };

const records: ClinicalRecord[] = [
  { ...base, id: 1, patientId: 1, date: '2026-10-14', time: '09:00', type: 'consulta', status: 'agendado' },
  { ...base, id: 2, patientId: 2, date: '2026-10-14', type: 'exame', title: 'Hemograma', status: 'pendente', priority: 'urgente' },
  { ...base, id: 3, patientId: 1, date: '2026-10-10', scheduledDate: '2026-10-20', time: '14:30:00', type: 'retorno', title: 'Retorno', status: 'agendado' },
];

function renderAgenda(patient = null as (typeof patients)[number] | null) {
  render(<AgendaCalendar records={records} patients={patients} patient={patient} />);
}

describe('AgendaCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 14, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('abre no mês e no dia de hoje, com a agenda do dia', () => {
    renderAgenda();

    expect(screen.getByText('Outubro de 2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quarta-feira, 14 de outubro' })).toBeInTheDocument();
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('Hemograma')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^14 de outubro de 2026, 2 registros, 1 urgente/ })).toHaveAttribute('aria-current', 'date');
  });

  it('mostra o nome do paciente em cada registro da agenda geral', () => {
    renderAgenda();
    expect(screen.getByText(/João Oliveira/)).toBeInTheDocument();
  });

  it('filtra a agenda pelo paciente em atendimento', () => {
    renderAgenda(patients[0]);
    expect(screen.queryByText('Hemograma')).not.toBeInTheDocument();
    expect(screen.getByText('Registros de Paciente Teste SUSpiro.')).toBeInTheDocument();
  });

  it('usa a data do agendamento quando a guia já foi agendada', () => {
    renderAgenda();
    fireEvent.click(screen.getByRole('button', { name: /^20 de outubro de 2026/ }));

    expect(screen.getByText('14:30')).toBeInTheDocument();
    expect(screen.getAllByText('Retorno').length).toBeGreaterThan(0);
  });

  it('avisa quando o dia não tem registros', () => {
    renderAgenda();
    fireEvent.click(screen.getByRole('button', { name: /^15 de outubro de 2026/ }));
    expect(screen.getByText('Nenhum registro neste dia.')).toBeInTheDocument();
  });

  it('navega entre meses e volta para hoje', () => {
    renderAgenda();

    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(screen.getByText('Novembro de 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hoje' }));
    expect(screen.getByText('Outubro de 2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quarta-feira, 14 de outubro' })).toBeInTheDocument();
  });

  it('move o dia escolhido com as setas do teclado', () => {
    renderAgenda();
    const today = screen.getByRole('button', { name: /^14 de outubro de 2026/ });

    fireEvent.keyDown(today, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: 'Quinta-feira, 15 de outubro' })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('button', { name: /^15 de outubro de 2026/ }), { key: 'ArrowDown' });
    expect(screen.getByRole('heading', { name: 'Quinta-feira, 22 de outubro' })).toBeInTheDocument();
  });
});
