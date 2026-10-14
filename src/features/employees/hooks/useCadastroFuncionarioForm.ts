import { useState, type FormEvent } from 'react';
import { ApiError } from '../../../api/httpClient';
import { useFocusFirstInvalidField } from '../../../hooks/useFocusFirstInvalidField';
import { formatCpf } from '../../../utils/cpf';
import { cadastrarFuncionario, type PerfilFuncionario, type UsuarioCriado } from '../service';
import {
  validateConfirmarSenha,
  validateCpfFuncionario,
  validateNome,
  validateSenhaFuncionario,
} from '../validation';

type Campo = 'nome' | 'cpf' | 'senha' | 'confirmarSenha';
type ErrosDoFormulario = Partial<Record<Campo, string>>;

export function useCadastroFuncionarioForm(onSucesso: (funcionario: UsuarioCriado) => void) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilFuncionario>('RECEPCIONISTA');
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

  function alterarSenha(valor: string) {
    setSenha(valor);
    clearError('senha');
  }

  function alterarConfirmacaoSenha(valor: string) {
    setConfirmarSenha(valor);
    clearError('confirmarSenha');
  }

  function alterarPerfil(valor: PerfilFuncionario) {
    setPerfil(valor);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: ErrosDoFormulario = {
      nome: validateNome(nome),
      cpf: validateCpfFuncionario(cpf),
      senha: validateSenhaFuncionario(senha),
      confirmarSenha: validateConfirmarSenha(senha, confirmarSenha),
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
  }

  return {
    nome,
    cpf,
    senha,
    confirmarSenha,
    perfil,
    fieldErrors,
    formError,
    isSubmitting,
    formRef,
    handleSubmit,
    alterarNome,
    alterarCpf,
    alterarSenha,
    alterarConfirmacaoSenha,
    alterarPerfil,
  };
}
