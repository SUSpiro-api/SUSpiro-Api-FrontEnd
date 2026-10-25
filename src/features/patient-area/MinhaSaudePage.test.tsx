// Testa o painel de saúde do paciente.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MinhaSaudePage } from './MinhaSaudePage';
import * as patientData from './data';
import type { CareItem } from './data';
import type { AuthUser } from '../auth/types';

const paciente: AuthUser = { sub: '16899546043', nome: 'Beatriz Almeida', perfil: 'PACIENTE' };

const jornada: CareItem[] = [
  {
    id: 'guia-40',
    type: 'exame',
    title: 'Ecocardiograma',
    status: 'agendado',
    date: '2026-10-20',
    time: '09:00',
    professional: 'Dra. Marina Duarte',
    location: 'Clínica A+',
    note: null,
    guideNumber: 40,
    urgent: false,
    source: 'guia',
  },
  {
    id: 'guia-41',
    type: 'encaminhamento',
    title: 'Ortopedia',
    status: 'pendente',
    date: '2026-10-18',
    time: null,
    professional: 'Dra. Marina Duarte',
    note: 'Avaliação da coluna.',
    guideNumber: 41,
    urgent: true,
    source: 'guia',
  },
  {
    id: 'guia-39',
    type: 'retorno',
    title: 'Retorno clínico',
    status: 'cancelado',
    date: '2026-10-10',
    time: null,
    professional: null,
    note: null,
    urgent: false,
    source: 'guia',
  },
  {
    id: 'registro-6',
    type: 'exame',
    title: 'Hemograma',
    status: 'realizado',
    date: '2026-09-10',
    time: null,
    professional: null,
    note: null,
    urgent: false,
    source: 'registro',
  },
];

function carregarJornada(items: CareItem[], fromServer = true, demoPreview = false) {
  return vi.spyOn(patientData, 'loadPatientCareData').mockResolvedValue({ items, fromServer, demoPreview });
}

