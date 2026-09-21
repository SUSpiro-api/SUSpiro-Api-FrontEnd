package com.app.suspiro.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.app.suspiro.model.PacienteModel;

public class PacienteResponse {

    private final Long id;
    private final String nome;
    private final String cpf;
    private final LocalDate dataNascimento;
    private final String numeroSus;
    private final String telefone;
    private final LocalDateTime criadoEm;

    private PacienteResponse(
            Long id,
            String nome,
            String cpf,
            LocalDate dataNascimento,
            String numeroSus,
            String telefone,
            LocalDateTime criadoEm) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.numeroSus = numeroSus;
        this.telefone = telefone;
        this.criadoEm = criadoEm;
    }

    public static PacienteResponse fromModel(PacienteModel paciente) {
        return new PacienteResponse(
                paciente.getId(),
                paciente.getNome(),
                paciente.getCpf(),
                paciente.getDataNascimento(),
                paciente.getNumeroSus(),
                paciente.getTelefone(),
                paciente.getCriadoEm()
        );
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

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public String getNumeroSus() {
        return numeroSus;
    }

    public String getTelefone() {
        return telefone;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
