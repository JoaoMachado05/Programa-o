package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import java.time.LocalDateTime;

public record ManutencaoSemaforoDTO(
        Long semaforoId,
        LocalDateTime dataAgendada,
        String descricao
){}
