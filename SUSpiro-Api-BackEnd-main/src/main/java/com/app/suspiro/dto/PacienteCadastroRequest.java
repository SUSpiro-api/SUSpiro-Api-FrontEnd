package com.app.suspiro.dto;

import java.time.LocalDate;

import com.app.suspiro.validation.CpfValido;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PacienteCadastroRequest {

    @NotBlank(message = "O nome é obrigatório.")
    @Size(min = 3, max = 150, message = "O nome deve ter entre 3 e 150 caracteres.")
    private String nome;

    @NotBlank(message = "O CPF é obrigatório.")
    @CpfValido
    private String cpf;

    @NotNull(message = "A data de nascimento é obrigatória.")
    @Past(message = "A data de nascimento deve estar no passado.")
    private LocalDate dataNascimento;

    @NotBlank(message = "O número do SUS é obrigatório.")
    @Size(min = 15, max = 15, message = "O número do SUS deve conter 15 dígitos.")
    @Pattern(regexp = "\\d{15}", message = "O número do SUS deve conter apenas dígitos.")
    private String numeroSus;

    @Pattern(regexp = "^$|\\d{10,11}$", message = "Informe um telefone válido com DDD.")
    private String telefone;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public String getNumeroSus() { return numeroSus; }
    public void setNumeroSus(String numeroSus) { this.numeroSus = numeroSus; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
}
