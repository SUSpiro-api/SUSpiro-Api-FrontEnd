// Mostra os campos do cadastro de funcionário.

import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { SelectField } from '../../components/ui/SelectField';
import { TextField } from '../../components/ui/TextField';
import { PasswordField } from '../../components/ui/PasswordField';
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
  const form = useCadastroFuncionarioForm(onSucesso, podeCriarAdmin ? 'GERENTE' : 'ATENDENTE');

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

          <TextField
            label="E-mail profissional"
            type="email"
            placeholder="nome@unidade.com.br"
            autoComplete="email"
            required
            error={form.fieldErrors.email}
            value={form.email}
            onChange={(event) => form.alterarEmail(event.target.value)}
          />

          <SelectField
            label="Perfil de acesso"
            hint="Define o que o funcionário pode fazer no sistema."
            value={form.perfil}
            onChange={(event) => form.alterarPerfil(event.target.value as PerfilFuncionario)}
          >
            {podeCriarAdmin && <option value="GERENTE">Gerente</option>}
            <option value="MEDICO">Médico</option>
            <option value="ENFERMEIRO">Enfermeiro</option>
            <option value="ATENDENTE">Recepcionista</option>
          </SelectField>
        </div>
      </FormSection>

      <FormSection title="Primeiro acesso">
        <div className="form-grid">
          <div className="form-grid__full">
            <PasswordField
              label="Senha temporária"
              hint="Defina uma senha com 8 a 72 caracteres, contendo letras e números. O funcionário deverá substituí-la por uma senha forte no primeiro acesso."
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              error={form.fieldErrors.senhaTemporaria}
              value={form.senhaTemporaria}
              onChange={(event) => form.alterarSenhaTemporaria(event.target.value)}
            />
          </div>
          <p className="form-aside__text form-grid__full">Entregue a senha temporária diretamente ao profissional por um canal seguro. Ela não será enviada por e-mail nem exibida novamente após o cadastro.</p>
        </div>
      </FormSection>

      {form.formError && <Notice variant="error">{form.formError}</Notice>}

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancelar} disabled={form.isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.isSubmitting} aria-busy={form.isSubmitting}>
          {form.isSubmitting ? 'Cadastrando...' : 'Cadastrar funcionário'}
        </Button>
      </div>
    </form>
  );
}
