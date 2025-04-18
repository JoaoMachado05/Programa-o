package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarAvariaAutocarroDTO {
    private Integer gravidade; // 1-3 (1: grave, 2: moderada, 3: leve)
    private String tipo;
}