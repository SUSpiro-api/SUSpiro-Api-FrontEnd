import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Guide } from '../../guides';
import { GuideQueueItem } from './GuideQueueItem';

const guide: Guide = {
  id: 42,
  protocolo: 'SUS-2026-000042',
  pacienteId: 'f5e0aeb2-1c5d-4dd0-a51b-e0de68d8cc2d',
  pacienteNome: 'Paciente de Teste',
  pacienteCpf: '•••.•••.•••-35',
  tipo: 'CONSULTA',
  especialidade: 'Cardiologia',
  dataSolicitada: '2026-11-05',
  prioridade: 'NORMAL',
  status: 'AGUARDANDO_AGENDAMENTO',
  solicitanteId: 7,
  solicitanteNome: 'Dra. Ana',
  criadoEm: '2026-10-30T10:00:00',
};

describe('GuideQueueItem', () => {
  it('mantém consulta da fila disponível para médico sem permitir agendamento', () => {
    render(<ul><GuideQueueItem guide={guide} canSchedule={false} onSchedule={vi.fn()} /></ul>);
    expect(screen.getByText('Paciente de Teste')).toBeInTheDocument();
    expect(screen.getByText('Cardiologia')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agendar' })).not.toBeInTheDocument();
  });

  it('mantém a ação de agendamento para perfis autorizados', () => {
    render(<ul><GuideQueueItem guide={guide} canSchedule onSchedule={vi.fn()} /></ul>);
    expect(screen.getByRole('button', { name: 'Agendar' })).toBeInTheDocument();
  });
});
