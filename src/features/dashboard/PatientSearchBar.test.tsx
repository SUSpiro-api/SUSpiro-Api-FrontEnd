import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatientSearchBar } from './PatientSearchBar';
import { findPatientByCpf, patients } from './data';

function renderBar(onFound = vi.fn()) {
  const inputRef = createRef<HTMLInputElement>();
  render(<PatientSearchBar inputRef={inputRef} onFound={onFound} findPatient={findPatientByCpf} />);
  return { onFound, input: screen.getByLabelText('Buscar paciente pelo CPF') as HTMLInputElement };
}

describe('PatientSearchBar', () => {
  it('aplica máscara ao CPF enquanto o médico digita', () => {
    const { input } = renderBar();
    fireEvent.change(input, { target: { value: '52998224725' } });
    expect(input.value).toBe('529.982.247-25');
  });

  it('localiza o paciente ao enviar um CPF válido', () => {
    const { onFound, input } = renderBar();
    fireEvent.change(input, { target: { value: patients[0].cpf } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onFound).toHaveBeenCalledWith(patients[0]);
  });

  it('mostra erro para CPF inválido e para CPF sem cadastro', () => {
    const { onFound, input } = renderBar();

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('CPF válido');

    fireEvent.change(input, { target: { value: '11144477735' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Nenhum paciente');
    expect(onFound).not.toHaveBeenCalled();
  });

  it('foca o campo com o atalho "/" fora de campos de texto', () => {
    const { input } = renderBar();
    fireEvent.keyDown(document.body, { key: '/' });
    expect(input).toHaveFocus();
  });
});
