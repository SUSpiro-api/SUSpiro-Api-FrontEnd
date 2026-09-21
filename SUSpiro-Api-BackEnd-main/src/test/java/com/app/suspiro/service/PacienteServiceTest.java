package com.app.suspiro.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.app.suspiro.dto.PacienteCadastroRequest;
import com.app.suspiro.exception.RegraDeNegocioException;
import com.app.suspiro.model.PacienteModel;
import com.app.suspiro.repository.PacienteRepository;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock PacienteRepository repository;
    @InjectMocks PacienteService service;

    private PacienteCadastroRequest request;

    @BeforeEach
    void setUp() {
        request = new PacienteCadastroRequest();
        request.setNome(" Maria da Silva ");
        request.setCpf("529.982.247-25");
        request.setDataNascimento(LocalDate.of(1990, 5, 20));
        request.setNumeroSus("123 456 789 012 345");
        request.setTelefone("(85) 99999-9999");
        when(repository.save(any(PacienteModel.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void deveNormalizarCamposAntesDePersistir() {
        when(repository.existsByCpf("52998224725")).thenReturn(false);
        when(repository.existsByNumeroSus("123456789012345")).thenReturn(false);

        var response = service.cadastrarPaciente(request);

        assertEquals("52998224725", response.getCpf());
        assertEquals("123456789012345", response.getNumeroSus());
        assertEquals("85999999999", response.getTelefone());
        assertEquals("Maria da Silva", response.getNome());
    }

    @Test
    void deveBloquearCpfDuplicado() {
        when(repository.existsByCpf("52998224725")).thenReturn(true);

        RegraDeNegocioException exception = assertThrows(
                RegraDeNegocioException.class, () -> service.cadastrarPaciente(request));

        assertEquals("CPF de cidadão já cadastrado.", exception.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void deveBloquearNumeroSusDuplicado() {
        when(repository.existsByCpf("52998224725")).thenReturn(false);
        when(repository.existsByNumeroSus("123456789012345")).thenReturn(true);

        RegraDeNegocioException exception = assertThrows(
                RegraDeNegocioException.class, () -> service.cadastrarPaciente(request));

        assertEquals("Número do SUS já cadastrado.", exception.getMessage());
        verify(repository, never()).save(any());
    }
}
