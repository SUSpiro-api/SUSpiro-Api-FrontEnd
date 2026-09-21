package com.app.suspiro.validation;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class CpfValidoValidatorTest {

    private final CpfValidoValidator validator = new CpfValidoValidator();

    @Test
    void deveAceitarCpfValidoComMascara() {
        assertTrue(validator.isValid("529.982.247-25", null));
    }

    @Test
    void deveRejeitarCpfComDigitosRepetidos() {
        assertFalse(validator.isValid("111.111.111-11", null));
    }

    @Test
    void deveConsiderarCampoOpcionalNuloComoValido() {
        assertTrue(validator.isValid(null, null));
    }
}
