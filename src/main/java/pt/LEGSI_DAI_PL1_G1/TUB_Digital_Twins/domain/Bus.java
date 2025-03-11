package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "buses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String matricula;
    private Integer capacidadeMaxima;
    private Integer lotacaoAtual;
    private String linhaAtual;
    private Double velocidade;
    private Double temperaturaAtual;
    private Double latitude;
    private Double longitude;


    //mostra o estado atual do autcarro
    /*public enum BusStatus {
        OPERATIONAL, DELAYED, EMERGENCY
    }
    */

    public double calcularPercentagemOcupacao() {
        if (capacidadeTotal == null || capacidadeTotal == 0 || lotacaoAtual == null) {
            return 0.0;
        }
        return (double) lotacaoAtual / capacidadeTotal * 100;
    }

    // verifica se a lotação do autocarro está proximo dos 85% (valor suscetivel a alterações) para poder avisar na paragem
    public boolean proximoLotacaoMaxima() {
        double percentagem = calcularPercentagemOcupacao();
        return percentagem >= 85.0;
    }


    public boolean necessitaAjusteTemperatura() {
        if (temperaturaInterior == null) {
            return false;
        }
        return Math.abs(temperaturaInterior - 21.0) > 1.5;
    }
}