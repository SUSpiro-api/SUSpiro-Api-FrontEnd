// Barra de busca sempre visível: o médico digita o CPF e o histórico do paciente abre.

import { useEffect, type RefObject } from 'react';
import { MaterialIcon } from '../../components/icons';
import { formatCpf } from '../../utils/cpf';
import { patients } from './data';
import { usePatientLookup } from './hooks/usePatientLookup';
import type { Patient } from './types';

interface PatientSearchBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onFound: (patient: Patient) => void;
  findPatient: (cpf: string) => Patient | null | Promise<Patient | null>;
}

const INPUT_ID = 'patient-search-bar-cpf';

export function PatientSearchBar({ inputRef, onFound, findPatient }: PatientSearchBarProps) {
  const lookup = usePatientLookup({ onFound, findPatient });
  const demoPatient = patients[0];

  // Atalho "/" leva direto para o campo, como em outras ferramentas de trabalho.
  useEffect(() => {
    function focusOnSlash(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector('dialog[open]')) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const isTyping = target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
        if (isTyping) return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    }

    document.addEventListener('keydown', focusOnSlash);
    return () => document.removeEventListener('keydown', focusOnSlash);
  }, [inputRef]);

  return (
    <section className="patient-search-bar">
      <form className="patient-search-bar__form" onSubmit={lookup.handleSubmit} noValidate>
        <label id="patient-search-bar-title" className="patient-search-bar__label" htmlFor={INPUT_ID}>
          Buscar paciente pelo CPF
        </label>
        <div className="patient-search-bar__row">
          <div className="patient-search-bar__field">
            <MaterialIcon name="search" size={20} className="patient-search-bar__icon" />
            <input
              ref={inputRef}
              id={INPUT_ID}
              className="patient-search-bar__input"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              aria-keyshortcuts="/"
              aria-invalid={Boolean(lookup.error)}
              aria-describedby={lookup.error ? 'patient-search-bar-error' : 'patient-search-bar-hint'}
              value={formatCpf(lookup.cpf)}
              onChange={lookup.handleCpfChange}
            />
            <kbd className="patient-search-bar__key" aria-hidden="true">/</kbd>
          </div>
          <button type="submit" className="dashboard-button dashboard-button--primary">Buscar</button>
        </div>

        {lookup.error ? (
          <p id="patient-search-bar-error" className="patient-search-bar__error" role="alert">
            <MaterialIcon name="error" size={16} />
            {lookup.error}
          </p>
        ) : (
          <p id="patient-search-bar-hint" className="patient-search-bar__hint">
            Ao localizar, o painel mostra só o histórico desse paciente. Pressione / para buscar de qualquer lugar da tela.
          </p>
        )}
      </form>

      <p className="patient-search-bar__demo">
        Sem backend para testar?{' '}
        <button type="button" className="patient-search-bar__demo-button" onClick={() => onFound(demoPatient)}>
          Usar {demoPatient.name}
        </button>
      </p>
    </section>
  );
}
