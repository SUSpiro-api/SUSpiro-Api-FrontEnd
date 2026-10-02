package com.app.suspiro.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.suspiro.dto.UsuarioLoginRequest;
import com.app.suspiro.dto.UsuarioResponse;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.security.AuthCookieService;
import com.app.suspiro.security.JwtService;
import com.app.suspiro.service.UsuarioService;
import com.app.suspiro.util.CpfUtils;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class LoginController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;
    private final AuthCookieService authCookieService;

    public LoginController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UsuarioService usuarioService,
            AuthCookieService authCookieService) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
        this.authCookieService = authCookieService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody UsuarioLoginRequest request,
            HttpServletResponse response) {

        String cpfNormalizado = CpfUtils.normalize(request.getCpf());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        cpfNormalizado,
                        request.getSenha()));

        UsuariosModel usuario = usuarioService.buscarPorCpf(cpfNormalizado);
        String token = jwtService.gerarToken(usuario);

        authCookieService.writeAuthenticationCookies(response, token);

        return ResponseEntity.ok(
                new LoginResponse(UsuarioResponse.fromModel(usuario)));
    }

    @GetMapping("/me")
    public ResponseEntity<SessionResponse> me(Principal principal) {
        UsuariosModel usuario = usuarioService.buscarPorCpf(principal.getName());
        return ResponseEntity.ok(
                new SessionResponse(UsuarioResponse.fromModel(usuario)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authCookieService.clearAuthenticationCookies(response);
        return ResponseEntity.noContent().build();
    }

    public record LoginResponse(UsuarioResponse user) {
    }

    public record SessionResponse(UsuarioResponse user) {
    }
}
