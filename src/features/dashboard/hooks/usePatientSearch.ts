import { useEffect } from 'react';
import { useDialog } from '../../../hooks/useDialog';
import type { Patient } from '../types';
import { usePatientLookup } from './usePatientLookup';

interface UsePatientSearchParams {
  open: boolean;
  onFound: (patient: Patient) => void;
  onClose: () => void;
  findPatient: (cpf: string) => Patient | null | Promise<Patient | null>;
}

export function usePatientSearch({ open, onFound, onClose, findPatient }: UsePatientSearchParams) {
  const dialog = useDialog({ isOpen: open, focusSelector: '#patient-search-cpf', onClose });
  const lookup = usePatientLookup({ onFound, findPatient });
  const { reset } = lookup;

  useEffect(() => {
    if (open) reset();
  }, [open]);

  return {
    ...dialog,
    cpf: lookup.cpf,
    error: lookup.error,
    handleCpfChange: lookup.handleCpfChange,
    handleSubmit: lookup.handleSubmit,
  };
}
