package com.app.suspiro.exception;

import java.time.LocalDateTime;

public record ErroResposta(
        LocalDateTime timestamp,
        int status,
        String erro,
        String mensagem) {

    public static ErroResposta de(int status, String erro, String mensagem) {
        return new ErroResposta(LocalDateTime.now(), status, erro, mensagem);
    }
}
