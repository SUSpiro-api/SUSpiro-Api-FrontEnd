package com.app.suspiro.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfValidoValidator implements ConstraintValidator<CpfValido, String> {

    @Override
    public boolean isValid(String cpf, ConstraintValidatorContext context) {

        if (cpf == null || cpf.isBlank()) {
            return true;
        }

        cpf = cpf.replaceAll("\\D", "");

        if (cpf.length() != 11) {
            return false;
        }

        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        int primeiroDigito = calcularDigito(cpf, 9);
        int segundoDigito = calcularDigito(cpf, 10);

        return primeiroDigito == Character.getNumericValue(cpf.charAt(9))
                && segundoDigito == Character.getNumericValue(cpf.charAt(10));
    }

    private int calcularDigito(String cpf, int quantidadeDigitos) {

        int soma = 0;
        int peso = quantidadeDigitos + 1;

        for (int i = 0; i < quantidadeDigitos; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * peso;
            peso--;
        }

        int resto = soma % 11;

        return resto < 2 ? 0 : 11 - resto;
    }
}
