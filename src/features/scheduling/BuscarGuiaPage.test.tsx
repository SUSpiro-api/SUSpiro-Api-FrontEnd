import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BuscarGuiaPage } from './BuscarGuiaPage';
import * as schedulingData from './data';
import type { Guide } from '../guides';

const guias: Guide[] = [
  {
    id: 41,
    protocolo: 'SUS-ABC234DEFG',
    pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
    pacienteNome: 'João Oliveira',
    pacienteCpf: '39053344705',
    tipo: 'CONSULTA',
    especialidade: 'Cardiologia',
    detalhe: null,
    dataSolicitada: '2026-10-17',
    observacao: 'Avaliação cardiológica.',
    prioridade: 'URGENTE',
    status: 'AGUARDANDO_AGENDAMENTO',
    solicitanteId: 1,
    solicitanteNome: 'Dra. Marina Duarte',
    dataAgendamento: null,
    horaAgendamento: null,
    agendadoPorId: null,
    agendadoPorNome: null,
    criadoEm: '2026-10-15T10:00:00Z',
  },
  {
    id: 40,
    protocolo: 'SUS-HJK567LMNP',
    pacienteId: '7cf9439e-2b25-4fa5-b25b-62031daf2ed7',
    pacienteNome: 'Ana Costa',
    pacienteCpf: '93541134780',
    tipo: 'EXAME',
    especialidade: null,
    detalhe: 'Ecocardiograma',
    dataSolicitada: '2026-10-16',
    observacao: null,
    prioridade: 'NORMAL',
    status: 'AGENDADO',
    solicitanteId: 1,
    solicitanteNome: 'Dra. Marina Duarte',
    dataAgendamento: '2026-10-20',
    horaAgendamento: '09:00',
    agendadoPorId: 2,
    agendadoPorNome: 'Camila Rocha',
    criadoEm: '2026-10-14T08:00:00Z',
  },
  {
    id: 39,
    protocolo: 'SUS-QRST234VWXY',
    pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
    pacienteNome: 'João Oliveira',
    pacienteCpf: '39053344705',
    tipo: 'RETORNO',
    especialidade: null,
    detalhe: 'Retorno clínico',
    dataSolicitada: '2026-10-19',
    observacao: null,
    prioridade: 'NORMAL',
    status: 'CANCELADO',
    solicitanteId: 1,
    solicitanteNome: 'Dra. Marina Duarte',
    dataAgendamento: null,
    horaAgendamento: null,
    agendadoPorId: null,
    agendadoPorNome: null,
    criadoEm: '2026-10-13T08:00:00Z',
  },
];

function carregarDados() {
  return vi.spyOn(schedulingData, 'loadSchedulingSearchData').mockResolvedValue({
    guides: guias,
    patients: [],
    fromServer: true,
  });
}

async function buscar(termo: string) {
  fireEvent.change(screen.getByLabelText('Buscar guia'), { target: { value: termo } });
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
  await waitFor(() => expect(screen.getByRole('region', { name: 'Resultado da busca' })).not.toBeEmptyDOMElement());
}

describe('BuscarGuiaPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('encontra a guia pelo número e mostra o agendamento com data e hora', async () => {
    carregarDados();
    render(<BuscarGuiaPage />);

    await buscar('40');

    expect(screen.getByText('Protocolo SUS-HJK567LMNP')).toBeInTheDocument();
    expect(screen.getByText('Agendado · 20/10/2026 às 09:00')).toBeInTheDocument();
    expect(screen.getByText('Ana Costa')).toBeInTheDocument();
  });

  it('encontra as guias de um paciente pelo nome e lista a urgente primeiro', async () => {
    carregarDados();
    render(<BuscarGuiaPage />);

    await buscar('João');

    const cartoes = screen.getAllByText(/Protocolo SUS-/);
    expect(cartoes).toHaveLength(2);
    expect(cartoes[0]).toHaveTextContent('Protocolo SUS-ABC234DEFG');
    expect(screen.getByText('Urgente')).toBeInTheDocument();
    expect(screen.getByText('Cancelado')).toBeInTheDocument();
  });

  it('avisa quando nenhuma guia é encontrada', async () => {
    carregarDados();
    render(<BuscarGuiaPage />);

    await buscar('99999');

    expect(screen.getByText('Nenhuma guia encontrada.')).toBeInTheDocument();
  });
});
