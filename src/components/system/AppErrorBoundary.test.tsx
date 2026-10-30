import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function FailingPage({ shouldFail }: { shouldFail: boolean }) {
  if (shouldFail) throw new Error('Falha de renderização simulada');
  return <h1>Central de agendamento</h1>;
}

function RouteHarness() {
  const [route, setRoute] = useState<'broken' | 'central'>('broken');
  return (
    <>
      <button type="button" onClick={() => setRoute('central')}>Abrir central</button>
      <AppErrorBoundary resetKey={route}>
        <FailingPage shouldFail={route === 'broken'} />
      </AppErrorBoundary>
    </>
  );
}

function StatefulPage({ route }: { route: string }) {
  const [patient, setPatient] = useState('Nenhum');
  return (
    <section>
      <h2>{route}</h2>
      <p>Paciente selecionado: {patient}</p>
      <button type="button" onClick={() => setPatient('Mariana Oliveira Santos')}>Selecionar paciente</button>
    </section>
  );
}

function StatePreservingHarness() {
  const [route, setRoute] = useState('/dashboard');
  return (
    <>
      <button type="button" onClick={() => setRoute('/dashboard/atendimento')}>Abrir atendimento</button>
      <AppErrorBoundary resetKey={route}>
        <StatefulPage route={route} />
      </AppErrorBoundary>
    </>
  );
}

describe('AppErrorBoundary', () => {
  it('recupera a interface quando o usuário navega para outra rota', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<RouteHarness />);

    expect(screen.getByRole('heading', { name: 'Não foi possível carregar esta tela' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir central' }));

    expect(screen.getByRole('heading', { name: 'Central de agendamento' })).toBeInTheDocument();
  });

  it('preserva o estado do atendimento ao navegar entre rotas do dashboard', () => {
    render(<StatePreservingHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Selecionar paciente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir atendimento' }));

    expect(screen.getByText('Paciente selecionado: Mariana Oliveira Santos')).toBeInTheDocument();
  });
});
