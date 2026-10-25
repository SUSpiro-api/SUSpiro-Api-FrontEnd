// Página de busca de guia da central de agendamento.

import { useMemo, useState } from 'react';
import { MaterialIcon } from '../../components/icons';
import { guideDetail } from '../dashboard/guideLabels';
import type { Guide } from '../guides';
import { useSchedulingSearch } from './hooks/useSchedulingSearch';
import { matchesCpfDigits, matchesTerm } from './search';
import { SupportSearchBar } from './components/SupportSearchBar';
import { GuideSituationCard } from './components/GuideSituation';
import '../../components/layout/layout.css';
import '../dashboard/DashboardPage.css';
import './scheduling.css';

const INPUT_ID = 'support-guide-search';

const STATUS_ORDER: Record<Guide['status'], number> = {
  AGUARDANDO_AGENDAMENTO: 0,
  AGENDADO: 1,
  CANCELADO: 2,
};

export function BuscarGuiaPage() {
  const { guides, fromServer, loading } = useSchedulingSearch();
  const [termo, setTermo] = useState('');
  const [consultou, setConsultou] = useState(false);

  const resultados = useMemo(() => {
    if (!consultou) return [];
    const digits = termo.replace(/\D/g, '');

    const encontradas = guides.filter((guide) =>
      (digits.length > 0 && String(guide.id) === digits)
      || matchesTerm(termo, guide.pacienteNome, guideDetail(guide), guide.solicitanteNome)
      || matchesCpfDigits(termo, guide.pacienteCpf),
    );

    return encontradas.sort((first, second) => {
      // Em aberto primeiro; a mais recente no mesmo estado.
      const statusDelta = STATUS_ORDER[first.status] - STATUS_ORDER[second.status];
      if (statusDelta !== 0) return statusDelta;
      return second.criadoEm.localeCompare(first.criadoEm);
    });
  }, [consultou, guides, termo]);

  return (
    <div className="page support-page" id="buscar-guia">
      <header className="page__header">
        <h1 className="page__title">Buscar guia</h1>
        <p className="page__description">
          Consulte uma guia pelo número, pelo nome ou CPF do paciente para ver a situação do agendamento.
        </p>
      </header>

      <SupportSearchBar
        inputId={INPUT_ID}
        label="Buscar guia"
        placeholder="Número da guia, nome ou CPF do paciente"
        icon="assignment"
        buttonLabel="Buscar"
        hint="A busca inclui guias pendentes, agendadas e canceladas registradas no servidor."
        value={termo}
        onChange={(valor) => { setTermo(valor); setConsultou(false); }}
        onSubmit={() => setConsultou(true)}
      />

      {!fromServer && (
        <p className="support-notice" role="status">
          <MaterialIcon name="warning" size={18} aria-hidden="true" />
          Não foi possível falar com o servidor agora; a busca mostra apenas as guias registradas neste dispositivo.
        </p>
      )}

      <section className="support-results support-results--guides" aria-live="polite" aria-label="Resultado da busca">
        {loading ? (
          <SupportSkeleton />
        ) : consultou && resultados.length === 0 ? (
          <div className="support-empty">
            <span className="support-empty__icon" aria-hidden="true">
              <MaterialIcon name="assignment" size={28} />
            </span>
            <p>Nenhuma guia encontrada.</p>
          <span>Confira o número ou os dados do paciente e tente novamente.</span>
          </div>
        ) : (
          resultados.map((guide) => <GuideSituationCard key={guide.id} guide={guide} />)
        )}
      </section>
    </div>
  );
}

function SupportSkeleton() {
  return (
    <div className="support-skeleton" role="status" aria-label="Carregando dados da busca">
      {[0, 1].map((row) => (
        <div key={row} className="support-skeleton__card">
          <span className="support-skeleton__avatar" aria-hidden="true" />
          <span className="support-skeleton__lines" aria-hidden="true">
            <span className="support-skeleton__line support-skeleton__line--lg" />
            <span className="support-skeleton__line support-skeleton__line--sm" />
          </span>
        </div>
      ))}
    </div>
  );
}
