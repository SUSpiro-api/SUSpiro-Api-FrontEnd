import { describe, expect, it } from 'vitest';
import {
  validateCpfPaciente,
  validateDataNascimento,
  validateNomePaciente,
  validateNumeroSus,
  validateTelefone,
} from './validation';

describe('validações de cadastro de paciente', () => {
  it('valida o nome do paciente', () => {
    expect(validateNomePaciente('')).toBe('Informe o nome completo.');
    expect(validateNomePaciente('Li')).toBe('O nome deve ter pelo menos 3 caracteres.');
    expect(validateNomePaciente('Maria Silva')).toBe('');
  });

  it('valida o CPF do paciente', () => {
    expect(validateCpfPaciente('')).not.toBe('');
    expect(validateCpfPaciente('123.456.789-00')).not.toBe('');
    expect(validateCpfPaciente('529.982.247-25')).toBe('');
  });

  it('valida a data de nascimento', () => {
    expect(validateDataNascimento('')).toBe('Informe a data de nascimento.');
    expect(validateDataNascimento('1990-05-20')).toBe('');
  });

  it('valida o número do SUS', () => {
    expect(validateNumeroSus('')).toBe('Informe o número do SUS.');
    expect(validateNumeroSus('12345678901234')).toBe(
      'O número do SUS deve conter 15 dígitos.',
    );
    expect(validateNumeroSus('123 456 789 012 345')).toBe('');
  });

  it('aceita telefone vazio por ser opcional', () => {
    expect(validateTelefone('')).toBe('');
  });

  it('valida telefone com DDD', () => {
    expect(validateTelefone('859999999')).toBe(
      'Informe um telefone válido com DDD.',
    );
    expect(validateTelefone('(85) 99999-9999')).toBe('');
    expect(validateTelefone('(85) 3333-4444')).toBe('');
  });
});
