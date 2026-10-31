import { useState, type FormEvent } from 'react';
import { ApiError } from '../../../api/httpClient';
import { useFocusFirstInvalidField } from '../../../hooks/useFocusFirstInvalidField';
import { formatCpf } from '../../../utils/cpf';
import { cadastrarFuncionario, type PerfilFuncionario, type UsuarioCriado } from '../service';
import {
  validateCpfFuncionario,
  validateEmailFuncionario,
  validateNome,
  validateSenhaFuncionario,
} from '../validation';

type Campo = 'nome' | 'cpf' | 'email' | 'sexo' | 'registroProfissional' | 'senhaTemporaria';
type ErrosDoFormulario = Partial<Record<Campo, string>>;

export function useCadastroFuncionarioForm(onSucesso: (funcionario: UsuarioCriado) => void, perfilInicial: PerfilFuncionario = 'ATENDENTE') {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [sexo, setSexo] = useState('');
  const [registroProfissional, setRegistroProfissional] = useState('');
  const [senhaTemporaria, setSenhaTemporaria] = useState('');
  const [perfil, setPerfil] = useState<PerfilFuncionario>(perfilInicial);
  const [fieldErrors, setFieldErrors] = useState<ErrosDoFormulario>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  function alterarEmail(valor: string) {
    setEmail(valor);
    clearError('email');
  }

  function alterarSexo(valor: string) { setSexo(valor); clearError('sexo'); }

  function alterarRegistroProfissional(valor: string) { setRegistroProfissional(valor.slice(0, 40)); clearError('registroProfissional'); }

  function alterarSenhaTemporaria(valor: string) {
    setSenhaTemporaria(valor);
    clearError('senhaTemporaria');
  }

  function alterarPerfil(valor: PerfilFuncionario) {
    setPerfil(valor);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: ErrosDoFormulario = {
      nome: validateNome(nome),
      cpf: validateCpfFuncionario(cpf),
      email: validateEmailFuncionario(email),
      sexo: sexo ? '' : 'Selecione o sexo.',
      registroProfissional: perfil === 'MEDICO' || perfil === 'ENFERMEIRO' ? (registroProfissional.trim() ? '' : `Informe o ${perfil === 'ENFERMEIRO' ? 'COREN' : 'CRM'}.`) : '',
      senhaTemporaria: validateSenhaFuncionario(senhaTemporaria) || undefined,
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
      const funcionario = await cadastrarFuncionario({ nome, cpf, email, perfil, sexo, registroProfissional, senhaTemporaria });
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
  }

  return {
    nome,
    cpf,
    email,
    sexo,
    registroProfissional,
    senhaTemporaria,
    perfil,
    fieldErrors,
    formError,
    isSubmitting,
    formRef,
    handleSubmit,
    alterarNome,
    alterarCpf,
    alterarEmail,
    alterarSexo,
    alterarRegistroProfissional,
    alterarSenhaTemporaria,
    alterarPerfil,
  };
}
