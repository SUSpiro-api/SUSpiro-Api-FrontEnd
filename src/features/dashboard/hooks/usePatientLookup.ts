// Guarda o CPF digitado, valida e localiza o paciente (usado na barra de busca e na janela).

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { isValidCpf } from '../../../utils/cpf';
import type { Patient } from '../types';

interface UsePatientLookupParams {
  onFound: (patient: Patient) => void;
  findPatient: (cpf: string) => Patient | null | Promise<Patient | null>;
}

export function usePatientLookup({ onFound, findPatient }: UsePatientLookupParams) {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  function reset() {
    setCpf('');
    setError('');
  }

  function handleCpfChange(event: ChangeEvent<HTMLInputElement>) {
    setCpf(event.target.value.replace(/\D/g, '').slice(0, 11));
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSearching) return;
    if (!isValidCpf(cpf)) { setError('Informe um CPF válido com 11 dígitos.'); return; }
    setIsSearching(true);
    setError('');
    try {
      const patient = await findPatient(cpf);
      if (!patient) { setError('Nenhum paciente foi encontrado com esse CPF.'); return; }
      reset();
      onFound(patient);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      setError(message || 'Não foi possível consultar o paciente. Verifique a conexão e tente novamente.');
    } finally { setIsSearching(false); }
  }

  return { cpf, error, isSearching, reset, handleCpfChange, handleSubmit };
}
