package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.dto;

import jakarta.persistence.Transient;

import java.time.LocalDateTime;

public record StopDTO(
        Long id,
        String nome,
        Integer capacidadeMaxima,
        Integer lotacaoAtual,
        Double temperaturaAtual,
        Double longitude,
        Double latitude,
        Integer tempoAteProximoAutocarro,
        LocalDateTime ultimaAtualizacao,
        double percentagemOcupacao,
        String estadoOcupacao,
        Integer bilhetesValidados,
        Long nextBusId,
        String message,
        Boolean previousStop,
        Integer nivelRisco
) {
}