package com.app.suspiro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.suspiro.model.PacienteModel;

public interface PacienteRepository extends JpaRepository<PacienteModel, Long> {

    boolean existsByCpf(String cpf);

    boolean existsByNumeroSus(String numeroSus);

    Optional<PacienteModel> findByCpf(String cpf);
}
