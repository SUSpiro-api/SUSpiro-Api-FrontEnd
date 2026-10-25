// Testa as regras de validação do cadastro de cidadão.

import { describe, expect, it } from 'vitest';
import {
  maxBirthDate,
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

  it('respeita o limite de 150 caracteres do back-end para o nome', () => {
    expect(validateNomePaciente('a'.repeat(150))).toBe('');
    expect(validateNomePaciente('a'.repeat(151))).toBe(
      'O nome deve ter no máximo 150 caracteres.',
    );
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

  describe('data de nascimento no passado (exigência do back-end)', () => {
    const now = new Date(2026, 8, 28);

    it('calcula ontem como a última data aceita', () => {
      expect(maxBirthDate(now)).toBe('2026-09-27');
      expect(maxBirthDate(new Date(2026, 0, 1))).toBe('2025-12-31');
    });

    it('aceita ontem e rejeita hoje e datas futuras', () => {
      expect(validateDataNascimento('2026-09-27', now)).toBe('');
      expect(validateDataNascimento('2026-09-28', now)).toBe(
        'A data de nascimento deve estar no passado.',
      );
      expect(validateDataNascimento('2030-01-01', now)).toBe(
        'A data de nascimento deve estar no passado.',
      );
    });

    it('rejeita datas inexistentes ou absurdas', () => {
      const invalid = 'Informe uma data de nascimento válida.';
      expect(validateDataNascimento('2023-02-31', now)).toBe(invalid);
      expect(validateDataNascimento('20/05/1990', now)).toBe(invalid);
      expect(validateDataNascimento('1800-01-01', now)).toBe(invalid);
    });

    it('aceita 29/02 apenas em ano bissexto', () => {
      expect(validateDataNascimento('2024-02-29', now)).toBe('');
      expect(validateDataNascimento('2023-02-29', now)).toBe(
        'Informe uma data de nascimento válida.',
      );
    });
  });

  it('valida o número do SUS', () => {
    expect(validateNumeroSus('')).toBe('Informe o número do CNS.');
    expect(validateNumeroSus('12345678901234')).toBe(
      'O CNS deve conter 15 dígitos.',
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
