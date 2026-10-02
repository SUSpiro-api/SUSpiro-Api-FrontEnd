import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/httpClient';
import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { TextField } from '../../components/ui/TextField';
import { formatCpf } from '../../utils/cpf';
import {
  maxBirthDate,
  NOME_MAX_LENGTH,
  validateCpfPaciente,
  validateDataNascimento,
  validateNomePaciente,
  validateNumeroSus,
  validateTelefone,
} from './validation';
import { cadastrarPaciente, type PacienteCriado } from './service';

interface CadastroCidadaoFormProps {
  onSucesso: (paciente: PacienteCriado) => void;
  onCancelar: () => void;
}

type Field = 'nome' | 'cpf' | 'dataNascimento' | 'numeroSus' | 'telefone';
type FieldErrors = Partial<Record<Field, string>>;

export function CadastroCidadaoForm({ onSucesso, onCancelar }: CadastroCidadaoFormProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numeroSus, setNumeroSus] = useState('');
  const [telefone, setTelefone] = useState('');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Depois de um envio com erro, leva o foco ao primeiro campo inválido.
  const formRef = useRef<HTMLFormElement>(null);
  const [focusTick, setFocusTick] = useState(0);

  useEffect(() => {
    if (focusTick === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  const clearError = (field: Field) => {
    if (fieldErrors[field]) setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

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

    if (Object.keys(cleanErrors).length > 0) {
      setFocusTick((tick) => tick + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      const paciente = await cadastrarPaciente({ nome, cpf, dataNascimento, numeroSus, telefone });
      onSucesso(paciente);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível cadastrar o cidadão. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulário de cadastro de cidadão"
    >
      <FormSection title="Dados pessoais">
        <div className="form-grid">
          <div className="form-grid__full">
            <TextField
              label="Nome completo"
              placeholder="Digite o nome completo"
              autoComplete="name"
              maxLength={NOME_MAX_LENGTH}
              required
              error={fieldErrors.nome}
              value={nome}
              onChange={(event) => {
                setNome(event.target.value);
                clearError('nome');
              }}
            />
          </div>

          <TextField
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
            error={fieldErrors.cpf}
            value={cpf}
            onChange={(event) => {
              setCpf(formatCpf(event.target.value));
              clearError('cpf');
            }}
          />

          <TextField
            label="Data de nascimento"
            type="date"
            max={maxBirthDate()}
            required
            error={fieldErrors.dataNascimento}
            value={dataNascimento}
            onChange={(event) => {
              setDataNascimento(event.target.value);
              clearError('dataNascimento');
            }}
          />
        </div>
      </FormSection>

      <FormSection
        title="Cartão Nacional de Saúde"
        description="O CNS identifica o cidadão no SUS."
      >
        <div className="form-grid">
          <TextField
            label="Número do CNS"
            hint="Informe os 15 dígitos do cartão."
            placeholder="000000000000000"
            inputMode="numeric"
            maxLength={15}
            required
            error={fieldErrors.numeroSus}
            value={numeroSus}
            onChange={(event) => {
              // Só dígitos: colar "123 456 789 012 345" não pode truncar o número.
              setNumeroSus(event.target.value.replace(/\D/g, '').slice(0, 15));
              clearError('numeroSus');
            }}
          />
        </div>
      </FormSection>

      <FormSection title="Contato">
        <div className="form-grid">
          <TextField
            label="Telefone"
            hint="Opcional. Inclua o DDD."
            placeholder="(00) 00000-0000"
            type="tel"
            inputMode="numeric"
            error={fieldErrors.telefone}
            value={telefone}
            onChange={(event) => {
              setTelefone(event.target.value);
              clearError('telefone');
            }}
          />
        </div>
      </FormSection>

      {formError && <Notice variant="error">{formError}</Notice>}

      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar cidadão'}
        </Button>
        <Button variant="secondary" onClick={onCancelar} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
