package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusDTO {
    @JsonProperty("capacidade_maxima")
    private Integer capacidadeMaxima;

    private Long id;
    private String matricula;

    @JsonProperty("lotacao_atual")
    private Integer lotacaoAtual;

    private String linhaAtual;
    private Double velocidade;
    private Double temperaturaAtual;
    private Double latitude;
    private Double longitude;
    private LocalDateTime proximaParagemHorario;
    private Integer atrasoMinutos;
    private Float lastTemperature;
    private String temperatureAction;

    public BusDTO(Long id, String matricula, Integer capacidadeMaxima, Integer lotacaoAtual, String linhaAtual, Double velocidade, Double temperaturaAtual, Double latitude, Double longitude) {
        this.id = id;
        this.matricula = matricula;
        this.capacidadeMaxima = capacidadeMaxima;
        this.lotacaoAtual = lotacaoAtual;
        this.linhaAtual = linhaAtual;
        this.velocidade = velocidade;
        this.temperaturaAtual = temperaturaAtual;
        this.latitude = latitude;
        this.longitude = longitude;
        this.proximaParagemHorario = null;
        this.atrasoMinutos = 0;
        this.lastTemperature = null;
        this.temperatureAction = null;
    }
}