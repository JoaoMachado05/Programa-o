package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import java.time.LocalDateTime;

public record RiscosDTO(
        Long id,
        Long paragemId,
        String paragemNome,
        Integer gravidade,
        String tipo,
        LocalDateTime dataReporte,
        LocalDateTime dataResolucao,
        boolean resolvida
) {}