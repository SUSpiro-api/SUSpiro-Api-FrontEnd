package com.app.suspiro.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

public record GuiaAgendamentoRequest(
        @NotNull(message = "A data do agendamento é obrigatória.")
        @FutureOrPresent(message = "A data do agendamento não pode ser anterior à data de hoje.")
        LocalDate dataAgendamento,

        @NotNull(message = "O horário do agendamento é obrigatório.")
        LocalTime horaAgendamento
) {}
