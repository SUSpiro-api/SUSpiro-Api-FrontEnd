import { beforeEach, describe, expect, it } from 'vitest';
import { createGuideService } from './guideService';
import { LocalGuideRepository } from './localGuideRepository';
import { setToken } from '../auth/token';

function tokenFor(sub: string, nome: string, perfil = 'MEDICO'): string {
  const encode = (value: string) => btoa(value).replaceAll('=', '');
  const header = encode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = encode(JSON.stringify({ sub, nome, perfil, exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) }));
  return `${header}.${payload}.signature`;
}

const guideService = createGuideService(new LocalGuideRepository());
const createGuide = guideService.create;
const listMyGuides = guideService.listMy;
const listPendingGuides = guideService.listPending;
const scheduleGuide = guideService.schedule;

describe('guides application and repository', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    setToken(tokenFor('2', 'Dr. Teste'));
  });

  it('persiste a especialidade da consulta e coloca a guia na fila', async () => {
    const result = await createGuide({
      pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
      pacienteNome: 'Paciente Teste',
      pacienteCpf: '52998224725',
      tipo: 'CONSULTA',
      especialidade: 'Cardiologia',
      dataSolicitada: '2026-10-10',
      prioridade: 'NORMAL',
    });

    expect(result.status).toBe('AGUARDANDO_AGENDAMENTO');
    expect(result.especialidade).toBe('Cardiologia');
    expect((await listMyGuides())[0].solicitanteNome).toBe('Dr. Teste');
    expect((await listPendingGuides())).toHaveLength(1);
  });

  it('permite à recepção alterar a guia para agendada', async () => {
    const created = await createGuide({
      pacienteId: '08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1',
      pacienteNome: 'Paciente Teste',
      pacienteCpf: '52998224725',
      tipo: 'EXAME',
      detalhe: 'Hemograma',
      dataSolicitada: '2026-10-10',
      prioridade: 'NORMAL',
    });

    setToken(tokenFor('8', 'Recepção SUS', 'ATENDENTE'));
    const scheduled = await scheduleGuide(created.id, {
      dataAgendamento: '2026-10-11',
      horaAgendamento: '08:30',
    });

    expect(scheduled.status).toBe('AGENDADO');
    expect(scheduled.agendadoPorNome).toBe('Recepção SUS');
    expect(await listPendingGuides()).toHaveLength(0);
  });
});
