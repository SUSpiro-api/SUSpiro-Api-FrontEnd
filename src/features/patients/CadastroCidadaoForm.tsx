import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { TextField } from '../../components/ui/TextField';
import { SelectField } from '../../components/ui/SelectField';
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
          <SelectField label="Sexo" value={form.sexo} required onChange={(event) => form.alterarSexo(event.target.value)}>
            <option value="">Selecione</option>
            <option value="FEMININO">Feminino</option>
            <option value="MASCULINO">Masculino</option>
            <option value="OUTRO">Outro</option>
            <option value="NAO_INFORMAR">Prefiro não informar</option>
          </SelectField>
          {form.fieldErrors.sexo && <p className="ui-field__error" role="alert">{form.fieldErrors.sexo}</p>}
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
          <TextField
            label="Número da carteirinha"
            placeholder="Número impresso no cartão do convênio"
            autoComplete="off"
            maxLength={80}
            value={form.numeroCarteirinha}
            onChange={(event) => form.alterarNumeroCarteirinha(event.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Contato">
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

      <FormSection
        title="Endereço do paciente"
        description="Informe o endereço residencial para apoiar a localização de unidades de saúde na cidade ou no mesmo estado."
      >
        <div className="form-grid">
          <TextField label="CEP" hint={form.cepMessage || 'Informe o CEP para preencher o endereço automaticamente.'} placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" maxLength={9} required error={form.fieldErrors.cep} value={form.cep} onChange={(event) => form.alterarCep(event.target.value)} />
          <TextField label="Estado (UF)" placeholder="SP" autoComplete="address-level1" maxLength={2} required error={form.fieldErrors.estado} value={form.estado} onChange={(event) => form.alterarEstado(event.target.value)} />
          <div className="form-grid__full">
            <TextField label="Logradouro" placeholder="Rua, avenida, travessa..." autoComplete="street-address" maxLength={180} required error={form.fieldErrors.logradouro} value={form.logradouro} onChange={(event) => form.alterarLogradouro(event.target.value)} />
          </div>
          <TextField label="Número" placeholder="Número ou S/N" autoComplete="address-line2" maxLength={20} required error={form.fieldErrors.numero} value={form.numero} onChange={(event) => form.alterarNumero(event.target.value)} />
          <TextField label="Complemento" placeholder="Apartamento, bloco, casa..." maxLength={120} error={form.fieldErrors.complemento} value={form.complemento} onChange={(event) => form.alterarComplemento(event.target.value)} />
          <TextField label="Bairro" placeholder="Nome do bairro" autoComplete="address-level3" maxLength={120} required error={form.fieldErrors.bairro} value={form.bairro} onChange={(event) => form.alterarBairro(event.target.value)} />
          <TextField label="Cidade" placeholder="Nome da cidade" autoComplete="address-level2" maxLength={120} required error={form.fieldErrors.cidade} value={form.cidade} onChange={(event) => form.alterarCidade(event.target.value)} />
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
