import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PatientSearchBar } from './PatientSearchBar';
import type { Patient } from './types';

const patient: Patient = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'João da Silva',
  cpf: '111.444.777-35',
  birthDate: '1987-04-18',
};

function renderBar(onFound = vi.fn()) {
  const inputRef = createRef<HTMLInputElement>();
  const findPatient = vi.fn(async (cpf: string) => cpf === patient.cpf ? patient : null);
  render(<PatientSearchBar inputRef={inputRef} onFound={onFound} findPatient={findPatient} />);
  return { onFound, input: screen.getByRole('textbox') as HTMLInputElement, button: screen.getByRole('button') };
}

describe('PatientSearchBar', () => {
  it('aplica máscara ao CPF enquanto o médico digita', () => {
    const { input } = renderBar();
    fireEvent.change(input, { target: { value: '11144477735' } });
    expect(input.value).toBe('111.444.777-35');
  });

  it('localiza o paciente retornado pela busca', async () => {
    const { onFound, input, button } = renderBar();
    fireEvent.change(input, { target: { value: patient.cpf } });
    fireEvent.click(button);
    await waitFor(() => expect(onFound).toHaveBeenCalledWith(patient));
  });

  it('mostra erro para CPF inválido e para CPF sem cadastro', async () => {
    const { onFound, input, button } = renderBar();

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '12345678909' } });
    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onFound).not.toHaveBeenCalled();
  });

  it('foca o campo com o atalho "/" fora de campos de texto', () => {
    const { input } = renderBar();
    fireEvent.keyDown(document.body, { key: '/' });
    expect(input).toHaveFocus();
  });
});
