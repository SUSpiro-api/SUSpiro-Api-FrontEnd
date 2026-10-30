import { usePatientSearch } from './hooks/usePatientSearch';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { formatCpf } from '../../utils/cpf';
import type { Patient } from './types';

interface PatientSearchModalProps {
  open: boolean;
  onClose: () => void;
  onFound: (patient: Patient) => void;
  findPatient: (cpf: string) => Patient | null | Promise<Patient | null>;
}

export function PatientSearchModal({ open, onClose, onFound, findPatient }: PatientSearchModalProps) {
  const search = usePatientSearch({ open, onFound, onClose, findPatient });

  return (
    <dialog
      ref={search.dialogRef}
      className="schedule-modal patient-search-modal"
      aria-labelledby="patient-search-title"
      onCancel={search.handleCancel}
      onClick={search.handleDialogClick}
    >
      <div className="schedule-modal__panel">
        <header className="schedule-modal__header">
          <div>
            <h2 id="patient-search-title">Atender paciente</h2>
            <p>Informe o CPF para localizar o cadastro e abrir o histórico clínico.</p>
          </div>
          <button type="button" className="ui-icon-button" aria-label="Fechar janela" onClick={onClose}>
            <MaterialIcon name="close" size={20} />
          </button>
        </header>

        <form onSubmit={search.handleSubmit} noValidate>
          <div className="patient-search__field ui-field">
            <label className="ui-field__label" htmlFor="patient-search-cpf">CPF do paciente</label>
            <div className="patient-search__input-row">
              <input
                id="patient-search-cpf"
                className="ui-field__input"
                inputMode="numeric"
                autoComplete="off"
                value={formatCpf(search.cpf)}
                placeholder="000.000.000-00"
                onChange={search.handleCpfChange}
                aria-invalid={Boolean(search.error)}
                aria-describedby={search.error ? 'patient-search-error' : undefined}
              />
              <Button type="submit">
                <MaterialIcon name="search" size={18} />
                Buscar paciente
              </Button>
            </div>
            {search.error && <p id="patient-search-error" className="ui-field__error" role="alert">{search.error}</p>}
          </div>

          <div className="patient-search__hint" role="note">
            <MaterialIcon name="info" size={18} />
            <p>Após localizar o paciente, consultas, retornos, exames e encaminhamentos serão filtrados para esse atendimento.</p>
          </div>


          <footer className="schedule-modal__footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}
