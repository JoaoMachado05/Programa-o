package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

public record AtualizacaoLotacaoDTO(
        Long paragemId,
        String nomeParagem,
        Integer novaLotacao,
        Double percentagemOcupacao,
        String estadoOcupacao
) {}
