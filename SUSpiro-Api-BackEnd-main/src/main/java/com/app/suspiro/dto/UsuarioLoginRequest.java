package com.app.suspiro.dto;

import com.app.suspiro.validation.CpfValido;
import jakarta.validation.constraints.NotBlank;

public class UsuarioLoginRequest {

    @NotBlank(message = "O CPF é obrigatório.")
    @CpfValido
    private String cpf;

    @NotBlank(message = "A senha é obrigatória.")
    private String senha;

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}
