package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;


public record StopDTO(
        Long id,
        String nome,
        Integer capacidadeMaxima,
        Integer lotacaoAtual,
        Double temperaturaAtual,
        Double longitude,
        Double latitude,
        double percentagemOcupacao) {
}