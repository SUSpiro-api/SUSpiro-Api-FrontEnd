import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RecentPatientList } from './RecentPatientList';
import type { Patient } from './types';

const patients: Patient[] = [{
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Mariana Oliveira Santos',
  cpf: '11144477735',
}];

describe('RecentPatientList', () => {
  it('renders avatar, patient identity and navigation affordance in the same row', () => {
    render(<RecentPatientList patients={patients} onSelectPatient={vi.fn()} onOpenPatientSearch={vi.fn()} />);

    expect(screen.getByText('MS')).toBeInTheDocument();
    expect(screen.getByText('Mariana Oliveira Santos')).toBeInTheDocument();
    expect(screen.getByText('111.444.777-35')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir atendimento de Mariana Oliveira Santos' })).toBeInTheDocument();
  });

  it('opens the selected patient and keeps the empty state actionable', () => {
    const onSelectPatient = vi.fn();
    const onOpenPatientSearch = vi.fn();
    const view = render(<RecentPatientList patients={patients} onSelectPatient={onSelectPatient} onOpenPatientSearch={onOpenPatientSearch} />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir atendimento de Mariana Oliveira Santos' }));
    expect(onSelectPatient).toHaveBeenCalledWith(patients[0]);

    view.rerender(<RecentPatientList patients={[]} onSelectPatient={onSelectPatient} onOpenPatientSearch={onOpenPatientSearch} />);
    fireEvent.click(screen.getByRole('button', { name: 'Atender paciente' }));
    expect(onOpenPatientSearch).toHaveBeenCalledOnce();
  });
});
