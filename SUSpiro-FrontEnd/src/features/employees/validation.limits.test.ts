import { describe, expect, it } from 'vitest';
import { validateNome, validateSenhaFuncionario } from './validation';

describe('limites do back-end para funcionário', () => {
  it('limita o nome a 150 caracteres', () => {
    expect(validateNome('a'.repeat(150))).toBe('');
    expect(validateNome('a'.repeat(151))).toBe('O nome deve ter no máximo 150 caracteres.');
  });

  it('limita a senha a 72 caracteres', () => {
    expect(validateSenhaFuncionario(`a1${'x'.repeat(70)}`)).toBe('');
    expect(validateSenhaFuncionario(`a1${'x'.repeat(71)}`)).toBe(
      'A senha deve ter no máximo 72 caracteres.',
    );
  });
});
