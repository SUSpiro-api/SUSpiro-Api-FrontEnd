import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatientSummary } from './PatientSummary';

describe('PatientSummary', () => {
  it('renders the selected patient and its action buttons without crashing', () => {
    const onChangePatient = vi.fn();
    const onClearPatient = vi.fn();
    render(
      <PatientSummary
        patient={{ id: '00000000-0000-4000-8000-000000000001', name: 'Mariana Oliveira Santos', cpf: '11144477735', birthDate: '1990-05-20' }}
        onChangePatient={onChangePatient}
        onClearPatient={onClearPatient}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Mariana Oliveira Santos' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Trocar paciente/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpar paciente' }));
    expect(onChangePatient).toHaveBeenCalledOnce();
    expect(onClearPatient).toHaveBeenCalledOnce();
  });
});
