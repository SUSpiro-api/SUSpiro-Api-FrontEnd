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

  it('requires a temporary password that must be changed on first access', () => {
    render(<CadastroFuncionarioPage podeCriarAdmin={false} onVoltar={vi.fn()} />);
    expect(screen.getByLabelText('Senha temporária')).toBeRequired();
    expect(screen.getByText(/deverá substituí-la por uma senha forte no primeiro acesso/i)).toBeInTheDocument();
  });

  it('confirms registration with profile, masked CPF and destination email', async () => {
    vi.spyOn(service, 'cadastrarFuncionario').mockResolvedValue({
      id: 7, nome: 'João Souza', cpf: '52998224725', email: 'joao@example.com', perfil: 'ENFERMEIRO', ativo: true,
    });
    render(<CadastroFuncionarioPage podeCriarAdmin={false} onVoltar={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'João Souza' } });
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('E-mail profissional'), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByLabelText('Senha temporária'), { target: { value: 'TempSenha#2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar funcionário' }));
    expect(await screen.findByText('Funcionário cadastrado com sucesso')).toBeInTheDocument();
    expect(screen.getByText('Enfermeiro')).toBeInTheDocument();
    expect(screen.getByText('•••.•••.•••-25')).toBeInTheDocument();
    expect(screen.getAllByText('joao@example.com').length).toBeGreaterThan(0);
    expect(screen.queryByText('ENFERMEIRO')).not.toBeInTheDocument();
  });
});
