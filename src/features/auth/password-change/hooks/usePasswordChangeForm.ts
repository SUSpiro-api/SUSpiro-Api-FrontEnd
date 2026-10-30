
import { useState, type FormEvent } from 'react';
import { authenticatedFetch } from '../../../../api/httpClient';
import { setSenhaProvisoria, setToken } from '../../token';

interface UsePasswordChangeFormParams {
  onConcluido: () => void;
  exigirSenhaAtual?: boolean;
}

export function usePasswordChangeForm({ onConcluido, exigirSenhaAtual = true }: UsePasswordChangeFormParams) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validarSenhas() {
    if (exigirSenhaAtual && !senhaAtual) return 'Informe sua senha inicial ou provisória atual.';
    if (novaSenha.length < 12) return 'A nova senha deve ter pelo menos 12 caracteres.';
    if (novaSenha.length > 72) return 'A nova senha deve ter no máximo 72 caracteres.';
    if (!/[a-z]/.test(novaSenha) || !/[A-Z]/.test(novaSenha) || !/\d/.test(novaSenha) || !/[^A-Za-z0-9]/.test(novaSenha)) return 'Use letras maiúsculas e minúsculas, número e símbolo.';
    if (novaSenha !== confirmacao) return 'As senhas não coincidem.';
    if (senhaAtual && novaSenha === senhaAtual) return 'A nova senha precisa ser diferente da senha provisória.';
    return '';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validarSenhas();
    if (validationError) {
      setErro(validationError);
      return;
    }

    setErro('');
    setIsSubmitting(true);
    try {
      const response = await authenticatedFetch<{ token?: string; senhaProvisoria?: boolean }>('/usuarios/me/senha', {
        method: 'PATCH',
        body: JSON.stringify({ ...(exigirSenhaAtual ? { senhaAtual } : {}), novaSenha }),
        retries: 0,
      });
      if (!response?.token) {
        throw new Error('A API não retornou a nova sessão após a troca de senha. Entre novamente.');
      }
      setToken(response.token);
      setSenhaProvisoria(response.senhaProvisoria === true);
      onConcluido();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível trocar a senha.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { senhaAtual, novaSenha, confirmacao, erro, isSubmitting, setSenhaAtual, setNovaSenha, setConfirmacao, handleSubmit };
}
