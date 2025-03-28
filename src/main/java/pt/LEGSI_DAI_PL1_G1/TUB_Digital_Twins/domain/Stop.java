package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Table(name = "stops")
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Stop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome da paragem não pode estar vazio")
    private String nome;

    @NotNull(message = "Capacidade máxima deve ser definida")
    @Min(value = 0, message = "Capacidade máxima não pode ser negativa")
    private Integer capacidadeMaxima;

    @NotNull(message = "Lotação atual deve ser definida")
    @Min(value = 0, message = "Lotação atual não pode ser negativa")
    private Integer lotacaoAtual;

    private Double temperaturaAtual;

    @NotNull(message = "Longitude é obrigatória")
    private Double longitude;

    @NotNull(message = "Latitude é obrigatória")
    private Double latitude;

    @NotNull(message = "Tempo até próximo autocarro deve ser definido")
    private Integer tempoAteProximoAutocarro; // Tempo em minutos

    private LocalDateTime ultimaAtualizacao;

    public double getPercentagemOcupacao() {
        if (capacidadeMaxima != null && capacidadeMaxima > 0) {
            return (double) lotacaoAtual / capacidadeMaxima * 100.0;
        }
        return 0.0;
    }

    @PrePersist
    @PreUpdate
    public void atualizarUltimaAtualizacao() {
        this.ultimaAtualizacao = LocalDateTime.now();
    }

    public String getEstadoOcupacao() {
        double percentagem = getPercentagemOcupacao();
        if (percentagem <= 25) return "Baixa";
        if (percentagem <= 75) return "Média";
        return "Alta";
    }
}