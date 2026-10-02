package com.app.suspiro.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.suspiro.dto.GuiaAgendamentoRequest;
import com.app.suspiro.dto.GuiaCadastroRequest;
import com.app.suspiro.dto.GuiaResponse;
import com.app.suspiro.enums.Perfil;
import com.app.suspiro.enums.StatusGuia;
import com.app.suspiro.exception.RegraDeNegocioException;
import com.app.suspiro.model.GuiaModel;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.repository.GuiaRepository;
import com.app.suspiro.util.CpfUtils;

@Service
public class GuiaService {

    private final GuiaRepository guiaRepository;
    private final UsuarioService usuarioService;

    public GuiaService(GuiaRepository guiaRepository, UsuarioService usuarioService) {
        this.guiaRepository = guiaRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public GuiaResponse criar(GuiaCadastroRequest request, String cpfSolicitante) {
        UsuariosModel solicitante = usuarioService.buscarPorCpf(cpfSolicitante);

        if (request.getDataSolicitada().isBefore(LocalDate.now())) {
            throw new RegraDeNegocioException("A data solicitada não pode estar no passado.");
        }

        GuiaModel guia = new GuiaModel();
        guia.setPacienteId(request.getPacienteId());
        guia.setPacienteNome(request.getPacienteNome().trim());
        guia.setPacienteCpf(CpfUtils.normalize(request.getPacienteCpf()));
        guia.setTipo(request.getTipo());
        guia.setEspecialidade(normalizeNullable(request.getEspecialidade()));
        guia.setDetalhe(normalizeNullable(request.getDetalhe()));
        guia.setDataSolicitada(request.getDataSolicitada());
        guia.setObservacao(normalizeNullable(request.getObservacao()));
        guia.setPrioridade(request.getPrioridade());
        guia.setStatus(StatusGuia.AGUARDANDO_AGENDAMENTO);
        guia.setSolicitanteId(solicitante.getId());
        guia.setSolicitanteNome(solicitante.getNome());

        return GuiaResponse.fromModel(guiaRepository.save(guia));
    }

    @Transactional(readOnly = true)
    public List<GuiaResponse> listarMinhas(String cpfSolicitante) {
        UsuariosModel solicitante = usuarioService.buscarPorCpf(cpfSolicitante);
        return guiaRepository.findBySolicitanteIdOrderByCriadoEmDesc(solicitante.getId())
                .stream()
                .map(GuiaResponse::fromModel)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GuiaResponse> listarPendentes() {
        return guiaRepository.findByStatusOrderByPrioridadeDescCriadoEmAsc(StatusGuia.AGUARDANDO_AGENDAMENTO)
                .stream()
                .map(GuiaResponse::fromModel)
                .toList();
    }

    @Transactional
    public GuiaResponse agendar(Long id, GuiaAgendamentoRequest request, String cpfAgendador) {
        UsuariosModel agendador = usuarioService.buscarPorCpf(cpfAgendador);

        if (agendador.getPerfil() != Perfil.SUPER_ADMIN
                && agendador.getPerfil() != Perfil.ADMIN
                && agendador.getPerfil() != Perfil.ENFERMEIRO
                && agendador.getPerfil() != Perfil.RECEPCIONISTA) {
            throw new RegraDeNegocioException("O perfil atual não pode agendar guias.");
        }

        GuiaModel guia = guiaRepository.findById(id)
                .orElseThrow(() -> new RegraDeNegocioException("Guia não encontrada."));

        if (guia.getStatus() != StatusGuia.AGUARDANDO_AGENDAMENTO) {
            throw new RegraDeNegocioException("A guia selecionada não está aguardando agendamento.");
        }

        if (request.getDataAgendamento().isBefore(LocalDate.now())) {
            throw new RegraDeNegocioException("A data de agendamento não pode estar no passado.");
        }

        guia.setStatus(StatusGuia.AGENDADO);
        guia.setDataAgendamento(request.getDataAgendamento());
        guia.setHoraAgendamento(request.getHoraAgendamento());
        guia.setAgendadoPorId(agendador.getId());
        guia.setAgendadoPorNome(agendador.getNome());

        return GuiaResponse.fromModel(guiaRepository.save(guia));
    }

    private String normalizeNullable(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
