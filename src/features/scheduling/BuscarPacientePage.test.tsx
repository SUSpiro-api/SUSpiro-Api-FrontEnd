import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BuscarPacientePage } from './BuscarPacientePage';
import * as schedulingData from './data';
import type { Guide } from '../guides';

const guias: Guide[] = [
  {
    id: 38,
    pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
    pacienteNome: 'Beatriz Almeida',
    pacienteCpf: '16899546043',
    tipo: 'ENCAMINHAMENTO',
    especialidade: null,
    detalhe: 'Ortopedia',
    dataSolicitada: '2026-10-16',
    observacao: 'Dor lombar persistente.',
    prioridade: 'URGENTE',
    status: 'AGUARDANDO_AGENDAMENTO',
    solicitanteId: 1,
    solicitanteNome: 'Dra. Marina Duarte',
    dataAgendamento: null,
    horaAgendamento: null,
    agendadoPorId: null,
    agendadoPorNome: null,
    criadoEm: '2026-10-15T09:00:00Z',
  },
];

const pacientes = [
  { name: 'Beatriz Almeida', cpf: '16899546043', birthDate: '1965-02-11' },
  { name: 'Rui Amorim', cpf: '23845678902' },
];

function carregarDados() {
  vi.spyOn(schedulingData, 'loadSchedulingSearchData').mockResolvedValue({
    guides: guias,
    patients: pacientes,
    fromServer: true,
  });
  vi.spyOn(schedulingData, 'searchRegisteredPatients').mockImplementation(async (term) => {
    const normalized = term.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const digits = term.replace(/\D/g, '');
    return pacientes.filter((patient) => {
      const name = patient.name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return name.includes(normalized) || (digits.length > 0 && patient.cpf.replace(/\D/g, '').includes(digits));
    });
  });
}

async function buscar(termo: string) {
  fireEvent.change(screen.getByLabelText('Buscar paciente'), { target: { value: termo } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  await waitFor(() => expect(screen.getByRole('region', { name: 'Resultado da busca' })).not.toBeEmptyDOMElement());
}

describe('BuscarPacientePage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('localiza o paciente pelo nome e mostra a situação das guias dele', async () => {
    carregarDados();
    render(<BuscarPacientePage />);

    await buscar('Beatriz');

    expect(screen.getByText('Beatriz Almeida')).toBeInTheDocument();
    expect(screen.getByText('CPF 168.995.460-43 · nascimento 11/02/1965')).toBeInTheDocument();
    expect(screen.getByText('Encaminhamento · Ortopedia')).toBeInTheDocument();
    expect(screen.getByText('Aguardando agendamento')).toBeInTheDocument();
  });

  it('localiza o paciente pelos dígitos do CPF', async () => {
    carregarDados();
    render(<BuscarPacientePage />);

    await buscar('168.995');

    expect(screen.getByText('Beatriz Almeida')).toBeInTheDocument();
  });

  it('avisa quando o paciente não tem guias e quando nada é encontrado', async () => {
    carregarDados();
    render(<BuscarPacientePage />);

    await buscar('Rui');

    expect(screen.getByText('Nenhuma guia registrada para este paciente.')).toBeInTheDocument();

    await buscar('inexistente');

    expect(screen.getByText('Nenhum paciente encontrado.')).toBeInTheDocument();
  });

  it('mostra que está usando apenas este dispositivo quando a API falha', async () => {
    vi.spyOn(schedulingData, 'loadSchedulingSearchData').mockResolvedValue({
      guides: [],
      patients: pacientes,
      fromServer: false,
    });
    render(<BuscarPacientePage />);

    expect(await screen.findByText(/apenas as guias registradas neste dispositivo/)).toBeInTheDocument();
  });
});
