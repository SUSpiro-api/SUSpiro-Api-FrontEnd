import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CadastroCidadaoPage } from './CadastroCidadaoPage';
import * as service from './service';

describe('CadastroCidadaoPage', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('confirms registration and lets the user register another patient', async () => {
    vi.spyOn(service, 'cadastrarPaciente').mockResolvedValue({
      id: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
      nome: 'Maria da Silva', cpfMascarado: '•••.•••.•••-25', convenio: 'Plano Exemplo',
      email: 'maria@example.com', criadoEm: '2026-09-29T10:00:00', contaCriada: true,
    });
    const onVoltar = vi.fn();
    render(<CadastroCidadaoPage onVoltar={onVoltar} />);
    expect(screen.getByText('O e-mail é obrigatório para recuperação de senha; convênio e telefone são opcionais.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nome completo'), { target: { value: 'Maria da Silva' } });
    fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '52998224725' } });
    fireEvent.change(screen.getByLabelText('Data de nascimento'), { target: { value: '1990-05-20' } });
    fireEvent.change(screen.getByLabelText('Nome do convênio'), { target: { value: 'Plano Exemplo' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar paciente' }));

    expect(await screen.findByText('Paciente cadastrado com sucesso')).toBeInTheDocument();
    expect(screen.getByText('Maria da Silva')).toBeInTheDocument();
    expect(screen.getByText('•••.•••.•••-25')).toBeInTheDocument();
    expect(screen.getByText('Plano Exemplo')).toBeInTheDocument();
    expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    expect(screen.queryByText('52998224725')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(onVoltar).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar outro paciente' }));
    await waitFor(() => expect(screen.getByRole('form', { name: 'Formulário de cadastro de paciente' })).toBeInTheDocument());
    expect(screen.getByLabelText('Nome completo')).toHaveValue('');
  });
});
