package com.app.suspiro.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.app.suspiro.enums.PrioridadeGuia;
import com.app.suspiro.enums.StatusGuia;
import com.app.suspiro.enums.TipoGuia;
import com.app.suspiro.model.GuiaModel;

public record GuiaResponse(
        Long id,
        Long pacienteId,
        String pacienteNome,
        String pacienteCpf,
        TipoGuia tipo,
        String especialidade,
        String detalhe,
        LocalDate dataSolicitada,
        String observacao,
        PrioridadeGuia prioridade,
        StatusGuia status,
        Long solicitanteId,
        String solicitanteNome,
        LocalDate dataAgendamento,
        LocalTime horaAgendamento,
        Long agendadoPorId,
        String agendadoPorNome,
        LocalDateTime criadoEm) {

    public static GuiaResponse fromModel(GuiaModel guia) {
        return new GuiaResponse(
                guia.getId(),
                guia.getPacienteId(),
                guia.getPacienteNome(),
                guia.getPacienteCpf(),
                guia.getTipo(),
                guia.getEspecialidade(),
                guia.getDetalhe(),
                guia.getDataSolicitada(),
                guia.getObservacao(),
                guia.getPrioridade(),
                guia.getStatus(),
                guia.getSolicitanteId(),
                guia.getSolicitanteNome(),
                guia.getDataAgendamento(),
                guia.getHoraAgendamento(),
                guia.getAgendadoPorId(),
                guia.getAgendadoPorNome(),
                guia.getCriadoEm());
    }
}
