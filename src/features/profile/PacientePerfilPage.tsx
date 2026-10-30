import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { FormSection } from '../../components/ui/FormSection';
import { Notice } from '../../components/ui/Notice';
import { TextField } from '../../components/ui/TextField';
import { SelectField } from '../../components/ui/SelectField';
import { consultarCep } from '../../utils/cep';
import { formatCpf } from '../../utils/cpf';
import type { PacientePerfil, PacientePerfilUpdate } from '../patients/service';
import { atualizarMeuPerfilPaciente, obterMeuPerfilPaciente } from '../patients/service';
import '../../components/layout/layout.css';
import './PerfilPage.css';

function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString('pt-BR');
}

interface Props {
  onAtualizarUsuario: (updates: { nome?: string }) => void;
  onVoltar: () => void;
}

type FormValues = PacientePerfilUpdate;
const vazio: FormValues = {
  nome: '', dataNascimento: '', sexo: '', convenio: '', numeroCarteirinha: '', telefone: '', email: '', cep: '',
  logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
};

export function PacientePerfilPage({ onAtualizarUsuario, onVoltar }: Props) {
  const [perfil, setPerfil] = useState<PacientePerfil | null>(null);
  const [values, setValues] = useState<FormValues>(vazio);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'error'>('idle');
  const [cepMessage, setCepMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    obterMeuPerfilPaciente().then((data) => {
      if (!mounted) return;
      setPerfil(data);
      setValues({
        nome: data.nome ?? '', dataNascimento: data.dataNascimento ?? '', sexo: data.sexo ?? '', convenio: data.convenio ?? '', numeroCarteirinha: data.numeroCarteirinha ?? '',
        telefone: data.telefone ?? '', email: data.email ?? '', cep: data.cep ?? '',
        logradouro: data.logradouro ?? '', numero: data.numero ?? '', complemento: data.complemento ?? '',
        bairro: data.bairro ?? '', cidade: data.cidade ?? '', estado: data.estado ?? '',
      });
    }).catch((requestError: unknown) => {
      if (mounted) setError(requestError instanceof Error ? requestError.message : 'Não foi possível carregar seu cadastro.');
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const digits = values.cep.replace(/\D/g, '');
    if (digits.length !== 8) { setCepStatus('idle'); setCepMessage(''); return; }
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setCepStatus('loading'); setCepMessage('Consultando CEP…');
      try {
        const address = await consultarCep(digits, controller.signal);
        if (!active) return;
        if (!address) { setCepStatus('invalid'); setCepMessage('CEP inválido ou não encontrado.'); setError('CEP inválido ou não encontrado.'); return; }
        setCepStatus('valid'); setCepMessage('CEP localizado. Endereço preenchido automaticamente.');
        setValues((current) => ({ ...current, cep: address.cep, logradouro: address.logradouro || current.logradouro, bairro: address.bairro || current.bairro, cidade: address.cidade, estado: address.estado }));
        setError('');
      } catch (lookupError) {
        if (!active || (lookupError instanceof DOMException && lookupError.name === 'AbortError')) return;
        setCepStatus('error'); setCepMessage('Não foi possível validar o CEP agora. Verifique a conexão e tente novamente.');
      }
    }, 350);
    return () => { active = false; window.clearTimeout(timeout); controller.abort(); };
  }, [values.cep]);

  function change<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError('');
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!perfil) return;
    if (values.cep.replace(/\D/g, '').length !== 8) { setError('Informe um CEP com 8 dígitos.'); return; }
    if (cepStatus !== 'valid') { setError(cepStatus === 'invalid' ? 'CEP inválido ou não encontrado.' : cepStatus === 'loading' ? 'Aguarde a validação do CEP.' : 'Confirme um CEP válido antes de salvar.'); return; }
    if (!/^[A-Za-z]{2}$/.test(values.estado.trim())) { setError('Informe a sigla do estado com 2 letras.'); return; }
    setSubmitting(true);
    try {
      const updated = await atualizarMeuPerfilPaciente(values);
      setPerfil(updated);
      setValues({
        nome: updated.nome, dataNascimento: updated.dataNascimento, sexo: updated.sexo ?? '', convenio: updated.convenio ?? '', numeroCarteirinha: updated.numeroCarteirinha ?? '',
        telefone: updated.telefone ?? '', email: updated.email, cep: updated.cep ?? '',
        logradouro: updated.logradouro ?? '', numero: updated.numero ?? '', complemento: updated.complemento ?? '',
        bairro: updated.bairro ?? '', cidade: updated.cidade ?? '', estado: updated.estado ?? '',
      });
      onAtualizarUsuario({ nome: updated.nome });
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível salvar os dados. Tente novamente.');
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="page page--form"><p role="status">Carregando seus dados...</p></div>;

  return (
    <div className="page page--form">
      <header className="page__header">
        <h1 className="page__title">Meu perfil</h1>
        <p className="page__description">Confira e mantenha seus dados pessoais, contato e endereço atualizados.</p>
      </header>
      <div className="form-page__grid">
        <div className="card form-page__main">
          {saved && <Notice variant="success">Seus dados foram atualizados com sucesso.</Notice>}
          {error && <Notice variant="error">{error}</Notice>}
          <form onSubmit={handleSubmit} noValidate aria-label="Perfil cadastral do paciente">
            <FormSection title="Dados pessoais" description="O CPF é protegido e sua alteração requer conferência pela equipe autorizada.">
              <div className="form-grid">
                <div className="form-grid__full">
                  <TextField label="Nome completo" autoComplete="name" maxLength={150} value={values.nome} onChange={(e) => change('nome', e.target.value)} required />
                </div>
                <TextField label="CPF" value={perfil ? formatCpf(perfil.cpf) : ''} readOnly disabled hint="Para corrigir o CPF, solicite a conferência da administração autorizada." />
                <TextField label="Data de nascimento" type="date" max={new Date().toISOString().slice(0, 10)} value={values.dataNascimento} onChange={(e) => change('dataNascimento', e.target.value)} required />
                <SelectField label="Sexo" value={values.sexo ?? ''} required onChange={(e) => change('sexo', e.target.value)}>
                  <option value="">Selecione</option><option value="FEMININO">Feminino</option><option value="MASCULINO">Masculino</option><option value="OUTRO">Outro</option><option value="NAO_INFORMAR">Prefiro não informar</option>
                </SelectField>
                <TextField label="Nome do convênio / plano" maxLength={120} value={values.convenio ?? ''} onChange={(e) => change('convenio', e.target.value)} />
                <TextField label="Número da carteirinha" maxLength={80} value={values.numeroCarteirinha ?? ''} onChange={(e) => change('numeroCarteirinha', e.target.value)} />
              </div>
              <div className="perfil-readonly" style={{ marginTop: '1rem' }}>
                <div className="perfil-readonly__field">
                  <span className="perfil-readonly__label">Cadastro realizado em</span>
                  <span className="perfil-readonly__value">{formatDateTime(perfil.criadoEm)}</span>
                </div>
                <div className="perfil-readonly__field">
                  <span className="perfil-readonly__label">Última atualização</span>
                  <span className="perfil-readonly__value">{formatDateTime(perfil.atualizadoEm)}</span>
                </div>
              </div>
            </FormSection>
            <FormSection title="Contato">
              <div className="form-grid">
                <TextField label="E-mail" type="email" autoComplete="email" maxLength={255} value={values.email} onChange={(e) => change('email', e.target.value)} required />
                <TextField label="Telefone com DDD" type="tel" autoComplete="tel" maxLength={20} value={values.telefone ?? ''} onChange={(e) => change('telefone', e.target.value)} />
              </div>
            </FormSection>
            <FormSection title="Endereço residencial" description="Usado para orientar a busca de hospital ou clínica na sua cidade; se necessário, o sistema considera outras unidades do mesmo estado.">
              <div className="form-grid">
                <TextField label="CEP" hint={cepMessage || 'O endereço será preenchido após localizar o CEP.'} autoComplete="postal-code" inputMode="numeric" maxLength={9} value={values.cep} onChange={(e) => change('cep', e.target.value.replace(/\D/g, '').slice(0, 8))} error={cepStatus === 'invalid' ? 'CEP inválido ou não encontrado.' : undefined} required />
                <TextField label="Estado (UF)" autoComplete="address-level1" maxLength={2} value={values.estado} onChange={(e) => change('estado', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))} required />
                <div className="form-grid__full"><TextField label="Logradouro" autoComplete="street-address" maxLength={180} value={values.logradouro} onChange={(e) => change('logradouro', e.target.value)} required /></div>
                <TextField label="Número" maxLength={20} value={values.numero} onChange={(e) => change('numero', e.target.value)} required />
                <TextField label="Complemento" maxLength={120} value={values.complemento ?? ''} onChange={(e) => change('complemento', e.target.value)} />
                <TextField label="Bairro" maxLength={120} autoComplete="address-level3" value={values.bairro} onChange={(e) => change('bairro', e.target.value)} required />
                <TextField label="Cidade" maxLength={120} autoComplete="address-level2" value={values.cidade} onChange={(e) => change('cidade', e.target.value)} required />
              </div>
            </FormSection>
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={onVoltar} disabled={submitting}>Voltar</Button>
              <Button type="submit" disabled={submitting || !perfil} aria-busy={submitting}>{submitting ? 'Salvando...' : 'Salvar alterações'}</Button>
            </div>
          </form>
        </div>
        <aside className="form-page__aside" aria-label="Proteção dos dados pessoais">
          <section className="form-aside">
            <h2 className="form-aside__title">Seus dados e sua privacidade</h2>
            <p className="form-aside__text">Seu cadastro é consultado por profissionais autenticados conforme as permissões de atendimento. O sistema não permite que sua conta altere o CPF por este formulário.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
