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
            error={form.fieldErrors.numeroSus}
            value={form.numeroSus}
            onChange={(event) => form.alterarNumeroSus(event.target.value)}
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
            error={form.fieldErrors.telefone}
            value={form.telefone}
            onChange={(event) => form.alterarTelefone(event.target.value)}
          />
        </div>
      </FormSection>

      {form.formError && <Notice variant="error">{form.formError}</Notice>}

      <div className="form-actions">
        <Button type="submit" disabled={form.isSubmitting} aria-busy={form.isSubmitting}>
          {form.isSubmitting ? 'Cadastrando...' : 'Cadastrar cidadão'}
        </Button>
        <Button variant="secondary" onClick={onCancelar} disabled={form.isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
