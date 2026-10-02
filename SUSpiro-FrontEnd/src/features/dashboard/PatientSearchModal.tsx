import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { formatCpf, isValidCpf } from '../../utils/cpf';
import { patients } from './data';
import type { Patient } from './types';

interface PatientSearchModalProps {
  open: boolean;
  onClose: () => void;
  onFound: (patient: Patient) => void;
  findPatient: (cpf: string) => Patient | null;
}

export function PatientSearchModal({ open, onClose, onFound, findPatient }: PatientSearchModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cpfInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    setCpf('');
    setError('');
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    requestAnimationFrame(() => cpfInputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (open) return;
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    previousFocusRef.current?.focus();
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidCpf(cpf)) {
      setError('Informe um CPF válido com 11 dígitos.');
      return;
    }

    const patient = findPatient(cpf);
    if (!patient) {
      setError('Nenhum paciente foi encontrado com esse CPF.');
      return;
    }

    onFound(patient);
  };

  return (
    <dialog
      ref={dialogRef}
      className="schedule-modal patient-search-modal"
      aria-labelledby="patient-search-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="schedule-modal__panel">
        <header className="schedule-modal__header">
          <div>
            <p className="schedule-modal__eyebrow">Identificação do paciente</p>
            <h2 id="patient-search-title">Atender paciente</h2>
            <p>Informe o CPF para localizar o cadastro e abrir o histórico clínico.</p>
          </div>
          <button type="button" className="dashboard-icon-button" aria-label="Fechar janela" onClick={onClose}>
            <MaterialIcon name="close" size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="patient-search__field ui-field">
            <label className="ui-field__label" htmlFor="patient-search-cpf">CPF do paciente</label>
            <div className="patient-search__input-row">
              <input
                ref={cpfInputRef}
                id="patient-search-cpf"
                className="ui-field__input"
                inputMode="numeric"
                autoComplete="off"
                value={formatCpf(cpf)}
                placeholder="000.000.000-00"
                onChange={(event) => {
                  setCpf(event.target.value.replace(/\D/g, '').slice(0, 11));
                  setError('');
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'patient-search-error' : undefined}
              />
              <Button type="submit">
                <MaterialIcon name="search" size={18} />
                Buscar paciente
              </Button>
            </div>
            {error && <p id="patient-search-error" className="ui-field__error" role="alert">{error}</p>}
          </div>

          <div className="patient-search__hint" role="note">
            <MaterialIcon name="info" size={18} />
            <p>Após localizar o paciente, consultas, retornos, exames e encaminhamentos serão filtrados para esse atendimento.</p>
          </div>

          <div className="patient-search__demo" role="note" aria-label="Paciente de demonstração">
            <div>
              <span className="patient-search__demo-label">Paciente de demonstração</span>
              <strong>{patients[0].name}</strong>
              <span>CPF: {patients[0].cpf}</span>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onFound(patients[0])}
            >
              Usar para teste
            </Button>
          </div>

          <footer className="schedule-modal__footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
