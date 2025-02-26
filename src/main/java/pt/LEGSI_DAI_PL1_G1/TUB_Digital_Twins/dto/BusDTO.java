package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

public record BusDTO(
        Long id,

        String linha,

        int passageiros,

        double velocidade,

        double temperatura,

        double latitude,

        double longitude
) {}
