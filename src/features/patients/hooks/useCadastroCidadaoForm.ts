import { useEffect, useState, type FormEvent } from 'react';
import { consultarCep } from '../../../utils/cep';
import { ApiError } from '../../../api/httpClient';
import { formatCpf } from '../../../utils/cpf';
import { useFocusFirstInvalidField } from '../../../hooks/useFocusFirstInvalidField';
import { cadastrarPaciente, type PacienteCriado } from '../service';
import {
  validateCpfPaciente,
  validateDataNascimento,
  validateNomePaciente,
  validateConvenio,
  validateEmailPaciente,
  validateTelefone,
  validateCepPaciente,
  validateEnderecoObrigatorio,
  validateEstadoPaciente,
} from '../validation';

type Campo = 'nome' | 'cpf' | 'dataNascimento' | 'sexo' | 'convenio' | 'numeroCarteirinha' | 'telefone' | 'email' | 'cep' | 'logradouro' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado';
type ErrosDoFormulario = Partial<Record<Campo, string>>;

export function useCadastroCidadaoForm(onSucesso: (paciente: PacienteCriado) => void) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [convenio, setConvenio] = useState('');
  const [numeroCarteirinha, setNumeroCarteirinha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ErrosDoFormulario>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'error'>('idle');
  const [cepMessage, setCepMessage] = useState('');
  const { formRef, focusFirstInvalidField } = useFocusFirstInvalidField();

  function clearError(campo: Campo) {
    setFieldErrors((erros) => ({ ...erros, [campo]: undefined }));
  }

  function alterarNome(valor: string) {
    setNome(valor);
    clearError('nome');
  }

  function alterarCpf(valor: string) {
    setCpf(formatCpf(valor));
    clearError('cpf');
  }

  function alterarDataNascimento(valor: string) {
    setDataNascimento(valor);
    clearError('dataNascimento');
  }

  function alterarSexo(valor: string) { setSexo(valor); clearError('sexo'); }

  function alterarConvenio(valor: string) {
    setConvenio(valor.slice(0, 120));
    clearError('convenio');
  }

  function alterarNumeroCarteirinha(valor: string) { setNumeroCarteirinha(valor.slice(0, 80)); clearError('numeroCarteirinha'); }

  function alterarTelefone(valor: string) {
    setTelefone(valor);
    clearError('telefone');
  }

  useEffect(() => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) { setCepStatus('idle'); setCepMessage(''); return; }
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setCepStatus('loading'); setCepMessage('Consultando CEP…');
      try {
        const address = await consultarCep(digits, controller.signal);
        if (!active) return;
        if (!address) {
          setCepStatus('invalid'); setCepMessage('CEP inválido ou não encontrado.');
          setFieldErrors((current) => ({ ...current, cep: 'CEP inválido ou não encontrado.' }));
          return;
        }
        setCepStatus('valid'); setCepMessage('CEP localizado. Endereço preenchido automaticamente.');
        setFieldErrors((current) => ({ ...current, cep: undefined }));
        setLogradouro(address.logradouro); setBairro(address.bairro); setCidade(address.cidade); setEstado(address.estado);
        setFieldErrors((current) => ({ ...current, logradouro: undefined, bairro: undefined, cidade: undefined, estado: undefined }));
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === 'AbortError')) return;
        setCepStatus('error'); setCepMessage('Não foi possível validar o CEP agora. Verifique a conexão e tente novamente.');
      }
    }, 350);
    return () => { active = false; window.clearTimeout(timeout); controller.abort(); };
  }, [cep]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cepStatus !== 'valid') {
      setFieldErrors((current) => ({ ...current, cep: cepStatus === 'invalid' ? 'CEP inválido ou não encontrado.' : cepStatus === 'loading' ? 'Aguarde a validação do CEP.' : 'Confirme um CEP válido antes de cadastrar.' }));
      focusFirstInvalidField();
      return;
    }

    const errors: ErrosDoFormulario = {
      nome: validateNomePaciente(nome),
      cpf: validateCpfPaciente(cpf),
      dataNascimento: validateDataNascimento(dataNascimento),
      sexo: sexo ? '' : 'Selecione o sexo.',
      convenio: validateConvenio(convenio),
      numeroCarteirinha: numeroCarteirinha.trim().length > 80 ? 'O número da carteirinha deve ter no máximo 80 caracteres.' : '' ,
      telefone: validateTelefone(telefone),
      email: validateEmailPaciente(email),
      cep: validateCepPaciente(cep),
      logradouro: validateEnderecoObrigatorio(logradouro, 'o logradouro', 180),
      numero: validateEnderecoObrigatorio(numero, 'o número', 20),
      complemento: complemento.trim().length > 120 ? 'O complemento deve ter no máximo 120 caracteres.' : '',
      bairro: validateEnderecoObrigatorio(bairro, 'o bairro', 120),
      cidade: validateEnderecoObrigatorio(cidade, 'a cidade', 120),
      estado: validateEstadoPaciente(estado),
    };
    const validErrors = Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as ErrosDoFormulario;

    setFieldErrors(validErrors);
    setFormError('');

    if (Object.keys(validErrors).length > 0) {
      focusFirstInvalidField();
      return;
    }

    setIsSubmitting(true);

    try {
      const paciente = await cadastrarPaciente({
        nome,
        cpf,
        dataNascimento,
        sexo,
        convenio,
        numeroCarteirinha,
        telefone,
        email,
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
      });
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
  }

  return {
    nome,
    cpf,
    dataNascimento,
    sexo,
    convenio,
    numeroCarteirinha,
    cepMessage,
    telefone,
    email,
    cep,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    fieldErrors,
    formError,
    isSubmitting,
    formRef,
    handleSubmit,
    alterarNome,
    alterarCpf,
    alterarDataNascimento,
    alterarSexo,
    alterarConvenio,
    alterarNumeroCarteirinha,
    alterarTelefone,
    alterarEmail: (valor: string) => { setEmail(valor); clearError('email'); },
    alterarCep: (valor: string) => { setCep(valor.replace(/\D/g, '').slice(0, 8)); clearError('cep'); },
    alterarLogradouro: (valor: string) => { setLogradouro(valor); clearError('logradouro'); },
    alterarNumero: (valor: string) => { setNumero(valor); clearError('numero'); },
    alterarComplemento: (valor: string) => { setComplemento(valor.slice(0, 120)); clearError('complemento'); },
    alterarBairro: (valor: string) => { setBairro(valor); clearError('bairro'); },
    alterarCidade: (valor: string) => { setCidade(valor); clearError('cidade'); },
    alterarEstado: (valor: string) => { setEstado(valor.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2)); clearError('estado'); },
  };
}
