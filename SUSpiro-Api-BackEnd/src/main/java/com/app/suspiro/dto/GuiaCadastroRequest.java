package com.app.suspiro.dto;

import java.time.LocalDate;

import com.app.suspiro.enums.PrioridadeGuia;
import com.app.suspiro.enums.TipoConsulta;
import com.app.suspiro.enums.TipoGuia;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record GuiaCadastroRequest(
        @NotNull(message = "O paciente é obrigatório.")
        Long pacienteId,

        @NotBlank(message = "O nome do paciente é obrigatório.")
        @Size(max = 150, message = "O nome do paciente deve ter no máximo 150 caracteres.")
        String pacienteNome,

        @NotBlank(message = "O CPF do paciente é obrigatório.")
        @Pattern(regexp = "\\d{11}", message = "O CPF do paciente deve conter 11 dígitos.")
        String pacienteCpf,

        @NotNull(message = "O tipo da guia é obrigatório.")
        TipoGuia tipo,

        TipoConsulta tipoConsulta,

        @Size(max = 255, message = "O detalhe deve ter no máximo 255 caracteres.")
        String detalhe,

        @NotNull(message = "A data solicitada é obrigatória.")
        @FutureOrPresent(message = "A data solicitada não pode ser anterior à data de hoje.")
        LocalDate dataSolicitada,

        @Size(max = 1000, message = "A observação deve ter no máximo 1000 caracteres.")
        String observacao,

        @NotNull(message = "A prioridade é obrigatória.")
        PrioridadeGuia prioridade
) {}
