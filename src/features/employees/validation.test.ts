import { describe, expect, it } from 'vitest';
import {
  validateCpfFuncionario,
  validateConfirmarSenha,
  validateNome,
  validateSenhaFuncionario,
} from './validation';

describe('validateNome', () => {
  it('rejects empty name', () => {
    expect(validateNome('')).toBe('Informe o nome completo.');
  });

  it('rejects name shorter than 3 characters', () => {
    expect(validateNome('Jo')).toBe('O nome deve ter pelo menos 3 caracteres.');
  });

  it('accepts a valid name', () => {
    expect(validateNome('Maria Silva')).toBe('');
  });
});

describe('validateCpfFuncionario', () => {
  it('rejects an invalid CPF (bad check digits)', () => {
    expect(validateCpfFuncionario('111.111.111-11')).toBe(
      'Informe um CPF válido com 11 dígitos.',
    );
  });

  it('rejects a CPF with fewer than 11 digits', () => {
    expect(validateCpfFuncionario('123.456.789')).toBe(
      'Informe um CPF válido com 11 dígitos.',
    );
  });

  it('accepts a valid CPF', () => {

    expect(validateCpfFuncionario('111.444.777-35')).toBe('');
  });
});

describe('validateSenhaFuncionario', () => {
  it('rejects empty password', () => {
    expect(validateSenhaFuncionario('')).toBe('Informe uma senha.');
  });

  it('rejects password shorter than 8 characters', () => {
    expect(validateSenhaFuncionario('abc123')).toBe(
      'A senha deve ter no mínimo 8 caracteres.',
    );
  });

  it('rejects password without a number', () => {
    expect(validateSenhaFuncionario('somenteletras')).toBe(
      'A senha deve conter pelo menos uma letra e um número.',
    );
  });

  it('rejects password without a letter', () => {
    expect(validateSenhaFuncionario('12345678')).toBe(
      'A senha deve conter pelo menos uma letra e um número.',
    );
  });

  it('accepts a valid password', () => {
    expect(validateSenhaFuncionario('senha1234')).toBe('');
  });
});

describe('validateConfirmarSenha', () => {
  it('rejects when passwords do not match', () => {
    expect(validateConfirmarSenha('senha1234', 'outraSenha1')).toBe(
      'As senhas não coincidem.',
    );
  });

  it('accepts when passwords match', () => {
    expect(validateConfirmarSenha('senha1234', 'senha1234')).toBe('');
  });
});
