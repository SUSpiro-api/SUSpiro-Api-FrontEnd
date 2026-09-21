package com.app.suspiro.exception;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioNaoEncontradoException.class)
    public ResponseEntity<ErroResposta> tratarUsuarioNaoEncontrado(UsuarioNaoEncontradoException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErroResposta.de(HttpStatus.NOT_FOUND.value(), "Usuário não encontrado", exception.getMessage()));
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ErroResposta> tratarRegraDeNegocio(RegraDeNegocioException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErroResposta.de(HttpStatus.CONFLICT.value(), "Regra de negócio violada", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> tratarErroDeValidacao(MethodArgumentNotValidException exception) {
        String mensagem = exception.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getField() + ": " + erro.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return ResponseEntity.badRequest()
                .body(ErroResposta.de(HttpStatus.BAD_REQUEST.value(), "Dados inválidos", mensagem));
    }

    @ExceptionHandler({ BadCredentialsException.class, DisabledException.class })
    public ResponseEntity<ErroResposta> tratarFalhaDeLogin(AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErroResposta.de(HttpStatus.UNAUTHORIZED.value(), "Falha de autenticação", "CPF ou senha inválidos."));
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, HttpMediaTypeNotSupportedException.class })
    public ResponseEntity<ErroResposta> tratarRequisicaoInvalida(Exception exception) {
        return ResponseEntity.badRequest()
                .body(ErroResposta.de(HttpStatus.BAD_REQUEST.value(), "Requisição inválida", "O corpo enviado não possui um formato válido."));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResposta> tratarViolacaoDeDados(DataIntegrityViolationException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErroResposta.de(
                        HttpStatus.CONFLICT.value(),
                        "Conflito de dados",
                        "Já existe um registro com os dados informados."));
    }
}
