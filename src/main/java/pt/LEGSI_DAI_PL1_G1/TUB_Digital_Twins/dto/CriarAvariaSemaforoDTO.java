package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

public record CriarAvariaSemaforoDTO(
        Integer gravidade, // 1-3 (1: grave, 2: moderada, 3: leve)
        String tipo       // Tipo da avaria
) {}