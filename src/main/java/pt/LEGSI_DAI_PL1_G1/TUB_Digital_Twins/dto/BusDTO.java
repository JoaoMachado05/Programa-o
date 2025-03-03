package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusDTO {

    private Long id;
    private String matricula;
    private Integer capacidadeMaxima;
    private Integer lotacaoAtual;
    private Double percentagemOcupacao;
    private String linhaAtual;
    private Double velocidade;
    private Double temperaturaAtual;
    private Double latitude;
    private Double longitude;
}