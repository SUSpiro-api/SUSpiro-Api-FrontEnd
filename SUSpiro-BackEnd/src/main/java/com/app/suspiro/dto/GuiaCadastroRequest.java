package com.app.suspiro.dto;

import java.time.LocalDate;

import com.app.suspiro.enums.PrioridadeGuia;
import com.app.suspiro.enums.TipoGuia;
import com.app.suspiro.validation.CpfValido;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class GuiaCadastroRequest {

    @NotNull
    @Positive
    private Long pacienteId;

    @NotBlank
    @Size(max = 150)
    private String pacienteNome;

    @NotBlank
    @CpfValido
    private String pacienteCpf;

    @NotNull
    private TipoGuia tipo;

    @Size(max = 120)
    private String especialidade;

    @Size(max = 255)
    private String detalhe;

    @NotNull
    private LocalDate dataSolicitada;

    @Size(max = 1000)
    private String observacao;

    @NotNull
    private PrioridadeGuia prioridade;

    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }
    public String getPacienteNome() { return pacienteNome; }
    public void setPacienteNome(String pacienteNome) { this.pacienteNome = pacienteNome; }
    public String getPacienteCpf() { return pacienteCpf; }
    public void setPacienteCpf(String pacienteCpf) { this.pacienteCpf = pacienteCpf; }
    public TipoGuia getTipo() { return tipo; }
    public void setTipo(TipoGuia tipo) { this.tipo = tipo; }
    public String getEspecialidade() { return especialidade; }
    public void setEspecialidade(String especialidade) { this.especialidade = especialidade; }
    public String getDetalhe() { return detalhe; }
    public void setDetalhe(String detalhe) { this.detalhe = detalhe; }
    public LocalDate getDataSolicitada() { return dataSolicitada; }
    public void setDataSolicitada(LocalDate dataSolicitada) { this.dataSolicitada = dataSolicitada; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public PrioridadeGuia getPrioridade() { return prioridade; }
    public void setPrioridade(PrioridadeGuia prioridade) { this.prioridade = prioridade; }
}
