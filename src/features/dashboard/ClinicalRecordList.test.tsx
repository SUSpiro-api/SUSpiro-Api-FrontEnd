import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClinicalRecordList } from './ClinicalRecordList';
import type { ClinicalRecord, Patient } from './types';

const patient: Patient = {
  id: 1,
  name: 'João da Silva',
  cpf: '111.444.777-35',
  birthDate: '1987-04-18',
};

const records: ClinicalRecord[] = [
  {
    id: 1,
    patientId: '00000000-0000-4000-8000-000000000001',
    date: '2026-10-12',
    time: '09:00',
    type: 'consulta',
    title: 'Consulta clínica',
    status: 'agendado',
    priority: 'normal',
  },
  {
    id: 2,
    patientId: '00000000-0000-4000-8000-000000000001',
    date: '2026-10-14',
    type: 'exame',
    title: 'Hemograma completo',
    observation: 'Jejum de 8 horas orientado.',
    status: 'pendente',
    priority: 'urgente',
  },
];

function renderList() {
  render(
    <ClinicalRecordList
      records={records}
      selectedPatient={patient}
      onCreate={() => {}}
    />,
  );
}

function tab(name: string): HTMLElement {
  return screen.getByRole('tab', { name: new RegExp(name, 'i') });
}

describe('ClinicalRecordList', () => {
  it('não repete o nome do paciente em cada linha: ele já está no título do cartão', () => {
    renderList();

    expect(screen.getByText('Histórico de João da Silva')).toBeInTheDocument();
    expect(screen.queryAllByText(/João da Silva ·/)).toHaveLength(0);
    expect(screen.getByText(/Consulta · 12\/10\/2026 · 09:00/)).toBeInTheDocument();
    expect(screen.getByText('Jejum de 8 horas orientado.')).toBeInTheDocument();
  });

  it('segue o padrão de teclado de abas: setas movem foco e seleção juntas', () => {
    renderList();

    const all = screen.getAllByRole('tab');
    expect(all[0]).toHaveAttribute('aria-selected', 'true');
    expect(all[1]).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(all[0], { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Consultas/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Consultas/ })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /Todos/ })).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(screen.getByRole('tab', { name: /Consultas/ }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: /Todos/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Todos/ })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('tab', { name: /Todos/ }), { key: 'End' });
    expect(screen.getByRole('tab', { name: /Encaminhamentos/ })).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(screen.getByRole('tab', { name: /Encaminhamentos/ }), { key: 'Home' });
    expect(screen.getByRole('tab', { name: /Todos/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('envolve o último filtro para o primeiro com a seta para a direita', () => {
    renderList();

    fireEvent.keyDown(tab('Encaminhamentos'), { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Todos/ })).toHaveAttribute('aria-selected', 'true');
  });
});
