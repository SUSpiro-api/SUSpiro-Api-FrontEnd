// Mostra os campos do cadastro de funcionário.

import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { PasswordField } from '../../components/ui/PasswordField';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import { NOME_MAX_LENGTH } from './validation';
import { useCadastroFuncionarioForm } from './hooks/useCadastroFuncionarioForm';
import type { PerfilFuncionario, UsuarioCriado } from './service';

interface CadastroFuncionarioFormProps {
  podeCriarAdmin: boolean;
  onSucesso: (funcionario: UsuarioCriado) => void;
  onCancelar: () => void;
}

export function CadastroFuncionarioForm({
  podeCriarAdmin,
  onSucesso,
  onCancelar,
}: CadastroFuncionarioFormProps) {
  const form = useCadastroFuncionarioForm(onSucesso);

  return (
    <form
      ref={form.formRef}
      onSubmit={form.handleSubmit}
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
              error={form.fieldErrors.nome}
              startIcon={<MaterialIcon name="person" size={18} />}
              value={form.nome}
              onChange={(event) => form.alterarNome(event.target.value)}
            />
          </div>

          <TextField
            label="CPF"
            hint="O funcionário usará o CPF para entrar."
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
            error={form.fieldErrors.cpf}
            value={form.cpf}
            onChange={(event) => form.alterarCpf(event.target.value)}
          />

          <SelectField
            label="Perfil de acesso"
            hint="Define o que o funcionário pode fazer no sistema."
            value={form.perfil}
            onChange={(event) => form.alterarPerfil(event.target.value as PerfilFuncionario)}
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
            error={form.fieldErrors.senha}
            value={form.senha}
            onChange={(event) => form.alterarSenha(event.target.value)}
          />

          <PasswordField
            label="Confirmar senha"
            hint="Repita a senha para conferir."
            autoComplete="new-password"
            required
            error={form.fieldErrors.confirmarSenha}
            value={form.confirmarSenha}
            onChange={(event) => form.alterarConfirmacaoSenha(event.target.value)}
          />
        </div>
      </FormSection>

      {form.formError && <Notice variant="error">{form.formError}</Notice>}

      <div className="form-actions">
        <Button type="submit" disabled={form.isSubmitting} aria-busy={form.isSubmitting}>
          {form.isSubmitting ? 'Cadastrando...' : 'Cadastrar funcionário'}
        </Button>
        <Button variant="secondary" onClick={onCancelar} disabled={form.isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
