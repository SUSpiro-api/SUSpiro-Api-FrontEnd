package com.app.suspiro.dto;

import java.time.LocalDateTime;

import com.app.suspiro.enums.Perfil;
import com.app.suspiro.model.UsuariosModel;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({
        "id",
        "nome",
        "cpf",
        "email",
        "perfil",
        "ativo",
        "criadoEm",
        "atualizadoEm"
})
public class UsuarioResponse {

    private Long id;
    private String nome;
    private String cpf;
    private String email;
    private Perfil perfil;
    private boolean ativo;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public static UsuarioResponse fromModel(UsuariosModel usuario) {

        UsuarioResponse response = new UsuarioResponse();

        response.id = usuario.getId();
        response.nome = usuario.getNome();
        response.cpf = usuario.getCpf();
        response.email = usuario.getEmail();
        response.perfil = usuario.getPerfil();
        response.ativo = usuario.isAtivo();
        response.criadoEm = usuario.getCriadoEm();
        response.atualizadoEm = usuario.getAtualizadoEm();

        return response;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getCpf() {
        return cpf;
    }

    public String getEmail() {
        return email;
    }

    public Perfil getPerfil() {
        return perfil;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
