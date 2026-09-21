package com.app.suspiro.service;

import java.util.List;
import java.util.Locale;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.suspiro.dto.UsuarioAtualizacaoRequest;
import com.app.suspiro.dto.UsuarioCadastroRequest;
import com.app.suspiro.dto.UsuarioResponse;
import com.app.suspiro.enums.Perfil;
import com.app.suspiro.exception.RegraDeNegocioException;
import com.app.suspiro.exception.UsuarioNaoEncontradoException;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.repository.UsuariosRepository;
import com.app.suspiro.security.AuthenticatedUserService;
import com.app.suspiro.security.SecurityAuth;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuariosRepository usuariosRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticatedUserService authenticatedUserService;

    public UsuarioService(
            UsuariosRepository usuariosRepository,
            PasswordEncoder passwordEncoder,
            AuthenticatedUserService authenticatedUserService) {
        this.usuariosRepository = usuariosRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticatedUserService = authenticatedUserService;
    }

    @Override
    public UserDetails loadUserByUsername(String cpf) throws UsernameNotFoundException {
        String cpfNormalizado = normalizeDigits(cpf);

        UsuariosModel usuario = usuariosRepository.findByCpf(cpfNormalizado)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return new SecurityAuth(usuario);
    }

    public UsuariosModel buscarPorCpf(String cpf) {
        return usuariosRepository.findByCpf(normalizeDigits(cpf))
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado."));
    }

    @Transactional
    public UsuariosModel cadastrarUsuario(UsuarioCadastroRequest request) {
        String cpf = normalizeDigits(request.getCpf());
        String email = normalizeEmail(request.getEmail());

        if (usuariosRepository.existsByCpf(cpf)) {
            throw new RegraDeNegocioException("CPF já cadastrado.");
        }

        if (email != null && usuariosRepository.existsByEmail(email)) {
            throw new RegraDeNegocioException("E-mail já cadastrado.");
        }

        if (request.getPerfil() == Perfil.SUPER_ADMIN) {
            throw new RegraDeNegocioException(
                    "Não é permitido cadastrar um novo SUPER_ADMIN por esta rota.");
        }

        if (request.getPerfil() == Perfil.ADMIN && !authenticatedUserService.isSuperAdmin()) {
            throw new RegraDeNegocioException(
                    "Apenas o SUPER_ADMIN pode cadastrar um novo ADMIN.");
        }

        UsuariosModel usuario = new UsuariosModel();
        usuario.setNome(request.getNome().trim());
        usuario.setCpf(cpf);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setPerfil(request.getPerfil());
        usuario.setAtivo(true);

        return usuariosRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarUsuarios() {
        return usuariosRepository.findAll().stream().map(UsuarioResponse::fromModel).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Long id) {
        UsuariosModel usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado."));
        return UsuarioResponse.fromModel(usuario);
    }

    @Transactional
    public UsuarioResponse atualizarUsuario(Long id, UsuarioAtualizacaoRequest request) {
        UsuariosModel usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado."));

        if (usuario.getPerfil() == Perfil.SUPER_ADMIN && !authenticatedUserService.isSuperAdmin()) {
            throw new RegraDeNegocioException(
                    "Apenas o SUPER_ADMIN pode alterar o SUPER_ADMIN.");
        }

        if (request.getPerfil() == Perfil.SUPER_ADMIN) {
            throw new RegraDeNegocioException(
                    "Não é permitido atribuir o perfil SUPER_ADMIN por esta rota.");
        }

        if (request.getPerfil() == Perfil.ADMIN && !authenticatedUserService.isSuperAdmin()) {
            throw new RegraDeNegocioException(
                    "Apenas o SUPER_ADMIN pode atribuir o perfil ADMIN.");
        }

        String cpf = normalizeDigits(request.getCpf());
        String email = normalizeEmail(request.getEmail());

        if (usuariosRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new RegraDeNegocioException("CPF já cadastrado.");
        }

        if (email != null && usuariosRepository.existsByEmailAndIdNot(email, id)) {
            throw new RegraDeNegocioException("E-mail já cadastrado.");
        }

        usuario.setNome(request.getNome().trim());
        usuario.setCpf(cpf);
        usuario.setEmail(email);
        usuario.setPerfil(request.getPerfil());

        if (request.getSenha() != null && !request.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        usuariosRepository.save(usuario);
        return UsuarioResponse.fromModel(usuario);
    }

    @Transactional
    public void excluirUsuario(Long id) {
        UsuariosModel usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado."));

        if (usuario.getPerfil() == Perfil.SUPER_ADMIN) {
            throw new RegraDeNegocioException("Não é permitido excluir o SUPER_ADMIN.");
        }

        usuariosRepository.delete(usuario);
    }

    static String normalizeDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    static String normalizeEmail(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
