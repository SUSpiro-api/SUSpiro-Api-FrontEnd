// Guarda os dados do perfil, valida e salva as alterações da conta.

import { useState, type FormEvent } from 'react';
import { authenticatedFetch } from '../../../api/httpClient';
import type { AuthUser } from '../../auth/types';
import { setToken } from '../../auth/token';
import { useFocusFirstInvalidField } from '../../../hooks/useFocusFirstInvalidField';
import {
  validateConfirmarSenhaPerfil,
  validateNomePerfil,
  validateNovaSenhaPerfil,
  validateSenhaAtualPerfil,
} from '../validation';

type Campo = 'nome' | 'senhaAtual' | 'novaSenha' | 'confirmacao';
type ErrosDoFormulario = Partial<Record<Campo, string>>;

interface UsePerfilFormParams {
  user: AuthUser;
  onAtualizarUsuario: (updates: Partial<Pick<AuthUser, 'nome'>>) => void;
  securityOnly?: boolean;
}

/** Troca a senha pelo endpoint já existente na API (o mesmo da senha provisória). */
async function trocarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
  const response = await authenticatedFetch<{ token?: string }>('/usuarios/me/senha', {
    method: 'PATCH',
    body: JSON.stringify({ senhaAtual, novaSenha }),
    retries: 0,
  });
  if (!response?.token) throw new Error('A API não retornou a nova sessão após a troca de senha.');
  setToken(response.token);
}

export function usePerfilForm({ user, onAtualizarUsuario, securityOnly = false }: UsePerfilFormParams) {
  const [nome, setNome] = useState(user.nome ?? '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ErrosDoFormulario>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const { formRef, focusFirstInvalidField } = useFocusFirstInvalidField();

  function clearError(campo: Campo) {
    setFieldErrors((erros) => ({ ...erros, [campo]: undefined }));
  }

  function alterarNome(valor: string) {
    setNome(valor);
    clearError('nome');
  }

  function alterarSenhaAtual(valor: string) {
    setSenhaAtual(valor);
    clearError('senhaAtual');
    setSalvo(false);
  }

  function alterarNovaSenha(valor: string) {
    setNovaSenha(valor);
    clearError('novaSenha');
    setSalvo(false);
  }

  function alterarConfirmacao(valor: string) {
    setConfirmacao(valor);
    clearError('confirmacao');
    setSalvo(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const querTrocarSenha = securityOnly || Boolean(senhaAtual || novaSenha || confirmacao);
    const errors: ErrosDoFormulario = securityOnly ? {} : { nome: validateNomePerfil(nome) };
    if (querTrocarSenha) {
      errors.senhaAtual = validateSenhaAtualPerfil(senhaAtual);
      errors.novaSenha = validateNovaSenhaPerfil(novaSenha, senhaAtual);
      errors.confirmacao = validateConfirmarSenhaPerfil(confirmacao, novaSenha);
    }

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
      if (querTrocarSenha) {
        await trocarSenha(senhaAtual, novaSenha);
      }
      if (!securityOnly && nome.trim() !== (user.nome ?? '')) {
        await authenticatedFetch('/usuarios/me', { method: 'PATCH', body: JSON.stringify({ nome: nome.trim() }), retries: 0 });
        onAtualizarUsuario({ nome: nome.trim() });
      }
      setSalvo(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar as alterações. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function continuarEditando() {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmacao('');
    setFormError('');
    setSalvo(false);
  }

  return {
    nome,
    senhaAtual,
    novaSenha,
    confirmacao,
    fieldErrors,
    formError,
    isSubmitting,
    salvo,
    formRef,
    handleSubmit,
    alterarNome,
    alterarSenhaAtual,
    alterarNovaSenha,
    alterarConfirmacao,
    continuarEditando,
  };
}
