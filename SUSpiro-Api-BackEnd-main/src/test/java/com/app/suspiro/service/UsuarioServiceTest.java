package com.app.suspiro.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.app.suspiro.dto.UsuarioCadastroRequest;
import com.app.suspiro.enums.Perfil;
import com.app.suspiro.exception.RegraDeNegocioException;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.repository.UsuariosRepository;
import com.app.suspiro.security.AuthenticatedUserService;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock UsuariosRepository repository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticatedUserService authenticatedUserService;
    @InjectMocks UsuarioService service;

    private UsuarioCadastroRequest request;

    @BeforeEach
    void setUp() {
        request = new UsuarioCadastroRequest();
        request.setNome(" Maria da Silva ");
        request.setCpf("529.982.247-25");
        request.setEmail("  MARIA@EMAIL.COM  ");
        request.setSenha("senha1234");
        request.setPerfil(Perfil.RECEPCIONISTA);
        when(passwordEncoder.encode("senha1234")).thenReturn("encoded");
        when(repository.save(any(UsuariosModel.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void deveNormalizarCpfEmailENomeAoCadastrar() {
        when(repository.existsByCpf("52998224725")).thenReturn(false);
        when(repository.existsByEmail("maria@email.com")).thenReturn(false);

        UsuariosModel saved = service.cadastrarUsuario(request);

        assertEquals("52998224725", saved.getCpf());
        assertEquals("maria@email.com", saved.getEmail());
        assertEquals("Maria da Silva", saved.getNome());
        assertEquals("encoded", saved.getSenha());
    }

    @Test
    void deveImpedirAdminSemSuperAdmin() {
        request.setPerfil(Perfil.ADMIN);
        when(repository.existsByCpf("52998224725")).thenReturn(false);
        when(repository.existsByEmail("maria@email.com")).thenReturn(false);
        when(authenticatedUserService.isSuperAdmin()).thenReturn(false);

        RegraDeNegocioException exception = assertThrows(
                RegraDeNegocioException.class, () -> service.cadastrarUsuario(request));

        assertEquals("Apenas o SUPER_ADMIN pode cadastrar um novo ADMIN.", exception.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void devePermitirAdminParaSuperAdmin() {
        request.setPerfil(Perfil.ADMIN);
        when(repository.existsByCpf("52998224725")).thenReturn(false);
        when(repository.existsByEmail("maria@email.com")).thenReturn(false);
        when(authenticatedUserService.isSuperAdmin()).thenReturn(true);

        UsuariosModel saved = service.cadastrarUsuario(request);

        assertEquals(Perfil.ADMIN, saved.getPerfil());
        verify(repository).save(any(UsuariosModel.class));
    }

    @Test
    void deveRejeitarCpfDuplicadoAntesDePersistir() {
        when(repository.existsByCpf("52998224725")).thenReturn(true);

        RegraDeNegocioException exception = assertThrows(
                RegraDeNegocioException.class, () -> service.cadastrarUsuario(request));

        assertEquals("CPF já cadastrado.", exception.getMessage());
        verify(repository, never()).save(any());
    }
    @Test
    void deveImpedirQuePerfilSejaAlteradoParaSuperAdmin() {
        UsuariosModel existente = new UsuariosModel();
        existente.setId(7L);
        existente.setPerfil(Perfil.RECEPCIONISTA);

        request.setPerfil(Perfil.SUPER_ADMIN);
        when(repository.findById(7L)).thenReturn(Optional.of(existente));

        RegraDeNegocioException exception = assertThrows(
                RegraDeNegocioException.class,
                () -> service.atualizarUsuario(7L, toUpdateRequest()));

        assertEquals(
                "Não é permitido atribuir o perfil SUPER_ADMIN por esta rota.",
                exception.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void deveImpedirAdminDeAlterarDadosDoSuperAdmin() {
        UsuariosModel superAdmin = new UsuariosModel();
        superAdmin.setId(7L);
        superAdmin.setPerfil(Perfil.SUPER_ADMIN);
        request.setPerfil(Perfil.MEDICO);

        when(repository.findById(7L)).thenReturn(Optional.of(superAdmin));
        when(authenticatedUserService.isSuperAdmin()).thenReturn(false);

        RegraDeNegocioException exception = assertThrows(
                RegraDeNegocioException.class,
                () -> service.atualizarUsuario(7L, toUpdateRequest()));

        assertEquals(
                "Apenas o SUPER_ADMIN pode alterar o SUPER_ADMIN.",
                exception.getMessage());
        verify(repository, never()).save(any());
    }

    private com.app.suspiro.dto.UsuarioAtualizacaoRequest toUpdateRequest() {
        var update = new com.app.suspiro.dto.UsuarioAtualizacaoRequest();
        update.setNome(request.getNome());
        update.setCpf(request.getCpf());
        update.setEmail(request.getEmail());
        update.setSenha("");
        update.setPerfil(request.getPerfil());
        return update;
    }

}
