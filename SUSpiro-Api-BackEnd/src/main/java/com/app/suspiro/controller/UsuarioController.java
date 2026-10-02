package com.app.suspiro.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.suspiro.dto.UsuarioAtualizacaoRequest;
import com.app.suspiro.dto.UsuarioCadastroRequest;
import com.app.suspiro.dto.UsuarioResponse;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @PostMapping
    public ResponseEntity<UsuarioResponse> cadastrarUsuario(
            @RequestBody @Valid UsuarioCadastroRequest request) {

        UsuariosModel usuario = usuarioService.cadastrarUsuario(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UsuarioResponse.fromModel(usuario));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @GetMapping("/{id}")
    public UsuarioResponse buscarUsuarioPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @PutMapping("/{id}")
    public UsuarioResponse atualizarUsuario(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioAtualizacaoRequest request) {

        return usuarioService.atualizarUsuario(id, request);
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluirUsuario(@PathVariable Long id) {

        usuarioService.excluirUsuario(id);

        return ResponseEntity.noContent().build();
    }
}
