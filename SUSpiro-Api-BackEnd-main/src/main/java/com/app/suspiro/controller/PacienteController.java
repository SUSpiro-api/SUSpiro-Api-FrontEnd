package com.app.suspiro.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.suspiro.dto.PacienteCadastroRequest;
import com.app.suspiro.dto.PacienteResponse;
import com.app.suspiro.service.PacienteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    private final PacienteService pacienteService;

    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','MEDICO','ENFERMEIRO','RECEPCIONISTA')")
    @PostMapping
    public ResponseEntity<PacienteResponse> cadastrarPaciente(
            @RequestBody @Valid PacienteCadastroRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(pacienteService.cadastrarPaciente(request));
    }
}
