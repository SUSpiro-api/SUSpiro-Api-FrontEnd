package com.app.suspiro.service;

import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.suspiro.dto.PacienteCadastroRequest;
import com.app.suspiro.dto.PacienteResponse;
import com.app.suspiro.exception.RegraDeNegocioException;
import com.app.suspiro.model.PacienteModel;
import com.app.suspiro.repository.PacienteRepository;

@Service
public class PacienteService {

    private static final Pattern NON_DIGIT = Pattern.compile("\\D");

    private final PacienteRepository pacienteRepository;

    public PacienteService(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @Transactional
    public PacienteResponse cadastrarPaciente(PacienteCadastroRequest request) {
        String cpf = digits(request.getCpf());
        String numeroSus = digits(request.getNumeroSus());
        String telefone = digits(request.getTelefone());

        if (pacienteRepository.existsByCpf(cpf)) {
            throw new RegraDeNegocioException("CPF de cidadão já cadastrado.");
        }
        if (pacienteRepository.existsByNumeroSus(numeroSus)) {
            throw new RegraDeNegocioException("Número do SUS já cadastrado.");
        }

        PacienteModel paciente = new PacienteModel();
        paciente.setNome(request.getNome().trim());
        paciente.setCpf(cpf);
        paciente.setDataNascimento(request.getDataNascimento());
        paciente.setNumeroSus(numeroSus);
        paciente.setTelefone(telefone.isBlank() ? null : telefone);

        return PacienteResponse.fromModel(pacienteRepository.save(paciente));
    }

    static String digits(String value) {
        return value == null ? "" : NON_DIGIT.matcher(value).replaceAll("");
    }
}
