package com.app.suspiro.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import com.app.suspiro.enums.Perfil;
import com.app.suspiro.model.UsuariosModel;

class JwtServiceTest {

    private static final String SECRET = "12345678901234567890123456789012";

    @Test
    void deveGerarEValidarToken() {
        JwtService service = new JwtService(SECRET, 60_000);
        UsuariosModel user = new UsuariosModel();
        user.setCpf("52998224725");
        user.setPerfil(Perfil.ADMIN);

        String token = service.gerarToken(user);

        assertTrue(service.tokenValido(token));
        assertEquals("52998224725", service.extrairCpf(token));
        assertEquals("ADMIN", service.extrairClaims(token).get("perfil", String.class));
    }

    @Test
    void deveRejeitarTokenComAssinaturaInvalida() {
        JwtService service = new JwtService(SECRET, 60_000);
        assertFalse(service.tokenValido("abc.def.ghi"));
    }

    @Test
    void deveRejeitarConfiguracaoDeSecretCurto() {
        assertThrows(IllegalStateException.class, () -> new JwtService("curto", 60_000));
    }
}
