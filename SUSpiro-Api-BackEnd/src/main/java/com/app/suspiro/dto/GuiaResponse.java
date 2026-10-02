package com.app.suspiro.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.app.suspiro.enums.PrioridadeGuia;
import com.app.suspiro.enums.StatusGuia;
import com.app.suspiro.enums.TipoConsulta;
import com.app.suspiro.enums.TipoGuia;
import com.app.suspiro.model.GuiaModel;

public record GuiaResponse(
        Long id,
        Long pacienteId,
        String pacienteNome,
        String pacienteCpf,
        TipoGuia tipo,
        TipoConsulta tipoConsulta,
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
        LocalDateTime criadoEm
) {
    public static GuiaResponse fromModel(GuiaModel model) {
        return new GuiaResponse(
                model.getId(),
                model.getPacienteId(),
                model.getPacienteNome(),
                model.getPacienteCpf(),
                model.getTipo(),
                model.getTipoConsulta(),
                model.getDetalhe(),
                model.getDataSolicitada(),
                model.getObservacao(),
                model.getPrioridade(),
                model.getStatus(),
                model.getSolicitanteId(),
                model.getSolicitanteNome(),
                model.getDataAgendamento(),
                model.getHoraAgendamento(),
                model.getAgendadoPorId(),
                model.getAgendadoPorNome(),
                model.getCriadoEm()
        );
    }
}
