package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusDTO {
    private Long id;
    private String matricula;
    private Integer capacidadeMaxima;
    private Integer lotacaoAtual;
    private String linhaAtual;
    private Double velocidade;
    private Double temperaturaAtual;
    private Double latitude;
    private Double longitude;
    private LocalDateTime proximaParagemHorario;
    private Integer atrasoMinutos;


    // Novos campos
    private Float lastTemperature;
    private String temperatureAction;

    public BusDTO(Long id, String matricula, Integer capacidadeMaxima, Integer lotacaoAtual, Double percentagemOcupacaoAtual, String linhaAtual, Double velocidade, Double temperaturaAtual, Double latitude, Double longitude) {

    }

    // Métodos getters e setters
    public Long id() {
        return this.id;
    }

    public String matricula() {
        return this.matricula;
    }

    public Integer capacidadeMaxima() {
        return this.capacidadeMaxima;
    }

    public Integer lotacaoAtual() {
        return this.lotacaoAtual;
    }

    public String linhaAtual() {
        return this.linhaAtual;
    }

    public Double velocidade() {
        return this.velocidade;
    }

    public Double temperaturaAtual() {
        return this.temperaturaAtual;
    }

    public Double latitude() {
        return this.latitude;
    }

    public Double longitude() {
        return this.longitude;
    }

    public LocalDateTime proximaParagemHorario() {
        return this.proximaParagemHorario;
    }

    public Integer atrasoMinutos() {
        return this.atrasoMinutos;
    }

    public Float lastTemperature() {
        return this.lastTemperature;
    }

    public String temperatureAction() {
        return this.temperatureAction;
    }
}