describe('MinhaSaudePage', () => {
  beforeEach(() => vi.restoreAllMocks());
  afterEach(() => vi.useRealTimers());

  it('cumprimenta o paciente e mostra o total de cada tipo de atendimento', async () => {
    carregarJornada(jornada);
    render(<MinhaSaudePage user={paciente} />);

    expect(await screen.findByText('Olá, Beatriz Almeida. Acompanhe suas consultas, exames, retornos e encaminhamentos em um só lugar.')).toBeInTheDocument();

    const totais: Record<string, string> = { Consultas: '0', Exames: '2', Retornos: '1', Encaminhamentos: '1' };
    for (const [nome, total] of Object.entries(totais)) {
      const cartao = screen.getByRole('heading', { level: 3, name: nome }).closest('article')!;
      expect(cartao.querySelector('.care-stat__value')).toHaveTextContent(total);
    }

    const exames = screen.getByRole('heading', { level: 3, name: 'Exames' }).closest('article')!;
    expect(exames).toHaveTextContent('1 com data marcada · 0 aguardando');
    const encaminhamentos = screen.getByRole('heading', { level: 3, name: 'Encaminhamentos' }).closest('article')!;
    expect(encaminhamentos).toHaveTextContent('0 com data marcada · 1 aguardando');
  });

  it('destaca o próximo atendimento com data marcada e abre os detalhes dele', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-19T12:00:00'));
    carregarJornada(jornada);
    render(<MinhaSaudePage user={paciente} />);

    const destaque = await screen.findByLabelText('Próximo atendimento');
    expect(destaque).toHaveTextContent('Exame · Ecocardiograma');
    expect(destaque).toHaveTextContent('terça-feira, às 09:00 · Dra. Marina Duarte');
    expect(destaque).toHaveTextContent('Clínica A+');
    expect(destaque).toHaveTextContent('20');
    expect(destaque).toHaveTextContent('out');

    fireEvent.click(within(destaque).getByRole('button', { name: 'Ver detalhes' }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('Nº 40');
  });

  it('avisa que não há atendimento marcado e quantos aguardam a recepção', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-21T12:00:00'));
    carregarJornada(jornada);
    render(<MinhaSaudePage user={paciente} />);

    const destaque = await screen.findByLabelText('Próximo atendimento');
    expect(destaque).toHaveTextContent('Nenhum atendimento marcado');
    expect(destaque).toHaveTextContent('1 solicitação aguarda data e horário da recepção.');
  });

  it('mantém orientações e proteção da conta fora do dashboard principal', async () => {
    carregarJornada(jornada);
    render(<MinhaSaudePage user={paciente} />);

    await screen.findByRole('heading', { level: 2, name: 'Próximos atendimentos' });
    expect(screen.queryByRole('heading', { level: 2, name: 'Antes do atendimento' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Entenda as situações' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Em caso de urgência' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Trocar a minha senha' })).not.toBeInTheDocument();
  });

  it('organiza os atendimentos por situação e destaca a urgência', async () => {
    carregarJornada(jornada);
    render(<MinhaSaudePage user={paciente} />);

    const proximos = (await screen.findByRole('heading', { level: 2, name: 'Próximos atendimentos' })).closest('section')!;
    expect(proximos).toHaveTextContent('Ecocardiograma');
    expect(proximos).toHaveTextContent('20/10/2026 às 09:00');
    expect(proximos).toHaveTextContent('Agendado');

    const aguardando = screen.getByRole('heading', { level: 2, name: 'Aguardando agendamento' }).closest('section')!;
    expect(aguardando).toHaveTextContent('Encaminhamento · Ortopedia');
    expect(aguardando).toHaveTextContent('Desejada para 18/10/2026');
    expect(aguardando).toHaveTextContent('Urgente');

    const historico = screen.getByRole('heading', { level: 2, name: 'Histórico' }).closest('section')!;
    expect(historico).toHaveTextContent('Exame · Hemograma');
    expect(historico).toHaveTextContent('Realizado');
    expect(historico).toHaveTextContent('Retorno clínico');
    expect(historico).toHaveTextContent('Cancelado');
  });


  it('mostra tipo, especialidade ou exame e código com hierarquia clara na lista', async () => {
    const consulta: CareItem = {
      ...jornada[0],
      id: 'guia-52',
      type: 'consulta',
      title: 'Neurologia',
      guideNumber: 52,
    };
    carregarJornada([consulta, jornada[0]]);
    render(<MinhaSaudePage user={paciente} />);

    const consultaRow = await screen.findByRole('button', { name: /Consulta · Neurologia/ });
    expect(consultaRow).toHaveTextContent('Código: GUIA-52');
    expect(consultaRow).toHaveTextContent('20/10/2026 às 09:00');

    const exameRow = screen.getByRole('button', { name: /Exame · Ecocardiograma/ });
    expect(exameRow).toHaveTextContent('Código: GUIA-40');
    expect(exameRow).toHaveTextContent('Clínica A+');
  });

  it('mostra o estado vazio quando o paciente não tem atendimentos', async () => {
    carregarJornada([]);
    render(<MinhaSaudePage user={paciente} />);

    expect(await screen.findByText('Tudo calmo por aqui')).toBeInTheDocument();
    expect(screen.queryByText('Próximos atendimentos')).not.toBeInTheDocument();

    for (const nome of ['Consultas', 'Exames', 'Retornos', 'Encaminhamentos']) {
      const cartao = screen.getByRole('heading', { level: 3, name: nome }).closest('article')!;
      expect(cartao.querySelector('.care-stat__value')).toHaveTextContent('0');
      expect(cartao).toHaveTextContent('Nada registrado ainda');
    }
    expect(screen.getByLabelText('Próximo atendimento')).toHaveTextContent('Nenhum atendimento marcado');
  });

  it('avisa quando só consegue mostrar os dados do dispositivo', async () => {
    carregarJornada(jornada, false);
    render(<MinhaSaudePage user={paciente} />);

    expect(await screen.findByText(/Não foi possível consultar seus atendimentos com segurança/)).toBeInTheDocument();
  });

  it('avisa quando a pré-visualização do admin usa a jornada de demonstração', async () => {
    carregarJornada(jornada, true, true);
    render(<MinhaSaudePage user={paciente} preview />);

    expect(await screen.findByText(/Pré-visualização da área do paciente com uma jornada de demonstração/)).toBeInTheDocument();
  });

  it('abre os detalhes do atendimento ao clicar nele', async () => {
    carregarJornada(jornada);
    render(<MinhaSaudePage user={paciente} />);

    fireEvent.click(await screen.findByText(/Exame · Ecocardiograma/));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Ecocardiograma');
    expect(dialog).toHaveTextContent('Exame');
    expect(dialog).toHaveTextContent('Data e horário');
    expect(dialog).toHaveTextContent('20/10/2026 às 09:00');
    expect(dialog).toHaveTextContent('Local de atendimento');
    expect(dialog).toHaveTextContent('Clínica A+');
    expect(dialog).toHaveTextContent('Dra. Marina Duarte');
    expect(dialog).toHaveTextContent('Nº 40');

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByText('Data e horário')).not.toBeInTheDocument());
  });

  it('mostra a urgência, a data desejada e a observação nos detalhes', async () => {
    carregarJornada(jornada);
    render(<MinhaSaudePage user={paciente} />);

    fireEvent.click(await screen.findByText(/Encaminhamento · Ortopedia/));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Pendente');
    expect(dialog).toHaveTextContent('Urgente');
    expect(dialog).toHaveTextContent('Data desejada');
    expect(dialog).toHaveTextContent('18/10/2026');
    expect(dialog).toHaveTextContent('Avaliação da coluna.');
  });
});
