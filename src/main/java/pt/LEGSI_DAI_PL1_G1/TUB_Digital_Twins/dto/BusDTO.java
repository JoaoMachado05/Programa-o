package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

public record BusDTO(
        Long id,
        String matricula,
        Integer capacidadeMaxima,
        Integer lotacaoAtual,
        Double percentagemOcupacao,
        String linhaAtual,
        Double velocidade,
        Double temperaturaAtual,
        Double latitude,
        Double longitude) {
}