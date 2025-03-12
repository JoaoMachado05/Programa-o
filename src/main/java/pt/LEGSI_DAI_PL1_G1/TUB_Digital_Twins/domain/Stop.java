package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Table(name = "stops")
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Stop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Integer capacidadeMaxima;
    private Integer lotacaoAtual;
    private Double temperaturaAtual;
    private Double longitude;
    private Double latitude;

    public double getPercentagemOcupacao() {
        if (capacidadeMaxima != null && capacidadeMaxima > 0) {
            return (double) lotacaoAtual / capacidadeMaxima * 100;
        }
        return 0;
    }
}