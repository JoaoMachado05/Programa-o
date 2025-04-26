package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "buses", uniqueConstraints = {@UniqueConstraint(columnNames = "matricula")})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String matricula;

    @Column(nullable = false)
    private Integer capacidadeMaxima;

    @Column(nullable = false)
    private Integer lotacaoAtual;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'Desconhecida'")
    private String linhaAtual;

    private Double velocidade;
    private Double temperaturaAtual;
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusBus status = StatusBus.OPERACIONAL;

    private LocalDateTime proximaParagemHorario;
    private Integer atrasoMinutos = 0;

    @ManyToMany
    @JoinTable(
            name = "bus_rota",
            joinColumns = @JoinColumn(name = "bus_id"),
            inverseJoinColumns = @JoinColumn(name = "rota_id"))
    private List<Rota> rotas = new ArrayList<>();

    // Novos atributos para temperatura e ação
    private Float lastTemperature;
    private String temperatureAction;

    // Constructor com todos os parâmetros
    public Bus(Long id, String matricula, Integer capacidadeMaxima, Integer lotacaoAtual, String linhaAtual, Double velocidade, Double temperaturaAtual, Double latitude, Double longitude) {
        this.id = id;
        this.matricula = matricula;
        this.capacidadeMaxima = capacidadeMaxima;
        this.lotacaoAtual = lotacaoAtual;
        this.linhaAtual = linhaAtual;
        this.velocidade = velocidade;
        this.temperaturaAtual = temperaturaAtual;
        this.latitude = latitude;
        this.longitude = longitude;
        this.proximaParagemHorario = proximaParagemHorario;
        this.atrasoMinutos = atrasoMinutos;
        this.lastTemperature = lastTemperature;
        this.temperatureAction = temperatureAction;
    }

    public void setLastTemperature(Float lastTemperature) {
        this.lastTemperature = lastTemperature;
    }

    public void setTemperatureAction(String temperatureAction) {
        this.temperatureAction = temperatureAction;
    }

    // Enum para o status do autocarro
    public enum StatusBus {
        OPERACIONAL,
        EM_MANUTENCAO,
        AVARIADO,
        FORA_DE_SERVICO
    }
}
