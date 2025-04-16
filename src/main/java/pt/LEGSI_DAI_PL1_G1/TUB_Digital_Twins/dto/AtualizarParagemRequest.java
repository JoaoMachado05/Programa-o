package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import java.util.List;

public record  AtualizarParagemRequest (
        Double latitude,
        Double longitude,
        Integer lotacaoAtual
) {}