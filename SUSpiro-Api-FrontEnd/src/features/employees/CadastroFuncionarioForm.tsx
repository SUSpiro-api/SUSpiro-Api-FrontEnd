import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../api/httpClient';
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { PasswordField } from '../../components/ui/PasswordField';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import { formatCpf } from '../../utils/cpf';
import {
  NOME_MAX_LENGTH,
  validateCpfFuncionario,
  validateConfirmarSenha,
  validateNome,
  validateSenhaFuncionario,
} from './validation';
import { cadastrarFuncionario, type PerfilFuncionario, type UsuarioCriado } from './service';

interface CadastroFuncionarioFormProps {
  /** Só um SUPER_ADMIN pode cadastrar outro ADMIN. */
  podeCriarAdmin: boolean;
  onSucesso: (funcionario: UsuarioCriado) => void;
  onCancelar: () => void;
}

type Field = 'nome' | 'cpf' | 'senha' | 'confirmarSenha';
type FieldErrors = Partial<Record<Field, string>>;

export function CadastroFuncionarioForm({
  podeCriarAdmin,
  onSucesso,
  onCancelar,
}: CadastroFuncionarioFormProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilFuncionario>('RECEPCIONISTA');

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
      nome: validateNome(nome),
      cpf: validateCpfFuncionario(cpf),
      senha: validateSenhaFuncionario(senha),
      confirmarSenha: validateConfirmarSenha(senha, confirmarSenha),
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
      const funcionario = await cadastrarFuncionario({ nome, cpf, senha, perfil });
      onSucesso(funcionario);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível cadastrar o funcionário. Tente novamente.',
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
      aria-label="Formulário de cadastro de funcionário"
    >
      <FormSection title="Identificação">
        <div className="form-grid">
          <div className="form-grid__full">
            <TextField
              label="Nome completo"
              placeholder="Digite o nome completo"
              autoComplete="name"
              maxLength={NOME_MAX_LENGTH}
              required
              error={fieldErrors.nome}
              startIcon={<MaterialIcon name="person" size={18} />}
              value={nome}
              onChange={(event) => {
                setNome(event.target.value);
                clearError('nome');
              }}
            />
          </div>

          <TextField
            label="CPF"
            hint="O funcionário usará o CPF para entrar."
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

          <SelectField
            label="Perfil de acesso"
            hint="Define o que o funcionário pode fazer no sistema."
            value={perfil}
            onChange={(event) => setPerfil(event.target.value as PerfilFuncionario)}
          >
            <option value="RECEPCIONISTA">Recepcionista</option>
            <option value="ENFERMEIRO">Enfermeiro</option>
            <option value="MEDICO">Médico</option>
            {podeCriarAdmin && <option value="ADMIN">Administrador</option>}
          </SelectField>
        </div>
      </FormSection>

      <FormSection title="Senha de acesso">
        <div className="form-grid">
          <PasswordField
            label="Senha provisória"
            hint="Mínimo de 8 caracteres, com letras e números."
            autoComplete="new-password"
            required
            error={fieldErrors.senha}
            value={senha}
            onChange={(event) => {
              setSenha(event.target.value);
              clearError('senha');
            }}
          />

          <PasswordField
            label="Confirmar senha"
            hint="Repita a senha para conferir."
            autoComplete="new-password"
            required
            error={fieldErrors.confirmarSenha}
            value={confirmarSenha}
            onChange={(event) => {
              setConfirmarSenha(event.target.value);
              clearError('confirmarSenha');
            }}
          />
        </div>
      </FormSection>

      {formError && <Notice variant="error">{formError}</Notice>}

      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar funcionário'}
        </Button>
        <Button variant="secondary" onClick={onCancelar} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
