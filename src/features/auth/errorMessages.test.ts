import { describe, expect, it } from 'vitest';
import { AuthError } from './types';
import { getLoginErrorMessage, getPasswordResetErrorMessage } from './errorMessages';

describe('getLoginErrorMessage', () => {
  it('recognizes invalid credentials via AuthError code', () => {
    const error = new AuthError('Credenciais inválidas.', 'INVALID_CREDENTIALS');
    expect(getLoginErrorMessage(error)).toMatch(/inválidos/);
  });

  it('recognizes a connection failure via AuthError code', () => {
    const error = new AuthError('Não foi possível conectar ao serviço.', 'NETWORK');
    expect(getLoginErrorMessage(error)).toMatch(/conectar ao serviço/);
  });

  it('falls back to keyword matching for a plain Error thrown by a caller-supplied onLogin', () => {
    const error = new Error('connection failed');
    expect(getLoginErrorMessage(error)).toMatch(/conectar ao serviço/);
  });

  it('returns a generic message for an unrecognized error', () => {
    const error = new Error('something unexpected');
    expect(getLoginErrorMessage(error)).toBe('Não foi possível concluir o acesso. Tente novamente.');
  });
});

describe('getPasswordResetErrorMessage', () => {
  it('recognizes a connection failure via AuthError code', () => {
    const error = new AuthError('offline', 'NOT_CONFIGURED');
    expect(getPasswordResetErrorMessage(error)).toMatch(/conectar ao serviço/);
  });

  it('explains when password recovery is not available in the back-end yet', () => {
    const error = new AuthError('indisponível', 'NOT_AVAILABLE');
    expect(getPasswordResetErrorMessage(error)).toMatch(/ainda não está disponível/);
    expect(getPasswordResetErrorMessage(error)).toMatch(/administrador/);
  });

  it('returns a generic message otherwise', () => {
    const error = new Error('unexpected');
    expect(getPasswordResetErrorMessage(error)).toBe(
      'Não foi possível enviar as instruções. Tente novamente.',
    );
  });
});
