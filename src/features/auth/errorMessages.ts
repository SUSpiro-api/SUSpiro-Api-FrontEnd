import { AuthError } from './types';

//Centraliza todas as menssagens de erro//

const GENERIC_CONNECTION_MESSAGE =
  'Não foi possível conectar ao serviço. Tente novamente em instantes.';

/** Códigos de `AuthError` que representam falha de conectividade/infra, não do usuário. */
const CONNECTION_ERROR_CODES = new Set<string>(['NETWORK', 'NOT_CONFIGURED']);

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

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return ['credencial', 'senha', 'cpf'].some((keyword) => message.includes(keyword));
  }

  return false;
}


export function getLoginErrorMessage(error: unknown): string {
  if (looksLikeInvalidCredentials(error)) {
    return 'CPF/e-mail ou senha inválidos. Confira seus dados e tente novamente.';
  }

  if (looksLikeConnectionError(error)) {
    return GENERIC_CONNECTION_MESSAGE;
  }

  return 'Não foi possível concluir o acesso. Tente novamente.';
}

/** Mensagem de erro para exibir após uma falha ao solicitar troca  de senha. */
export function getPasswordResetErrorMessage(error: unknown): string {
  return looksLikeConnectionError(error)
    ? GENERIC_CONNECTION_MESSAGE
    : 'Não foi possível enviar as instruções. Tente novamente.';
}
