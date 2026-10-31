// Transforma erros de autenticação em mensagens fáceis de entender.

import { AuthError } from './types';

const GENERIC_CONNECTION_MESSAGE =
  'Não foi possível conectar ao serviço. Tente novamente em instantes.';

const CONNECTION_ERROR_CODES = new Set<string>(['NETWORK', 'NOT_CONFIGURED']);

const SPECIFIC_MESSAGE_CODES = new Set<string>([
  'CPF_NAO_CADASTRADO', 'SENHA_INCORRETA', 'CONTA_DESATIVADA', 'DADOS_INVALIDOS',
  'FORBIDDEN', 'CONFLICT', 'NOT_FOUND', 'RATE_LIMITED', 'SERVER', 'SESSAO_EXPIRADA',
]);

const CONNECTION_KEYWORDS = ['conectar', 'connection', 'network'];

function looksLikeConnectionError(error: unknown): boolean {
  if (error instanceof AuthError) {
    return CONNECTION_ERROR_CODES.has(error.code);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return CONNECTION_KEYWORDS.some((keyword) => message.includes(keyword));
  }

  return false;
}

function looksLikeInvalidCredentials(error: unknown): boolean {
  if (error instanceof AuthError) {
    return error.code === 'INVALID_CREDENTIALS';
  }

  // Somente um código explícito de autenticação representa credenciais inválidas.
  // Erros 403, de validação ou do servidor não são convertidos em falha de login.
  return false;
}

export function getLoginErrorMessage(error: unknown): string {

  if (error instanceof AuthError && SPECIFIC_MESSAGE_CODES.has(error.code) && error.message) {
    return error.message;
  }

  if (looksLikeInvalidCredentials(error)) {
    return 'CPF ou senha inválidos. Confira seus dados e tente novamente.';
  }

  if (looksLikeConnectionError(error)) {
    return GENERIC_CONNECTION_MESSAGE;
  }

  if (error instanceof AuthError && error.code === 'FORBIDDEN') return error.message || 'Você não tem permissão para acessar este recurso.';
  if (error instanceof AuthError && error.code === 'CONFLICT') return error.message || 'Há um conflito com os dados informados.';
  if (error instanceof AuthError && error.code === 'NOT_FOUND') return error.message || 'O recurso solicitado não foi encontrado.';
  if (error instanceof AuthError && error.code === 'RATE_LIMITED') return error.message || 'Muitas tentativas. Aguarde e tente novamente.';
  if (error instanceof AuthError && error.code === 'SERVER') return error.message || 'O serviço encontrou um erro interno. Tente mais tarde.';
  if (error instanceof AuthError && error.code === 'SESSAO_EXPIRADA') return error.message || 'Sua sessão expirou. Entre novamente.';
  return 'Não foi possível concluir o acesso. Tente novamente.';
}

export function getPasswordResetErrorMessage(error: unknown): string {
  if (error instanceof AuthError && error.code === 'NOT_AVAILABLE') {
    return 'A recuperação de senha por e-mail ainda não está disponível. Procure o administrador da sua unidade para redefinir sua senha.';
  }

  return looksLikeConnectionError(error)
    ? GENERIC_CONNECTION_MESSAGE
    : 'Não foi possível enviar as instruções. Tente novamente.';
}
