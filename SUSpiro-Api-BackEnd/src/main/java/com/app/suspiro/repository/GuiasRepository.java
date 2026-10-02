package com.app.suspiro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.suspiro.enums.StatusGuia;
import com.app.suspiro.model.GuiaModel;

public interface GuiasRepository extends JpaRepository<GuiaModel, Long> {
    List<GuiaModel> findByStatusOrderByPrioridadeDescDataSolicitadaAscCriadoEmAsc(StatusGuia status);
    List<GuiaModel> findBySolicitanteIdOrderByCriadoEmDesc(Long solicitanteId);
}
