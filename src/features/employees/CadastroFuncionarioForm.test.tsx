import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CadastroFuncionarioForm } from './CadastroFuncionarioForm';
import { ApiError } from '../../api/httpClient';
import * as service from './service';

describe('CadastroFuncionarioForm', () => {
  beforeEach(() => vi.restoreAllMocks());

  function preencherFormularioValido() {
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria da Silva' } });
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('E-mail profissional'), { target: { value: 'maria@example.com' } });
  }

  it('shows validation errors and does not call API when input is invalid', async () => {
    const spy = vi.spyOn(service, 'cadastrarFuncionario');
    render(<CadastroFuncionarioForm podeCriarAdmin={false} onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));
    expect(await screen.findByText('Informe o nome completo.')).toBeInTheDocument();
    expect(screen.getByText('Informe um CPF válido com 11 dígitos.')).toBeInTheDocument();
    expect(screen.getByText('Informe o e-mail do funcionário.')).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it('shows backend errors', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockRejectedValue(new ApiError('Já existe um usuário cadastrado com este CPF', 409));
    render(<CadastroFuncionarioForm podeCriarAdmin={false} onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    preencherFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));
    expect(await screen.findByText('Já existe um usuário cadastrado com este CPF')).toBeInTheDocument();
  });

  it('shows permission errors from the API', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockRejectedValue(new ApiError('Você não tem permissão para realizar essa ação.', 403));
    render(<CadastroFuncionarioForm podeCriarAdmin={false} onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    preencherFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));
    expect(await screen.findByText('Você não tem permissão para realizar essa ação.')).toBeInTheDocument();
  });

  it('calls onSucesso when registration succeeds', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockResolvedValue({
      id: 1, nome: 'Maria da Silva', cpf: '52998224725', email: 'maria@example.com', perfil: 'ATENDENTE', ativo: true,
    });
    const onSucesso = vi.fn();
    render(<CadastroFuncionarioForm podeCriarAdmin={false} onSucesso={onSucesso} onCancelar={vi.fn()} />);
    preencherFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));
    await waitFor(() => expect(onSucesso).toHaveBeenCalledTimes(1));
  });

  it('shows only profile options allowed for a manager', () => {
    render(<CadastroFuncionarioForm podeCriarAdmin={false} onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByText('Recepcionista')).toBeInTheDocument();
    expect(screen.getByText('Enfermeiro')).toBeInTheDocument();
    expect(screen.getByText('Médico')).toBeInTheDocument();
    expect(screen.queryByText('Gerente')).not.toBeInTheDocument();
  });

  it('shows manager and clinical/reception profiles to the super administrator', () => {
    render(<CadastroFuncionarioForm podeCriarAdmin onSucesso={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByText('Gerente')).toBeInTheDocument();
    expect(screen.getByText('Recepcionista')).toBeInTheDocument();
    expect(screen.getByText('Enfermeiro')).toBeInTheDocument();
    expect(screen.getByText('Médico')).toBeInTheDocument();
  });
});
