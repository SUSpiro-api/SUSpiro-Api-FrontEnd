import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GuideDetailsModal } from './GuideDetailsModal';
import type { RecentActivity } from './hooks/useDashboardOverview';

const activity: RecentActivity = {
  patientName: 'Mariana Oliveira Santos',
  record: {
    id: 17,
    patientId: '00000000-0000-4000-8000-000000000001',
    patientName: 'Mariana Oliveira Santos',
    patientCpf: '11144477735',
    date: '2026-11-05',
    type: 'retorno',
    title: 'Cardiologia',
    status: 'pendente',
    priority: 'urgente',
    guide: {
      id: 17,
      protocolo: 'SUS-RET-00017',
      pacienteId: '00000000-0000-4000-8000-000000000001',
      pacienteNome: 'Mariana Oliveira Santos',
      pacienteCpf: '11144477735',
      tipo: 'RETORNO',
      detalhe: 'Reavaliação cardiológica',
      dataSolicitada: '2026-11-05',
      observacao: 'Levar exames anteriores.',
      prioridade: 'URGENTE',
      status: 'AGUARDANDO_AGENDAMENTO',
      solicitanteId: 3,
      solicitanteNome: 'Dra. Ana',
      criadoEm: '2026-10-30T12:00:00',
    },
  },
};

describe('GuideDetailsModal', () => {
  it('shows guide information for the selected activity', () => {
    render(<GuideDetailsModal activity={activity} onClose={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Retorno' })).toBeInTheDocument();
    expect(screen.getByText('Mariana Oliveira Santos')).toBeInTheDocument();
    expect(screen.getByText('SUS-RET-00017')).toBeInTheDocument();
    expect(screen.getByText('Reavaliação cardiológica')).toBeInTheDocument();
    expect(screen.getByText('Levar exames anteriores.')).toBeInTheDocument();
    expect(screen.getByText('Dra. Ana')).toBeInTheDocument();
  });
});
