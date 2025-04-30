package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

public record  AtualizarParagemRequest (
        Double latitude,
        Double longitude,
        Integer lotacaoAtual
) {}