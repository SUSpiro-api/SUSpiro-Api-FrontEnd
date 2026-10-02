import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CadastroFuncionarioPage } from './CadastroFuncionarioPage';
import * as service from './service';

describe('CadastroFuncionarioPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('focuses the first invalid field after a failed submit', async () => {
    render(<CadastroFuncionarioPage podeCriarAdmin={false} onVoltar={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));

    expect(await screen.findByText('Informe o nome completo.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome completo')).toHaveFocus();
  });

  it('shows the password rules before any error', () => {
    render(<CadastroFuncionarioPage podeCriarAdmin={false} onVoltar={vi.fn()} />);

    expect(screen.getByText('Mínimo de 8 caracteres, com letras e números.')).toBeInTheDocument();
  });

  it('confirms the registration using the profile name and a masked CPF', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockResolvedValue({
      id: 7,
      nome: 'João Souza',
      cpf: '52998224725',
      perfil: 'ENFERMEIRO',
      ativo: true,
    });
    render(<CadastroFuncionarioPage podeCriarAdmin={false} onVoltar={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'João Souza' } });
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('Senha provisória'), { target: { value: 'senha1234' } });
    fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'senha1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));

    expect(await screen.findByText('Funcionário cadastrado com sucesso')).toBeInTheDocument();
    expect(screen.getByText('Enfermeiro')).toBeInTheDocument();
    expect(screen.getByText('•••.•••.•••-25')).toBeInTheDocument();
    expect(screen.queryByText('ENFERMEIRO')).not.toBeInTheDocument();
  });
});
