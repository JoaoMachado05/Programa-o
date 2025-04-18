package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarManutencaoAutocarroDTO {
    private LocalDateTime dataAgendada;
    private String descricao;
}