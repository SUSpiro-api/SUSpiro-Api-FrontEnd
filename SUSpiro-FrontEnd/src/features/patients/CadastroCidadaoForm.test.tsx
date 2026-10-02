import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../core/api/httpClient';
import { CadastroCidadaoForm } from './CadastroCidadaoForm';
import * as service from './service';

const paciente = {
  id: 1,
  nome: 'Maria da Silva',
  cpf: '52998224725',
  dataNascimento: '1990-05-20',
  numeroSus: '123456789012345',
  telefone: null,
  criadoEm: '2026-09-29T10:00:00',
};

function preencher(overrides: Partial<Record<'nome' | 'cpf' | 'data' | 'cns', string>> = {}) {
  const values = { nome: 'Maria da Silva', cpf: '52998224725', data: '1990-05-20', cns: '123456789012345', ...overrides };

  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: values.nome } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: values.cpf } });
  fireEvent.change(screen.getByLabelText('Data de nascimento'), { target: { value: values.data } });
  fireEvent.change(screen.getByLabelText('Número do CNS'), { target: { value: values.cns } });
}

const enviar = () => fireEvent.click(screen.getByRole('button', { name: 'Cadastrar cidadão' }));

describe('CadastroCidadaoForm', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shows the errors, does not call the API and focuses the first invalid field', async () => {
    const spy = vi.spyOn(service, 'cadastrarPaciente');
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);

    enviar();

    expect(await screen.findByText('Informe o nome completo.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data de nascimento.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveFocus();
    expect(spy).not.toHaveBeenCalled();
  });

  it('rejects a birth date that is not in the past, as the back-end does', async () => {
    const spy = vi.spyOn(service, 'cadastrarPaciente');
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);

    preencher({ data: '2999-01-01' });
    enviar();

    expect(await screen.findByText('A data de nascimento deve estar no passado.')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de nascimento')).toHaveFocus();
    expect(spy).not.toHaveBeenCalled();
  });

  it('keeps only digits in the CNS, even when a formatted number is pasted', () => {
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);

    const cns = screen.getByLabelText('Número do CNS');
    fireEvent.change(cns, { target: { value: '123 456 789 012 345' } });

    expect(cns).toHaveValue('123456789012345');
  });

  it('sends the data and reports the created citizen', async () => {
    const spy = vi.spyOn(service, 'cadastrarPaciente').mockResolvedValue(paciente);
    const onSucesso = vi.fn();
    render(<CadastroCidadaoForm onSucesso={onSucesso} onCancelar={vi.fn()} />);

    preencher();
    enviar();

    await waitFor(() => expect(onSucesso).toHaveBeenCalledWith(paciente));
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Maria da Silva', dataNascimento: '1990-05-20', numeroSus: '123456789012345' }),
    );
  });

  it('shows the message returned by the back-end', async () => {
    vi.spyOn(service, 'cadastrarPaciente').mockRejectedValue(
      new ApiError('Já existe um cidadão cadastrado com esse CPF.', 409),
    );
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);

    preencher();
    enviar();

    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe um cidadão cadastrado com esse CPF.');
  });

  it('cancels', () => {
    const onCancelar = vi.fn();
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={onCancelar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancelar).toHaveBeenCalledTimes(1);
  });
});
