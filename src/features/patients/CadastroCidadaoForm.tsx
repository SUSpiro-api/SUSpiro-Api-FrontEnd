// Mostra os campos do cadastro de cidadão.

import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { TextField } from '../../components/ui/TextField';
import { maxBirthDate, NOME_MAX_LENGTH } from './validation';
import { useCadastroCidadaoForm } from './hooks/useCadastroCidadaoForm';
import type { PacienteCriado } from './service';

interface CadastroCidadaoFormProps {
  onSucesso: (paciente: PacienteCriado) => void;
  onCancelar: () => void;
}

export function CadastroCidadaoForm({ onSucesso, onCancelar }: CadastroCidadaoFormProps) {
  const form = useCadastroCidadaoForm(onSucesso);

  return (
    <form
      ref={form.formRef}
      onSubmit={form.handleSubmit}
      noValidate
      aria-label="Formulário de cadastro de paciente"
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
              error={form.fieldErrors.nome}
              value={form.nome}
              onChange={(event) => form.alterarNome(event.target.value)}
            />
          </div>

          <TextField
            label="CPF"
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
            error={form.fieldErrors.cpf}
            value={form.cpf}
            onChange={(event) => form.alterarCpf(event.target.value)}
          />

          <TextField
            label="Data de nascimento"
            type="date"
            max={maxBirthDate()}
            required
            error={form.fieldErrors.dataNascimento}
            value={form.dataNascimento}
            onChange={(event) => form.alterarDataNascimento(event.target.value)}
          />
        </div>
      </FormSection>

      <FormSection
        title="Convênio"
        description="Informe o convênio de saúde do paciente, se houver."
      >
        <div className="form-grid">
          <TextField
            label="Nome do convênio"
            placeholder="Ex.: convênio ou plano de saúde"
            autoComplete="off"
            maxLength={120}
            error={form.fieldErrors.convenio}
            value={form.convenio}
            onChange={(event) => form.alterarConvenio(event.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Contato" description="O e-mail é obrigatório para recuperação de senha por link. O telefone é opcional.">
        <div className="form-grid">
          <TextField
            label="E-mail"
            type="email"
            placeholder="nome@exemplo.com"
            autoComplete="email"
            required
            error={form.fieldErrors.email}
            value={form.email}
            onChange={(event) => form.alterarEmail(event.target.value)}
          />
          <TextField
            label="Telefone"
            hint="Opcional. Inclua o DDD."
            placeholder="(00) 00000-0000"
            type="tel"
            inputMode="numeric"
            error={form.fieldErrors.telefone}
            value={form.telefone}
            onChange={(event) => form.alterarTelefone(event.target.value)}
          />
        </div>
      </FormSection>

      {form.formError && <Notice variant="error">{form.formError}</Notice>}

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancelar} disabled={form.isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={form.isSubmitting} aria-busy={form.isSubmitting}>
          {form.isSubmitting ? 'Cadastrando...' : 'Cadastrar paciente'}
        </Button>
      </div>
    </form>
  );
}
