import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppointmentSuccessModal } from './AppointmentSuccessModal';
import type { Guide } from '../guides';

const guide: Guide = {
  id: 42,
  protocolo: 'SUS-2026-000042',
  pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
  pacienteNome: 'Pessoa Sintética',
  pacienteCpf: '11144477735',
  tipo: 'CONSULTA',
  especialidade: 'Cardiologia',
  dataSolicitada: '2026-11-10',
  prioridade: 'NORMAL',
  status: 'AGENDADO',
  solicitanteId: 7,
  solicitanteNome: 'Profissional Sintético',
  dataAgendamento: '2026-11-10',
  horaAgendamento: '08:30',
  estabelecimentoNome: 'Unidade de Saúde Exemplo',
  estabelecimentoEndereco: 'Rua das Flores, 120',
  estabelecimentoCidade: 'Cotia',
  estabelecimentoEstado: 'SP',
  criadoEm: '2026-10-30T10:00:00',
};

describe('AppointmentSuccessModal', () => {
  it('abre uma confirmação central com os dados do agendamento', () => {
    render(<AppointmentSuccessModal guide={guide} onClose={vi.fn()} />);

    const dialog = document.querySelector('dialog.appointment-success-modal');
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByRole('heading', { name: 'Atendimento agendado' })).toBeInTheDocument();
    expect(screen.getByText('Pessoa Sintética')).toBeInTheDocument();
    expect(screen.getByText('08:30')).toBeInTheDocument();
    expect(screen.getByText(/Rua das Flores, 120/)).toBeInTheDocument();
    expect(screen.getByText('SUS-2026-000042')).toBeInTheDocument();
  });

  it('fecha pela ação principal', () => {
    const onClose = vi.fn();
    render(<AppointmentSuccessModal guide={guide} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
