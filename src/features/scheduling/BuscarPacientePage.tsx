import { useMemo, useState } from 'react';
import { MaterialIcon } from '../../components/icons';
import { normalizeCpf, formatCpf } from '../../utils/cpf';
import { initialsFromName } from '../../utils/initials';
import { formatIsoDate } from '../dashboard/guideLabels';
import type { Guide } from '../guides';
import { useSchedulingSearch } from './hooks/useSchedulingSearch';
import type { PatientRecord } from './data';
import { SupportSearchBar } from './components/SupportSearchBar';
import { GuideSituationRow } from './components/GuideSituation';
import '../../components/layout/layout.css';
import '../dashboard/DashboardPage.css';
import './scheduling.css';

const INPUT_ID = 'support-patient-search';

export function BuscarPacientePage() {
  const { guides, fromServer, loading, searchPatients } = useSchedulingSearch();
  const [termo, setTermo] = useState('');
  const [consultou, setConsultou] = useState(false);
  const [pacientesEncontrados, setPacientesEncontrados] = useState<PatientRecord[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');

  const resultados = useMemo(() => {
    if (!consultou) return [];
    return pacientesEncontrados
      .map((patient) => ({ patient, guias: guidesForPatient(guides, patient.cpf) }))
      .sort((first, second) => {
        // Pacientes com guias em aberto primeiro, depois por nome.
        const openDelta = second.guias.length - first.guias.length;
        if (openDelta !== 0) return openDelta;
        return first.patient.name.localeCompare(second.patient.name, 'pt-BR');
      });
  }, [consultou, guides, pacientesEncontrados]);

  async function handleSearch() {
    setConsultou(true);
    setBuscando(true);
    setErroBusca('');
    try {
      setPacientesEncontrados(await searchPatients(termo));
    } catch {
      setPacientesEncontrados([]);
      setErroBusca('Não foi possível consultar o cadastro agora. Verifique sua conexão e tente novamente.');
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="page support-page" id="buscar-paciente">
      <header className="page__header">
        <h1 className="page__title">Buscar paciente</h1>
        <p className="page__description">
          Localize um paciente pelo nome ou CPF para ver os dados do cadastro e a situação das guias dele.
        </p>
      </header>

      <SupportSearchBar
        inputId={INPUT_ID}
        label="Buscar paciente"
        placeholder="Nome ou CPF do paciente"
        icon="person_search"
        buttonLabel="Buscar"
        hint="Pesquise o cadastro oficial por nome ou por qualquer trecho do CPF."
        value={termo}
        onChange={(valor) => { setTermo(valor); setConsultou(false); setErroBusca(''); }}
        onSubmit={handleSearch}
      />

      {erroBusca && <p className="support-notice" role="alert">{erroBusca}</p>}

      {!fromServer && (
        <p className="support-notice" role="status">
          <MaterialIcon name="warning" size={18} />
          Não foi possível falar com o servidor agora; a busca mostra apenas as guias registradas neste dispositivo.
        </p>
      )}

      <section className="support-results" aria-live="polite" aria-label="Resultado da busca">
        {loading || buscando ? (
          <SupportSkeleton />
        ) : consultou && resultados.length === 0 && !erroBusca ? (
          <div className="support-empty">
            <span className="support-empty__icon" aria-hidden="true">
              <MaterialIcon name="person_search" size={28} />
            </span>
            <p>Nenhum paciente encontrado.</p>
            <span>Confira o nome ou o CPF e tente novamente. Se o paciente não tiver cadastro, você pode cadastrá-lo.</span>
          </div>
        ) : (
          resultados.map(({ patient, guias }) => (
            <article key={patient.cpf} className="patient-result">
              <header className="patient-result__header">
                <span className="patient-result__avatar" aria-hidden="true">
                  {initialsFromName(patient.name) || <MaterialIcon name="person" size={20} />}
                </span>
                <div className="patient-result__info">
                  <h2 className="patient-result__name">{patient.name}</h2>
                  <span className="patient-result__meta">
                    CPF {formatCpf(patient.cpf)}
                    {patient.birthDate ? ` · nascimento ${formatIsoDate(patient.birthDate)}` : ''}
                  </span>
                </div>
              </header>

              <div className="patient-result__guides">
                <h3 className="patient-result__guides-title">Guias do paciente</h3>
                {guias.length === 0 ? (
                  <p className="patient-result__no-guides">Nenhuma guia registrada para este paciente.</p>
                ) : (
                  <ul className="situation-list">
                    {guias.map((guide) => <GuideSituationRow key={guide.id} guide={guide} />)}
                  </ul>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function guidesForPatient(guides: Guide[], cpf: string): Guide[] {
  return guides.filter((guide) => normalizeCpf(guide.pacienteCpf) === normalizeCpf(cpf));
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
