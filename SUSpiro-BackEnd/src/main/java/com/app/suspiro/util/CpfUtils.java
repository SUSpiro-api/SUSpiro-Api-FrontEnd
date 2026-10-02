package com.app.suspiro.util;

public final class CpfUtils {

    private CpfUtils() {
    }

    /**
     * Remove formatação do CPF e retorna somente os 11 dígitos.
     */
    public static String normalize(String cpf) {
        if (cpf == null) {
            return null;
        }
        return cpf.replaceAll("\\D", "");
    }
}
