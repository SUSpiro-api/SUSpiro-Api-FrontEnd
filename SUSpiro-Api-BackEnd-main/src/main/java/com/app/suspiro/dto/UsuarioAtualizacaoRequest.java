package com.app.suspiro.dto;

import com.app.suspiro.enums.Perfil;
import com.app.suspiro.validation.CpfValido;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioAtualizacaoRequest {

    @NotBlank(message = "O nome é obrigatório.")
    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
    private String nome;

    @NotBlank(message = "O CPF é obrigatório.")
    @CpfValido
    private String cpf;

    @Email(message = "Informe um e-mail válido.")
    @Size(max = 255, message = "O e-mail deve ter no máximo 255 caracteres.")
    private String email;

    @Size(max = 72, message = "A senha deve ter no máximo 72 caracteres.")
    @Pattern(
        regexp = "^$|(?s)(?=.*[A-Za-z])(?=.*\\d).{8,72}$",
        message = "A senha deve conter pelo menos 8 caracteres, uma letra e um número."
    )
    private String senha;

    @NotNull(message = "O perfil é obrigatório.")
    private Perfil perfil;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public Perfil getPerfil() { return perfil; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }
}
