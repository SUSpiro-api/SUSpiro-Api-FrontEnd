import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CadastroFuncionarioForm } from './CadastroFuncionarioForm';
import { ApiError } from '../../api/httpClient';
import * as service from './service';

describe('CadastroFuncionarioForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function preencherFormularioValido() {
    fireEvent.change(screen.getByLabelText('Nome completo'), {
      target: { value: 'Maria da Silva' },
    });
    fireEvent.change(screen.getByLabelText('CPF'), {
      target: { value: '52998224725' },
    });
    fireEvent.change(screen.getByLabelText('Senha provisória'), {
      target: { value: 'senha1234' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar senha'), {
      target: { value: 'senha1234' },
    });
  }

  it('shows field validation errors and does not call the API with invalid data', async () => {
    const cadastrarSpy = vi.spyOn(service, 'cadastrarFuncionario');

    render(
      <CadastroFuncionarioForm
        podeCriarAdmin={false}
        onSucesso={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));

    expect(
      await screen.findByText('Informe o nome completo.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe um CPF válido com 11 dígitos.')).toBeInTheDocument();
    expect(screen.getByText('Informe uma senha.')).toBeInTheDocument();
    expect(cadastrarSpy).not.toHaveBeenCalled();
  });

  it('shows "CPF já cadastrado" error returned by the backend', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockRejectedValue(
      new ApiError('Já existe um usuário cadastrado com esse CPF.', 409, 'CPF_DUPLICADO'),
    );

    render(
      <CadastroFuncionarioForm
        podeCriarAdmin={false}
        onSucesso={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    preencherFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));

    expect(
      await screen.findByText('Já existe um usuário cadastrado com esse CPF.'),
    ).toBeInTheDocument();
  });

  it('shows "sem permissão" error when submitted without admin auth', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockRejectedValue(
      new ApiError('Você não tem permissão para realizar essa ação.', 403, 'ACESSO_NEGADO'),
    );

    render(
      <CadastroFuncionarioForm
        podeCriarAdmin={false}
        onSucesso={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    preencherFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));

    expect(
      await screen.findByText('Você não tem permissão para realizar essa ação.'),
    ).toBeInTheDocument();
  });

  it('calls onSucesso when the registration succeeds', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockResolvedValue({
      id: 1,
      nome: 'Maria da Silva',
      cpf: '52998224725',
      perfil: 'USUARIO',
      ativo: true,
    });

    const onSucesso = vi.fn();

    render(
      <CadastroFuncionarioForm
        podeCriarAdmin={false}
        onSucesso={onSucesso}
        onCancelar={vi.fn()}
      />,
    );

    preencherFormularioValido();
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));

    await waitFor(() => expect(onSucesso).toHaveBeenCalledTimes(1));
  });

  it('does not show the "Administrador" option when podeCriarAdmin is false', () => {
    render(
      <CadastroFuncionarioForm
        podeCriarAdmin={false}
        onSucesso={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.queryByText('Administrador')).not.toBeInTheDocument();
  });

  it('shows the "Administrador" option when podeCriarAdmin is true', () => {
    render(
      <CadastroFuncionarioForm
        podeCriarAdmin
        onSucesso={vi.fn()}
        onCancelar={vi.fn()}
      />,
    );

    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });
});
