import { useState } from 'react';
import { ApiError } from '../../api/httpClient';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { formatCpf } from '../../utils/cpf';
import {
  validateCpfPaciente,
  validateDataNascimento,
  validateNomePaciente,
  validateNumeroSus,
  validateTelefone,
} from './validation';
import { cadastrarPaciente } from './service';

interface CadastroCidadaoFormProps {
  onSucesso: () => void;
  onCancelar: () => void;
}

type FieldErrors = Partial<
  Record<
    'nome' | 'cpf' | 'dataNascimento' | 'numeroSus' | 'telefone',
    string
  >
>;

export function CadastroCidadaoForm({
  onSucesso,
  onCancelar,
}: CadastroCidadaoFormProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numeroSus, setNumeroSus] = useState('');
  const [telefone, setTelefone] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: FieldErrors = {
      nome: validateNomePaciente(nome),
      cpf: validateCpfPaciente(cpf),
      dataNascimento: validateDataNascimento(dataNascimento),
      numeroSus: validateNumeroSus(numeroSus),
      telefone: validateTelefone(telefone),
    };

    const cleanErrors = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value),
    ) as FieldErrors;

    setFieldErrors(cleanErrors);
    setFormError('');

    if (Object.keys(cleanErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await cadastrarPaciente({
        nome,
        cpf,
        dataNascimento,
        numeroSus,
        telefone,
      });

      onSucesso();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError(
          'Não foi possível cadastrar o cidadão. Tente novamente.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="patient-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulário de cadastro de cidadão"
    >
      <div className="patient-form__grid">
        <div className="patient-form__field patient-form__field--full">
          <TextField
            label="Nome completo"
            placeholder="Digite o nome completo"
            autoComplete="name"
            required
            value={nome}
            aria-invalid={Boolean(fieldErrors.nome)}
            onChange={(event) => {
              setNome(event.target.value);

              if (fieldErrors.nome) {
                setFieldErrors((prev) => ({
                  ...prev,
                  nome: undefined,
                }));
              }
            }}
          />

          {fieldErrors.nome && (
            <p className="patient-form__error" role="alert">
              {fieldErrors.nome}
            </p>
          )}
        </div>

        <div className="patient-form__field">
          <TextField
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
            value={cpf}
            aria-invalid={Boolean(fieldErrors.cpf)}
            onChange={(event) => {
              setCpf(formatCpf(event.target.value));

              if (fieldErrors.cpf) {
                setFieldErrors((prev) => ({
                  ...prev,
                  cpf: undefined,
                }));
              }
            }}
          />

          {fieldErrors.cpf && (
            <p className="patient-form__error" role="alert">
              {fieldErrors.cpf}
            </p>
          )}
        </div>

        <div className="patient-form__field">
          <TextField
            label="Data de nascimento"
            type="date"
            required
            value={dataNascimento}
            aria-invalid={Boolean(fieldErrors.dataNascimento)}
            onChange={(event) => {
              setDataNascimento(event.target.value);

              if (fieldErrors.dataNascimento) {
                setFieldErrors((prev) => ({
                  ...prev,
                  dataNascimento: undefined,
                }));
              }
            }}
          />

          {fieldErrors.dataNascimento && (
            <p className="patient-form__error" role="alert">
              {fieldErrors.dataNascimento}
            </p>
          )}
        </div>

        <div className="patient-form__field">
          <TextField
            label="CNS"
            placeholder="000000000000000"
            inputMode="numeric"
            maxLength={15}
            required
            value={numeroSus}
            aria-invalid={Boolean(fieldErrors.numeroSus)}
            onChange={(event) => {
              setNumeroSus(event.target.value);

              if (fieldErrors.numeroSus) {
                setFieldErrors((prev) => ({
                  ...prev,
                  numeroSus: undefined,
                }));
              }
            }}
          />

          {fieldErrors.numeroSus && (
            <p className="patient-form__error" role="alert">
              {fieldErrors.numeroSus}
            </p>
          )}
        </div>

        <div className="patient-form__field">
          <TextField
            label="Telefone"
            placeholder="(00) 00000-0000"
            type="tel"
            inputMode="numeric"
            value={telefone}
            aria-invalid={Boolean(fieldErrors.telefone)}
            onChange={(event) => {
              setTelefone(event.target.value);

              if (fieldErrors.telefone) {
                setFieldErrors((prev) => ({
                  ...prev,
                  telefone: undefined,
                }));
              }
            }}
          />

          {fieldErrors.telefone && (
            <p className="patient-form__error" role="alert">
              {fieldErrors.telefone}
            </p>
          )}
        </div>
      </div>

      {formError && (
        <p className="patient-form__form-error" role="alert">
          {formError}
        </p>
      )}

      <div className="patient-form__actions">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar cidadão'}
        </Button>

        <button
          type="button"
          className="patient-form__cancel"
          onClick={onCancelar}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
