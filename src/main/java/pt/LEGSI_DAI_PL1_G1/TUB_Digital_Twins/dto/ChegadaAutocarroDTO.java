package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

public record ChegadaAutocarroDTO(
        Long autocarroId,
        Long paragemId,
        Integer pessoasSaindo  // Número de pessoas que saem do autocarro
) {
}