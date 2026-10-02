package com.app.suspiro.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class CpfUtilsTest {

    @Test
    void deveRemoverFormatacao() {
        assertEquals("13827327083", CpfUtils.normalize("138.273.270-83"));
    }

    @Test
    void deveManterCpfSemFormatacao() {
        assertEquals("13827327083", CpfUtils.normalize("13827327083"));
    }

    @Test
    void deveAceitarValorNulo() {
        assertNull(CpfUtils.normalize(null));
    }
}
