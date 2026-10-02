package com.app.suspiro.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import com.app.suspiro.dto.GuiaAgendamentoRequest;
import com.app.suspiro.dto.GuiaCadastroRequest;
import com.app.suspiro.dto.GuiaResponse;
import com.app.suspiro.service.GuiaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/guias")
public class GuiaController {

    private final GuiaService guiaService;

    public GuiaController(GuiaService guiaService) {
        this.guiaService = guiaService;
    }

    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<GuiaResponse> criar(@RequestBody @Valid GuiaCadastroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(guiaService.criar(request));
    }

    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/minhas")
    public List<GuiaResponse> listarMinhas() {
        return guiaService.listarMinhas();
    }

    @PreAuthorize("hasAnyRole('ENFERMEIRO', 'RECEPCIONISTA', 'ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/pendentes")
    public List<GuiaResponse> listarPendentes() {
        return guiaService.listarPendentes();
    }

    @PreAuthorize("hasAnyRole('ENFERMEIRO', 'RECEPCIONISTA', 'ADMIN', 'SUPER_ADMIN')")
    @PatchMapping("/{id}/agendamento")
    public GuiaResponse agendar(
            @PathVariable Long id,
            @RequestBody @Valid GuiaAgendamentoRequest request) {
        return guiaService.agendar(id, request);
    }
}
