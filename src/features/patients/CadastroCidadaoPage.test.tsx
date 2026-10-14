import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CadastroCidadaoPage } from './CadastroCidadaoPage';
import * as service from './service';

describe('CadastroCidadaoPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('confirms the registration with masked personal data and lets the user register another', async () => {
    vi.spyOn(service, 'cadastrarPaciente').mockResolvedValue({
      id: 1,
      nome: 'Maria da Silva',
      cpf: '52998224725',
      dataNascimento: '1990-05-20',
      numeroSus: '123456789012345',
      telefone: null,
      criadoEm: '2026-09-29T10:00:00',
    });
    const onVoltar = vi.fn();
    render(<CadastroCidadaoPage onVoltar={onVoltar} />);
    expect(screen.getByText('Todos os campos são obrigatórios, exceto o telefone.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria da Silva' } });
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('Data de nascimento'), { target: { value: '1990-05-20' } });
    fireEvent.change(screen.getByLabelText('Número do CNS'), { target: { value: '123456789012345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar cidadão' }));

    expect(await screen.findByText('Cidadão cadastrado com sucesso')).toBeInTheDocument();
    expect(screen.queryByText('Todos os campos são obrigatórios, exceto o telefone.')).not.toBeInTheDocument();
    expect(screen.getByText('Maria da Silva')).toBeInTheDocument();
    expect(screen.getByText('•••.•••.•••-25')).toBeInTheDocument();
    expect(screen.getByText('•••••••••••2345')).toBeInTheDocument();
    expect(screen.queryByText('52998224725')).not.toBeInTheDocument();
    expect(screen.queryByText('123456789012345')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(onVoltar).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar outro cidadão' }));
    await waitFor(() =>
      expect(screen.getByRole('form', { name: 'Formulário de cadastro de cidadão' })).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Nome completo')).toHaveValue('');
  });
});
