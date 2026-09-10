import { useState } from 'react';
import { TextField } from '../../components/ui/TextField';
import { PasswordField } from '../../components/ui/PasswordField';
import { Button } from '../../components/ui/Button';
import { MaterialIcon } from '../../components/icons';
import { formatCpf } from '../../utils/cpf';
import {
  validateCpfFuncionario,
  validateConfirmarSenha,
  validateNome,
  validateSenhaFuncionario,
} from './validation';
import { cadastrarFuncionario, type PerfilFuncionario } from './service';
import { ApiError } from '../../api/httpClient';

interface CadastroFuncionarioFormProps {
  /** Só um SUPER_ADMIN pode cadastrar outro ADMIN. */
  podeCriarAdmin: boolean;
  onSucesso: () => void;
  onCancelar: () => void;
}

type FieldErrors = Partial<Record<'nome' | 'cpf' | 'senha' | 'confirmarSenha', string>>;

export function CadastroFuncionarioForm({
  podeCriarAdmin,
  onSucesso,
  onCancelar,
}: CadastroFuncionarioFormProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilFuncionario>('USUARIO');

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (Object.keys(cleanErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await cadastrarFuncionario({ nome, cpf, senha, perfil });
      onSucesso();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError('Não foi possível cadastrar o funcionário. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="login-login-form" aria-labelledby="cadastro-form-title">
      <header>
        <h1 id="cadastro-form-title" className="login-login-form__title">
          Cadastrar funcionário
        </h1>
        <p className="login-login-form__subtitle">
          Cadastre o acesso de um novo funcionário da recepção ou administração.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate aria-label="Formulário de cadastro de funcionário">
        <TextField
          label="Nome completo"
          placeholder="Digite o nome completo"
          autoComplete="name"
          required
          startIcon={<MaterialIcon name="person" size={18} />}
          value={nome}
          aria-invalid={Boolean(fieldErrors.nome)}
          onChange={(event) => {
            setNome(event.target.value);
            if (fieldErrors.nome) setFieldErrors((prev) => ({ ...prev, nome: undefined }));
          }}
        />
        {fieldErrors.nome && (
          <p className="login-field__error" role="alert">
            {fieldErrors.nome}
          </p>
        )}

        <TextField
          label="CPF"
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
          required
          startIcon={<MaterialIcon name="person" size={18} />}
          value={cpf}
          aria-invalid={Boolean(fieldErrors.cpf)}
          onChange={(event) => {
            setCpf(formatCpf(event.target.value));
            if (fieldErrors.cpf) setFieldErrors((prev) => ({ ...prev, cpf: undefined }));
          }}
        />
        {fieldErrors.cpf && (
          <p className="login-field__error" role="alert">
            {fieldErrors.cpf}
          </p>
        )}

        <div className="login-field">
          <label className="login-field__label" htmlFor="perfil-funcionario">
            Perfil de acesso
          </label>
          <div className="login-field__control">
            <select
              id="perfil-funcionario"
              className="login-field__input"
              value={perfil}
              onChange={(event) => setPerfil(event.target.value as PerfilFuncionario)}
            >
              <option value="USUARIO">Recepção</option>
              {podeCriarAdmin && <option value="ADMIN">Administrador</option>}
            </select>
          </div>
        </div>

        <PasswordField
          label="Senha provisória"
          placeholder="Mínimo 8 caracteres, com letra e número"
          autoComplete="new-password"
          required
          value={senha}
          aria-invalid={Boolean(fieldErrors.senha)}
          onChange={(event) => {
            setSenha(event.target.value);
            if (fieldErrors.senha) setFieldErrors((prev) => ({ ...prev, senha: undefined }));
          }}
        />
        {fieldErrors.senha && (
          <p className="login-field__error" role="alert">
            {fieldErrors.senha}
          </p>
        )}

        <PasswordField
          label="Confirmar senha"
          placeholder="Repita a senha"
          autoComplete="new-password"
          required
          value={confirmarSenha}
          aria-invalid={Boolean(fieldErrors.confirmarSenha)}
          onChange={(event) => {
            setConfirmarSenha(event.target.value);
            if (fieldErrors.confirmarSenha) {
              setFieldErrors((prev) => ({ ...prev, confirmarSenha: undefined }));
            }
          }}
        />
        {fieldErrors.confirmarSenha && (
          <p className="login-field__error" role="alert">
            {fieldErrors.confirmarSenha}
          </p>
        )}

        {formError && (
          <p className="login-form-error" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" variant="primary" className="login-login-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar funcionário'}
        </Button>

        <button
          type="button"
          className="login-link login-link--button login-link--back"
          onClick={onCancelar}
          disabled={isSubmitting}
        >
          Voltar
        </button>
      </form>
    </article>
  );
}
