package com.app.suspiro.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.LocalTime;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.suspiro.dto.GuiaAgendamentoRequest;
import com.app.suspiro.dto.GuiaCadastroRequest;
import com.app.suspiro.dto.GuiaResponse;
import com.app.suspiro.enums.StatusGuia;
import com.app.suspiro.enums.TipoGuia;
import com.app.suspiro.exception.RegraDeNegocioException;
import com.app.suspiro.model.GuiaModel;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.repository.GuiasRepository;

@Service
public class GuiaService {

    private static final ZoneId BRAZIL_ZONE = ZoneId.of("America/Sao_Paulo");

    private final GuiasRepository guiasRepository;
    private final UsuarioService usuarioService;

    public GuiaService(GuiasRepository guiasRepository, UsuarioService usuarioService) {
        this.guiasRepository = guiasRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public GuiaResponse criar(GuiaCadastroRequest request) {
        if (request.dataSolicitada().isBefore(LocalDate.now(BRAZIL_ZONE))) {
            throw new RegraDeNegocioException("A data solicitada não pode ser anterior à data de hoje.");
        }

        if (request.tipo() == TipoGuia.CONSULTA && request.tipoConsulta() == null) {
            throw new RegraDeNegocioException("Selecione o tipo de consulta antes de gerar a guia.");
        }

        if (request.tipo() != TipoGuia.CONSULTA && request.tipoConsulta() != null) {
            throw new RegraDeNegocioException("O tipo de consulta só deve ser informado para guias de consulta.");
        }

        if ((request.tipo() == TipoGuia.EXAME || request.tipo() == TipoGuia.ENCAMINHAMENTO)
                && (request.detalhe() == null || request.detalhe().isBlank())) {
            throw new RegraDeNegocioException("Informe o exame ou a especialidade de destino.");
        }

        UsuariosModel solicitante = usuarioAutenticado();
        GuiaModel guia = new GuiaModel();
        guia.setPacienteId(request.pacienteId());
        guia.setPacienteNome(request.pacienteNome().trim());
        guia.setPacienteCpf(request.pacienteCpf().replaceAll("\\D", ""));
        guia.setTipo(request.tipo());
        guia.setTipoConsulta(request.tipoConsulta());
        guia.setDetalhe(normalize(request.detalhe()));
        guia.setDataSolicitada(request.dataSolicitada());
        guia.setObservacao(normalize(request.observacao()));
        guia.setPrioridade(request.prioridade());
        guia.setStatus(StatusGuia.AGUARDANDO_AGENDAMENTO);
        guia.setSolicitanteId(solicitante.getId());
        guia.setSolicitanteNome(solicitante.getNome());

        return GuiaResponse.fromModel(guiasRepository.save(guia));
    }

    @Transactional(readOnly = true)
    public List<GuiaResponse> listarPendentes() {
        return guiasRepository.findByStatusOrderByPrioridadeDescDataSolicitadaAscCriadoEmAsc(StatusGuia.AGUARDANDO_AGENDAMENTO)
                .stream()
                .map(GuiaResponse::fromModel)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GuiaResponse> listarMinhas() {
        return guiasRepository.findBySolicitanteIdOrderByCriadoEmDesc(usuarioAutenticado().getId())
                .stream()
                .map(GuiaResponse::fromModel)
                .toList();
    }

    @Transactional
    public GuiaResponse agendar(Long id, GuiaAgendamentoRequest request) {
        if (request.dataAgendamento().isBefore(LocalDate.now(BRAZIL_ZONE))) {
            throw new RegraDeNegocioException("A data do agendamento não pode ser anterior à data de hoje.");
        }

        if (request.dataAgendamento().isEqual(LocalDate.now(BRAZIL_ZONE))
                && request.horaAgendamento().isBefore(LocalTime.now(BRAZIL_ZONE))) {
            throw new RegraDeNegocioException("O horário de hoje precisa ser futuro.");
        }

        GuiaModel guia = guiasRepository.findById(id)
                .orElseThrow(() -> new RegraDeNegocioException("Guia não encontrada."));

        if (guia.getStatus() != StatusGuia.AGUARDANDO_AGENDAMENTO) {
            throw new RegraDeNegocioException("Esta guia não está aguardando agendamento.");
        }

        UsuariosModel agendador = usuarioAutenticado();
        guia.setDataAgendamento(request.dataAgendamento());
        guia.setHoraAgendamento(request.horaAgendamento());
        guia.setAgendadoPorId(agendador.getId());
        guia.setAgendadoPorNome(agendador.getNome());
        guia.setStatus(StatusGuia.AGENDADO);

        return GuiaResponse.fromModel(guiasRepository.save(guia));
    }

    private UsuariosModel usuarioAutenticado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RegraDeNegocioException("Usuário autenticado não encontrado.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails details) {
            return usuarioService.buscarPorCpf(details.getUsername());
        }

        return usuarioService.buscarPorCpf(authentication.getName());
    }

    private String normalize(String value) {
        if (value == null) return null;
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
