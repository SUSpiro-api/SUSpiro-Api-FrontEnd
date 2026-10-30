import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../api/httpClient';
import { CadastroCidadaoForm } from './CadastroCidadaoForm';
import * as service from './service';

const paciente = {
  id: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
  nome: 'Maria da Silva',
  cpfMascarado: '•••.•••.•••-25',
  convenio: 'Plano Exemplo',
  email: 'maria@example.com',
  contaCriada: true,
  criadoEm: '2026-09-29T10:00:00',
};

function preencher(overrides: Partial<Record<'nome' | 'cpf' | 'data' | 'convenio' | 'email', string>> = {}) {
  const values = { nome: 'Maria da Silva', cpf: '11144477735', data: '1990-05-20', convenio: 'Plano Exemplo', email: 'maria@example.com', ...overrides };
  fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: values.nome } });
  fireEvent.change(screen.getByLabelText('CPF'), { target: { value: values.cpf } });
  fireEvent.change(screen.getByLabelText('Data de nascimento'), { target: { value: values.data } });
  fireEvent.change(screen.getByLabelText('Nome do convênio'), { target: { value: values.convenio } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: values.email } });
  fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '01001000' } });
  fireEvent.change(screen.getByLabelText('Estado (UF)'), { target: { value: 'SP' } });
  fireEvent.change(screen.getByLabelText('Logradouro'), { target: { value: 'Praça da Sé' } });
  fireEvent.change(screen.getByLabelText('Número'), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText('Bairro'), { target: { value: 'Sé' } });
  fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'São Paulo' } });
}

const enviar = () => fireEvent.click(screen.getByRole('button', { name: 'Cadastrar paciente' }));

describe('CadastroCidadaoForm', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shows errors and focuses the first invalid field', async () => {
    const spy = vi.spyOn(service, 'cadastrarPaciente');
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    enviar();
    expect(await screen.findByText('Informe o nome completo.')).toBeInTheDocument();
    expect(screen.getByText('Informe a data de nascimento.')).toBeInTheDocument();
    expect(screen.getByText('Informe um e-mail para recuperação de senha.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveFocus();
    expect(spy).not.toHaveBeenCalled();
  });

  it('rejects a birth date that is not in the past', async () => {
    const spy = vi.spyOn(service, 'cadastrarPaciente');
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    preencher({ data: '2999-01-01' });
    enviar();
    expect(await screen.findByText('A data de nascimento deve estar no passado.')).toBeInTheDocument();
    expect(screen.getByLabelText('Data de nascimento')).toHaveFocus();
    expect(spy).not.toHaveBeenCalled();
  });

  it('accepts an insurance name instead of a CNS number', () => {
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    const convenio = screen.getByLabelText('Nome do convênio');
    fireEvent.change(convenio, { target: { value: 'Saúde Mais' } });
    expect(convenio).toHaveValue('Saúde Mais');
  });

  it('sends the data and reports the created patient', async () => {
    const spy = vi.spyOn(service, 'cadastrarPaciente').mockResolvedValue(paciente);
    const onSucesso = vi.fn();
    render(<CadastroCidadaoForm onSucesso={onSucesso} onCancelar={vi.fn()} />);
    preencher();
    enviar();
    await waitFor(() => expect(onSucesso).toHaveBeenCalledWith(paciente));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Maria da Silva', dataNascimento: '1990-05-20', convenio: 'Plano Exemplo', email: 'maria@example.com', cep: '01001000', logradouro: 'Praça da Sé', numero: '100', bairro: 'Sé', cidade: 'São Paulo', estado: 'SP',
    }));
  });

  it('shows the message returned by the backend', async () => {
    vi.spyOn(service, 'cadastrarPaciente').mockRejectedValue(new ApiError('CPF já cadastrado para um paciente.', 409));
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    preencher();
    enviar();
    expect(await screen.findByRole('alert')).toHaveTextContent('CPF já cadastrado para um paciente.');
  });

  it('cancels', () => {
    const onCancelar = vi.fn();
    render(<CadastroCidadaoForm onSucesso={vi.fn()} onCancelar={onCancelar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });
});
