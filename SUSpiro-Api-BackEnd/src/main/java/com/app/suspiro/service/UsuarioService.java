package com.app.suspiro.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
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
import com.app.suspiro.security.SecurityAuth;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuariosRepository usuariosRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuariosRepository usuariosRepository,
            PasswordEncoder passwordEncoder) {

        this.usuariosRepository = usuariosRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String cpf)
            throws UsernameNotFoundException {

        UsuariosModel usuario = usuariosRepository.findByCpf(cpf)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuário não encontrado"
                        )
                );

        return new SecurityAuth(usuario);
    }

    public UsuariosModel buscarPorCpf(String cpf) {

        return usuariosRepository.findByCpf(cpf)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuário não encontrado"
                        )
                );
    }

    @Transactional
    public UsuariosModel cadastrarUsuario(UsuarioCadastroRequest request) {

        if (usuariosRepository.existsByCpf(request.getCpf())) {
            throw new RegraDeNegocioException("CPF já cadastrado.");
        }

        if (request.getEmail() != null
                && usuariosRepository.existsByEmail(request.getEmail())) {
            throw new RegraDeNegocioException("E-mail já cadastrado.");
        }

        if (request.getPerfil() == Perfil.SUPER_ADMIN) {
            throw new RegraDeNegocioException(
                    "Não é permitido cadastrar um novo SUPER_ADMIN por esta rota."
            );
        }

        if (request.getPerfil() == Perfil.ADMIN && !usuarioAutenticadoEhSuperAdmin()) {
            throw new RegraDeNegocioException(
                    "Apenas o SUPER_ADMIN pode cadastrar um novo ADMIN."
            );
        }

        UsuariosModel usuario = new UsuariosModel();

        usuario.setNome(request.getNome());
        usuario.setCpf(request.getCpf());
        usuario.setEmail(request.getEmail());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setPerfil(request.getPerfil());
        usuario.setAtivo(true);

        return usuariosRepository.save(usuario);
    }

    public List<UsuarioResponse> listarUsuarios() {

        return usuariosRepository.findAll()
                .stream()
                .map(UsuarioResponse::fromModel)
                .toList();
    }

    public UsuarioResponse buscarPorId(Long id) {

        UsuariosModel usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(
                        "Usuário não encontrado."
                ));

        return UsuarioResponse.fromModel(usuario);
    }

    @Transactional
    public UsuarioResponse atualizarUsuario(
            Long id,
            UsuarioAtualizacaoRequest request) {

        UsuariosModel usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(
                        "Usuário não encontrado."
                ));

        if (usuariosRepository.existsByCpfAndIdNot(request.getCpf(), id)) {
            throw new RegraDeNegocioException("CPF já cadastrado.");
        }

        if (request.getEmail() != null
                && usuariosRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new RegraDeNegocioException("E-mail já cadastrado.");
        }

        usuario.setNome(request.getNome());
        usuario.setCpf(request.getCpf());
        usuario.setEmail(request.getEmail());
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
                .orElseThrow(() -> new UsuarioNaoEncontradoException(
                        "Usuário não encontrado."
                ));

        if (usuario.getPerfil() == Perfil.SUPER_ADMIN) {
            throw new RegraDeNegocioException(
                    "Não é permitido excluir o SUPER_ADMIN."
            );
        }

        usuariosRepository.delete(usuario);
    }

    /**
     * Verifica se o usuário autenticado na requisição atual possui o
     * papel SUPER_ADMIN. Usado para restringir a criação de novos ADMIN.
     */
    private boolean usuarioAutenticadoEhSuperAdmin() {

        var authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_SUPER_ADMIN")
                );
    }
}