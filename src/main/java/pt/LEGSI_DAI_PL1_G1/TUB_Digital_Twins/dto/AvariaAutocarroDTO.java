package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvariaAutocarroDTO {
    private Long id;
    private Long autocarroId;
    private Integer gravidade;
    private String tipo;
    private LocalDateTime dataReporte;
    private LocalDateTime dataResolucao;
    private boolean resolvida;
}